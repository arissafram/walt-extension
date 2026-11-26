// popup.js
const STATUS = {
  on: { pill: 'Enabled', hint: '' },
  off: { pill: 'Disabled', hint: 'Hidden' },
  detect: { pill: 'Sleep mode', hint: '' }, // hint comes from the delay picker
};
const DEFAULT_DELAY = 30;

const delayRow = document.getElementById('delay-row');
const delaySelect = document.getElementById('delay');

function delayLabel() {
  return delaySelect.options[delaySelect.selectedIndex]?.text || '30 sec';
}

const stage = document.getElementById('stage');
const mini = document.getElementById('mini');
const hint = document.getElementById('hint');
const pill = document.getElementById('status');
const sizeInput = document.getElementById('size');
const sizeVal = document.getElementById('size-val');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let mode = 'off';
let miniW = 40, miniH = 29;
let px = 20, py = 12, vx = 38, vy = 26; // preview position + speed (px/s)
let last = null;

// ---- Preview -------------------------------------------------------------

// Map the real size range (80–400px) onto the small preview stage.
function setMiniSize(size) {
  // Grow/shrink around the box's current center rather than its top-left corner.
  const cx = px + miniW / 2, cy = py + miniH / 2;
  miniW = Math.round(22 + ((size - 80) / 320) * 42);
  const ratio = mini.naturalWidth ? mini.naturalHeight / mini.naturalWidth : 0.73;
  miniH = Math.round(miniW * ratio);
  mini.style.width = miniW + 'px';
  mini.style.height = miniH + 'px';
  if (mode === 'on' && !reduceMotion) {
    px = cx - miniW / 2;
    py = cy - miniH / 2;
    clampToStage();
  } else {
    centerMini();
  }
  placeMini();
}

function clampToStage() {
  px = Math.max(0, Math.min(px, stage.clientWidth - miniW));
  py = Math.max(0, Math.min(py, stage.clientHeight - miniH));
}

// Center in the space above the hint text so even the largest box never touches it.
const HINT_SPACE = 22;
function centerMini() {
  px = (stage.clientWidth - miniW) / 2;
  py = Math.max(6, (stage.clientHeight - HINT_SPACE - miniH) / 2 + 2);
}

function placeMini() {
  mini.style.transform = `translate(${Math.round(px)}px, ${Math.round(py)}px)`;
}

function tick(now) {
  requestAnimationFrame(tick);
  const dt = last === null ? 0 : Math.min((now - last) / 1000, 0.1);
  last = now;
  if (mode !== 'on' || reduceMotion) return;

  const W = stage.clientWidth, H = stage.clientHeight;
  px += vx * dt;
  py += vy * dt;
  if (px <= 0) { px = 0; vx = Math.abs(vx); }
  else if (px + miniW >= W) { px = W - miniW; vx = -Math.abs(vx); }
  if (py <= 0) { py = 0; vy = Math.abs(vy); }
  else if (py + miniH >= H) { py = H - miniH; vy = -Math.abs(vy); }
  placeMini();
}

// ---- State ---------------------------------------------------------------

function applyMode(next) {
  mode = STATUS[next] ? next : 'off';
  pill.dataset.mode = mode;
  stage.dataset.mode = mode;
  pill.textContent = STATUS[mode].pill;
  hint.textContent = mode === 'detect' ? `Shows after ${delayLabel()} idle` : STATUS[mode].hint;
  delaySelect.disabled = mode !== 'detect';
  delayRow.classList.toggle('disabled', mode !== 'detect');
  const radio = document.querySelector(`input[name="mode"][value="${mode}"]`);
  if (radio) radio.checked = true;
  if (mode !== 'on' || reduceMotion) {
    centerMini();
    placeMini();
  }
}

function applySize(size) {
  sizeInput.value = size;
  sizeVal.textContent = size + 'px';
  const pct = ((size - sizeInput.min) / (sizeInput.max - sizeInput.min)) * 100;
  sizeInput.style.setProperty('--fill', pct + '%');
  setMiniSize(size);
}

// Works inside the extension; falls back to defaults when opened as a plain page.
const hasChrome = typeof chrome !== 'undefined' && chrome.storage;

function init(result) {
  const delay = String(result.idleDelay || DEFAULT_DELAY);
  delaySelect.value = [...delaySelect.options].some((o) => o.value === delay) ? delay : String(DEFAULT_DELAY);
  applySize(result.boxSize || 182);
  applyMode(result.mode || 'off');
  requestAnimationFrame(tick);
}

mini.addEventListener('load', () => setMiniSize(parseInt(sizeInput.value, 10)));

if (hasChrome) {
  chrome.storage.local.get(['mode', 'boxSize', 'idleDelay'], init);
} else {
  init({});
}

document.querySelectorAll('input[name="mode"]').forEach((radio) => {
  radio.addEventListener('change', (e) => {
    applyMode(e.target.value);
    if (hasChrome) chrome.storage.local.set({ mode: e.target.value });
  });
});

delaySelect.addEventListener('change', () => {
  applyMode(mode); // refresh the hint text
  if (hasChrome) chrome.storage.local.set({ idleDelay: parseInt(delaySelect.value, 10) });
});

sizeInput.addEventListener('input', (e) => {
  const size = parseInt(e.target.value, 10);
  applySize(size);
  if (!hasChrome) return;
  chrome.storage.local.set({ boxSize: size });
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) chrome.tabs.sendMessage(tab.id, { action: 'setSize', size }).catch(() => {});
    });
  });
});
