# Development

No build step, no bundler, no test framework. The extension is plain JS loaded directly by Firefox.

## Loading for testing

1. Open `about:debugging` in Firefox.
2. Click **This Firefox** in the left sidebar.
3. Click **Load Temporary Add-on**.
4. Select `manifest.json` from the repo root.

Temporary add-ons are removed when Firefox restarts.

## Packaging for distribution

Zip the extension files (not the folder itself) into an `.xpi`:

```bash
zip -r tabbit.xpi manifest.json background.js popup.html popup.js tabbit-name-small.png icons/
```

Then submit to [addons.mozilla.org](https://addons.mozilla.org) for signing. Choose "On your own" for self-distribution (no public listing required).

## Installing unsigned (Developer Edition / Nightly / ESR only)

Set `xpinstall.signatures.required` to `false` in `about:config` and install the `.xpi` directly. Does not work on Release or Beta.

## Architecture

- `background.js` — core logic. Listens to `tabs.onCreated` (grouping), `tabs.onRemoved` (lonely tab cleanup), and `tabs.onActivated` (auto-collapse). Reads settings from `browser.storage.local`.
- `popup.html` / `popup.js` — toolbar popup with all settings UI. Auto-saves on change.
- `icons/` — extension icons at 16, 32, 48, 96, 128px.

Uses `browser.*` APIs (Firefox WebExtension namespace), not `chrome.*`. Requires `tabs`, `tabGroups`, and `storage` permissions.
