// chrome-type.js — the display lettering of Vice Chrome Studio.
//
// The caption is set in retro chrome: heavy poster capitals filled with a
// striped metal gradient — pale sky at the top, a hard white horizon
// glint, then the magenta-to-violet reflection a Vice City sunset throws
// back — wrapped in a dark outline, extruded a few pixels deep, and
// dropped on a soft shadow with a slight forward slant. No font file is
// shipped: the letterforms are the visitor's own heavy system sans,
// painted by the passes below, so the chrome looks the same everywhere.
//
// The module also carries the small text helpers the poster dressing
// uses: the script subtitle under the title, letterspaced type for the
// billing block, and type set on a circle for the seal.

const CHROME_STACK = "'Arial Black', 'Liberation Sans', 'DejaVu Sans', sans-serif";
const CONDENSED_STACK = "'Arial Narrow', 'Liberation Sans Narrow', 'Liberation Sans', sans-serif";

// Cap height of the chrome face as a fraction of the font size; the
// gradient is fitted to the caps, not to the font's whole em box.
const CAP_RATIO = 0.716;

export function chromeFont(px) {
  return `900 ${px}px ${CHROME_STACK}`;
}

export function condensedFont(px, weight = 600) {
  return `${weight} ${px}px ${CONDENSED_STACK}`;
}

// Width of a line of chrome text at a given font size, in pixels.
export function measureChromeText(ctx, text, px) {
  ctx.save();
  ctx.font = chromeFont(px);
  const width = ctx.measureText(text).width;
  ctx.restore();
  return width;
}

// The chrome gradient itself, fitted between the top of the caps (top)
// and a little below the baseline (bottom): sky, steel, the horizon
// glint, then the sunset the metal mirrors.
function chromeGradient(ctx, top, bottom) {
  const grad = ctx.createLinearGradient(0, top, 0, bottom);
  grad.addColorStop(0.0, '#f2faff');
  grad.addColorStop(0.16, '#aedcff');
  grad.addColorStop(0.33, '#5f97d8');
  grad.addColorStop(0.45, '#24467c');
  grad.addColorStop(0.495, '#ffffff');
  grad.addColorStop(0.52, '#ffe0f4');
  grad.addColorStop(0.57, '#ff4fc3');
  grad.addColorStop(0.72, '#93339f');
  grad.addColorStop(0.88, '#4a1c6e');
  grad.addColorStop(1.0, '#2a0f47');
  return grad;
}

// Draw one line of retro-chrome text centred on (cx, cy).
//   height:   the cap height to aim for, in pixels
//   maxWidth: shrink the line until it fits this width
//   slant:    shear of the letterforms (negative leans forward)
// Returns the width the line actually took.
export function drawChromeText(ctx, text, cx, cy, { height, maxWidth, slant = -0.09 }) {
  const upper = text.toUpperCase();
  let px = height / CAP_RATIO;
  ctx.save();
  ctx.font = chromeFont(px);
  let width = ctx.measureText(upper).width;
  ctx.restore();
  if (width > maxWidth) {
    px *= maxWidth / width;
    width = maxWidth;
  }

  // The lettering is painted on its own canvas first: the outline, the
  // extrusion and the face need to composite against each other (the
  // gloss and pinstripes are clipped to the letterforms with
  // source-atop), and the finished line is then stamped onto the cover
  // with its drop shadow.
  const padX = px * 0.22;
  const padTop = px * 0.3;
  const padBottom = px * 0.34;
  const off = document.createElement('canvas');
  off.width = Math.ceil(width + padX * 2 + px * 0.2);
  off.height = Math.ceil(px + padTop + padBottom);
  const o = off.getContext('2d');
  const baseX = padX + px * 0.1;
  const baseY = padTop + px * 0.78; // alphabetic baseline
  const capTop = baseY - px * CAP_RATIO;
  const capBottom = baseY + px * 0.08;

  o.font = chromeFont(px);
  o.textAlign = 'left';
  o.textBaseline = 'alphabetic';
  o.lineJoin = 'round';
  o.miterLimit = 2;

  // Shear around the middle of the caps so the line leans as one piece.
  const midY = (capTop + capBottom) / 2;
  o.translate(0, midY);
  o.transform(1, 0, slant, 1, 0, 0);
  o.translate(0, -midY);

  // Extrusion: a short stack of dark copies stepping down and back,
  // which gives the letters their stamped-metal depth.
  o.fillStyle = '#160430';
  const steps = 5;
  for (let i = steps; i >= 1; i--) {
    o.fillText(upper, baseX + (i * px * 0.008), baseY + (i * px * 0.011));
  }

  // The dark outline the chrome sits in.
  o.strokeStyle = '#0a0118';
  o.lineWidth = px * 0.15;
  o.strokeText(upper, baseX, baseY);

  // The chrome face.
  o.fillStyle = chromeGradient(o, capTop, capBottom);
  o.fillText(upper, baseX, baseY);

  // Detail passes, clipped to the letterforms by source-atop: a gloss
  // across the top of the caps, two pinstripes, the bright horizon line
  // where sky meets reflection, and a warm bounce along the foot.
  o.globalCompositeOperation = 'source-atop';
  const gloss = o.createLinearGradient(0, capTop, 0, capTop + px * 0.42);
  gloss.addColorStop(0, 'rgba(255,255,255,0.5)');
  gloss.addColorStop(1, 'rgba(255,255,255,0)');
  o.fillStyle = gloss;
  o.fillRect(0, capTop, off.width, px * 0.45);
  o.fillStyle = 'rgba(8,8,40,0.28)';
  o.fillRect(0, capTop + px * 0.3, off.width, px * 0.022);
  o.fillStyle = 'rgba(255,255,255,0.85)';
  o.fillRect(0, capTop + (capBottom - capTop) * 0.495, off.width, px * 0.014);
  o.fillStyle = 'rgba(255,255,255,0.16)';
  o.fillRect(0, capTop + px * 0.6, off.width, px * 0.018);
  const bounce = o.createLinearGradient(0, capBottom - px * 0.2, 0, capBottom);
  bounce.addColorStop(0, 'rgba(255,110,40,0)');
  bounce.addColorStop(1, 'rgba(255,110,40,0.22)');
  o.fillStyle = bounce;
  o.fillRect(0, capBottom - px * 0.2, off.width, px * 0.2);
  o.globalCompositeOperation = 'source-over';

  // Stamp onto the cover: once with the shadow, once clean over it.
  const dx = cx - off.width / 2;
  const dy = cy - (padTop + px * CAP_RATIO / 2) + px * 0.1;
  ctx.save();
  ctx.shadowColor = 'rgba(8,0,24,0.6)';
  ctx.shadowBlur = height * 0.14;
  ctx.shadowOffsetY = height * 0.055;
  ctx.drawImage(off, dx, dy);
  ctx.restore();
  ctx.drawImage(off, dx, dy);
  return width;
}

// One line of letterspaced type, centred on (cx, y) — the billing block's
// tiny credits are set this way, character by character, since canvas
// letter-spacing is not yet everywhere. Returns the width taken.
export function drawSpacedText(ctx, text, cx, y, { font, spacing, color }) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  let total = 0;
  for (const ch of text) total += ctx.measureText(ch).width + spacing;
  total -= text.length ? spacing : 0;
  let penX = cx - total / 2;
  for (const ch of text) {
    ctx.fillText(ch, penX, y);
    penX += ctx.measureText(ch).width + spacing;
  }
  ctx.restore();
  return total;
}

// Width drawSpacedText would take, for fitting the billing line.
export function measureSpacedText(ctx, text, { font, spacing }) {
  ctx.save();
  ctx.font = font;
  let total = 0;
  for (const ch of text) total += ctx.measureText(ch).width + spacing;
  ctx.restore();
  return text.length ? total - spacing : 0;
}

// The script subtitle that sits under the chrome title — "one last ride"
// in a flowing hand, the way the genre's posters sign their title off.
// The stack names real script faces first (Segoe Script on Windows,
// Brush Script / Lucida Handwriting on macOS); where none is installed —
// this build's headless Chromium among them — it lands on a bold italic
// serif, and the neon-pink glow carries the flourish instead. The line
// leans back a few degrees and is painted twice: a dark underlay for
// legibility over bright panels, then the glowing face.
const SCRIPT_STACK = "'Segoe Script', 'Brush Script MT', 'Lucida Handwriting', 'Apple Chancery', 'Liberation Serif', 'DejaVu Serif', Georgia, serif";

export function scriptFont(px) {
  return `italic 700 ${px}px ${SCRIPT_STACK}`;
}

// Draw one line of script centred on (cx, cy).
//   size:     the font size to aim for, in pixels
//   maxWidth: shrink the line until it fits this width
// Returns the width the line actually took.
export function drawScriptText(ctx, text, cx, cy, { size, maxWidth }) {
  let px = size;
  ctx.save();
  ctx.font = scriptFont(px);
  let width = ctx.measureText(text).width;
  ctx.restore();
  if (width > maxWidth) {
    px *= maxWidth / width;
    width = maxWidth;
  }
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.028);
  ctx.font = scriptFont(px);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(16,1,26,0.6)';
  ctx.fillText(text, px * 0.03, px * 0.045);
  ctx.shadowColor = '#ff2e88';
  ctx.shadowBlur = px * 0.38;
  ctx.fillStyle = '#ff7ac0';
  ctx.fillText(text, 0, 0);
  ctx.fillText(text, 0, 0); // a second pass deepens the glow
  ctx.restore();
  return width;
}

// Type set around a circle, letter by letter — the seal's rim legend.
// The characters stand on the rim at equal angular steps across `span`
// radians, centred on the top of the circle and running clockwise, each
// rotated to sit tangent to the rim.
export function drawCircularText(ctx, text, cx, cy, radius, { font, color, span }) {
  const chars = [...text];
  if (!chars.length) return;
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const step = chars.length > 1 ? span / chars.length : 0;
  chars.forEach((ch, i) => {
    const a = -span / 2 + step * (i + 0.5);
    ctx.save();
    ctx.translate(cx + Math.sin(a) * radius, cy - Math.cos(a) * radius);
    ctx.rotate(a);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });
  ctx.restore();
}
