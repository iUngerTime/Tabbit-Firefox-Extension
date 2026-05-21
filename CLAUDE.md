# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tabbit — a Firefox extension (Manifest V3) that auto-groups tabs with their opener tab. Requires Firefox 139+ for `tabGroups` API support.

## Architecture

No content scripts, no build step.

- `background.js` — core logic. Listens to `tabs.onCreated` (grouping), `tabs.onRemoved` (lonely tab cleanup), and `tabs.onActivated` (auto-collapse). Reads settings from `browser.storage.local` with defaults in `DEFAULTS`.
- `popup.html` / `popup.js` — toolbar popup with all settings UI. Auto-saves on change.
- `icons/` — extension icons at 16, 32, 48, 96, 128px.

**Grouping logic:** If the opener tab already belongs to a group, the new tab joins it. If the opener is ungrouped, a new group is created containing both tabs. Blacklist is checked first, then domain matching (if enabled), then max-tabs cap.

**Settings (stored in `browser.storage.local`):**
- `groupby` — `"sot"` (same opening tab) or `"sd"` (same domain)
- `naming` — `"dom"`, `"subdom"`, `"subdomtld"`, `"title"`, or `"nameless"`
- `maximum` — max tabs per group (0 = unlimited)
- `lonely` — ungroup last tab when group shrinks to 1
- `autocollapse` — collapse inactive groups on tab switch
- `customrules` — array of `{id, url, alias, color}` for domain-specific overrides
- `blocklist` — array of `{id, blockedUrl}` for domains to never group

## Development

No build, lint, or test tooling. The extension is plain JS loaded directly by Firefox.

**Load for testing:** Open `about:debugging` → This Firefox → Load Temporary Add-on → select `manifest.json`.

**Package for signing:**
```bash
zip -r tabbit.xpi manifest.json background.js popup.html popup.js tabbit-name-small.png icons/
```

Then submit to `addons.mozilla.org` for self-distribution signing.

## Key Constraints

- Uses `browser.*` APIs (Firefox WebExtension namespace), not `chrome.*`.
- `tabs`, `tabGroups`, and `storage` permissions are all required.
- Cross-window tab opens are intentionally ignored — grouping only works within a single window.
- Pinned tabs and internal URLs (`about:`, `moz-extension:`, etc.) are excluded from grouping.
