// Fixed scenes for the shipped screenshots, plus the state the studio
// opens with. A scene is a full cover state: layout, grade, words and the
// cast dealt into each panel role. ?shot=1..4 picks one; no query at all
// opens scene 1 in the editor.

export const QUOTE = { quote: 'SIN NEVER LOOKED THIS GOOD', quoteBy: 'THE BAYSIDE BUGLE' };

function velvetHeat() {
  return {
    layout: 'ensemble', grade: 'sunset',
    caption: 'VELVET HEAT', subtitle: 'no saints after dark',
    tagline: 'FIVE SINS · ONE CITY · NO SAINTS',
    ...QUOTE,
    billing: 'VICE CHROME STUDIO PRESENTS VELVET HEAT · STARRING FIVE SINNERS · SHOT IN LEONIDA · NO SAINTS WERE CONSULTED',
    captionPos: 'top', captionArea: null, captionScale: 0.85,
    ribbon: 'centre', seal: 'topRight', tags: true,
    slots: [
      { photo: 'siren', tag: 'THE SIREN' },
      { photo: 'gambler', tag: 'THE GAMBLER' },
      { photo: 'surfer', tag: 'THE SURFER' },
      { photo: 'heiress', tag: 'THE HEIRESS' },
      { photo: 'dj', tag: 'THE DJ' },
    ],
  };
}

function motelRow() {
  return {
    layout: 'motel', grade: 'neon',
    caption: 'MOTEL ROW', subtitle: 'after hours',
    tagline: 'STAY THE NIGHT · LEAVE AT DAWN',
    ...QUOTE,
    billing: 'VICE CHROME STUDIO PRESENTS MOTEL ROW · STARRING THE VIXEN AND THE SHOWGIRL · CHECKOUT IS AT DAWN',
    captionPos: 'top', captionArea: 'scene', captionScale: 1,
    ribbon: null, seal: 'scene', tags: true,
    slots: [
      { photo: 'vixen', tag: 'THE VIXEN', headroom: 0.03 },
      { photo: 'showgirl', tag: 'THE SHOWGIRL', headroom: 0.03 },
      { photo: 'pano', tag: null },
    ],
  };
}

function tealConfession() {
  return {
    layout: 'ensemble', grade: 'teal',
    caption: 'TEAL CONFESSION', subtitle: 'every saint has a past',
    tagline: '',
    ...QUOTE,
    billing: 'VICE CHROME STUDIO PRESENTS TEAL CONFESSION · STARRING THE VIXEN, THE SHOWGIRL, THE SURFER, THE SIREN AND THE GAMBLER',
    captionPos: 'foot', captionArea: null, captionScale: 1,
    ribbon: null, seal: null, tags: false,
    slots: [
      { photo: 'vixen', tag: null },
      { photo: 'showgirl', tag: null },
      { photo: 'surfer', tag: null },
      { photo: 'siren', tag: null },
      { photo: 'gambler', tag: null },
    ],
  };
}

export const SCENES = {
  1: { kind: 'export', size: [1920, 1080], state: velvetHeat },
  2: { kind: 'editor', size: [1920, 1080], state: velvetHeat },
  3: { kind: 'export', size: [1920, 1080], state: motelRow },
  4: { kind: 'export', size: [1080, 1080], state: tealConfession },
};

export function openingState() {
  return velvetHeat();
}
