// Vice Chrome Studio — cover renderer.
// Everything on a cover is drawn from fractions of the canvas size, so the
// same state renders identically at editor size and at export size.
// The module is pure drawing: it knows nothing about the DOM controls.

export const GRADES = {
  neon: {
    label: 'Neon Nights',
    filter: 'saturate(1.38) contrast(1.10) brightness(1.03)',
    tint: ['rgba(255,45,150,0.55)', 'rgba(40,220,255,0.55)'],
    tintMode: 'soft-light',
  },
  teal: {
    label: 'Teal Dusk',
    filter: 'saturate(1.14) contrast(1.06) sepia(0.16) hue-rotate(-10deg)',
    tint: ['rgba(20,180,190,0.50)', 'rgba(255,170,80,0.45)'],
    tintMode: 'soft-light',
  },
  sunset: {
    label: 'Sunset Strip',
    filter: 'saturate(1.27) contrast(1.06) brightness(1.05) sepia(0.20)',
    tint: ['rgba(255,140,60,0.42)', 'rgba(255,60,140,0.42)'],
    tintMode: 'soft-light',
  },
  golden: {
    label: 'Golden Hour',
    filter: 'saturate(1.18) contrast(1.03) brightness(1.08) sepia(0.30)',
    tint: ['rgba(255,190,80,0.55)', 'rgba(255,120,90,0.40)'],
    tintMode: 'soft-light',
  },
  chrome: {
    label: 'Midnight Chrome',
    filter: 'saturate(0.82) contrast(1.16) brightness(0.99)',
    tint: ['rgba(90,140,255,0.45)', 'rgba(200,220,255,0.40)'],
    tintMode: 'soft-light',
  },
  candy: {
    label: 'Candy Vice',
    filter: 'saturate(1.52) contrast(1.04) hue-rotate(6deg)',
    tint: ['rgba(255,110,220,0.40)', 'rgba(140,90,255,0.40)'],
    tintMode: 'overlay',
  },
};

// Panel geometry. Every layout returns panels in role order; a panel is a
// polygon (points as fractions of W/H) plus the role name used for dealing.
function P(x, y) { return { x, y }; }

export const LAYOUTS = {
  ensemble: {
    label: 'Ensemble Five',
    roles: ['centre', 'tl', 'bl', 'tr', 'br'],
    panels() {
      const x0 = 0.014, x1 = 0.302, x2 = 0.310, x3 = 0.690, x4 = 0.698, x5 = 0.986;
      const y0 = 0.046, ym = 0.482, yg = 0.496, y1 = 0.932, sl = 0.013;
      return [
        { role: 'centre', pts: [P(x2 + sl, y0), P(x3, y0), P(x3 - sl * 0.4, y1), P(x2, y1)], safe: 0.010 },
        { role: 'tl', pts: [P(x0, y0), P(x1, y0), P(x1 - sl * 0.5, ym), P(x0, ym)] },
        { role: 'bl', pts: [P(x0, yg), P(x1 - sl * 0.5, yg), P(x1 - sl * 0.2, y1), P(x0, y1)] },
        { role: 'tr', pts: [P(x4 + sl * 0.5, y0), P(x5, y0), P(x5, ym), P(x4, ym)] },
        { role: 'br', pts: [P(x4, yg), P(x5, yg), P(x5, y1), P(x4 + sl * 0.2, y1)] },
      ];
    },
  },
  motel: {
    label: 'Motel Row',
    roles: ['left', 'right', 'scene'],
    panels() {
      const x0 = 0.014, xm = 0.4965, xn = 0.5035, x1 = 0.986;
      const y0 = 0.046, ym = 0.498, yg = 0.512, y1 = 0.932;
      return [
        { role: 'left', pts: [P(x0, y0), P(xm, y0), P(xm, ym), P(x0, ym)] },
        { role: 'right', pts: [P(xn, y0), P(x1, y0), P(x1, ym), P(xn, ym)] },
        { role: 'scene', pts: [P(x0, yg), P(x1, yg), P(x1, y1), P(x0, y1)], bare: true },
      ];
    },
  },
  hero: {
    label: 'Hero + Duo',
    roles: ['hero', 'tr', 'br'],
    panels() {
      const x0 = 0.014, x1 = 0.648, x2 = 0.656, x3 = 0.986;
      const y0 = 0.046, ym = 0.482, yg = 0.496, y1 = 0.932, sl = 0.012;
      return [
        { role: 'hero', pts: [P(x0, y0), P(x1, y0), P(x1 - sl, y1), P(x0, y1)], safe: 0.008 },
        { role: 'tr', pts: [P(x2 + sl * 0.5, y0), P(x3, y0), P(x3, ym), P(x2, ym)] },
        { role: 'br', pts: [P(x2, yg), P(x3, yg), P(x3, y1), P(x2 + sl * 0.3, y1)] },
      ];
    },
  },
  duo: {
    label: 'Duo Split',
    roles: ['left', 'right'],
    panels() {
      const x0 = 0.014, xm = 0.4965, xn = 0.5035, x1 = 0.986;
      const y0 = 0.046, y1 = 0.932, sl = 0.016;
      return [
        { role: 'left', pts: [P(x0, y0), P(xm + sl, y0), P(xm, y1), P(x0, y1)], safe: 0.010 },
        { role: 'right', pts: [P(xn + sl, y0), P(x1, y0), P(x1, y1), P(xn, y1)], safe: 0.010 },
      ];
    },
  },
  quad: {
    label: 'Poster Quad',
    roles: ['tl', 'tr', 'bl', 'br'],
    panels() {
      const x0 = 0.014, xm = 0.4965, xn = 0.5035, x1 = 0.986;
      const y0 = 0.046, ym = 0.482, yg = 0.496, y1 = 0.932;
      return [
        { role: 'tl', pts: [P(x0, y0), P(xm, y0), P(xm, ym), P(x0, ym)] },
        { role: 'tr', pts: [P(xn, y0), P(x1, y0), P(x1, ym), P(xn, ym)] },
        { role: 'bl', pts: [P(x0, yg), P(xm, yg), P(xm, y1), P(x0, y1)] },
        { role: 'br', pts: [P(xn, yg), P(x1, yg), P(x1, y1), P(xn, y1)] },
      ];
    },
  },
};

export function panelBox(panel, W, H) {
  const xs = panel.pts.map(p => p.x * W), ys = panel.pts.map(p => p.y * H);
  const x = Math.min(...xs), y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

function polyPath(ctx, panel, W, H) {
  ctx.beginPath();
  panel.pts.forEach((p, i) => {
    const px = p.x * W, py = p.y * H;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  });
  ctx.closePath();
}

// ---- face-fitted cropping -------------------------------------------------
// A dealt portrait is placed so its "skin zone" (the face span shrunk past
// the hair) sits whole inside the panel and clear of furniture rectangles,
// while the full span (hair included) stays inside as far as possible.
// Returns {sx, sy, sw, sh}: the source window to draw into the panel box.
export function fitWindow(img, face, box, furniture, headroomFrac = 0.10) {
  const iw = img.naturalWidth, ih = img.naturalHeight;
  if (!face) {
    const s = Math.max(box.w / iw, box.h / ih);
    const sw = box.w / s, sh = box.h / s;
    return { sx: (iw - sw) / 2, sy: (ih - sh) / 2, sw, sh };
  }
  const [fx0, fx1] = face.x, [fy0, fy1] = face.y;
  // The hairline sits well inside the measured span for the long-haired
  // portraits (about 45% of the way from hair-top to chin), so the skin
  // zone starts there: furniture may cross hair, never forehead.
  const skinTop = fy0 + 0.45 * (fy1 - fy0);
  const sk = { x0: fx0 * iw, y0: skinTop * ih, x1: fx1 * iw, y1: fy1 * ih };
  const span = { x0: fx0 * iw, y0: fy0 * ih, x1: fx1 * iw, y1: fy1 * ih };
  const s0 = Math.max(box.w / iw, box.h / ih);
  let best = null;
  for (let z = 1.0; z <= 1.601; z += 0.025) {
    const s = s0 * z;
    const sw = box.w / s, sh = box.h / s;
    // Candidate window positions: the natural one (skin zone centred,
    // near the top), the extremes, and positions that park the skin zone
    // just clear of a furniture rectangle on each side.
    const wxC = new Set([ (sk.x0 + sk.x1) / 2 - sw / 2, 0, iw - sw ]);
    const wyC = new Set([ sk.y0 - headroomFrac * box.h / s, 0, ih - sh ]);
    for (const f of furniture) {
      wxC.add(sk.x1 - (f.x - 4 - box.x) / s);       // skin right edge at f.left
      wxC.add(sk.x0 - (f.x + f.w + 4 - box.x) / s); // skin left edge at f.right
      wyC.add(sk.y0 - (f.y + f.h + 4 - box.y) / s); // skin top below f
      wyC.add(sk.y1 - (f.y - 4 - box.y) / s);       // skin bottom above f
    }
    for (let wx of wxC) {
      wx = Math.min(Math.max(wx, 0), iw - sw);
      for (let wy of wyC) {
        wy = Math.min(Math.max(wy, 0), ih - sh);
        const px = v => box.x + (v - wx) * s;
        const py = v => box.y + (v - wy) * s;
        const skinRect = { x: px(sk.x0), y: py(sk.y0), w: (sk.x1 - sk.x0) * s, h: (sk.y1 - sk.y0) * s };
        const spanRect = { x: px(span.x0), y: py(span.y0), w: (span.x1 - span.x0) * s, h: (span.y1 - span.y0) * s };
        let penalty = (z - 1) * 40;
        penalty += rectOverflow(skinRect, box) * 3;
        penalty += rectOverflow(spanRect, box) * 0.35;
        for (const f of furniture) penalty += rectOverlap(skinRect, f) * 0.02;
        penalty += Math.abs((skinRect.x + skinRect.w / 2) - (box.x + box.w / 2)) * 0.05;
        if (!best || penalty < best.penalty) best = { penalty, sx: wx, sy: wy, sw, sh };
      }
    }
  }
  return best;
}

function rectOverflow(r, box) {
  const dx = Math.max(0, box.x - r.x) + Math.max(0, r.x + r.w - (box.x + box.w));
  const dy = Math.max(0, box.y - r.y) + Math.max(0, r.y + r.h - (box.y + box.h));
  return dx + dy;
}
function rectOverlap(a, b) {
  const w = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const h = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return w * h;
}

// ---- backdrop --------------------------------------------------------------
function paintBackdrop(ctx, W, H) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#170a33');
  g.addColorStop(0.42, '#3d0f52');
  g.addColorStop(0.72, '#7c1a5e');
  g.addColorStop(0.92, '#c2336e');
  g.addColorStop(1, '#8f1d63');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const sun = ctx.createRadialGradient(W * 0.5, H * 1.02, 10, W * 0.5, H * 1.02, W * 0.62);
  sun.addColorStop(0, 'rgba(255,170,90,0.30)');
  sun.addColorStop(1, 'rgba(255,170,90,0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, W, H);
  // Silhouette palms in the top corners, kept faint: the gaps between
  // panels show the painted sky, never a photograph.
  ctx.fillStyle = 'rgba(16,4,30,0.55)';
  palm(ctx, W * 0.015, H * 0.005, H * 0.16, 1);
  palm(ctx, W * 0.985, H * 0.005, H * 0.14, -1);
  palm(ctx, W * 0.5, -H * 0.03, H * 0.10, 1);
}
function palm(ctx, x, y, len, dir) {
  ctx.save();
  ctx.translate(x, y);
  for (let i = 0; i < 6; i++) {
    const a = (-0.15 - i * 0.32) * dir;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(Math.sin(a) * len * 0.6, Math.cos(a) * len * 0.4 - len * 0.25,
      Math.sin(a) * len, len * (0.25 + 0.16 * Math.sin(i * 2.1)));
    ctx.quadraticCurveTo(Math.sin(a) * len * 0.55, Math.cos(a) * len * 0.35 - len * 0.10, 0, 0);
    ctx.fill();
  }
  ctx.restore();
}

// ---- furniture -------------------------------------------------------------
const GOLD = '#f2c14e';
const INK = '#120826';

function spacedWidth(ctx, text, spacing) {
  let w = 0;
  for (const ch of text) w += ctx.measureText(ch).width + spacing;
  return w - (text.length ? spacing : 0);
}
function drawSpaced(ctx, text, cx, y, spacing) {
  const total = spacedWidth(ctx, text, spacing);
  let x = cx - total / 2;
  const prev = ctx.textAlign;
  ctx.textAlign = 'left';
  for (const ch of text) { ctx.fillText(ch, x, y); x += ctx.measureText(ch).width + spacing; }
  ctx.textAlign = prev;
}

function chromeGradient(ctx, y, h) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#fdfdff');
  g.addColorStop(0.30, '#cfe2ff');
  g.addColorStop(0.47, '#7d9ccf');
  g.addColorStop(0.505, '#241a4a');
  g.addColorStop(0.545, '#ff8ad4');
  g.addColorStop(0.72, '#e034b4');
  g.addColorStop(0.88, '#8a4de8');
  g.addColorStop(1, '#4de3ff');
  return g;
}

// Retro-chrome display type: each glyph is stroked dark, then filled with a
// striped metal-to-neon gradient. Returns the drawn width.
export function drawChrome(ctx, text, cx, top, fontPx, maxW) {
  let size = fontPx;
  const setFont = s => { ctx.font = `900 ${s}px "Arial Black","DejaVu Sans",sans-serif`; };
  setFont(size);
  const raw = spacedWidth(ctx, text, -size * 0.06);
  if (raw > maxW) { size = Math.floor(size * maxW / raw); setFont(size); }
  const total = spacedWidth(ctx, text, -size * 0.06);
  ctx.save();
  ctx.textBaseline = 'alphabetic';
  const base = top + size * 0.82;
  ctx.shadowColor = 'rgba(8,2,20,0.55)';
  ctx.shadowBlur = size * 0.10;
  ctx.shadowOffsetY = size * 0.045;
  let x = cx - total / 2;
  ctx.lineJoin = 'round';
  for (const ch of text) {
    const w = ctx.measureText(ch).width;
    ctx.strokeStyle = INK;
    ctx.lineWidth = size * 0.15;
    ctx.strokeText(ch, x, base);
    x += w - size * 0.06;
  }
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = chromeGradient(ctx, top, size * 0.86);
  x = cx - total / 2;
  for (const ch of text) {
    const w = ctx.measureText(ch).width;
    ctx.fillText(ch, x, base);
    x += w - size * 0.06;
  }
  ctx.restore();
  return { w: total, h: size * 0.86, size };
}

export function drawScript(ctx, text, cx, y, fontPx, maxW) {
  let size = fontPx;
  const setFont = s => {
    ctx.font = `italic 700 ${s}px "Segoe Script","Brush Script MT","URW Chancery L","Apple Chancery",cursive`;
  };
  setFont(size);
  const w = ctx.measureText(text).width;
  if (w > maxW) { size = Math.floor(size * maxW / w); setFont(size); }
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = '#ff2e9e';
  ctx.shadowBlur = size * 0.42;
  ctx.fillStyle = '#ff5fb0';
  ctx.fillText(text, cx, y);
  ctx.fillText(text, cx, y);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffd9ec';
  ctx.globalAlpha = 0.85;
  ctx.fillText(text, cx, y);
  ctx.restore();
  return size;
}

function drawQuoteStrip(ctx, W, H, st) {
  const y = H * 0.031;
  ctx.save();
  ctx.textBaseline = 'alphabetic';
  ctx.font = `700 ${H * 0.020}px "DejaVu Sans",sans-serif`;
  ctx.fillStyle = GOLD;
  ctx.textAlign = 'left';
  ctx.fillText('★★★★★', W * 0.016, y);
  const starW = ctx.measureText('★★★★★ ').width;
  ctx.font = `700 ${H * 0.0195}px "DejaVu Sans",sans-serif`;
  ctx.fillStyle = '#fdf6e3';
  const label = `"${st.quote}" — ${st.quoteBy}`;
  ctx.fillText(label, W * 0.016 + starW, y);
  // VOL. 1 chip, top-right.
  const tw = ctx.measureText('VOL. 1').width + W * 0.014;
  const bx = W - W * 0.012 - tw, by = H * 0.006, bh = H * 0.030;
  ctx.fillStyle = 'rgba(10,5,22,0.88)';
  ctx.fillRect(bx, by, tw, bh);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = Math.max(1, H * 0.0016);
  ctx.strokeRect(bx, by, tw, bh);
  ctx.fillStyle = GOLD;
  ctx.textAlign = 'center';
  ctx.font = `700 ${H * 0.018}px "DejaVu Sans",sans-serif`;
  ctx.fillText('VOL. 1', bx + tw / 2, by + bh * 0.72);
  ctx.restore();
}

function drawRibbon(ctx, x, y, w, h, text) {
  ctx.save();
  ctx.fillStyle = 'rgba(9,5,20,0.94)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = GOLD;
  ctx.fillRect(x, y, w, Math.max(1.5, h * 0.055));
  ctx.fillRect(x, y + h - Math.max(1.5, h * 0.055), w, Math.max(1.5, h * 0.055));
  ctx.fillStyle = '#fdf6e3';
  ctx.font = `700 ${h * 0.44}px "DejaVu Sans",sans-serif`;
  ctx.textBaseline = 'middle';
  drawSpaced(ctx, text, x + w / 2, y + h * 0.54, h * 0.16);
  ctx.restore();
}

function drawSeal(ctx, cx, cy, r) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(10,5,22,0.82)';
  ctx.fill();
  ctx.lineWidth = r * 0.045;
  ctx.strokeStyle = GOLD;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
  ctx.lineWidth = r * 0.02;
  ctx.stroke();
  // Star in the middle.
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const rr = i % 2 === 0 ? r * 0.34 : r * 0.145;
    const px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#ff5f9e';
  ctx.fill();
  // Ring words.
  ctx.fillStyle = GOLD;
  ctx.font = `700 ${r * 0.155}px "DejaVu Sans",sans-serif`;
  ringText(ctx, 'VICE CITY', cx, cy, r * 0.885, -Math.PI / 2, 1);
  ringText(ctx, 'EST. 2026', cx, cy, r * 0.885, Math.PI / 2, -1);
  ctx.restore();
}
function ringText(ctx, text, cx, cy, r, centre, dir) {
  const chars = [...text];
  const step = (r * 0.155 * 0.92) / r;
  let a = centre - dir * step * (chars.length - 1) / 2;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const ch of chars) {
    ctx.save();
    ctx.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.rotate(a + (dir > 0 ? Math.PI / 2 : -Math.PI / 2));
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    a += dir * step;
  }
  ctx.restore();
}

const BAR_DIGITS = '9 781926 112606';
function drawBarcode(ctx, W, H) {
  const w = W * 0.047, h = H * 0.056;
  const x = W - W * 0.012 - w, y = H * 0.930;
  ctx.save();
  ctx.fillStyle = '#fdfdf8';
  ctx.fillRect(x, y, w, h);
  let seed = 112606;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  ctx.fillStyle = '#111';
  let bx = x + w * 0.07;
  const baseY = y + h * 0.10, barH = h * 0.62;
  while (bx < x + w * 0.90) {
    const bw = (0.008 + rnd() * 0.028) * w;
    if (rnd() > 0.32) ctx.fillRect(bx, baseY, bw * 0.72, barH);
    bx += bw;
  }
  ctx.font = `400 ${h * 0.17}px "DejaVu Sans",sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(BAR_DIGITS, x + w / 2, y + h * 0.93);
  ctx.restore();
}

function drawBilling(ctx, W, H, text) {
  ctx.save();
  ctx.fillStyle = 'rgba(238,226,255,0.92)';
  ctx.textBaseline = 'alphabetic';
  // Fit between COMING SOON on the left and the barcode on the right:
  // shrink the small caps (and their letter spacing with them), measuring
  // as we go, until the line fits its share of the strip.
  let size = H * 0.0135;
  let spacing = size * 0.26;
  ctx.font = `600 ${size}px "DejaVu Sans",sans-serif`;
  while (spacedWidth(ctx, text, spacing) > W * 0.58 && size > H * 0.005) {
    size *= 0.92;
    spacing = size * 0.26;
    ctx.font = `600 ${size}px "DejaVu Sans",sans-serif`;
  }
  drawSpaced(ctx, text, W / 2, H * 0.972, spacing);
  ctx.restore();
}

function drawComingSoon(ctx, W, H) {
  ctx.save();
  ctx.fillStyle = '#ff5f9e';
  ctx.font = `700 ${H * 0.020}px "DejaVu Sans",sans-serif`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  const t = 'COMING SOON';
  let x = W * 0.014;
  for (const ch of t) { ctx.fillText(ch, x, H * 0.972); x += ctx.measureText(ch).width + H * 0.006; }
  ctx.restore();
}

const TAG_BARS = ['#ff5f9e', '#3fd2ff', '#7ddc5a', '#ffb347', '#c792ff'];
function drawTag(ctx, box, text, idx, H) {
  const h = H * 0.034;
  ctx.save();
  ctx.font = `700 ${h * 0.46}px "DejaVu Sans",sans-serif`;
  const tw = ctx.measureText(text).width + H * 0.020;
  const x = box.x + H * 0.006, y = box.y + box.h - h - H * 0.007;
  ctx.fillStyle = 'rgba(8,5,18,0.90)';
  ctx.fillRect(x, y, tw, h);
  ctx.fillStyle = TAG_BARS[idx % TAG_BARS.length];
  ctx.fillRect(x, y, H * 0.005, h);
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(text, x + H * 0.011, y + h * 0.55);
  ctx.restore();
  return { x, y, w: tw, h };
}

// ---- furniture map (for face fitting) --------------------------------------
// Rectangles the dealt faces must keep clear of, for a given state.
export function furnitureRects(W, H, st, panels) {
  const rects = [{ x: 0, y: 0, w: W, h: H * 0.042 }]; // quote strip zone
  const boxes = panels.map(p => panelBox(p, W, H));
  if (st.captionArea === 'scene') {
    const foot = boxes[boxes.length - 1];
    rects.push({ x: foot.x + foot.w * 0.16, y: foot.y + foot.h * 0.16, w: foot.w * 0.68, h: foot.h * 0.62 });
  } else if (st.captionPos === 'top') {
    rects.push({ x: W * 0.20, y: H * 0.040, w: W * 0.60, h: H * 0.175 });
    if (st.ribbon && st.ribbon !== 'none') {
      const c = boxes[0];
      rects.push({ x: c.x, y: H * 0.262, w: c.w, h: H * 0.056 });
    }
  } else if (st.captionPos === 'foot') {
    rects.push({ x: W * 0.03, y: H * 0.795, w: W * 0.94, h: H * 0.165 });
  }
  if (st.seal === 'topRight') {
    rects.push({ x: W * 0.845, y: 0, w: W * 0.155, h: H * 0.235 });
  }
  rects.push({ x: 0, y: H * 0.945, w: W, h: H * 0.055 }); // billing strip
  return rects;
}

// ---- the cover ---------------------------------------------------------------
export function renderCover(ctx, W, H, st, images, opts = {}) {
  const layout = LAYOUTS[st.layout];
  const panels = layout.panels();
  const grade = GRADES[st.grade];
  paintBackdrop(ctx, W, H);

  const furniture = furnitureRects(W, H, st, panels);
  panels.forEach((panel, i) => {
    const slot = st.slots[i];
    const box = panelBox(panel, W, H);
    if (!slot || !images[slot.photo]) {
      ctx.save();
      polyPath(ctx, panel, W, H);
      ctx.fillStyle = 'rgba(20,8,40,0.65)';
      ctx.fill();
      ctx.restore();
    } else {
      const img = images[slot.photo];
      const face = slot.face || null;
      let win = fitWindow(img, face, box, furniture, slot.headroom ?? 0.10);
      if (slot.nudge) {
        const cxw = win.sx + win.sw / 2, cyw = win.sy + win.sh / 2;
        const s = box.w / win.sw / (slot.nudge.zoom || 1);
        const nsw = box.w / s, nsh = box.h / s;
        win = {
          sx: Math.min(Math.max(cxw + slot.nudge.x * win.sw - nsw / 2, 0), img.naturalWidth - nsw),
          sy: Math.min(Math.max(cyw + slot.nudge.y * win.sh - nsh / 2, 0), img.naturalHeight - nsh),
          sw: nsw, sh: nsh,
        };
      }
      drawPanelPhoto(ctx, panel, box, img, win, grade);
    }
    ctx.save();
    polyPath(ctx, panel, W, H);
    ctx.lineWidth = Math.max(1.5, H * 0.0032);
    ctx.strokeStyle = GOLD;
    ctx.stroke();
    ctx.restore();
    if (opts.editor) drawPanelBadge(ctx, box, i + 1, H, opts.selected === i);
  });

  // Cast tags (under the title block, over the photos).
  if (st.tags) {
    panels.forEach((panel, i) => {
      const slot = st.slots[i];
      if (slot && slot.tag && !panel.bare) drawTag(ctx, panelBox(panel, W, H), slot.tag, i, H);
    });
  }

  drawQuoteStrip(ctx, W, H, st);

  if (st.captionArea === 'scene') {
    const foot = panelBox(panels[panels.length - 1], W, H);
    const cx = foot.x + foot.w / 2;
    const titleTop = foot.y + foot.h * 0.24;
    ctx.save();
    ctx.fillStyle = 'rgba(12,4,26,0.35)';
    ctx.fillRect(foot.x + foot.w * 0.14, foot.y + foot.h * 0.14, foot.w * 0.72, foot.h * 0.66);
    ctx.restore();
    const t = drawChrome(ctx, st.caption, cx, titleTop, H * 0.115 * (st.captionScale || 1), foot.w * 0.86);
    const subY = titleTop + t.h + H * 0.052;
    drawScript(ctx, st.subtitle, cx, subY, H * 0.040, foot.w * 0.6);
    if (st.tagline) drawRibbon(ctx, cx - W * 0.215, subY + H * 0.026, W * 0.43, H * 0.046, st.tagline);
  } else if (st.captionPos === 'top') {
    const cx = W / 2;
    const t = drawChrome(ctx, st.caption, cx, H * 0.048, H * 0.118 * (st.captionScale || 1), W * 0.60);
    drawScript(ctx, st.subtitle, cx, H * 0.048 + t.h + H * 0.040, H * 0.037, W * 0.5);
    if (st.ribbon && st.ribbon !== 'none') {
      const c = panelBox(panels[0], W, H);
      drawRibbon(ctx, c.x + H * 0.004, H * 0.264, c.w - H * 0.008, H * 0.052, st.tagline);
    }
  } else if (st.captionPos === 'foot') {
    const cx = W / 2;
    const size = H * 0.105 * (st.captionScale || 1);
    const t = drawChrome(ctx, st.caption, cx, H * 0.852, size, W * 0.93);
    drawScript(ctx, st.subtitle, cx, H * 0.845, H * 0.042, W * 0.62);
  }

  if (st.seal === 'topRight') drawSeal(ctx, W * 0.906, H * 0.118, W * 0.058);
  if (st.seal === 'scene') {
    const foot = panelBox(panels[panels.length - 1], W, H);
    drawSeal(ctx, foot.x + foot.w * 0.895, foot.y + foot.h * 0.66, W * 0.052);
  }

  // Footer shade: a dark strip under the bottom furniture so the billing
  // line and COMING SOON stay readable over the painted backdrop.
  const fs = ctx.createLinearGradient(0, H * 0.930, 0, H);
  fs.addColorStop(0, 'rgba(18,5,34,0.86)');
  fs.addColorStop(1, 'rgba(24,7,44,0.95)');
  ctx.fillStyle = fs;
  ctx.fillRect(0, H * 0.930, W, H * 0.070);

  drawComingSoon(ctx, W, H);
  drawBilling(ctx, W, H, st.billing);
  drawBarcode(ctx, W, H);

  // Frame: magenta edge line + gold hairline.
  ctx.save();
  ctx.lineWidth = Math.max(2, W * 0.0045);
  ctx.strokeStyle = '#ff2e88';
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);
  ctx.lineWidth = Math.max(1, H * 0.0016);
  ctx.strokeStyle = 'rgba(242,193,78,0.85)';
  ctx.strokeRect(W * 0.008, W * 0.008, W - W * 0.016, H - W * 0.016);
  ctx.restore();

  if (opts.editor && opts.selected != null && panels[opts.selected]) {
    ctx.save();
    polyPath(ctx, panels[opts.selected], W, H);
    ctx.setLineDash([H * 0.012, H * 0.008]);
    ctx.lineWidth = Math.max(1.5, H * 0.003);
    ctx.strokeStyle = '#ff2e88';
    ctx.stroke();
    ctx.restore();
  }
  return panels;
}

function drawPanelBadge(ctx, box, n, H, selected) {
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2, r = H * 0.021;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = selected ? '#ff2e88' : 'rgba(10,5,22,0.78)';
  ctx.fill();
  ctx.lineWidth = Math.max(1, H * 0.0016);
  ctx.strokeStyle = GOLD;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = `700 ${r * 1.05}px "DejaVu Sans",sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(n), cx, cy + r * 0.06);
  ctx.restore();
}

const gradeCanvas = document.createElement('canvas');
function drawPanelPhoto(ctx, panel, box, img, win, grade) {
  const gw = Math.max(2, Math.round(box.w)), gh = Math.max(2, Math.round(box.h));
  gradeCanvas.width = gw; gradeCanvas.height = gh;
  const g = gradeCanvas.getContext('2d');
  g.clearRect(0, 0, gw, gh);
  g.save();
  try { g.filter = grade.filter; } catch { /* older engines: plain draw */ }
  g.drawImage(img, win.sx, win.sy, win.sw, win.sh, 0, 0, gw, gh);
  g.restore();
  g.save();
  g.globalCompositeOperation = grade.tintMode;
  const tg = g.createLinearGradient(0, 0, gw, gh);
  tg.addColorStop(0, grade.tint[0]);
  tg.addColorStop(1, grade.tint[1]);
  g.fillStyle = tg;
  g.fillRect(0, 0, gw, gh);
  g.restore();
  // Gentle vignette so panel edges sit into the backdrop.
  const vg = g.createRadialGradient(gw / 2, gh / 2, Math.min(gw, gh) * 0.42, gw / 2, gh / 2, Math.max(gw, gh) * 0.78);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(10,2,24,0.28)');
  g.fillStyle = vg;
  g.fillRect(0, 0, gw, gh);

  ctx.save();
  polyPath(ctx, panel, ctx.canvas.width, ctx.canvas.height);
  ctx.clip();
  ctx.drawImage(gradeCanvas, box.x, box.y, gw, gh);
  ctx.restore();
}
