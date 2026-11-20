// main.ts — the handover program for Vice Chrome Studio.
//
// The app itself is the static site in app/ (open app/index.html from any
// static file server; it runs offline in a desktop browser). This program
// hands the entry in the way the bounty asks: it copies app/ and
// screenshots/ from beside this file into the output directory and writes
// dossier.json there with buildDossier from the vendored make.fun library
// (vendor/makefun-app.ts, the kit's copy, kept byte for byte). The output
// directory is /output in the grader; anywhere else, MAKEFUN_OUTPUT_DIR
// names it instead:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Node 22 standard library only; nothing is installed before it runs, and
// two runs over the same repository write the same bytes.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate's caps, passed to the dossier builder so an entry the scorer
// would refuse (too many app files, an oversized screenshot, a dossier
// text over its cap) fails here first instead of at grading.
const GATE_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

mkdirSync(outDir, { recursive: true });
cpSync(join(repoDir, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoDir, 'screenshots'))) {
  cpSync(join(repoDir, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

writeFileSync(join(outDir, 'dossier.json'), buildDossier(outDir, GATE_CAPS));
