// main.js — the Vice Chrome Studio editor and cover renderer.
//
// The app is this module plus layouts.js (eight panel arrangements),
// chrome-type.js (the retro-chrome caption lettering and the small type
// helpers) and backdrop.js (the painted sunset an empty panel shows).
// Everything runs on the visitor's own machine: photos are read from
// their files into memory, drawn on canvas panel by panel, graded,
// captioned in chrome with a script subtitle, dressed with cast tags, a
// review-quote strip, a tagline ribbon, a seal, a billing block and the
// poster extras (barcode, volume badge, "coming soon"), and exported as
// a PNG. Nothing is uploaded; the only files the page ever asks for
// beyond its own code are the bundled samples in samples/ — five cast
// portraits, which fill the Ensemble Five cover on first load so the
// studio opens on a finished cover, two more portraits dealt by the
// Motel Row preset and the square Teal Confession cover, and one neon
// motel scene, which anchors the Motel Row layout (in two framings:
// the scene itself for tall covers, and a composed panorama of it
// for wide ones).

import { LAYOUTS, panelsFor, panelBox, pointInPanel } from './layouts.js';
import {
  drawChromeText, drawScriptText, drawSpacedText, measureSpacedText, measureChromeText, scriptFont, drawCircularText, condensedFont,
} from './chrome-type.js';
import { paintBackdrop } from './backdrop.js';
import { shotConfigFromQuery } from './shots.js';

// The three post sizes the exporter offers; the preview canvas adopts
// whichever is picked, so what you see is exactly what you get.
const SIZES = {
  square: [1080, 1080],
  portrait: [1080, 1350],
  wide: [1920, 1080],
};

// Colour grades. Each is a set of gradient washes painted over the photo
// layer as a whole — photos and painted backdrops together — plus a
// sky-glow: a soft screen-blended bloom centred above the top edge, the
// sun sitting just out of frame. Mono Noir instead desaturates the layer
// as it is composited (see NOIR_FILTER) and only deepens the foot.
const GRADES = {
  sunset: {
    washes: [
      ['soft-light', [[0, 'rgba(255,138,60,0.85)'], [0.45, 'rgba(255,47,128,0.45)'], [1, 'rgba(24,0,66,0.55)']]],
      ['source-over', [[0, 'rgba(255,110,40,0.10)'], [0.55, 'rgba(255,110,40,0)'], [1, 'rgba(110,8,80,0.16)']]],
    ],
    glow: 'rgba(255,146,54,0.5)',
  },
  neon: {
    washes: [
      ['soft-light', [[0, 'rgba(0,255,216,0.75)'], [0.5, 'rgba(64,0,255,0.35)'], [1, 'rgba(255,0,166,0.75)']]],
      ['source-over', [[0, 'rgba(0,30,60,0.14)'], [0.6, 'rgba(0,30,60,0)'], [1, 'rgba(60,0,90,0.18)']]],
    ],
    glow: 'rgba(0,229,255,0.34)',
  },
  gold: {
    washes: [
      ['soft-light', [[0, 'rgba(255,176,48,0.8)'], [1, 'rgba(255,120,20,0.5)']]],
      ['source-over', [[0, 'rgba(255,166,0,0.10)'], [1, 'rgba(84,32,0,0.14)']]],
    ],
    glow: 'rgba(255,183,64,0.55)',
  },
  teal: {
    washes: [
      ['soft-light', [[0, 'rgba(64,224,208,0.65)'], [0.55, 'rgba(16,80,110,0.4)'], [1, 'rgba(8,16,64,0.6)']]],
      ['source-over', [[0, 'rgba(0,40,50,0.10)'], [1, 'rgba(2,8,34,0.20)']]],
    ],
    glow: 'rgba(64,224,208,0.4)',
  },
  noir: {
    washes: [
      ['source-over', [[0, 'rgba(0,0,0,0.05)'], [0.7, 'rgba(0,0,0,0.02)'], [1, 'rgba(0,0,0,0.26)']]],
    ],
    glow: null,
  },
  raw: { washes: [], glow: null },
};
const NOIR_FILTER = 'grayscale(1) contrast(1.09) brightness(1.03)';

const MAX_PANELS = 6;
const TAG_COLORS = ['#ff2e88', '#ffb02e', '#35d0ff', '#8dff57', '#ff7847', '#c86bff'];
const DEFAULT_TAGS = ['THE SIREN', 'THE GAMBLER', 'THE SURFER', 'THE HEIRESS', 'THE DJ', 'THE ACE'];
const DEFAULT_BILLING = 'VICE CHROME STUDIO presents VELVET HEAT · starring five sinners · shot in LEONIDA · no saints were consulted';

// The bundled cast: five portraits in samples/, one per Ensemble Five
// panel. The layout's panel order is centre, top-left, bottom-left,
// top-right, bottom-right, and the cast list follows it — the siren
// takes the centre, and each portrait brings its own cast tag with it.
// Each entry also carries its measured face: `face` is the span from
// the top of the hair to the chin as a fraction of the photo's height,
// `faceX` the face's horizontal extent as a fraction of its width.
// The Ensemble panels are shorter than the tall portraits, so a plain
// centred cover-fit slices the faces off at the hairline or the chin;
// assignCast fits each dealt crop to these spans instead (see
// fitCastPanel), the way assignMotel fits the Motel Row pair.
const CAST = [
  { file: 'samples/cast-siren.jpg', name: 'Cast — The Siren', tag: 'THE SIREN', face: [0.170, 0.458], faceX: [0.365, 0.702] },
  { file: 'samples/cast-gambler.jpg', name: 'Cast — The Gambler', tag: 'THE GAMBLER', face: [0.071, 0.577], faceX: [0.240, 0.728] },
  { file: 'samples/cast-surfer.jpg', name: 'Cast — The Surfer', tag: 'THE SURFER', face: [0.078, 0.390], faceX: [0.365, 0.745] },
  { file: 'samples/cast-heiress.jpg', name: 'Cast — The Heiress', tag: 'THE HEIRESS', face: [0.142, 0.448], faceX: [0.388, 0.718] },
  { file: 'samples/cast-dj.jpg', name: 'Cast — The DJ', tag: 'THE DJ', face: [0.099, 0.486], faceX: [0.318, 0.832] },
];

// The Motel Row pair: two more portraits that belong to the motel
// cover alone — the vixen takes the left portrait panel, the showgirl
// the right, over the scene in the wide foot. Each entry carries its
// measured face span (hairline to chin, as a fraction of the photo's
// height): the panels are wide and short, and the crops in assignMotel
// are fitted to these spans so both faces survive them whole.
const MOTEL_CAST = [
  { file: 'samples/cast-vixen.jpg', name: 'Cast — The Vixen', tag: 'THE VIXEN', face: [0.198, 0.485] },
  { file: 'samples/cast-showgirl.jpg', name: 'Cast — The Showgirl', tag: 'THE SHOWGIRL', face: [0.210, 0.440] },
];

// The billing line the Motel Row preset sets: the pair it stars.
const MOTEL_BILLING = 'VICE CHROME STUDIO presents MOTEL ROW · starring the vixen and the showgirl · checkout is at dawn';

// The Teal Confession cast: the square demo cover's company — the
// Motel Row pair promoted into the ensemble alongside three of the
// five, so the shipped screenshots show the studio dealing more than
// one cast. Panel order follows the layout's: centre, top-left,
// bottom-left, top-right, bottom-right — the vixen takes the centre,
// the showgirl the top-left, and the surfer, the siren and the
// gambler fill the rest straight from the cast table. The pair's
// entries here carry the spans the ensemble's face-fit solves
// against (hairline to chin, and the face's horizontal extent);
// MOTEL_CAST's spans serve the motel centring instead, so the pair
// is measured once for each dealing.
const CONFESSION_CAST = [
  { file: 'samples/cast-vixen.jpg', name: 'Cast — The Vixen', tag: 'THE VIXEN', face: [0.160, 0.490], faceX: [0.350, 0.790] },
  { file: 'samples/cast-showgirl.jpg', name: 'Cast — The Showgirl', tag: 'THE SHOWGIRL', face: [0.170, 0.470], faceX: [0.360, 0.750] },
  CAST[2], // the surfer, bottom-left
  CAST[0], // the siren, top-right
  CAST[1], // the gambler, bottom-right
];

// The bundled scene: a neon-noir motel exterior with no people in it,
// the wide foot panel of the Motel Row layout. It rides in the tray
// alongside the cast but is never dealt into the ensemble.
const SCENE = { file: 'samples/scene-motel.jpg', name: 'Scene — Motel Row', tag: '' };

// The same scene composed as a wide panorama (1100x286): the whole
// scene — sign, building, pool and convertible — remapped into the
// strip the wide Motel Row foot panel asks for. A cover-fit of the
// scene itself into that strip could only show a 39% slice of it,
// slicing the neon sign off at the L and losing the car entirely; the
// panorama is what the wide geometry deals in instead.
const SCENE_PANO = { file: 'samples/scene-motel-pano.jpg', name: 'Scene — Motel Row Panorama', tag: '' };

const state = {
  photos: [], // {id, name, url, img}
  nextPhotoId: 1,
  panels: Array.from({ length: MAX_PANELS }, (_, i) => ({
    photoId: null, dx: 0, dy: 0, zoom: 1, tag: DEFAULT_TAGS[i],
  })),
  selectedPanel: 0,
  layoutIndex: 0, // Ensemble Five is the signature arrangement; open on it.
  grade: 'sunset',
  caption: 'VELVET HEAT',
  captionScale: 1,
  captionPos: 'top',
  subtitle: 'no saints after dark',
  subtitleOn: true,
  size: 'wide',
  tagsOn: true,
  quoteOn: true,
  quoteText: 'SIN NEVER LOOKED THIS GOOD',
  quoteSource: 'THE BAYSIDE BUGLE',
  taglineOn: true,
  tagline: 'FIVE SINS · ONE CITY · NO SAINTS',
  extrasOn: true,
  billingOn: true,
  billing: DEFAULT_BILLING,
  sealOn: true,
  sealPos: 'br',
  cleanShot: false,
};

const els = {
  canvas: document.getElementById('coverCanvas'),
  fileInput: document.getElementById('fileInput'),
  castBtn: document.getElementById('castBtn'),
  tray: document.getElementById('tray'),
  layoutGroup: document.getElementById('layoutGroup'),
  gradeGroup: document.getElementById('gradeGroup'),
  panelLabel: document.getElementById('panelLabel'),
  zoomRange: document.getElementById('zoomRange'),
  tagInput: document.getElementById('tagInput'),
  resetCropBtn: document.getElementById('resetCropBtn'),
  clearPanelBtn: document.getElementById('clearPanelBtn'),
  captionInput: document.getElementById('captionInput'),
  captionSize: document.getElementById('captionSize'),
  captionPosBtn: document.getElementById('captionPosBtn'),
  subtitleInput: document.getElementById('subtitleInput'),
  subtitleToggle: document.getElementById('subtitleToggle'),
  tagsToggle: document.getElementById('tagsToggle'),
  quoteToggle: document.getElementById('quoteToggle'),
  quoteInput: document.getElementById('quoteInput'),
  quoteSourceInput: document.getElementById('quoteSourceInput'),
  taglineToggle: document.getElementById('taglineToggle'),
  taglineInput: document.getElementById('taglineInput'),
  extrasToggle: document.getElementById('extrasToggle'),
  billingToggle: document.getElementById('billingToggle'),
  billingInput: document.getElementById('billingInput'),
  sealToggle: document.getElementById('sealToggle'),
  sealPos: document.getElementById('sealPos'),
  sizeGroup: document.getElementById('sizeGroup'),
  exportBtn: document.getElementById('exportBtn'),
  stage: document.getElementById('stage'),
};

// ---------------------------------------------------------------- photos

function currentLayout() {
  return LAYOUTS[state.layoutIndex];
}

function currentPolys(W, H) {
  const m = Math.round(Math.min(W, H) * 0.02);
  return panelsFor(currentLayout(), W / H, W - m * 2, H - m * 2)
    .map((poly) => poly.map(([x, y]) => [x + m, y + m]));
}

function photoById(id) {
  return state.photos.find((p) => p.id === id) || null;
}

function addPhoto(img, name, url) {
  const photo = { id: state.nextPhotoId++, name, url, img };
  state.photos.push(photo);
  const anyFilled = state.panels.some((p) => p.photoId !== null);
  if (!anyFilled) {
    // First photo in: fill every panel with it. Each panel keeps its own
    // crop, so one photo still reads as a composed multi-panel cover.
    for (const panel of state.panels) panel.photoId = photo.id;
  } else if (state.panels[state.selectedPanel].photoId === null) {
    state.panels[state.selectedPanel].photoId = photo.id;
  }
  renderTray();
  renderPreview();
}

function loadPhotoFiles(files) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => addPhoto(img, file.name, url);
    img.src = url;
  }
}

// The bundled samples, loaded once and kept as ordinary tray photos
// from then on. castPhotos stays in CAST order, so castPhotos[k] is
// CAST[k]'s portrait wherever it is placed; the Motel Row pair is
// kept apart in motelCastPhotos, and the motel scene and its panorama
// in scenePhoto and scenePanoPhoto, ready for the Motel Row layout.
let castPhotos = null;
let motelCastPhotos = null;
let scenePhoto = null;
let scenePanoPhoto = null;

function loadCastSamples() {
  if (castPhotos) return Promise.resolve();
  const loadOne = (entry) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ entry, img });
    img.onerror = () => resolve(null);
    img.src = entry.file;
  });
  return Promise.all([...CAST.map(loadOne), ...MOTEL_CAST.map(loadOne), loadOne(SCENE), loadOne(SCENE_PANO)]).then((loaded) => {
    castPhotos = [];
    motelCastPhotos = [];
    for (const item of loaded) {
      if (!item) continue;
      const photo = { id: state.nextPhotoId++, name: item.entry.name, url: item.entry.file, img: item.img };
      state.photos.push(photo);
      if (item.entry === SCENE) scenePhoto = photo;
      else if (item.entry === SCENE_PANO) scenePanoPhoto = photo;
      else if (MOTEL_CAST.includes(item.entry)) motelCastPhotos.push(photo);
      else castPhotos.push(photo);
    }
    if (castPhotos.length) els.castBtn.textContent = 'Cast samples added';
    renderTray();
  });
}

// Which framing of the motel scene the foot panel should hold: the
// panorama when the current post size gives the Motel Row layout its
// wide geometry, the scene itself when it gives the tall one.
function motelScenePhoto() {
  const [W, H] = SIZES[state.size];
  return W / H >= 1.2 && scenePanoPhoto ? scenePanoPhoto : scenePhoto;
}

// ------------------------------------------------------- face-fit dealing

// A scratch context for measuring type the way the renderer sets it,
// so the furniture rectangles below match the painted cover.
const measureCtx = document.createElement('canvas').getContext('2d');

// The rectangles the poster furniture will occupy on the current
// cover — the quote strip, the chrome title and its script subtitle,
// the tagline ribbon, the seal, the poster extras and the billing
// line — measured with the renderer's own geometry, so a dealt face
// can be kept out from under all of them. The Motel Row layout moves
// its title block into the scene panel, where its own dealing does
// its own fitting, so no rectangles are claimed for it here.
function furnitureRects(W, H) {
  const rects = [];
  const minSide = Math.min(W, H);
  const push = (x0, y0, x1, y1) => rects.push({ x0, y0, x1, y1 });
  if (currentLayout().id === 'motel') return rects;
  if (state.quoteOn && state.quoteText.trim()) {
    push(0, 0, W, minSide * 0.042);
  }
  const caption = state.caption.trim();
  if (caption) {
    const titleH = H * 0.118 * state.captionScale;
    const titleY = state.captionPos === 'top' ? H * 0.115 : H * 0.875;
    let pxF = titleH / 0.716;
    let w = measureChromeText(measureCtx, caption.toUpperCase(), pxF);
    if (w > W * 0.93) { pxF *= (W * 0.93) / w; w = W * 0.93; }
    push(W / 2 - w / 2 - pxF * 0.14, titleY - pxF * 0.3, W / 2 + w / 2 + pxF * 0.14, titleY + pxF * 0.78);
    const subtitle = state.subtitle.trim();
    if (state.subtitleOn && subtitle) {
      let size = H * 0.05 * state.captionScale;
      measureCtx.save();
      measureCtx.font = scriptFont(size);
      let sw = measureCtx.measureText(subtitle).width;
      measureCtx.restore();
      if (sw > W * 0.7) { size *= (W * 0.7) / sw; sw = W * 0.7; }
      const subY = state.captionPos === 'top' ? titleY + titleH * 0.78 : titleY - titleH * 0.82;
      push(W / 2 - sw / 2 - 6, subY - size * 0.62, W / 2 + sw / 2 + 6, subY + size * 0.62);
    }
  }
  if (state.taglineOn && state.tagline.trim()) {
    const px = minSide * 0.0245;
    const textW = measureSpacedText(measureCtx, state.tagline.trim().toUpperCase(), {
      font: condensedFont(px, 700), spacing: px * 0.24,
    });
    const halfW = Math.min(W * 0.46, textW / 2 + px * 1.6);
    const y = state.captionPos === 'top' ? H * 0.295 : H * 0.705;
    const rh = px * 1.95;
    push(W / 2 - halfW - 4, y - rh / 2 - halfW * 0.016 - 4, W / 2 + halfW + 4, y + rh / 2 + halfW * 0.016 + 4);
  }
  if (state.sealOn) {
    const r = minSide * 0.082;
    const margin = minSide * 0.032;
    let cx = W - r - margin;
    let cy = H - r - margin - minSide * 0.035;
    if (state.sealPos === 'bl') cx = r + margin;
    if (state.sealPos === 'tr') cy = r + margin;
    if (state.sealPos === 'br' && state.extrasOn) cy -= minSide * 0.088;
    push(cx - r - 3, cy - r - 3, cx + r + 3, cy + r + 3);
  }
  if (state.extrasOn) {
    const margin = minSide * 0.018;
    const vpx = minSide * 0.019;
    measureCtx.save();
    measureCtx.font = condensedFont(vpx, 700);
    const vw = measureCtx.measureText('VOL. 1').width + vpx * 1.5;
    measureCtx.restore();
    push(W - margin - vw - 3, margin - 3, W - margin + 3, margin + vpx * 1.8 + 3);
    const cpx = minSide * 0.019;
    const csW = measureSpacedText(measureCtx, 'COMING SOON', {
      font: condensedFont(cpx, 700), spacing: cpx * 0.3,
    });
    push(margin, H - minSide * 0.045 - cpx * 0.7, margin + minSide * 0.006 + csW + 3, H - minSide * 0.045 + cpx * 0.7);
    const bw = minSide * 0.104;
    const bh = minSide * 0.06;
    push(W - margin - bw - 3, H - margin - bh - 3, W - margin + 3, H - margin + 3);
  }
  if (state.billingOn && state.billing.trim()) {
    const text = state.billing.trim().toUpperCase();
    const maxW = state.extrasOn ? W * 0.54 : W * 0.92;
    let px = minSide * 0.0165;
    const fit = () => measureSpacedText(measureCtx, text, { font: condensedFont(px, 600), spacing: px * 0.16 });
    while (fit() > maxW && px > 7) px -= 0.5;
    const width = fit();
    const y = H - minSide * 0.045;
    push(W / 2 - width / 2 - 3, y - px * 1.15, W / 2 + width / 2 + 3, y + px * 0.65);
  }
  return rects;
}

// The rectangle one panel's cast tag will occupy (see drawTags).
function panelTagRect(panel, box, W, H) {
  if (!state.tagsOn) return null;
  const tag = (panel.tag || '').trim().toUpperCase();
  if (!tag) return null;
  const minSide = Math.min(W, H);
  const px = minSide * 0.021;
  measureCtx.save();
  measureCtx.font = condensedFont(px, 700);
  const textW = measureCtx.measureText(tag).width;
  measureCtx.restore();
  const pw = textW + px * 1.7;
  const ph = px * 1.62;
  const bottomRow = box.y + box.h > H - minSide * 0.08;
  const lift = bottomRow && (state.billingOn || state.extrasOn) ? minSide * 0.047 : 0;
  const x = box.x + minSide * 0.016;
  const y = box.y + box.h - minSide * 0.016 - ph - lift;
  return { x0: x - 3, y0: y - 3, x1: x + pw + 3, y1: y + ph + 3 };
}

// The rectangle guaranteed to sit inside a panel: for a four-point
// panel each side is pulled in to the farthest the panel's slanted
// boundary ever reaches, so a face fitted into this box is inside the
// panel at every height, clear of the seams. Other panel shapes fall
// back to the bounding box.
function inscribedBox(poly, box) {
  if (poly.length !== 4) return { ...box };
  const [a, b, c, d] = poly;
  const x = Math.max(a[0], d[0]);
  const y = Math.max(a[1], b[1]);
  return { x, y, w: Math.min(b[0], c[0]) - x, h: Math.min(c[1], d[1]) - y };
}

// Fit one dealt portrait's crop so its measured face lands whole
// inside its panel and clear of the poster furniture. The crop is a
// zoom (never below the plain cover-fit) plus an offset; what is
// solved for is the face's position inside the panel — first at the
// smallest zoom that admits a placement inside a margin-shrunk panel
// box with no furniture over the face, then, failing that, with a
// scan of the plain cover-fit placements that keeps the face inside
// the panel and takes the least furniture overlap. Manual crops are
// untouched: this runs only when the cast is dealt.
function fitCastPanel(panel, entry, poly, blocked) {
  const photo = photoById(panel.photoId);
  if (!photo || !entry.face) return;
  const img = photo.img;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih) return;
  const box = panelBox(poly);
  const inner = inscribedBox(poly, box);
  const [ft, fb] = entry.face;
  const [fx0, fx1] = entry.faceX;
  const s0 = Math.max(box.w / iw, box.h / ih);
  const M = Math.max(6, Math.min(box.w, box.h) * 0.016);
  const zone = { x: inner.x + M, y: inner.y + M, w: inner.w - M * 2, h: inner.h - M * 2 };

  const place = (z, fl, ftop) => {
    const dw = iw * s0 * z;
    const dh = ih * s0 * z;
    panel.zoom = z;
    panel.dx = (fl - fx0 * dw - (box.x + (box.w - dw) / 2)) / box.w;
    panel.dy = (ftop - ft * dh - (box.y + (box.h - dh) / 2)) / box.h;
  };
  // The face positions the cover-fit allows at a zoom: the image must
  // still cover the whole panel box however it slides.
  const ranges = (z) => {
    const dw = iw * s0 * z;
    const dh = ih * s0 * z;
    return {
      fw: (fx1 - fx0) * dw,
      fh: (fb - ft) * dh,
      lMin: box.x + box.w - dw + fx0 * dw,
      lMax: box.x + fx0 * dw,
      tMin: box.y + box.h - dh + ft * dh,
      tMax: box.y + ft * dh,
    };
  };
  const hits = (fl, ftop, fw, fh) => blocked.filter(
    (b) => fl < b.x1 && fl + fw > b.x0 && ftop < b.y1 && ftop + fh > b.y0,
  );

  for (let z = 1; z <= 3.001; z *= 1.045) {
    const r = ranges(z);
    if (r.fw > zone.w || r.fh > zone.h) {
      if (z > 1) break;
      continue;
    }
    const lo = { x: Math.max(r.lMin, zone.x), y: Math.max(r.tMin, zone.y) };
    const hi = { x: Math.min(r.lMax, zone.x + zone.w - r.fw), y: Math.min(r.tMax, zone.y + zone.h - r.fh) };
    if (lo.x > hi.x || lo.y > hi.y) continue;
    let fl = Math.min(hi.x, Math.max(lo.x, zone.x + zone.w / 2 - r.fw / 2));
    let ftop = Math.min(hi.y, Math.max(lo.y, zone.y + zone.h / 2 - r.fh / 2));
    let ok = true;
    for (let iter = 0; iter < 12; iter++) {
      const hit = hits(fl, ftop, r.fw, r.fh)[0];
      if (!hit) break;
      const cands = [
        { axis: 'x', to: hit.x0 - r.fw },
        { axis: 'x', to: hit.x1 },
        { axis: 'y', to: hit.y0 - r.fh },
        { axis: 'y', to: hit.y1 },
      ].sort((p, q) => Math.abs(p.to - (p.axis === 'x' ? fl : ftop)) - Math.abs(q.to - (q.axis === 'x' ? fl : ftop)));
      let moved = false;
      for (const c of cands) {
        if (c.axis === 'x' && c.to >= lo.x && c.to <= hi.x) { fl = c.to; moved = true; break; }
        if (c.axis === 'y' && c.to >= lo.y && c.to <= hi.y) { ftop = c.to; moved = true; break; }
      }
      if (!moved) { ok = false; break; }
    }
    if (ok) { place(z, fl, ftop); return; }
  }

  // Scanning fallback at the plain cover-fit: the face stays inside
  // the inscribed panel box; the score punishes furniture overlap
  // first, then distance from the panel's centre.
  const r = ranges(1);
  const lo = { x: Math.max(r.lMin, inner.x), y: Math.max(r.tMin, inner.y) };
  const hi = { x: Math.min(r.lMax, inner.x + inner.w - r.fw), y: Math.min(r.tMax, inner.y + inner.h - r.fh) };
  if (r.fw <= inner.w && r.fh <= inner.h && lo.x <= hi.x && lo.y <= hi.y) {
    const tx = inner.x + inner.w / 2 - r.fw / 2;
    const ty = inner.y + inner.h / 2 - r.fh / 2;
    const step = Math.max(3, Math.min(r.fw, r.fh) * 0.04);
    let best = null;
    for (let fl = lo.x; fl <= hi.x + 0.001; fl += step) {
      for (let ftop = lo.y; ftop <= hi.y + 0.001; ftop += step) {
        let overlap = 0;
        for (const b of hits(fl, ftop, r.fw, r.fh)) {
          overlap += (Math.min(fl + r.fw, b.x1) - Math.max(fl, b.x0))
            * (Math.min(ftop + r.fh, b.y1) - Math.max(ftop, b.y0));
        }
        const score = overlap * 100 + Math.abs(fl - tx) + Math.abs(ftop - ty);
        if (!best || score < best.score) best = { score, fl, ftop };
      }
    }
    if (best) { place(1, best.fl, best.ftop); return; }
  }
  // No placement keeps the whole face in the panel: the plain
  // centred cover-fit stands.
  panel.zoom = 1;
  panel.dx = 0;
  panel.dy = 0;
}

// Deal the cast into the first five panels, each portrait bringing its
// cast tag with it. `shift` rotates the casting — the screenshot scenes
// use it to show the same five faces in a different arrangement. Every
// dealt crop is face-fitted (see fitCastPanel): the whole face lands
// inside its panel, clear of the cover's furniture, instead of the
// centred cover-fit that used to slice the tall portraits' faces off
// at the hairline or the chin.
function assignCast(shift = 0) {
  if (!castPhotos || !castPhotos.length) return;
  const count = Math.min(5, state.panels.length, castPhotos.length);
  for (let i = 0; i < count; i++) {
    const k = (i + shift) % castPhotos.length;
    state.panels[i].photoId = castPhotos[k].id;
    state.panels[i].tag = CAST[k].tag;
    state.panels[i].dx = 0;
    state.panels[i].dy = 0;
    state.panels[i].zoom = 1;
  }
  const [W, H] = SIZES[state.size];
  const polys = currentPolys(W, H);
  const blocked = furnitureRects(W, H);
  for (let i = 0; i < count; i++) {
    if (!polys[i]) continue;
    const k = (i + shift) % castPhotos.length;
    const tagRect = panelTagRect(state.panels[i], panelBox(polys[i]), W, H);
    fitCastPanel(state.panels[i], CAST[k], polys[i], tagRect ? [...blocked, tagRect] : blocked);
  }
}

// Deal the Teal Confession cast into the first five panels: the
// Motel Row pair plus three of the Ensemble Five, each portrait
// bringing its cast tag with it and every crop face-fitted exactly
// as assignCast fits them (see fitCastPanel). The shipped square
// screenshot is dealt this company; its scene sets the billing line
// to match — TEAL CONFESSION, starring the five dealt here.
function assignConfession() {
  const deal = CONFESSION_CAST.map((entry) => ({
    entry,
    photo: state.photos.find((p) => p.url === entry.file) || null,
  }));
  if (deal.some((d) => !d.photo)) return;
  deal.forEach(({ photo, entry }, i) => {
    const panel = state.panels[i];
    panel.photoId = photo.id;
    panel.tag = entry.tag;
    panel.dx = 0;
    panel.dy = 0;
    panel.zoom = 1;
  });
  const [W, H] = SIZES[state.size];
  const polys = currentPolys(W, H);
  const blocked = furnitureRects(W, H);
  deal.forEach(({ entry }, i) => {
    if (!polys[i]) return;
    const tagRect = panelTagRect(state.panels[i], panelBox(polys[i]), W, H);
    fitCastPanel(state.panels[i], entry, polys[i], tagRect ? [...blocked, tagRect] : blocked);
  });
}

// Deal the Motel Row cover: the vixen and the showgirl take the two
// portrait panels, the motel scene takes the wide foot, each with a
// fresh crop. The scene panel carries no cast tag — a place gets no
// plaque. The foot takes whichever framing of the scene fits the
// geometry (see motelScenePhoto): the panorama on a wide cover, so
// the sign and the convertible survive, the scene itself on a tall
// one. The portrait panels are wide and short, so a centred cover-fit
// would slice both faces off at the chin; their crops are fitted to
// each portrait's measured face span (see MOTEL_CAST) instead — the
// face is centred at 42% of the panel, clamped so it never spills
// past the panel's top or bottom edge.
function assignMotel() {
  const scene = motelScenePhoto();
  if (!motelCastPhotos || motelCastPhotos.length < 2 || !scene) return;
  const deal = [
    [motelCastPhotos[0], MOTEL_CAST[0]],
    [motelCastPhotos[1], MOTEL_CAST[1]],
    [scene, null],
  ];
  const polys = currentPolys(...SIZES[state.size]);
  deal.forEach(([photo, entry], i) => {
    const panel = state.panels[i];
    panel.photoId = photo.id;
    panel.tag = entry ? entry.tag : '';
    panel.dx = 0;
    panel.dy = 0;
    panel.zoom = 1;
    if (entry && polys[i]) {
      const box = panelBox(polys[i]);
      const iw = photo.img.naturalWidth;
      const ih = photo.img.naturalHeight;
      const drawnH = ih * Math.max(box.w / iw, box.h / ih);
      if (drawnH > box.h) {
        const [faceTop, faceBot] = entry.face;
        const faceH = (faceBot - faceTop) * drawnH;
        const centre = Math.max(faceH / 2, Math.min(box.h - faceH / 2, 0.42 * box.h));
        const shift = centre - ((faceTop + faceBot) / 2) * drawnH - (box.h - drawnH) / 2;
        panel.dy = Math.max(-0.6, Math.min(0.85, shift / box.h));
      }
    }
  });
}

// The Motel Row preset, one click from the layout picker: the layout,
// its three photos, the Neon Nights grade and the cover's texts all
// land together. Everything stays editable afterwards.
async function applyMotelPreset() {
  await loadCastSamples();
  const idx = LAYOUTS.findIndex((l) => l.id === 'motel');
  if (idx >= 0) state.layoutIndex = idx;
  assignMotel();
  state.grade = 'neon';
  state.caption = 'MOTEL ROW';
  state.subtitle = 'after hours';
  state.subtitleOn = true;
  state.tagline = 'STAY THE NIGHT · LEAVE AT DAWN';
  state.taglineOn = true;
  state.billing = MOTEL_BILLING;
  state.billingOn = true;
  if (state.selectedPanel > 2) state.selectedPanel = 0;
  renderPreview();
}

function renderTray() {
  els.tray.textContent = '';
  for (const photo of state.photos) {
    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    thumb.title = 'Place in the selected panel';
    const img = document.createElement('img');
    img.src = photo.url;
    img.alt = photo.name;
    const label = document.createElement('span');
    label.className = 'thumb-name';
    label.textContent = photo.name;
    const fillAll = document.createElement('button');
    fillAll.type = 'button';
    fillAll.className = 'fill-all';
    fillAll.textContent = 'all';
    fillAll.title = 'Fill every panel with this photo';
    fillAll.addEventListener('click', (event) => {
      event.stopPropagation();
      for (const panel of state.panels) panel.photoId = photo.id;
      renderPreview();
    });
    thumb.append(img, label, fillAll);
    thumb.addEventListener('click', () => {
      state.panels[state.selectedPanel].photoId = photo.id;
      renderPreview();
    });
    els.tray.append(thumb);
  }
}

// ------------------------------------------------------- the photo layer

const photoLayer = document.createElement('canvas');

// One photo, cover-fitted into a panel's box with the panel's own crop:
// the same transform paints the panel itself and, in the Pop-Out Hero
// layout, the hero's overflow, so the two line up seamlessly.
function drawPhotoCover(ctx, photo, panel, box) {
  const iw = photo.img.naturalWidth;
  const ih = photo.img.naturalHeight;
  const scale = Math.max(box.w / iw, box.h / ih) * panel.zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const cx = box.x + box.w / 2 + panel.dx * box.w;
  const cy = box.y + box.h / 2 + panel.dy * box.h;
  ctx.drawImage(photo.img, cx - dw / 2, cy - dh / 2, dw, dh);
}

function tracePath(ctx, poly) {
  ctx.beginPath();
  poly.forEach(([px, py], k) => (k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
  ctx.closePath();
}

// The grade's washes and sky-glow over whatever is under them on ctx —
// the whole photo layer normally, or just the pop-out hero's overflow.
function applyGrade(ctx, W, H) {
  const grade = GRADES[state.grade];
  for (const [op, stops] of grade.washes) {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    for (const [at, color] of stops) grad.addColorStop(at, color);
    ctx.save();
    ctx.globalCompositeOperation = op;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  if (grade.glow) {
    const glow = ctx.createRadialGradient(W / 2, -H * 0.12, 10, W / 2, -H * 0.12, H * 0.78);
    glow.addColorStop(0, grade.glow);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H * 0.8);
    ctx.restore();
  }
}

// Everything photographic on one layer: each panel clipped to its
// polygon, photos cover-fitted with their per-panel crop, empty panels
// painted with the sunset backdrop — then the grade over the whole.
function renderPhotoLayer(W, H, polys) {
  photoLayer.width = W;
  photoLayer.height = H;
  const ctx = photoLayer.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  polys.forEach((poly, i) => {
    const panel = state.panels[i];
    if (!panel) return;
    const box = panelBox(poly);
    ctx.save();
    tracePath(ctx, poly);
    ctx.clip();
    const photo = panel.photoId !== null ? photoById(panel.photoId) : null;
    if (photo) drawPhotoCover(ctx, photo, panel, box);
    else paintBackdrop(ctx, box, i);
    ctx.restore();
  });
  applyGrade(ctx, W, H);
  return photoLayer;
}

// ------------------------------------------------------------ pop-out hero

// The hero polygon grown past the frame: fully past the outer edges, and
// part-way across the seam it shares with the panels below (or beside
// it), so the spill visibly swallows that keyline too. The photo inside
// keeps its panel transform, so where it spills over a border it
// continues the in-frame image exactly, only lifted out of the frame.
function expandedHeroPoly(poly, box, W, H, wide) {
  const ox = W * 0.045;
  const oy = H * 0.055;
  return poly.map(([px, py]) => {
    let nx = px;
    let ny = py;
    if (wide) {
      if (px <= box.x + 1) nx = px - ox;
      if (px >= box.x + box.w - 1) nx = px + ox * 0.55;
      if (py <= box.y + 1) ny = py - oy * 0.7;
      if (py >= box.y + box.h - 1) ny = py + oy * 0.7;
    } else {
      if (py <= box.y + 1) ny = py - oy;
      if (py >= box.y + box.h - 1) ny = py + oy * 0.55;
      if (px <= box.x + 1) nx = px - ox * 0.7;
      if (px >= box.x + box.w - 1) nx = px + ox * 0.7;
    }
    return [nx, ny];
  });
}

function strokePanel(ctx, poly, minSide, gold = false) {
  const rule = Math.max(5, minSide * 0.011);
  tracePath(ctx, poly);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#170b33';
  ctx.lineWidth = rule * 1.9;
  ctx.stroke();
  // The Ensemble Five's dividers are thin gold rules, not cream keylines.
  ctx.strokeStyle = gold ? '#e9bc55' : '#fff3d6';
  ctx.lineWidth = gold ? rule * 0.72 : rule;
  ctx.stroke();
}

const popLayer = document.createElement('canvas');
const popShadow = document.createElement('canvas');

// The signature move: after the framed cover is drawn, the hero photo is
// drawn once more, clipped to the grown polygon and floating on a soft
// shadow made from its own silhouette — the picture breaks out of its
// panel, over the keyline and the matte, the way GTA covers lift their
// hero out of the frame. The spill is painted on its own layer first, so
// where a photo's own frame cannot reach into the grown polygon the
// spill simply ends and the framed cover shows through: no hard edge
// and no dark wedge, whatever photo is in the hero panel.
function drawPopOut(ctx, W, H, polys) {
  const idx = currentLayout().popoutIndex;
  if (idx < 0) return;
  const panel = state.panels[idx];
  const photo = panel && panel.photoId !== null ? photoById(panel.photoId) : null;
  if (!photo) return;
  const minSide = Math.min(W, H);
  const poly = polys[idx];
  const box = panelBox(poly);
  const big = expandedHeroPoly(poly, box, W, H, W / H >= 1.2);

  popLayer.width = W;
  popLayer.height = H;
  const pctx = popLayer.getContext('2d');
  pctx.clearRect(0, 0, W, H);
  pctx.save();
  tracePath(pctx, big);
  pctx.clip();
  if (state.grade === 'noir') pctx.filter = NOIR_FILTER;
  drawPhotoCover(pctx, photo, panel, box);
  pctx.filter = 'none';
  applyGrade(pctx, W, H);
  pctx.restore();

  // The shadow: the spill's silhouette, blurred and dropped a little.
  popShadow.width = W;
  popShadow.height = H;
  const sctx = popShadow.getContext('2d');
  sctx.clearRect(0, 0, W, H);
  sctx.drawImage(popLayer, 0, 0);
  sctx.globalCompositeOperation = 'source-in';
  sctx.fillStyle = 'rgba(6,0,18,1)';
  sctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.filter = `blur(${Math.max(4, minSide * 0.014)}px)`;
  ctx.globalAlpha = 0.55;
  ctx.drawImage(popShadow, 0, minSide * 0.012);
  ctx.restore();

  ctx.drawImage(popLayer, 0, 0);

  // The frame line along the hero's base survives the spill, so the
  // picture reads as rising out of a real panel, not floating.
  strokePanel(ctx, poly, minSide, currentLayout().gold);
}

// ------------------------------------------------------- poster dressing

// A cast tag: a small angled plaque at a panel's lower-left corner — a
// dark chip with a coloured tick and the panel's name in cream capitals.
function drawTags(ctx, W, H, polys) {
  if (!state.tagsOn) return;
  const minSide = Math.min(W, H);
  const px = minSide * 0.021;
  polys.forEach((poly, i) => {
    const panel = state.panels[i];
    const tag = (panel.tag || '').trim().toUpperCase();
    if (!tag) return;
    const box = panelBox(poly);
    const font = condensedFont(px, 700);
    ctx.save();
    ctx.font = font;
    const textW = ctx.measureText(tag).width;
    const pw = textW + px * 1.7;
    const ph = px * 1.62;
    // A bottom-row tag rides up when the foot furniture is on, so the
    // plaque clears the billing line and COMING SOON instead of
    // sitting on them.
    const bottomRow = box.y + box.h > H - minSide * 0.08;
    const lift = bottomRow && (state.billingOn || state.extrasOn) ? minSide * 0.047 : 0;
    const x = box.x + minSide * 0.016;
    const y = box.y + box.h - minSide * 0.016 - ph - lift;
    ctx.translate(x, y + ph / 2);
    ctx.rotate(-0.03);
    ctx.shadowColor = 'rgba(8,0,22,0.5)';
    ctx.shadowBlur = minSide * 0.008;
    ctx.shadowOffsetY = minSide * 0.004;
    ctx.fillStyle = 'rgba(10,2,24,0.86)';
    ctx.fillRect(0, -ph / 2, pw, ph);
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = TAG_COLORS[i % TAG_COLORS.length];
    ctx.fillRect(0, -ph / 2, px * 0.34, ph);
    ctx.fillStyle = '#fff3d6';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tag, px * 0.62, 1);
    ctx.restore();
  });
}

// Letterspaced type drawn from a left pen position — drawSpacedText's
// left-aligned sibling, for the corner furniture.
function drawSpacedLeft(ctx, text, x, y, { font, spacing, color }) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  let penX = x;
  for (const ch of text) {
    ctx.fillText(ch, penX, y);
    penX += ctx.measureText(ch).width + spacing;
  }
  ctx.restore();
  return penX - x;
}

// The review-quote strip along the very top of the cover: five gold
// stars and a critic's line in small cream capitals, on a soft dark
// band that fades into the panels — the Palmline masthead furniture.
function drawQuoteStrip(ctx, W, H) {
  if (!state.quoteOn) return;
  const quote = state.quoteText.trim().toUpperCase();
  if (!quote) return;
  const source = state.quoteSource.trim().toUpperCase();
  const minSide = Math.min(W, H);
  const bandH = minSide * 0.052;
  const band = ctx.createLinearGradient(0, 0, 0, bandH * 1.5);
  band.addColorStop(0, 'rgba(8,1,20,0.66)');
  band.addColorStop(1, 'rgba(8,1,20,0)');
  ctx.fillStyle = band;
  ctx.fillRect(0, 0, W, bandH * 1.5);

  const cy = bandH * 0.52;
  const starR = minSide * 0.0105;
  let sx = minSide * 0.026;
  for (let i = 0; i < 5; i++) {
    drawStar(ctx, sx + starR, cy, starR, starR * 0.45, '#ffd23e', 'rgba(120,70,0,0.9)');
    sx += starR * 2.45;
  }
  const px = minSide * 0.0205;
  const line = source ? `“${quote}” — ${source}` : `“${quote}”`;
  drawSpacedLeft(ctx, line, sx + minSide * 0.014, cy + 1, {
    font: condensedFont(px, 600),
    spacing: px * 0.14,
    color: 'rgba(255,243,214,0.92)',
  });
}

// The tagline ribbon: a dark angled band across the cover under the
// title, gold-ruled top and bottom, carrying one spaced line of caps —
// FIVE FRIENDS · ONE COAST · NO WAY BACK. It follows the caption: with
// the caption at the foot, the ribbon rides above it instead. Motel
// Row passes its own y: down in the scene panel, under its relocated
// title (see renderCover).
function drawTagline(ctx, W, H, yOverride = null) {
  if (!state.taglineOn) return;
  const text = state.tagline.trim().toUpperCase();
  if (!text) return;
  const minSide = Math.min(W, H);
  const px = minSide * 0.0245;
  const opts = { font: condensedFont(px, 700), spacing: px * 0.24 };
  const textW = measureSpacedText(ctx, text, opts);
  const halfW = Math.min(W * 0.46, textW / 2 + px * 1.6);
  const rh = px * 1.95;
  const y = yOverride !== null ? yOverride : (state.captionPos === 'top' ? H * 0.295 : H * 0.705);
  ctx.save();
  ctx.translate(W / 2, y);
  ctx.rotate(-0.016);
  ctx.shadowColor = 'rgba(8,0,22,0.45)';
  ctx.shadowBlur = minSide * 0.01;
  ctx.shadowOffsetY = minSide * 0.005;
  ctx.fillStyle = 'rgba(9,1,22,0.88)';
  ctx.fillRect(-halfW, -rh / 2, halfW * 2, rh);
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#e9bc55';
  ctx.fillRect(-halfW, -rh / 2, halfW * 2, Math.max(1.5, minSide * 0.0022));
  ctx.fillRect(-halfW, rh / 2 - Math.max(1.5, minSide * 0.0022), halfW * 2, Math.max(1.5, minSide * 0.0022));
  drawSpacedText(ctx, text, 0, 1, { ...opts, color: '#fff3d6' });
  ctx.restore();
}

// The poster extras, one toggleable group: a "VOL. 1" badge in the top
// right corner, "COMING SOON" in spaced pink caps at the bottom left,
// and a barcode at the bottom right — white box, uneven black bars and
// a number under them, the bars dealt from a fixed seed so every export
// of the same cover carries the same code.
function drawExtras(ctx, W, H) {
  if (!state.extrasOn) return;
  const minSide = Math.min(W, H);
  const margin = minSide * 0.018;

  // VOL. 1 badge.
  const vpx = minSide * 0.019;
  ctx.save();
  ctx.font = condensedFont(vpx, 700);
  const vw = ctx.measureText('VOL. 1').width + vpx * 1.5;
  const vh = vpx * 1.8;
  ctx.fillStyle = 'rgba(10,2,24,0.85)';
  ctx.fillRect(W - margin - vw, margin, vw, vh);
  ctx.strokeStyle = '#e9bc55';
  ctx.lineWidth = Math.max(1.2, minSide * 0.0018);
  ctx.strokeRect(W - margin - vw, margin, vw, vh);
  ctx.fillStyle = '#ffd23e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VOL. 1', W - margin - vw / 2, margin + vh / 2 + 1);
  ctx.restore();

  // COMING SOON, on the billing block's baseline so the foot of the
  // cover reads as one furniture line.
  const cpx = minSide * 0.019;
  drawSpacedLeft(ctx, 'COMING SOON', margin + minSide * 0.006, H - minSide * 0.045, {
    font: condensedFont(cpx, 700),
    spacing: cpx * 0.3,
    color: '#ff5da2',
  });

  // The barcode.
  const bw = minSide * 0.104;
  const bh = minSide * 0.060;
  const bx = W - margin - bw;
  const by = H - margin - bh;
  ctx.save();
  ctx.fillStyle = '#f7f1de';
  ctx.fillRect(bx, by, bw, bh);
  let seed = 20261119;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const barsTop = by + bh * 0.10;
  const barsH = bh * 0.58;
  let penX = bx + bw * 0.07;
  ctx.fillStyle = '#17110a';
  while (penX < bx + bw * 0.9) {
    const w = (0.6 + rnd() * 2.2) * (bw / 46);
    if (rnd() > 0.32) ctx.fillRect(penX, barsTop, w, barsH);
    penX += w + (0.5 + rnd() * 1.4) * (bw / 46);
  }
  ctx.font = `${bh * 0.19}px 'Liberation Mono', 'DejaVu Sans Mono', monospace`;
  ctx.fillStyle = '#17110a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('9 781926 112606', bx + bw / 2, by + bh * 0.85);
  ctx.restore();
}

// A five-pointed star, the seal's centrepiece.
function drawStar(ctx, cx, cy, outer, inner, fill, stroke) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = outer * 0.09;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

// The round seal: a gold-ringed badge with its legend set around the rim
// and a star at its heart, stamped in a corner of the cover.
function drawSeal(ctx, W, H) {
  if (!state.sealOn) return;
  const minSide = Math.min(W, H);
  const r = minSide * 0.082;
  const margin = minSide * 0.032;
  let cx = W - r - margin;
  let cy = H - r - margin - minSide * 0.035;
  if (state.sealPos === 'bl') cx = r + margin;
  if (state.sealPos === 'tr') cy = r + margin;
  // With the poster extras on, the barcode owns the bottom-right
  // corner; the seal rides up clear of it.
  if (state.sealPos === 'br' && state.extrasOn) cy -= minSide * 0.088;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(12,3,28,0.88)';
  ctx.fill();
  ctx.lineWidth = r * 0.05;
  ctx.strokeStyle = '#ffd23e';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
  ctx.lineWidth = r * 0.02;
  ctx.strokeStyle = 'rgba(255,210,62,0.7)';
  ctx.stroke();
  drawCircularText(ctx, 'VICE CITY · EST. 2026 · VICE CITY · EST. 2026 · ', cx, cy, r * 0.665, {
    font: `700 ${r * 0.148}px ${"'Arial Narrow', 'Liberation Sans Narrow', sans-serif"}`,
    color: '#ffe9b0',
    span: Math.PI * 2,
  });
  drawStar(ctx, cx, cy, r * 0.3, r * 0.13, '#ff5da2', '#ffd23e');
  ctx.restore();
}

// The billing block: one line of tiny letterspaced credits along the
// foot of the cover, under a hairline rule, like a film poster's. The
// line sits a clear margin inside the frame — an earlier build let it
// ride the bottom edge — and with the poster extras on it narrows to
// the middle of the foot, clear of COMING SOON and the barcode.
function drawBilling(ctx, W, H) {
  if (!state.billingOn) return;
  const text = state.billing.trim().toUpperCase();
  if (!text) return;
  const minSide = Math.min(W, H);
  const maxW = state.extrasOn ? W * 0.54 : W * 0.92;
  let px = minSide * 0.0165;
  const fit = () => measureSpacedText(ctx, text, { font: condensedFont(px, 600), spacing: px * 0.16 });
  while (fit() > maxW && px > 7) px -= 0.5;
  const width = fit();
  const y = H - minSide * 0.045;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,210,62,0.45)';
  ctx.lineWidth = Math.max(1, minSide * 0.0016);
  ctx.beginPath();
  ctx.moveTo(W / 2 - width / 2, y - px * 0.95);
  ctx.lineTo(W / 2 + width / 2, y - px * 0.95);
  ctx.stroke();
  drawSpacedText(ctx, text, W / 2, y, {
    font: condensedFont(px, 600),
    spacing: px * 0.16,
    color: 'rgba(255,243,214,0.88)',
  });
  ctx.restore();
}

// ------------------------------------------------------------- rendering

// The full cover: matte, graded photo layer, vignette, panel keylines,
// the pop-out hero, cast tags, the quote strip, the chrome caption with
// its script subtitle, the tagline ribbon, the seal, the poster extras
// and the billing block. Used identically for the preview and for PNG
// export.
export function renderCover(ctx, W, H) {
  const polys = currentPolys(W, H);
  const minSide = Math.min(W, H);

  const matte = ctx.createLinearGradient(0, 0, W, H);
  matte.addColorStop(0, '#1b0a38');
  matte.addColorStop(1, '#2b0f4d');
  ctx.fillStyle = matte;
  ctx.fillRect(0, 0, W, H);

  if (state.grade === 'noir') ctx.filter = NOIR_FILTER;
  ctx.drawImage(renderPhotoLayer(W, H, polys), 0, 0);
  ctx.filter = 'none';

  const vig = ctx.createRadialGradient(W / 2, H / 2, minSide * 0.42, W / 2, H / 2, minSide * 0.95);
  vig.addColorStop(0, 'rgba(10,0,28,0)');
  vig.addColorStop(1, 'rgba(10,0,28,0.30)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  const gold = currentLayout().gold;
  for (const poly of polys) strokePanel(ctx, poly, minSide, gold);

  drawPopOut(ctx, W, H, polys);
  drawTags(ctx, W, H, polys);

  const caption = state.caption.trim();
  // Motel Row parks its title over the scene: the pair's faces fill
  // the portrait row, so with the caption at the top the whole title
  // block — chrome line, script subtitle and tagline ribbon — moves
  // down into the wide foot panel, clear of both faces, and the shade
  // band moves with it. A foot caption already sits in the scene, and
  // every other layout keeps the classic placement.
  const motelScene = currentLayout().id === 'motel' && state.captionPos === 'top'
    ? panelBox(polys[2])
    : null;
  const motelTitleY = motelScene
    ? motelScene.y + motelScene.h * 0.34
    : null;
  const motelRibbonY = motelTitleY !== null
    ? motelTitleY + H * 0.118 * state.captionScale * 1.55
    : null;
  if (caption) {
    const titleH = H * 0.118 * state.captionScale;
    const titleY = motelTitleY !== null
      ? motelTitleY
      : (state.captionPos === 'top' ? H * 0.115 : H * 0.875);
    if (motelScene) {
      // A soft dark cloud behind the relocated block, pooled over the
      // scene panel between the seam and the billing line.
      const bandTop = Math.max(motelScene.y + 4, titleY - titleH * 1.02);
      const bandBottom = motelRibbonY + minSide * 0.045;
      const band = ctx.createLinearGradient(0, bandTop, 0, bandBottom);
      band.addColorStop(0, 'rgba(12,2,32,0)');
      band.addColorStop(0.22, 'rgba(12,2,32,0.52)');
      band.addColorStop(0.78, 'rgba(12,2,32,0.52)');
      band.addColorStop(1, 'rgba(12,2,32,0)');
      ctx.fillStyle = band;
      ctx.fillRect(0, bandTop, W, bandBottom - bandTop);
    } else {
      const bandH = H * 0.26;
      const band = state.captionPos === 'top'
        ? ctx.createLinearGradient(0, 0, 0, bandH)
        : ctx.createLinearGradient(0, H, 0, H - bandH);
      band.addColorStop(0, 'rgba(12,2,32,0.45)');
      band.addColorStop(1, 'rgba(12,2,32,0)');
      ctx.fillStyle = band;
      ctx.fillRect(0, state.captionPos === 'top' ? 0 : H - bandH, W, bandH);
    }

    drawChromeText(ctx, caption, W / 2, titleY, {
      height: titleH,
      maxWidth: W * 0.93,
    });

    // The script subtitle signs the title off from just under (or, with
    // the caption at the foot, just over) the chrome line.
    const subtitle = state.subtitle.trim();
    if (state.subtitleOn && subtitle) {
      const subY = state.captionPos === 'top'
        ? titleY + titleH * 0.78
        : titleY - titleH * 0.82;
      drawScriptText(ctx, subtitle, W / 2, subY, {
        size: H * 0.05 * state.captionScale,
        maxWidth: W * 0.7,
      });
    }
  }

  // The quote strip is painted over the caption's shade band (but under
  // nothing else), so the critic's line stays legible across the title.
  drawQuoteStrip(ctx, W, H);
  drawTagline(ctx, W, H, motelRibbonY);
  drawSeal(ctx, W, H);
  drawExtras(ctx, W, H);
  drawBilling(ctx, W, H);

  // Outer pinstripe.
  ctx.strokeStyle = 'rgba(255,47,128,0.85)';
  ctx.lineWidth = Math.max(2, minSide * 0.004);
  ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, W - ctx.lineWidth * 2, H - ctx.lineWidth * 2);

  return polys;
}

// Editor-only dressing on the preview: a number badge on each panel and
// the selected panel's dashed outline.
function drawEditorOverlay(ctx, W, H, polys) {
  const minSide = Math.min(W, H);
  polys.forEach((poly, i) => {
    const box = panelBox(poly);
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, minSide * 0.026, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(21,8,38,0.72)';
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    ctx.font = `700 ${Math.round(minSide * 0.03)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), cx, cy + 1);
    ctx.restore();
  });
  const poly = polys[state.selectedPanel];
  if (poly) {
    ctx.save();
    tracePath(ctx, poly);
    ctx.setLineDash([minSide * 0.02, minSide * 0.013]);
    ctx.strokeStyle = '#ff2e88';
    ctx.lineWidth = Math.max(3, minSide * 0.006);
    ctx.stroke();
    ctx.restore();
  }
}

function markActive(group, key, value) {
  for (const btn of group.querySelectorAll('button')) {
    btn.classList.toggle('active', btn.dataset[key] === value);
  }
}

function syncControls() {
  els.panelLabel.textContent = `Selected panel: ${state.selectedPanel + 1}`;
  els.zoomRange.value = String(state.panels[state.selectedPanel].zoom);
  els.tagInput.value = state.panels[state.selectedPanel].tag;
  els.captionInput.value = state.caption;
  els.captionSize.value = String(state.captionScale);
  els.captionPosBtn.textContent = `Caption: ${state.captionPos}`;
  els.subtitleInput.value = state.subtitle;
  els.subtitleToggle.checked = state.subtitleOn;
  els.tagsToggle.checked = state.tagsOn;
  els.quoteToggle.checked = state.quoteOn;
  els.quoteInput.value = state.quoteText;
  els.quoteSourceInput.value = state.quoteSource;
  els.taglineToggle.checked = state.taglineOn;
  els.taglineInput.value = state.tagline;
  els.extrasToggle.checked = state.extrasOn;
  els.billingToggle.checked = state.billingOn;
  els.billingInput.value = state.billing;
  els.sealToggle.checked = state.sealOn;
  els.sealPos.value = state.sealPos;
  markActive(els.layoutGroup, 'layout', currentLayout().id);
  markActive(els.gradeGroup, 'grade', state.grade);
  markActive(els.sizeGroup, 'size', state.size);
}

function renderPreview() {
  const [W, H] = SIZES[state.size];
  const canvas = els.canvas;
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width = W;
    canvas.height = H;
  }
  const ctx = canvas.getContext('2d');
  const polys = renderCover(ctx, W, H);
  // A clean screenshot scene skips the editor's badges and outline, so
  // the frame the rig captures is the export itself.
  if (!state.cleanShot) drawEditorOverlay(ctx, W, H, polys);
  syncControls();
}

// ------------------------------------------------------------ interaction

function canvasPoint(event) {
  const rect = els.canvas.getBoundingClientRect();
  return [
    ((event.clientX - rect.left) / rect.width) * els.canvas.width,
    ((event.clientY - rect.top) / rect.height) * els.canvas.height,
  ];
}

let drag = null;

els.canvas.addEventListener('pointerdown', (event) => {
  const [px, py] = canvasPoint(event);
  const [W, H] = SIZES[state.size];
  const polys = currentPolys(W, H);
  for (let i = polys.length - 1; i >= 0; i--) {
    if (pointInPanel(px, py, polys[i])) {
      state.selectedPanel = i;
      const panel = state.panels[i];
      drag = { startX: px, startY: py, dx: panel.dx, dy: panel.dy, box: panelBox(polys[i]) };
      els.canvas.setPointerCapture(event.pointerId);
      renderPreview();
      break;
    }
  }
});

els.canvas.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const [px, py] = canvasPoint(event);
  const panel = state.panels[state.selectedPanel];
  const clamp = (v) => Math.max(-0.6, Math.min(0.6, v));
  panel.dx = clamp(drag.dx + (px - drag.startX) / drag.box.w);
  panel.dy = clamp(drag.dy + (py - drag.startY) / drag.box.h);
  renderPreview();
});

const endDrag = () => { drag = null; };
els.canvas.addEventListener('pointerup', endDrag);
els.canvas.addEventListener('pointercancel', endDrag);

els.canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  const panel = state.panels[state.selectedPanel];
  panel.zoom = Math.max(1, Math.min(5, panel.zoom * Math.exp(-event.deltaY * 0.0012)));
  renderPreview();
}, { passive: false });

// Double-click a panel to snap its photo back to the untouched cover fit.
els.canvas.addEventListener('dblclick', (event) => {
  const [px, py] = canvasPoint(event);
  const [W, H] = SIZES[state.size];
  const polys = currentPolys(W, H);
  for (let i = polys.length - 1; i >= 0; i--) {
    if (pointInPanel(px, py, polys[i])) {
      const panel = state.panels[i];
      panel.dx = 0;
      panel.dy = 0;
      panel.zoom = 1;
      state.selectedPanel = i;
      renderPreview();
      break;
    }
  }
});

// --------------------------------------------------------------- controls

els.fileInput.addEventListener('change', () => {
  loadPhotoFiles([...els.fileInput.files]);
  els.fileInput.value = '';
});

els.castBtn.addEventListener('click', async () => {
  await loadCastSamples();
  assignCast(0);
  renderPreview();
});

for (const target of [els.stage, els.canvas]) {
  target.addEventListener('dragover', (event) => event.preventDefault());
  target.addEventListener('drop', (event) => {
    event.preventDefault();
    loadPhotoFiles([...event.dataTransfer.files]);
  });
}

els.layoutGroup.addEventListener('click', async (event) => {
  const btn = event.target.closest('button[data-layout]');
  if (!btn) return;
  // Motel Row is a preset, not just an arrangement: picking it deals
  // its photos, grade and texts in the same click.
  if (btn.dataset.layout === 'motel') {
    await applyMotelPreset();
    return;
  }
  state.layoutIndex = LAYOUTS.findIndex((l) => l.id === btn.dataset.layout);
  const panelCount = currentPolys(...SIZES[state.size]).length;
  if (state.selectedPanel >= panelCount) state.selectedPanel = panelCount - 1;
  renderPreview();
});

els.gradeGroup.addEventListener('click', (event) => {
  const btn = event.target.closest('button[data-grade]');
  if (!btn) return;
  state.grade = btn.dataset.grade;
  renderPreview();
});

els.sizeGroup.addEventListener('click', (event) => {
  const btn = event.target.closest('button[data-size]');
  if (!btn) return;
  state.size = btn.dataset.size;
  // A Motel Row cover dealt at one post size holds the framing of the
  // scene that fits that geometry; crossing the wide/tall line swaps
  // the foot panel to the other framing, crop untouched.
  if (currentLayout().id === 'motel' && scenePhoto && scenePanoPhoto) {
    const foot = state.panels[2];
    if (foot.photoId === scenePhoto.id || foot.photoId === scenePanoPhoto.id) {
      foot.photoId = motelScenePhoto().id;
    }
  }
  renderPreview();
});

els.zoomRange.addEventListener('input', () => {
  state.panels[state.selectedPanel].zoom = Number(els.zoomRange.value);
  renderPreview();
});

els.tagInput.addEventListener('input', () => {
  state.panels[state.selectedPanel].tag = els.tagInput.value.toUpperCase();
  renderPreview();
});

els.resetCropBtn.addEventListener('click', () => {
  const panel = state.panels[state.selectedPanel];
  panel.dx = 0;
  panel.dy = 0;
  panel.zoom = 1;
  renderPreview();
});

els.clearPanelBtn.addEventListener('click', () => {
  state.panels[state.selectedPanel].photoId = null;
  renderPreview();
});

els.captionInput.addEventListener('input', () => {
  state.caption = els.captionInput.value;
  renderPreview();
});

els.captionSize.addEventListener('input', () => {
  state.captionScale = Number(els.captionSize.value);
  renderPreview();
});

els.captionPosBtn.addEventListener('click', () => {
  state.captionPos = state.captionPos === 'top' ? 'bottom' : 'top';
  renderPreview();
});

els.subtitleInput.addEventListener('input', () => {
  state.subtitle = els.subtitleInput.value;
  renderPreview();
});

els.subtitleToggle.addEventListener('change', () => {
  state.subtitleOn = els.subtitleToggle.checked;
  renderPreview();
});

els.quoteToggle.addEventListener('change', () => {
  state.quoteOn = els.quoteToggle.checked;
  renderPreview();
});

els.quoteInput.addEventListener('input', () => {
  state.quoteText = els.quoteInput.value;
  renderPreview();
});

els.quoteSourceInput.addEventListener('input', () => {
  state.quoteSource = els.quoteSourceInput.value;
  renderPreview();
});

els.taglineToggle.addEventListener('change', () => {
  state.taglineOn = els.taglineToggle.checked;
  renderPreview();
});

els.taglineInput.addEventListener('input', () => {
  state.tagline = els.taglineInput.value;
  renderPreview();
});

els.extrasToggle.addEventListener('change', () => {
  state.extrasOn = els.extrasToggle.checked;
  renderPreview();
});

els.tagsToggle.addEventListener('change', () => {
  state.tagsOn = els.tagsToggle.checked;
  renderPreview();
});

els.billingToggle.addEventListener('change', () => {
  state.billingOn = els.billingToggle.checked;
  renderPreview();
});

els.billingInput.addEventListener('input', () => {
  state.billing = els.billingInput.value;
  renderPreview();
});

els.sealToggle.addEventListener('change', () => {
  state.sealOn = els.sealToggle.checked;
  renderPreview();
});

els.sealPos.addEventListener('change', () => {
  state.sealPos = els.sealPos.value;
  renderPreview();
});

els.exportBtn.addEventListener('click', () => {
  const [W, H] = SIZES[state.size];
  const out = document.createElement('canvas');
  out.width = W;
  out.height = H;
  renderCover(out.getContext('2d'), W, H);
  out.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vice-chrome-cover-${W}x${H}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, 'image/png');
});

// --------------------------------------------------------- screenshot rig

// A ?shot= scene (see shots.js) presets the whole studio — layout, grade,
// size, caption, subtitle, the poster furniture and the cast dealt into
// the panels — so the entry's screenshots are the app showing its own
// work, reproducibly.
async function applyShotConfig(cfg) {
  if (cfg.layout) {
    const idx = LAYOUTS.findIndex((l) => l.id === cfg.layout);
    if (idx >= 0) state.layoutIndex = idx;
  }
  if (cfg.grade && GRADES[cfg.grade]) state.grade = cfg.grade;
  if (cfg.size && SIZES[cfg.size]) state.size = cfg.size;
  if (cfg.caption !== undefined) state.caption = cfg.caption;
  if (cfg.captionPos) state.captionPos = cfg.captionPos;
  if (cfg.captionScale) state.captionScale = cfg.captionScale;
  if (cfg.subText !== undefined) state.subtitle = cfg.subText;
  if (cfg.subtitle !== undefined) state.subtitleOn = cfg.subtitle;
  if (cfg.tags !== undefined) state.tagsOn = cfg.tags;
  if (cfg.quote !== undefined) state.quoteOn = cfg.quote;
  if (cfg.quoteText !== undefined) state.quoteText = cfg.quoteText;
  if (cfg.quoteSource !== undefined) state.quoteSource = cfg.quoteSource;
  if (cfg.tagline !== undefined) state.taglineOn = cfg.tagline;
  if (cfg.taglineText !== undefined) state.tagline = cfg.taglineText;
  if (cfg.extras !== undefined) state.extrasOn = cfg.extras;
  if (cfg.seal !== undefined) state.sealOn = cfg.seal;
  if (cfg.sealPos) state.sealPos = cfg.sealPos;
  if (cfg.billing !== undefined) state.billingOn = cfg.billing;
  if (cfg.billingText !== undefined) state.billing = cfg.billingText;
  if (cfg.clean !== undefined) state.cleanShot = cfg.clean;
  if (cfg.photo === 'cast') {
    await loadCastSamples();
    assignCast(cfg.castShift || 0);
  }
  if (cfg.photo === 'motel') {
    await loadCastSamples();
    assignMotel();
  }
  if (cfg.photo === 'confession') {
    await loadCastSamples();
    assignConfession();
  }
  renderPreview();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

const shotCfg = shotConfigFromQuery(window.location.search);
if (shotCfg) {
  applyShotConfig(shotCfg);
} else {
  // First load is a demo: paint the studio at once, then deal the cast
  // into the Ensemble Five so the opening screen is a finished cover.
  renderPreview();
  loadCastSamples().then(() => {
    assignCast(0);
    renderPreview();
  });
}
