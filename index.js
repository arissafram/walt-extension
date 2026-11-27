// index.js — the shared parts of Walt as an ES module, for web pages that
// embed a Walt demo (arissafram.com). Not part of the extension.
//
// boxes.js and bounce.js are plain scripts so the extension can load them
// without a build step; they hand their names over on globalThis.WaltShared.
import './boxes.js';
import './bounce.js';

export const {
  WALT_BOXES, DEFAULT_BOX_ID, waltBox, waltBoxPath,
  WALT_SPEED, WALT_SIZE, WALT_PREVIEW, waltStep, waltPreviewWidth,
} = globalThis.WaltShared;

// The URL of a box's PNG, served from this package's boxes/ folder by the
// page's bundler (Vite and webpack 5 both understand this pattern).
export function waltBoxUrl(id) {
  return new URL(`./boxes/${waltBox(id).id}.png`, import.meta.url).href;
}
