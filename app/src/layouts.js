// layouts.js — the eight panel arrangements of Vice Chrome Studio.
//
// Every layout is a list of panels; a panel is a polygon written as
// fractions of the cover's width and height, so one arrangement stretches
// to any export size. Covers at least 1.2x wider than tall get the
// landscape geometry, the rest get the portrait one. Neighbouring polygons
// share their seam coordinates exactly, and the renderer strokes a thick
// keyline over every join, so no gap can show through.
//
// popout marks the panel whose photo breaks out of its frame in the
// Pop-Out Hero layout; renderCover in main.js gives it the overflow pass.

// The Palmline composition: one large centre panel at full height, two
// stacked panels down each side. The vertical seams lean a little as
// they fall, and the side splits slant to match, so the five frames read
// as one cut sheet. Panel order is centre, top-left, bottom-left,
// top-right, bottom-right — the order the demo cast fills them in.
// The renderer strokes this layout's keylines in gold (see `gold`).
function ensembleWide() {
  return [
    [[0.315, 0], [0.685, 0], [0.715, 1], [0.285, 1]],
    [[0, 0], [0.315, 0], [0.299, 0.52], [0, 0.55]],
    [[0, 0.55], [0.299, 0.52], [0.285, 1], [0, 1]],
    [[0.685, 0], [1, 0], [1, 0.55], [0.701, 0.52]],
    [[0.701, 0.52], [1, 0.55], [1, 1], [0.715, 1]],
  ];
}

// On a portrait or square cover the centre panel takes a wider share,
// so the side columns stay wide enough for a face.
function ensembleTall() {
  return [
    [[0.28, 0], [0.72, 0], [0.745, 1], [0.255, 1]],
    [[0, 0], [0.28, 0], [0.267, 0.52], [0, 0.55]],
    [[0, 0.55], [0.267, 0.52], [0.255, 1], [0, 1]],
    [[0.72, 0], [1, 0], [1, 0.55], [0.733, 0.52]],
    [[0.733, 0.52], [1, 0.55], [1, 1], [0.745, 1]],
  ];
}

function quadTall() {
  return [
    [[0, 0], [1, 0], [1, 0.45], [0, 0.51]],
    [[0, 0.51], [0.56, 0.465], [0.54, 0.75], [0, 0.77]],
    [[0.56, 0.465], [1, 0.45], [1, 0.77], [0.54, 0.75]],
    [[0, 0.77], [0.54, 0.75], [1, 0.77], [1, 1], [0, 1]],
  ];
}

function quadWide() {
  return [
    [[0, 0], [0.53, 0], [0.51, 0.56], [0, 0.61]],
    [[0, 0.61], [0.51, 0.56], [0.48, 1], [0, 1]],
    [[0.53, 0], [1, 0], [1, 0.53], [0.51, 0.56]],
    [[0.51, 0.56], [1, 0.53], [1, 1], [0.48, 1]],
  ];
}

function triptychTall() {
  return [
    [[0, 0], [1, 0], [1, 0.33], [0, 0.39]],
    [[0, 0.39], [1, 0.33], [1, 0.67], [0, 0.73]],
    [[0, 0.73], [1, 0.67], [1, 1], [0, 1]],
  ];
}

function triptychWide() {
  return [
    [[0, 0], [0.37, 0], [0.32, 1], [0, 1]],
    [[0.37, 0], [0.69, 0], [0.65, 1], [0.32, 1]],
    [[0.69, 0], [1, 0], [1, 1], [0.65, 1]],
  ];
}

function heroDuoTall() {
  return [
    [[0, 0], [1, 0], [1, 0.61], [0, 0.67]],
    [[0, 0.67], [0.53, 0.64], [0.53, 1], [0, 1]],
    [[0.53, 0.64], [1, 0.61], [1, 1], [0.53, 1]],
  ];
}

function heroDuoWide() {
  return [
    [[0, 0], [0.63, 0], [0.58, 1], [0, 1]],
    [[0.63, 0], [1, 0], [1, 0.53], [0.605, 0.48]],
    [[0.605, 0.48], [1, 0.53], [1, 1], [0.58, 1]],
  ];
}

// Four tall parallelograms leaning the same way: the seams run diagonally
// from the top edge down to the bottom edge, comic-strip style.
function stripsTall() {
  const tops = [0, 0.28, 0.53, 0.78, 1];
  const bottoms = [0, 0.21, 0.46, 0.71, 1];
  const polys = [];
  for (let i = 0; i < 4; i++) {
    polys.push([[tops[i], 0], [tops[i + 1], 0], [bottoms[i + 1], 1], [bottoms[i], 1]]);
  }
  return polys;
}

// On a wide cover the strips stay upright but lean harder, so the four
// parallelograms read as one sheared sheet across the poster.
function stripsWide() {
  const tops = [0, 0.27, 0.52, 0.77, 1];
  const bottoms = [0, 0.19, 0.44, 0.69, 1];
  const polys = [];
  for (let i = 0; i < 4; i++) {
    polys.push([[tops[i], 0], [tops[i + 1], 0], [bottoms[i + 1], 1], [bottoms[i], 1]]);
  }
  return polys;
}

function popoutTall() {
  return [
    [[0, 0], [1, 0], [1, 0.6], [0, 0.66]],
    [[0, 0.66], [0.53, 0.63], [0.53, 1], [0, 1]],
    [[0.53, 0.63], [1, 0.6], [1, 1], [0.53, 1]],
  ];
}

function popoutWide() {
  return [
    [[0, 0], [0.61, 0], [0.57, 1], [0, 1]],
    [[0.61, 0], [1, 0], [1, 0.52], [0.585, 0.47]],
    [[0.585, 0.47], [1, 0.52], [1, 1], [0.57, 1]],
  ];
}

// Six cells in two rows of three; the uprights lean a degree or two in
// alternating directions so the grid still feels cut, not pasted.
function gridTall() {
  const topX = [0, 0.35, 0.68, 1];
  const midX = [0, 0.33, 0.66, 1];
  const botX = [0, 0.35, 0.67, 1];
  const polys = [];
  for (let c = 0; c < 3; c++) {
    polys.push([[topX[c], 0], [topX[c + 1], 0], [midX[c + 1], 0.52], [midX[c], 0.52]]);
  }
  for (let c = 0; c < 3; c++) {
    polys.push([[midX[c], 0.52], [midX[c + 1], 0.52], [botX[c + 1], 1], [botX[c], 1]]);
  }
  return polys;
}

function gridWide() {
  const topX = [0, 0.34, 0.67, 1];
  const midX = [0, 0.33, 0.68, 1];
  const botX = [0, 0.34, 0.66, 1];
  const polys = [];
  for (let c = 0; c < 3; c++) {
    polys.push([[topX[c], 0], [topX[c + 1], 0], [midX[c + 1], 0.54], [midX[c], 0.54]]);
  }
  for (let c = 0; c < 3; c++) {
    polys.push([[midX[c], 0.54], [midX[c + 1], 0.54], [botX[c + 1], 1], [botX[c], 1]]);
  }
  return polys;
}

// Motel Row: two portrait panels side by side over one wide scene
// panel — a pair of faces above a place, the neon-noir motel cover.
// The horizontal seam slants a little as it crosses, and the upright
// seam leans to meet it, so the three frames read as one cut sheet.
// Panel order is top-left, top-right, then the wide scene.
function motelWide() {
  return [
    [[0, 0], [0.52, 0], [0.50, 0.53], [0, 0.56]],
    [[0.52, 0], [1, 0], [1, 0.53], [0.50, 0.53]],
    [[0, 0.56], [0.50, 0.53], [1, 0.53], [1, 1], [0, 1]],
  ];
}

// On a portrait or square cover the seam rides a little higher, so the
// two faces keep their height and the scene takes the deep foot.
function motelTall() {
  return [
    [[0, 0], [0.52, 0], [0.50, 0.44], [0, 0.46]],
    [[0.52, 0], [1, 0], [1, 0.44], [0.50, 0.44]],
    [[0, 0.46], [0.50, 0.44], [1, 0.44], [1, 1], [0, 1]],
  ];
}

// The eight arrangements, each with its portrait and landscape geometry.
// popoutIndex names the panel that breaks its frame, or -1 for none.
// gold asks the renderer for gold keylines instead of cream ones.
export const LAYOUTS = [
  { id: 'ensemble', name: 'Ensemble Five', tall: ensembleTall, wide: ensembleWide, popoutIndex: -1, gold: true },
  { id: 'quad', name: 'Poster Quad', tall: quadTall, wide: quadWide, popoutIndex: -1 },
  { id: 'triptych', name: 'Triptych', tall: triptychTall, wide: triptychWide, popoutIndex: -1 },
  { id: 'hero', name: 'Hero + Duo', tall: heroDuoTall, wide: heroDuoWide, popoutIndex: -1 },
  { id: 'strips', name: 'Slanted Strips', tall: stripsTall, wide: stripsWide, popoutIndex: -1 },
  { id: 'popout', name: 'Pop-Out Hero', tall: popoutTall, wide: popoutWide, popoutIndex: 0 },
  { id: 'grid', name: 'Grid Six', tall: gridTall, wide: gridWide, popoutIndex: -1 },
  { id: 'motel', name: 'Motel Row', tall: motelTall, wide: motelWide, popoutIndex: -1, gold: true },
];

// Panels for a layout at a given cover aspect (width / height), returned
// as pixel polygons for a W x H canvas.
export function panelsFor(layout, aspect, W, H) {
  const shapes = aspect >= 1.2 ? layout.wide() : layout.tall();
  return shapes.map((poly) => poly.map(([fx, fy]) => [fx * W, fy * H]));
}

// Axis-aligned bounding box of a pixel polygon: the frame a photo is
// cover-fitted into before the polygon clips it.
export function panelBox(poly) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of poly) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

// Even-odd point test, used to pick the panel under the pointer.
export function pointInPanel(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}
