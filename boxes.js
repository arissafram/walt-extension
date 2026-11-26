// boxes.js — the box designs Walt can bounce. Shared by the popup and content script.
// To add a box: drop a PNG with a transparent background into boxes/ and list it here.
const WALT_BOXES = [
  { id: 'walt-original', name: 'Original' },
  { id: 'walt-classic', name: 'Classic' },
  { id: 'walt-industrial', name: 'Industrial' },
  { id: 'walt-explorer', name: 'Explorer' },
  { id: 'walt-tough', name: 'Tough' },
  { id: 'walt-sandra', name: 'Sandra' },
];
const DEFAULT_BOX_ID = 'walt-original';

function waltBox(id) {
  return WALT_BOXES.find((b) => b.id === id) || WALT_BOXES.find((b) => b.id === DEFAULT_BOX_ID);
}

function waltBoxPath(id) {
  return `boxes/${waltBox(id).id}.png`;
}
