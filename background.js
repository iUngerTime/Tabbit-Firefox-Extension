const DEFAULTS = {
  groupby: "sot",
  naming: "dom",
  maximum: 0,
  lonely: false,
  autocollapse: false,
  customrules: [],
  blocklist: [],
};

function getSettings() {
  return browser.storage.local.get(DEFAULTS);
}

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function isExcludedUrl(url) {
  return /^(about:|moz-extension:|chrome:|data:|file:|resource:)/.test(url);
}

function getDomainName(url, convention) {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split(".");
    switch (convention) {
      case "dom":
        return parts.length >= 3 ? parts[1] : parts[0];
      case "subdom":
        return parts.length >= 3 ? parts[0] + "." + parts[1] : parts[0];
      case "subdomtld":
        return hostname;
      default:
        return hostname;
    }
  } catch {
    return "Group";
  }
}

function deriveGroupName(tab, naming) {
  if (naming === "nameless") return "";
  if (naming === "title") return tab.title || getDomainName(tab.url, "dom");
  return getDomainName(tab.url, naming);
}

function isBlocked(openerUrl, blocklist) {
  const host = getHostname(openerUrl);
  return blocklist.some((e) => getHostname(e.blockedUrl) === host);
}

function findCustomRule(openerUrl, rules) {
  const host = getHostname(openerUrl);
  return rules.find((r) => getHostname(r.url) === host) || null;
}

async function tryUngroup(tabId) {
  try {
    await browser.tabs.ungroup(tabId);
  } catch {}
}

browser.tabs.onCreated.addListener(async (newTab) => {
  if (newTab.openerTabId === undefined) return;

  try {
    const opener = await browser.tabs.get(newTab.openerTabId);
    if (opener.windowId !== newTab.windowId) return;
    if (opener.pinned) return;

    const openerUrl = opener.url || "";
    if (isExcludedUrl(openerUrl)) return;

    const settings = await getSettings();

    if (isBlocked(openerUrl, settings.blocklist)) {
      if (
        newTab.groupId != null &&
        newTab.groupId !== browser.tabGroups.TAB_GROUP_ID_NONE
      ) {
        await tryUngroup(newTab.id);
      }
      return;
    }

    const isNewGroup = opener.groupId === browser.tabGroups.TAB_GROUP_ID_NONE;
    const newUrl = newTab.pendingUrl || newTab.url || "";

    if (settings.groupby === "sd") {
      const sameHost = getHostname(openerUrl) === getHostname(newUrl);
      if (!sameHost) {
        if (
          newTab.groupId != null &&
          newTab.groupId !== browser.tabGroups.TAB_GROUP_ID_NONE
        ) {
          await tryUngroup(newTab.id);
        }
        return;
      }
    }

    if (!isNewGroup) {
      if (settings.maximum > 1) {
        const groupTabs = await browser.tabs.query({
          groupId: opener.groupId,
        });
        if (groupTabs.length >= settings.maximum) return;
      }

      await browser.tabs.group({
        groupId: opener.groupId,
        tabIds: [newTab.id],
      });
    } else {
      const groupId = await browser.tabs.group({
        tabIds: [opener.id, newTab.id],
      });

      const rule = findCustomRule(openerUrl, settings.customrules);
      try {
        if (rule) {
          const props = { title: rule.alias };
          if (rule.color) props.color = rule.color;
          await browser.tabGroups.update(groupId, props);
        } else {
          const name = deriveGroupName(opener, settings.naming);
          await browser.tabGroups.update(groupId, { title: name });
        }
      } catch {}
    }
  } catch (err) {
    console.error("[Tabbit]", err);
  }
});

browser.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  if (removeInfo.isWindowClosing) return;

  const { lonely } = await getSettings();
  if (!lonely) return;

  try {
    const tabs = await browser.tabs.query({ windowId: removeInfo.windowId });
    const groups = new Map();

    for (const tab of tabs) {
      if (tab.groupId !== browser.tabGroups.TAB_GROUP_ID_NONE) {
        if (!groups.has(tab.groupId)) groups.set(tab.groupId, []);
        groups.get(tab.groupId).push(tab.id);
      }
    }

    for (const [, ids] of groups) {
      if (ids.length === 1) {
        await browser.tabs.ungroup(ids[0]);
      }
    }
  } catch (err) {
    console.error("[Tabbit]", err);
  }
});

browser.tabs.onActivated.addListener(async ({ tabId, windowId }) => {
  const { autocollapse } = await getSettings();
  if (!autocollapse) return;

  try {
    const tab = await browser.tabs.get(tabId);
    const activeGroup = tab.groupId;

    const tabs = await browser.tabs.query({ windowId });
    const seen = new Set();
    for (const t of tabs) {
      if (
        t.groupId !== browser.tabGroups.TAB_GROUP_ID_NONE &&
        t.groupId !== activeGroup
      ) {
        seen.add(t.groupId);
      }
    }

    for (const gid of seen) {
      try {
        await browser.tabGroups.update(gid, { collapsed: true });
      } catch {}
    }
  } catch (err) {
    console.error("[Tabbit]", err);
  }
});
