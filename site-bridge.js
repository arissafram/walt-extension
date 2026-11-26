// site-bridge.js: tells the Walt download page which version is installed.
// It only runs on the sites listed for it in manifest.json, so other websites
// can't detect Walt. To add your own website, add it to that "matches" list.
(() => {
  const version = chrome.runtime.getManifest().version;
  const reply = () =>
    window.postMessage({ source: 'walt-extension', version }, location.origin);

  document.documentElement.dataset.waltVersion = version;
  reply();
  window.addEventListener('message', (e) => {
    if (e.source === window && e.data?.source === 'walt-page' && e.data.type === 'ping') reply();
  });
})();
