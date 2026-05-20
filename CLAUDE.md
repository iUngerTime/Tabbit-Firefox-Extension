# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Firefox extension (Manifest V3) that auto-groups tabs with their opener tab, replicating Chrome extension Tabius. Requires Firefox 139+ for `tabGroups` API support.

## Architecture

No popup, no content scripts, no build step.

- `background.js` — core logic. Listens to `tabs.onCreated` (grouping) and `tabs.onRemoved` (cleanup). Reads user settings from `browser.storage.local` with defaults defined in `DEFAULTS`.
- `options.html` / `options.js` — settings page (accessed via the add-ons manager). Auto-saves on change.

**Grouping logic:** If the opener tab already belongs to a group, the new tab joins it. If the opener is ungrouped, a new group is created containing both tabs, named according to the user's naming convention setting.

**Settings (stored in `browser.storage.local`):**
- `namingConvention` — how new groups are titled: `domain`, `subdomain.domain`, `subdomain.domain.tld`, `title` (opener's page title), or `nameless`.
- `removeOnSingleTab` — ungroup a tab when it's the last one left in its group.

## Development

No build, lint, or test tooling. The extension is plain JS loaded directly by Firefox.

**Load for testing:** Open `about:debugging` → This Firefox → Load Temporary Add-on → select `manifest.json`.

**Package for signing:**
```bash
zip -r tab-grouper.xpi manifest.json background.js options.html options.js
```

Then submit to `addons.mozilla.org` for self-distribution signing.

## Key Constraints

- Uses `browser.*` APIs (Firefox WebExtension namespace), not `chrome.*`.
- `tabs`, `tabGroups`, and `storage` permissions are all required.
- Cross-window tab opens are intentionally ignored — grouping only works within a single window.
