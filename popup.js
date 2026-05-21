const DEFAULTS = {
  groupby: "sot",
  naming: "dom",
  maximum: 0,
  lonely: false,
  autocollapse: false,
  customrules: [],
  blocklist: [],
};

const COLOR_MAP = {
  grey: "#8b8b8b", blue: "#4a8ecc", red: "#cc4a4a", yellow: "#ccb44a",
  green: "#4acc6a", pink: "#cc4a8e", purple: "#8e4acc", cyan: "#4accc0",
  orange: "#cc8e4a",
};

const els = {
  groupby: document.getElementById("groupby"),
  naming: document.getElementById("naming"),
  maximum: document.getElementById("maximum"),
  lonely: document.getElementById("lonely"),
  autocollapse: document.getElementById("autocollapse"),
  saved: document.getElementById("saved"),
  ruleUrl: document.getElementById("ruleUrl"),
  ruleAlias: document.getElementById("ruleAlias"),
  ruleColor: document.getElementById("ruleColor"),
  addRule: document.getElementById("addRule"),
  rulesList: document.getElementById("rulesList"),
  blockUrl: document.getElementById("blockUrl"),
  addBlock: document.getElementById("addBlock"),
  blockList: document.getElementById("blockList"),
};

let settings = { ...DEFAULTS };

function toHostname(input) {
  const s = input.trim();
  try {
    return new URL(s.includes("://") ? s : "https://" + s).hostname;
  } catch {
    return s;
  }
}

function flashSaved() {
  els.saved.classList.add("show");
  setTimeout(() => els.saved.classList.remove("show"), 1200);
}

function save(partial) {
  Object.assign(settings, partial);
  browser.storage.local.set(partial);
  flashSaved();
}

function renderRules() {
  const list = els.rulesList;
  list.innerHTML = "";
  if (settings.customrules.length === 0) {
    list.innerHTML = '<div class="empty">No custom rules.</div>';
    return;
  }
  for (const rule of settings.customrules) {
    const item = document.createElement("div");
    item.className = "list-item";

    const domain = document.createElement("span");
    domain.className = "domain";
    domain.textContent = toHostname(rule.url);

    const arrow = document.createElement("span");
    arrow.className = "arrow";
    arrow.textContent = "→";

    const alias = document.createElement("span");
    alias.className = "alias";
    alias.textContent = rule.alias;

    item.append(domain, arrow, alias);

    if (rule.color && COLOR_MAP[rule.color]) {
      const dot = document.createElement("span");
      dot.className = "color-dot";
      dot.style.background = COLOR_MAP[rule.color];
      dot.title = rule.color;
      item.append(dot);
    }

    const del = document.createElement("button");
    del.className = "del";
    del.textContent = "×";
    del.addEventListener("click", () => {
      const updated = settings.customrules.filter((r) => r.id !== rule.id);
      save({ customrules: updated });
      renderRules();
    });
    item.append(del);

    list.append(item);
  }
}

function renderBlocklist() {
  const list = els.blockList;
  list.innerHTML = "";
  if (settings.blocklist.length === 0) {
    list.innerHTML = '<div class="empty">No blocked domains.</div>';
    return;
  }
  for (const entry of settings.blocklist) {
    const item = document.createElement("div");
    item.className = "list-item";

    const domain = document.createElement("span");
    domain.className = "domain";
    domain.textContent = toHostname(entry.blockedUrl);

    const del = document.createElement("button");
    del.className = "del";
    del.textContent = "×";
    del.addEventListener("click", () => {
      const updated = settings.blocklist.filter((e) => e.id !== entry.id);
      save({ blocklist: updated });
      renderBlocklist();
    });

    item.append(domain, del);
    list.append(item);
  }
}

browser.storage.local.get(DEFAULTS).then((stored) => {
  settings = stored;
  els.groupby.value = settings.groupby;
  els.naming.value = settings.naming;
  els.maximum.value = settings.maximum;
  els.lonely.checked = settings.lonely;
  els.autocollapse.checked = settings.autocollapse;
  renderRules();
  renderBlocklist();
});

els.groupby.addEventListener("change", () => save({ groupby: els.groupby.value }));
els.naming.addEventListener("change", () => save({ naming: els.naming.value }));
els.maximum.addEventListener("change", () => save({ maximum: parseInt(els.maximum.value, 10) || 0 }));
els.lonely.addEventListener("change", () => save({ lonely: els.lonely.checked }));
els.autocollapse.addEventListener("change", () => save({ autocollapse: els.autocollapse.checked }));

els.addRule.addEventListener("click", () => {
  const raw = els.ruleUrl.value.trim();
  const alias = els.ruleAlias.value.trim();
  if (!raw || !alias) return;
  const url = "https://" + toHostname(raw);
  const updated = [
    ...settings.customrules,
    { id: crypto.randomUUID(), url, alias, color: els.ruleColor.value },
  ];
  save({ customrules: updated });
  els.ruleUrl.value = "";
  els.ruleAlias.value = "";
  els.ruleColor.value = "";
  renderRules();
});

els.addBlock.addEventListener("click", () => {
  const raw = els.blockUrl.value.trim();
  if (!raw) return;
  const blockedUrl = "https://" + toHostname(raw);
  const updated = [
    ...settings.blocklist,
    { id: crypto.randomUUID(), blockedUrl },
  ];
  save({ blocklist: updated });
  els.blockUrl.value = "";
  renderBlocklist();
});

document.getElementById("resetDefaults").addEventListener("click", () => {
  settings = { ...DEFAULTS };
  browser.storage.local.set(settings);
  els.groupby.value = settings.groupby;
  els.naming.value = settings.naming;
  els.maximum.value = settings.maximum;
  els.lonely.checked = settings.lonely;
  els.autocollapse.checked = settings.autocollapse;
  renderRules();
  renderBlocklist();
  flashSaved();
});
