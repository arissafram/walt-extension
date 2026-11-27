# Walt

A Chrome extension that bounces a box around on top of your pages, like a screensaver.

![Walt](./docs/screenshot.png)

## Install

1. Download [walt.zip](https://arissafram.com/walt/walt.zip) and unzip it.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and choose the unzipped folder.
4. Pin Walt, then click it to pick a box and a mode: **On**, **Off**, or **Detect Sleep** (shows after a stretch of no activity, hides when you move).

## Develop

Load this folder with **Load unpacked**. After changing code, reload it on `chrome://extensions` and refresh open tabs.

```bash
./scripts/build-zip.sh   # builds dist/site/: walt.zip, version.json, download page
```

- **Add a box:** save a transparent PNG into `boxes/` and add it to `boxes.js`.
- **Release:** bump `"version"` in `manifest.json` and push to `main`. `.github/workflows/deploy-site.yml` builds the zip and commits it to `personal-site` under `public/walt/`. It needs a `WALT_CREDENTIALS` secret: a fine-grained token with Contents read/write on `personal-site`.
- **Site bridge:** `site-bridge.js` runs only on arissafram.com and localhost and tells the download page which version is installed.
- **Package:** arissafram.com's demo installs this repo as a package. `index.js` re-exports the box list (`boxes.js`) and bounce settings (`bounce.js`); the extension itself doesn't use it.
