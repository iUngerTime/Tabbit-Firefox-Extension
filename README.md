# Tabbit for Firefox - Automatic Tab Grouping

A Firefox extension that automatically groups tabs with the tab they were opened from. When you open a link in a new tab, both tabs are grouped together.

Requires Firefox 139 or newer.

## Features

- **Group by opening tab or domain** — group every tab from the same opener, or only when domains match
- **Configurable group naming** — name groups by domain, subdomain, full hostname, page title, or leave nameless
- **Max tabs per group** — cap how many tabs a group can hold
- **Auto-ungroup lonely tabs** — dissolve a group when it shrinks to one tab
- **Auto-collapse inactive groups** — keep only the active group expanded
- **Custom rules** — override group name and color for specific domains
- **Blacklist** — prevent specific domains from being grouped

All settings are accessible from the toolbar popup.

## Loading temporarily (for testing)

1. Open `about:debugging` in Firefox.
2. Click **This Firefox** in the left sidebar.
3. Click **Load Temporary Add-on**.
4. Select `manifest.json` from this folder.

Temporary add-ons are removed when Firefox restarts.

## Packaging for distribution

Zip the extension files (not the folder itself) into an `.xpi`:

```bash
zip -r tabbit.xpi manifest.json background.js popup.html popup.js tabbit-name-small.png icons/
```

Then submit to [addons.mozilla.org](https://addons.mozilla.org) for signing. Choose "On your own" for self-distribution (no public listing required).

## Installing unsigned (Developer Edition / Nightly / ESR only)

Set `xpinstall.signatures.required` to `false` in `about:config` and install the `.xpi` directly. Does not work on Release or Beta.
