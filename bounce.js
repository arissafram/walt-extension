// bounce.js — how Walt's box moves. Shared by the content script, the popup's
// preview, and the demo on arissafram.com (through index.js).
// Sizes and speeds are in CSS pixels; a speed of 1 means a full browser window.

// Speed in pixels per second (was 2.2 / 1.6 px per frame at 60fps).
const WALT_SPEED = { x: 132, y: 96 };
// The Size slider's range and starting value: the box's width in pixels.
const WALT_SIZE = { min: 80, max: 400, initial: 182 };
// The small box in the popup's preview: its speed, and the width range the
// Size slider maps onto.
const WALT_PREVIEW = { speed: { x: 38, y: 26 }, minW: 22, maxW: 64 };

// Move a box ({ x, y, vx, vy }, velocities in px/s) for dt seconds inside a
// W×H area, turning it around at the edges. w×h is the box's drawn size.
// `speed` scales the velocity, e.g. for an area smaller than a window.
function waltStep(box, dt, W, H, w, h, speed = 1) {
  box.x += box.vx * speed * dt;
  box.y += box.vy * speed * dt;

  if (box.x <= 0) { box.x = 0; box.vx = Math.abs(box.vx); }
  else if (box.x + w >= W) { box.x = W - w; box.vx = -Math.abs(box.vx); }
  if (box.y <= 0) { box.y = 0; box.vy = Math.abs(box.vy); }
  else if (box.y + h >= H) { box.y = H - h; box.vy = -Math.abs(box.vy); }
}

// The preview box's width for a given Size value.
function waltPreviewWidth(size) {
  const { minW, maxW } = WALT_PREVIEW;
  return Math.round(minW + ((size - WALT_SIZE.min) / (WALT_SIZE.max - WALT_SIZE.min)) * (maxW - minW));
}

// The extension loads this as a plain script and uses the names above. The
// site imports it as a module through index.js, which reads them from here.
globalThis.WaltShared = Object.assign(globalThis.WaltShared || {}, {
  WALT_SPEED, WALT_SIZE, WALT_PREVIEW, waltStep, waltPreviewWidth,
});
