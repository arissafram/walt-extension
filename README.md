# Walt Chrome Extension

## Download
Get the latest `walt.zip` from the download page (https://arissafram.github.io/walt-extension/) or straight from
https://github.com/arissafram/walt-extension/releases/latest/download/walt.zip

## Releasing a new version
1. Bump `"version"` in `manifest.json` (e.g. `1.0` → `1.1`).
2. Commit and push to `main`.

On every push to `main`, the GitHub Action in `.github/workflows/release.yml` rebuilds `walt.zip` and attaches it to the release for that version, creating the release if the version is new. If you push without changing the version, the zip in the current release is replaced, but people who already installed it won't see "update available". The download page compares the installed version with the latest release.

To build the zip locally: `./scripts/build-zip.sh` (writes `dist/walt.zip`).

## How the download page knows what's installed
`site-bridge.js` runs only on the sites listed for it in `manifest.json` (`arissafram.github.io` and localhost) and reports Walt's version to the page. To use the page on your own domain, add it to that list, push a new version, and copy `docs/index.html` to your site.

## Install
1. Download and unzip `walt.zip`.
2. Go to `chrome://extensions/`
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select this folder.

## Modes
- **On** — Box always bounces on top of pages.
- **Off** — Completely hidden.
- **Detect Sleep** — Box appears after a period of no activity you pick in the popup (15 sec–15 min, default 30 sec), or when the screen is locked, disappears as soon as you move the mouse or press a key.

## Testing tip
After clicking reload on `chrome://extensions`, refresh any open tabs — tabs that were open before the reload still run the old script.

## Boxes
Pick a box design from the carousel at the top of the popup. The designs live in `boxes/` (`walt-original.png` is the first one we made).

To add a box: save a PNG with a transparent background into `boxes/`, then add it to the list in `boxes.js`.
