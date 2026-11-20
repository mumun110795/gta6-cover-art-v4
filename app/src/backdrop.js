// backdrop.js — the painted Vice City sunset an empty panel shows.
//
// A panel with no photo in it is not left blank: this module paints a
// small retro scene into its box — banded sky, a low sun with a halo,
// skyline silhouettes, a bay with the sun's reflection, and palm trees at
// the corners. The scene is drawn from a seeded random source, so it is
// identical on every render and in every export for a given panel, and
// the cover's colour grade washes over it together with the photos, so
// painted panels and real photos share one colour world.

// Deterministic random source (a mulberry-style generator): same seed,
// same scene, on every machine and every run.
function seededRandom(seed) {
  let a = (seed * 2246822519 + 3266489917) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// One palm: a trunk curving away from vertical, five fronds drooping from
// its crown. (baseX, baseY) is where the trunk meets the ground.
function paintPalm(ctx, baseX, baseY, height, lean) {
  const crownX = baseX + lean * height;
  const crownY = baseY - height;
  ctx.strokeStyle = '#160631';
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(2, height * 0.07);
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.quadraticCurveTo(baseX + lean * height * 0.25, baseY - height * 0.55, crownX, crownY);
  ctx.stroke();
  ctx.lineWidth = Math.max(1.5, height * 0.04);
  const fronds = [-2.6, -1.9, -1.15, -0.45, 0.25];
  for (const dir of fronds) {
    const reach = height * (0.4 + Math.abs(dir) * 0.05);
    const endX = crownX + Math.sin(dir) * reach;
    const endY = crownY + Math.abs(Math.cos(dir)) * reach * 0.34 + height * 0.1;
    ctx.beginPath();
    ctx.moveTo(crownX, crownY);
    ctx.quadraticCurveTo(crownX + Math.sin(dir) * reach * 0.5, crownY - height * 0.13, endX, endY);
    ctx.stroke();
  }
}

// Paint the sunset scene into box {x, y, w, h}; panelIndex varies the
// sun's place, the skyline and the stars from panel to panel.
export function paintBackdrop(ctx, box, panelIndex) {
  const rand = seededRandom(panelIndex * 13 + 5);
  const { x, y, w, h } = box;
  const horizon = y + h * 0.76;

  // Banded retro sky: flat colour steps instead of a smooth blend.
  const bands = ['#20084a', '#4a1570', '#8a2a72', '#d94f70', '#ff8a5a', '#ffc46b'];
  const bandH = (horizon - y) / bands.length;
  bands.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y + i * bandH, w, bandH + 1);
  });

  // Early stars in the top bands.
  ctx.fillStyle = '#ffeecf';
  for (let i = 0; i < 12; i++) {
    ctx.globalAlpha = 0.2 + rand() * 0.55;
    const r = 0.8 + rand() * 1.6;
    ctx.fillRect(x + rand() * w, y + rand() * bandH * 2.2, r, r);
  }
  ctx.globalAlpha = 1;

  // The sun: a disc with a halo, sitting just above the horizon, its
  // lower half cut by two thin sky-coloured slits (the retro look).
  const sunX = x + w * (0.32 + rand() * 0.36);
  const sunY = horizon - h * 0.05;
  const sunR = Math.min(w, h) * 0.19;
  const halo = ctx.createRadialGradient(sunX, sunY, sunR * 0.3, sunX, sunY, sunR * 2.6);
  halo.addColorStop(0, 'rgba(255,196,90,0.55)');
  halo.addColorStop(1, 'rgba(255,196,90,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(x, y, w, horizon - y);
  ctx.fillStyle = '#ffd76e';
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d94f70';
  ctx.fillRect(sunX - sunR, sunY + sunR * 0.34, sunR * 2, sunR * 0.09);
  ctx.fillRect(sunX - sunR, sunY + sunR * 0.62, sunR * 2, sunR * 0.13);

  // Skyline along the horizon, lit windows pricked in.
  ctx.fillStyle = '#1a0636';
  let bx = x - 3;
  const windows = [];
  while (bx < x + w) {
    const bw = w * (0.045 + rand() * 0.085);
    const bh = h * (0.09 + rand() * 0.22);
    ctx.fillRect(bx, horizon - bh, bw, bh);
    for (let wy = horizon - bh + 4; wy < horizon - 5; wy += 6) {
      for (let wx = bx + 3; wx < bx + bw - 3; wx += 6) {
        if (rand() > 0.55) windows.push([wx, wy]);
      }
    }
    bx += bw + w * 0.014;
  }
  ctx.fillStyle = 'rgba(255,214,130,0.85)';
  for (const [wx, wy] of windows) ctx.fillRect(wx, wy, 2.2, 2.8);

  // The bay below the horizon, and the sun's reflection broken into
  // dashes that widen as they come forward.
  const sea = ctx.createLinearGradient(0, horizon, 0, y + h);
  sea.addColorStop(0, '#4a1460');
  sea.addColorStop(1, '#0e0324');
  ctx.fillStyle = sea;
  ctx.fillRect(x, horizon, w, y + h - horizon);
  const rows = 8;
  for (let i = 0; i < rows; i++) {
    const ry = horizon + ((i + 0.6) / rows) * (y + h - horizon);
    const rw = sunR * (0.45 + rand() * 0.9) * (1 + i * 0.12);
    ctx.fillStyle = `rgba(255,170,84,${0.5 - i * 0.045})`;
    ctx.fillRect(sunX - rw / 2 + (rand() - 0.5) * 7, ry, rw, 2.1);
  }

  // Palms framing the lower corners.
  paintPalm(ctx, x + w * 0.09, y + h * 0.995, h * 0.36, 0.2);
  paintPalm(ctx, x + w * 0.94, y + h * 0.995, h * 0.28, -0.27);
}
