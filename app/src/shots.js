// shots.js — fixed scenes for the entry's screenshots.
//
// A ?shot=editor query presets the studio so a screenshot shows the app
// in a known, reproducible state instead of whatever a visitor last did:
//   layout, grade, size — ids from main.js's tables
//   caption, captionPos (top|bottom), captionScale (0.6–1.5), subText
//   tags, seal, billing, quote, tagline, extras, subtitle, clean — 1 or 0
//   sealPos — br|bl|tr; billingText, quoteText, quoteSource, taglineText
//   photo=cast — deal the five bundled cast portraits into the panels;
//     castShift rotates which portrait lands in which panel
//   photo=motel — deal the Motel Row cover: the vixen and the
//     showgirl in the portrait panels, the motel scene in the wide
//     foot panel (its panorama framing at wide sizes, the scene
//     itself at tall)
//   photo=confession — deal the Teal Confession cast: the vixen and
//     the showgirl plus three of the five ensemble portraits,
//     face-fitted like the cast dealing
//   clean=1 — paint the cover without the editor's badges and outline,
//     so the captured frame is the export itself
// main.js applies the config, then sets window.__shotReady once the
// scene is painted. shots.json in the repository root lists the scenes
// the shipped screenshots were taken from.

const FLAG_KEYS = {
  tags: 'tags', seal: 'seal', billing: 'billing', quote: 'quote',
  tagline: 'tagline', extras: 'extras', subtitle: 'subtitle', clean: 'clean',
};

export function shotConfigFromQuery(search) {
  const query = new URLSearchParams(search);
  if (!query.has('shot')) return null;
  const cfg = {};
  for (const key of [
    'layout', 'grade', 'size', 'caption', 'captionPos', 'sealPos', 'billingText',
    'photo', 'subText', 'quoteText', 'quoteSource', 'taglineText',
  ]) {
    if (query.has(key)) cfg[key] = query.get(key);
  }
  if (query.has('captionScale')) {
    const scale = Number(query.get('captionScale'));
    if (Number.isFinite(scale)) cfg.captionScale = Math.max(0.6, Math.min(1.5, scale));
  }
  if (query.has('castShift')) {
    const shift = Number(query.get('castShift'));
    if (Number.isFinite(shift)) cfg.castShift = Math.max(0, Math.min(4, Math.floor(shift)));
  }
  for (const [param, key] of Object.entries(FLAG_KEYS)) {
    if (query.has(param)) cfg[key] = query.get(param) !== '0';
  }
  return cfg;
}
