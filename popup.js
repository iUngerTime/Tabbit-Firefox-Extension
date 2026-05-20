const domainEl = document.getElementById("domain");
const toggleEl = document.getElementById("toggle");

let currentHostname = "";
let blocklist = [];

function isCurrentlyBlocked() {
  return blocklist.some((e) => {
    try {
      return new URL(e.blockedUrl).hostname === currentHostname;
    } catch {
      return false;
    }
  });
}

function render() {
  const blocked = isCurrentlyBlocked();
  toggleEl.textContent = blocked
    ? "Enable for this domain"
    : "Disable for this domain";
  toggleEl.className = blocked ? "blocked" : "";
}

async function init() {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!tab?.url) return;

  try {
    currentHostname = new URL(tab.url).hostname;
  } catch {
    return;
  }
  domainEl.textContent = currentHostname;

  const stored = await browser.storage.local.get({ blocklist: [] });
  blocklist = stored.blocklist;
  render();
}

toggleEl.addEventListener("click", async () => {
  if (isCurrentlyBlocked()) {
    blocklist = blocklist.filter((e) => {
      try {
        return new URL(e.blockedUrl).hostname !== currentHostname;
      } catch {
        return true;
      }
    });
  } else {
    blocklist.push({
      id: crypto.randomUUID(),
      blockedUrl: "https://" + currentHostname,
    });
  }
  await browser.storage.local.set({ blocklist });
  render();
});

init();
