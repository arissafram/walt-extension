// boxes.js — the box designs Walt can bounce. Shared by the popup and content script.
// To add a box: drop a PNG with a transparent background into boxes/ and list it here.
const WALT_BOXES = [
  { id: 'walt-original', name: 'Original' },
  { id: 'walt-dexter', name: 'Dexter' },
  { id: 'walt-ramy', name: 'Ramy' },
  { id: 'walt-sandra', name: 'Sandra' },
  { id: 'walt-jones', name: 'Jones' },
  { id: 'walt-arnold', name: 'Arnold' },
];
const DEFAULT_BOX_ID = 'walt-original';

function waltBox(id) {
  return WALT_BOXES.find((b) => b.id === id) || WALT_BOXES.find((b) => b.id === DEFAULT_BOX_ID);
}

function waltBoxPath(id) {
  return `boxes/${waltBox(id).id}.png`;
}
