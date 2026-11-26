// background.js
// MV3 service workers are stopped when idle and restarted on demand, so
// in-memory variables can't be trusted. Always derive state from storage
// and chrome.idle instead.

const DEFAULT_IDLE_SECONDS = 30;
const MIN_IDLE_SECONDS = 15; // chrome.idle's minimum

async function getIdleSeconds() {
  const { idleDelay } = await chrome.storage.local.get(['idleDelay']);
  const n = Number(idleDelay);
  return Number.isFinite(n) && n >= MIN_IDLE_SECONDS ? Math.round(n) : DEFAULT_IDLE_SECONDS;
}

async function applyDetectionInterval() {
  chrome.idle.setDetectionInterval(await getIdleSeconds());
}

// Set on every worker start so the interval is always applied.
applyDetectionInterval();

async function getMode() {
  const { mode } = await chrome.storage.local.get(['mode']);
  return mode || 'off';
}

async function queryIdleState() {
  const seconds = await getIdleSeconds();
  return new Promise((resolve) => chrome.idle.queryState(seconds, resolve));
}

// 'locked' (screen locked / computer asleep) counts as sleeping too.
function isSleeping(idleState) {
  return idleState !== 'active';
}

async function shouldShow(idleState) {
  const mode = await getMode();
  if (mode === 'on') return true;
  if (mode === 'detect') {
    const state = idleState ?? (await queryIdleState());
    return isSleeping(state);
  }
  return false;
}

async function broadcastVisibility(idleState) {
  const visible = await shouldShow(idleState);
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'setVisible', visible }).catch(() => {});
    }
  }
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.idleDelay) {
    applyDetectionInterval().then(() => broadcastVisibility());
  } else if (changes.mode) {
    broadcastVisibility();
  }
});

chrome.idle.onStateChanged.addListener(async (newState) => {
  if ((await getMode()) === 'detect') {
    broadcastVisibility(newState);
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getState') {
    shouldShow().then((visible) => sendResponse({ visible }));
    return true; // keep the channel open for the async response
  }
});
