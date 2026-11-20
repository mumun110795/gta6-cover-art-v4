// Vice Chrome Studio — application logic: state, photo tray, dealing,
// panel editing (drag / zoom), the words, and PNG export.
// All cover drawing lives in render.js; this file owns the DOM.

import { GRADES, LAYOUTS, panelBox, renderCover } from './render.js';
import { SCENES, openingState } from './shots.js';

// The bundled cast. Face spans are measured on each portrait: x is the
// face's [left, right] and y its [top of hair, chin], as fractions.
export const CAST = {
  siren:    { file: 'cast-siren.jpg',    label: 'The Siren',    face: { x: [0.365, 0.702], y: [0.170, 0.458] } },
  gambler:  { file: 'cast-gambler.jpg',  label: 'The Gambler',  face: { x: [0.240, 0.728], y: [0.071, 0.577] } },
  surfer:   { file: 'cast-surfer.jpg',   label: 'The Surfer',   face: { x: [0.365, 0.745], y: [0.078, 0.390] } },
  heiress:  { file: 'cast-heiress.jpg',  label: 'The Heiress',  face: { x: [0.388, 0.718], y: [0.142, 0.448] } },
  dj:       { file: 'cast-dj.jpg',       label: 'The DJ',       face: { x: [0.318, 0.832], y: [0.099, 0.486] } },
  vixen:    { file: 'cast-vixen.jpg',    label: 'The Vixen',    face: { x: [0.350, 0.790], y: [0.160, 0.490] } },
  showgirl: { file: 'cast-showgirl.jpg', label: 'The Showgirl', face: { x: [0.360, 0.750], y: [0.170, 0.470] } },
  scene:    { file: 'scene-motel.jpg',   label: 'Motel scene',  face: null },
  pano:     { file: 'scene-motel-pano.jpg', label: 'Motel pano', face: null },
};
const CAST_ORDER = ['siren', 'gambler', 'surfer', 'heiress', 'dj', 'vixen', 'showgirl'];

// Default deals per layout, in role order, as [photo, tag] pairs.
const DEALS = {
  ensemble: [['siren', 'THE SIREN'], ['gambler', 'THE GAMBLER'], ['surfer', 'THE SURFER'], ['heiress', 'THE HEIRESS'], ['dj', 'THE DJ']],
  motel: [['vixen', 'THE VIXEN'], ['showgirl', 'THE SHOWGIRL'], ['pano', null]],
  hero: [['siren', 'THE SIREN'], ['heiress', 'THE HEIRESS'], ['gambler', 'THE GAMBLER']],
  duo: [['siren', 'THE SIREN'], ['vixen', 'THE VIXEN']],
  quad: [['gambler', 'THE GAMBLER'], ['heiress', 'THE HEIRESS'], ['surfer', 'THE SURFER'], ['dj', 'THE DJ']],
};

const SIZES = [[1080, 1080], [1080, 1350], [1920, 1080]];

const canvas = document.getElementById('cover');
const ctx = canvas.getContext('2d');
const photos = {};   // id -> HTMLImageElement
const photoMeta = {}; // id -> {label, face}
let userCount = 0;

let state = openingState();
let size = [1920, 1080];
let selected = 0;
let editorUI = true;

function makeSlot(photo, tag, headroom) {
  return {
    photo,
    tag: tag ?? null,
    face: photo && CAST[photo] ? CAST[photo].face : null,
    headroom: headroom ?? 0.10,
    nudge: { x: 0, y: 0, zoom: 1 },
  };
}
function deal(layoutName) {
  return (DEALS[layoutName] || []).map(([photo, tag]) => makeSlot(photo, tag));
}
function hydrateSlots(slots) {
  return slots.map(s => makeSlot(s.photo, s.tag, s.headroom));
}
state.slots = hydrateSlots(state.slots);

function loadPhoto(id, src, meta) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { photos[id] = img; photoMeta[id] = meta; resolve(img); };
    img.onerror = reject;
    img.src = src;
  });
}

function currentPanels() {
  return LAYOUTS[state.layout].panels();
}

function render() {
  canvas.width = size[0];
  canvas.height = size[1];
  const st = { ...state, slots: state.slots };
  renderCover(ctx, size[0], size[1], st, photos, { editor: editorUI, selected: editorUI ? selected : null });
}

// ---- tray ------------------------------------------------------------------
const tray = document.getElementById('tray');
function addThumb(id) {
  const el = document.createElement('div');
  el.className = 'thumb';
  el.dataset.photo = id;
  const img = document.createElement('img');
  img.src = photos[id].src;
  img.alt = photoMeta[id].label;
  const cap = document.createElement('span');
  cap.textContent = photoMeta[id].label;
  el.append(img, cap);
  el.addEventListener('click', () => placeInSelected(id));
  tray.append(el);
}
function placeInSelected(id) {
  const slot = state.slots[selected];
  if (!slot) return;
  slot.photo = id;
  slot.face = CAST[id] ? CAST[id].face : null;
  slot.tag = CAST[id] ? `THE ${CAST[id].label.replace(/^The /, '').toUpperCase()}` : slot.tag;
  slot.nudge = { x: 0, y: 0, zoom: 1 };
  document.querySelectorAll('.thumb').forEach(t => t.classList.toggle('active', t.dataset.photo === id));
  render();
}

// ---- controls ----------------------------------------------------------------
function chips(el, items, current, onPick) {
  el.innerHTML = '';
  for (const [value, label] of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (value === current ? ' active' : '');
    b.textContent = label;
    b.addEventListener('click', () => onPick(value));
    el.append(b);
  }
}
function refreshChips() {
  chips(document.getElementById('layoutChips'),
    Object.entries(LAYOUTS).map(([k, v]) => [k, v.label]), state.layout,
    name => { state.layout = name; state.slots = deal(name); selected = 0; syncWords(); refreshChips(); render(); });
  chips(document.getElementById('gradeChips'),
    Object.entries(GRADES).map(([k, v]) => [k, v.label]), state.grade,
    name => { state.grade = name; refreshChips(); render(); });
  chips(document.getElementById('sizeChips'),
    SIZES.map(([w, h]) => [`${w}x${h}`, `${w} × ${h}`]), `${size[0]}x${size[1]}`,
    v => { size = v.split('x').map(Number); refreshChips(); render(); });
}

const words = [
  ['captionIn', 'caption'], ['subtitleIn', 'subtitle'], ['taglineIn', 'tagline'],
];
function syncWords() {
  for (const [id, key] of words) document.getElementById(id).value = state[key] || '';
}
for (const [id, key] of words) {
  document.getElementById(id).addEventListener('input', e => { state[key] = e.target.value; render(); });
}

document.getElementById('dealBtn').addEventListener('click', () => {
  state.slots = deal(state.layout);
  selected = 0;
  render();
});
document.getElementById('motelBtn').addEventListener('click', () => {
  const scene = SCENES[3].state();
  state = { ...scene, slots: hydrateSlots(scene.slots) };
  selected = 0;
  syncWords(); refreshChips(); render();
});
document.getElementById('exportBtn').addEventListener('click', () => {
  const out = document.createElement('canvas');
  out.width = size[0]; out.height = size[1];
  renderCover(out.getContext('2d'), size[0], size[1], state, photos, { editor: false });
  out.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-chrome-cover-${size[0]}x${size[1]}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    document.getElementById('status').textContent = `Exported PNG ${size[0]} × ${size[1]}.`;
  }, 'image/png');
});

const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', async () => {
  for (const file of fileInput.files) await addUserPhoto(file);
  fileInput.value = '';
});
async function addUserPhoto(file) {
  const id = `user-${++userCount}`;
  const url = URL.createObjectURL(file);
  await loadPhoto(id, url, { label: file.name.replace(/\.[^.]+$/, ''), face: null });
  addThumb(id);
  placeInSelected(id);
}
canvas.addEventListener('dragover', e => e.preventDefault());
canvas.addEventListener('drop', async e => {
  e.preventDefault();
  for (const file of e.dataTransfer.files) if (file.type.startsWith('image/')) await addUserPhoto(file);
});

// ---- panel editing -----------------------------------------------------------
function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
}
function panelAt(pt) {
  const panels = currentPanels();
  for (let i = panels.length - 1; i >= 0; i--) {
    if (pointInPoly(pt, panels[i].pts)) return i;
  }
  return -1;
}
function pointInPoly(pt, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if ((a.y > pt.y) !== (b.y > pt.y) &&
        pt.x < (b.x - a.x) * (pt.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

let drag = null;
canvas.addEventListener('pointerdown', e => {
  const i = panelAt(canvasPoint(e));
  if (i < 0) return;
  selected = i;
  drag = { x: e.clientX, y: e.clientY };
  canvas.setPointerCapture(e.pointerId);
  render();
});
canvas.addEventListener('pointermove', e => {
  if (!drag) return;
  const slot = state.slots[selected];
  if (!slot || !slot.photo) return;
  const box = panelBox(currentPanels()[selected], size[0], size[1]);
  const r = canvas.getBoundingClientRect();
  const dx = (e.clientX - drag.x) / r.width * size[0];
  const dy = (e.clientY - drag.y) / r.height * size[1];
  slot.nudge.x -= dx / box.w;
  slot.nudge.y -= dy / box.h;
  drag = { x: e.clientX, y: e.clientY };
  render();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('wheel', e => {
  const i = panelAt(canvasPoint(e));
  if (i < 0) return;
  e.preventDefault();
  selected = i;
  const slot = state.slots[selected];
  if (!slot) return;
  slot.nudge.zoom = Math.min(2.5, Math.max(0.45, slot.nudge.zoom * Math.exp(e.deltaY * 0.0012)));
  render();
}, { passive: false });
canvas.addEventListener('dblclick', e => {
  const i = panelAt(canvasPoint(e));
  if (i >= 0 && state.slots[i]) { state.slots[i].nudge = { x: 0, y: 0, zoom: 1 }; render(); }
});

// ---- boot ----------------------------------------------------------------------
async function boot() {
  const query = new URLSearchParams(location.search);
  const shotNo = query.get('shot');
  const scene = shotNo ? SCENES[shotNo] : null;

  await Promise.all(Object.entries(CAST).map(([id, c]) =>
    loadPhoto(id, `samples/${c.file}`, { label: CAST[id].label, face: c.face })));
  for (const id of Object.keys(CAST)) addThumb(id);

  if (scene) {
    const s = scene.state();
    state = { ...s, slots: hydrateSlots(s.slots) };
    size = scene.size.slice();
    if (scene.kind === 'export') {
      editorUI = false;
      document.body.classList.add('shot-cover');
      canvas.style.width = `${size[0]}px`;
      canvas.style.height = `${size[1]}px`;
    }
  }
  syncWords();
  refreshChips();
  render();
  if (document.fonts && document.fonts.ready) { await document.fonts.ready; render(); }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
boot();
