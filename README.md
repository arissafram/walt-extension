# Walt Chrome Extension

## Download
https://arissafram.com/walt/ (download page) or https://arissafram.com/walt/walt.zip

## Releasing a new version
1. Bump `"version"` in `manifest.json` (e.g. `1.1` → `1.2`).
2. Commit and push to `main`.

On every push to `main`, `.github/workflows/deploy-site.yml` runs `scripts/build-zip.sh` and commits the result into the `personal-site` repo under `public/walt/`: `walt.zip`, `version.json`, the download page (`site/index.html`) and `box.png`. Amplify then republishes the site. If you push without bumping the version, the zip is replaced but people won't see "update available".

To build locally: `./scripts/build-zip.sh` (writes `dist/site/`).

### One-time setup: the WALT_CREDENTIALS secret
The workflow needs permission to write to `personal-site`:
1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token.
2. Repository access: **Only select repositories** → `personal-site`.
3. Permissions → Repository permissions → **Contents: Read and write**.
4. Copy the token. In `walt-extension` → Settings → Secrets and variables → Actions → **New repository secret**, name it `WALT_CREDENTIALS` and paste the token.
5. Re-run the workflow from the Actions tab (or push again).

## How the download page knows what's installed
`site-bridge.js` runs only on the sites listed for it in `manifest.json` (`arissafram.com`, `www.arissafram.com` and localhost) and reports Walt's version to the page. Every other site gets nothing.

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
