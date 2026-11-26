# Walt Chrome Extension

## Install
1. Download and unzip this folder.
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
