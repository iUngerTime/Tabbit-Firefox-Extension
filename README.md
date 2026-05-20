# Tab Grouper (Firefox)

A minimal Firefox extension that groups a newly opened tab together with the tab it was opened from. Replicates the core behavior of the Chrome extension Tabius.

Requires Firefox 139 or newer.

## Behavior

- Open a link from tab A in a new tab. Tab A becomes part of a new group containing both tabs.
- Open another link from tab A. The new tab joins the same group.
- Open a fresh tab from the URL bar or new-tab button. Nothing happens (no opener).

## Loading temporarily (for testing)

1. Open `about:debugging` in Firefox.
2. Click **This Firefox** in the left sidebar.
3. Click **Load Temporary Add-on**.
4. Select `manifest.json` from this folder.

Temporary add-ons are removed when Firefox restarts.

## Installing permanently

Firefox enforces extension signing on Release and Beta channels, so you have three options:

1. **Self-distribution via AMO (recommended).** Submit the packaged extension to `addons.mozilla.org` and choose "On your own" instead of public listing. Mozilla signs it, you download the signed `.xpi`, and install it locally. No public listing, no review queue for the public catalog. Free.
2. **Firefox Developer Edition or Nightly.** Set `xpinstall.signatures.required` to `false` in `about:config` and install the unsigned `.xpi` directly. Does not work on Release or Beta.
3. **Firefox ESR.** Same signature-disable trick as Developer Edition. Useful if you want a stable build without signing.

To package for option 1: zip the contents of this folder (not the folder itself) into a `.zip`, rename it to `.xpi`.

```bash
cd tab-grouper
zip -r ../tab-grouper.xpi manifest.json background.js
```

## Files

- `manifest.json`: extension metadata, permissions (`tabs`, `tabGroups`), Firefox minimum version.
- `background.js`: listens to `tabs.onCreated` and groups via `tabs.group()`.
