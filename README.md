# gta6-cover-art-01

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/mumun110795/gta6-cover-art-v4/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/mumun110795/gta6-cover-art-v4/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Chrome Studio is a static web app that turns your own photos into GTA-poster-style cover art and exports it as a PNG in 1080×1080, 1080×1350 or 1920×1080. Load photos from your machine (or drag & drop them), fill the panels, drag and scroll to crop each one, and the studio does the rest — everything runs offline in your browser, with no uploads.

It opens on a finished cover: five bundled cast portraits — the Siren, the Gambler, the Surfer, the Heiress and the DJ — are dealt into the Ensemble Five layout on first load, so the first screen already looks like the poster at the top of the board. The remaining bundled samples are two more portraits — the Vixen and the Showgirl, the Motel Row pair — and a neon motel scene with no people in it, in two framings — the scene itself and a wide panorama composed from it — waiting in the tray for the Motel Row preset. The pair also headlines the square demo cover, Teal Confession, dealt into the ensemble with the Surfer, the Siren and the Gambler — and its billing line says so. Swap in your own photos panel by panel whenever you're ready.

What it makes:

- **Ensemble Five layout** — one large centre panel at full height with two stacked panels down each side, thin gold dividers and seams that lean as they fall: the five-face ensemble composition, and the studio's default. Seven more layouts behind it — Poster Quad, Triptych, Hero + Duo, Slanted Strips (angled parallelogram dividers), Grid Six, the **Pop-Out Hero**, whose hero photo spills past its panel frame over the keyline with a soft shadow, the classic GTA cover move, and **Motel Row** (below).
- **Face-fitted cast dealing** — the five cast portraits are tall and the Ensemble panels are not, so a plain centred crop would slice every face off at the hairline or the chin. Each portrait carries its measured face span, and dealing the cast fits every crop to it: the whole face — hairline to chin, with headroom — lands inside its panel at every post size, and the placement is solved against the cover's own furniture, so the chrome title, script subtitle, tagline ribbon, quote strip and seal never sit across a face either. Your own photos keep the plain cover-fit and full manual drag/zoom; the fitting applies to how the bundled cast is dealt.
- **Motel Row layout & preset** — two portrait panels side by side over one wide scene panel, the neon-noir motel cover. Its button in the layout picker is a preset, not just an arrangement: one click deals the Vixen and the Showgirl into the portrait panels and the bundled motel scene into the wide foot, sets the Neon Nights grade, and titles the cover MOTEL ROW — "after hours", STAY THE NIGHT · LEAVE AT DAWN. The portrait crops are fitted to each face, so nobody loses their head to the wide panels, and the chrome title, subtitle and tagline ribbon sit over the scene panel rather than across the pair's faces. At wide post sizes the foot takes the scene's panorama framing, so the neon sign and the convertible survive the strip instead of being cropped out of it. Everything stays editable afterwards.
- **Retro-chrome caption lettering** — the title is painted on canvas as striped chrome type: sky-blue steel over a white horizon glint over a magenta-violet sunset reflection, with a dark outline, stamped-metal extrusion, drop shadow and a slight forward slant. Edit the text, its size, and top or bottom placement.
- **Script subtitle** — a flowing line under the chrome title ("no saints after dark"), set in a script face where one is installed and in a glowing neon-pink italic serif where none is, editable and toggleable.
- **Poster furniture** — a review-quote strip with five gold stars along the top ("SIN NEVER LOOKED THIS GOOD" — THE BAYSIDE BUGLE), a gold-ruled tagline ribbon across the cover (FIVE SINS · ONE CITY · NO SAINTS), a round "VICE CITY · EST. 2026" seal drawn in code, a "VOL. 1" corner badge, a "COMING SOON" stamp and a seeded barcode — every line editable, every piece toggleable.
- **Cast tags & callouts** — an editable name plaque on every panel ("THE SIREN", "THE GAMBLER", "THE DJ"…), angled like a sticker, toggleable as a set.
- **Six colour grades** — Vice Sunset, Neon Nights, Golden Hour, Teal Dusk, Mono Noir and No Grade, each with a sky-glow bloom over the top of the cover.
- **Billing block** — a film-poster line of tiny letterspaced credits along the foot of the cover, seated a clear margin inside the frame.
- **Painted backdrops** — panels without a photo are painted with a built-in Vice City sunset (banded sky, skyline, bay, palms), so even one photo makes a finished cover.

## Run it

```sh
# Serve the app (any static file server works; there is no build step):
python3 -m http.server 8080 --directory app
# …then open the served page in desktop Chrome.

# Hand the entry in — copies app/ and screenshots/ to the output
# directory and writes dossier.json there:
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---
<sub>Entered on [make.fun](https://make.fun/?ref=vdsf53gd&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
