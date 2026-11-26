// content.js
let canvas, ctx, img;
let visible = false;
let x = 100, y = 100;
// Speed in pixels per second (was 2.2 / 1.6 px per frame at 60fps).
let vx = 132, vy = 96;
let boxW = 182, boxH = 182;
let animId = null;
let lastTime = null;

// After the extension is reloaded, this old content script keeps running but
// can no longer talk to the extension. Detect that and stay quiet.
function contextValid() {
  try {
    return !!chrome.runtime?.id;
  } catch {
    return false;
  }
}

let sprite = null; // the box image pre-scaled to the exact on-screen pixel size
let dpr = 1;
let boxId = DEFAULT_BOX_ID; // from boxes.js

// Swap to a different box design, keeping the box centered where it is.
function setBox(id) {
  boxId = waltBox(id).id;
  if (!img) return; // overlay not created yet; createOverlay will use boxId
  const oldW = boxW, oldH = boxH;
  const next = new Image();
  next.onload = () => {
    img = next;
    updateBoxHeight();
    x += (oldW - boxW) / 2;
    y += (oldH - boxH) / 2;
  };
  next.src = chrome.runtime.getURL(waltBoxPath(boxId));
}

function updateBoxHeight() {
  if (img && img.complete && img.naturalWidth) {
    boxH = Math.round(boxW / (img.naturalWidth / img.naturalHeight));
    buildSprite();
  }
}

// Downscale the large source image in halving steps with smoothing. A single
// nearest-neighbour shrink from ~1300px to ~150px drops most of the thin lines
// and dither, which is what made the box look noisy at small sizes.
function buildSprite() {
  if (!img || !img.complete || !img.naturalWidth) return;
  const tw = Math.max(1, Math.round(boxW * dpr));
  const th = Math.max(1, Math.round(boxH * dpr));
  let src = img, sw = img.naturalWidth, sh = img.naturalHeight;
  while (sw / 2 >= tw) {
    const step = document.createElement('canvas');
    step.width = Math.round(sw / 2);
    step.height = Math.round(sh / 2);
    const sctx = step.getContext('2d');
    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = 'high';
    sctx.drawImage(src, 0, 0, step.width, step.height);
    src = step; sw = step.width; sh = step.height;
  }
  sprite = document.createElement('canvas');
  sprite.width = tw;
  sprite.height = th;
  const spctx = sprite.getContext('2d');
  spctx.imageSmoothingEnabled = true;
  spctx.imageSmoothingQuality = 'high';
  spctx.drawImage(src, 0, 0, tw, th);
}

// Size the canvas in device pixels so it's sharp on Retina screens.
function resize() {
  const newDpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(window.innerWidth * newDpr);
  canvas.height = Math.round(window.innerHeight * newDpr);
  if (newDpr !== dpr) {
    dpr = newDpr;
    buildSprite();
  }
}

function createOverlay() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.id = 'dewalt-bounce-overlay';
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 2147483647;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  `;
  // documentElement exists even on pages without a <body> (XML, SVG, ...).
  (document.body || document.documentElement).appendChild(canvas);
  ctx = canvas.getContext('2d');

  resize();

  img = new Image();
  img.onload = () => {
    updateBoxHeight();
    if (visible) startLoop();
  };
  img.src = chrome.runtime.getURL(waltBoxPath(boxId));

  window.addEventListener('resize', resize);
}

function startLoop() {
  if (animId) return;
  lastTime = null;
  function loop(now) {
    if (!visible) {
      animId = null;
      return;
    }
    animId = requestAnimationFrame(loop);
    if (!sprite) return;

    // Frame-rate independent movement; cap dt so a backgrounded tab doesn't jump.
    const dt = lastTime === null ? 0 : Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // Movement is in CSS pixels; drawing is in device pixels.
    const W = window.innerWidth;
    const H = window.innerHeight;
    // Never draw the box larger than the viewport (prevents edge jitter).
    const w = Math.min(boxW, W);
    const h = Math.min(boxH, H);

    x += vx * dt;
    y += vy * dt;

    if (x <= 0) { x = 0; vx = Math.abs(vx); }
    else if (x + w >= W) { x = W - w; vx = -Math.abs(vx); }
    if (y <= 0) { y = 0; vy = Math.abs(vy); }
    else if (y + h >= H) { y = H - h; vy = -Math.abs(vy); }

    ctx.imageSmoothingEnabled = false; // reset whenever the canvas is resized
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Whole device pixels + 1:1 sprite size = no resampling blur per frame.
    ctx.drawImage(sprite, Math.round(x * dpr), Math.round(y * dpr),
      Math.round(w * dpr), Math.round(h * dpr));
  }
  animId = requestAnimationFrame(loop);
}

function stopLoop() {
  if (animId) cancelAnimationFrame(animId);
  animId = null;
}

function setVisible(show) {
  visible = show;
  if (show) {
    createOverlay();
    canvas.style.display = 'block';
    startLoop();
  } else if (canvas) {
    canvas.style.display = 'none';
    stopLoop();
  }
}

if (contextValid()) {
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'setVisible') {
      setVisible(msg.visible);
    }
    if (msg.action === 'setSize') {
      // Resize around the box's center so it doesn't jump toward a corner.
      const oldW = boxW, oldH = boxH;
      boxW = msg.size;
      updateBoxHeight();
      x += (oldW - boxW) / 2;
      y += (oldH - boxH) / 2;
    }
  });

  chrome.storage.local.get(['boxSize', 'boxId'], (result) => {
    if (chrome.runtime.lastError) return;
    if (result.boxSize) {
      boxW = result.boxSize;
      updateBoxHeight();
    }
    if (result.boxId && result.boxId !== boxId) setBox(result.boxId);
  });

  // Picking a box in the popup updates every open tab.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.boxId && contextValid()) {
      setBox(changes.boxId.newValue);
    }
  });

  chrome.runtime.sendMessage({ action: 'getState' }, (response) => {
    if (chrome.runtime.lastError) return; // e.g. extension reloaded
    if (response && typeof response.visible === 'boolean') {
      setVisible(response.visible);
    }
  });
}
