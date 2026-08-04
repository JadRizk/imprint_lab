#!/usr/bin/env node
// Copies each system's static tier into public/, so the docs site serves the
// report kit a consumer actually receives rather than a hand-kept fork of it.
//
// This existed as a manual copy until now, and the manual copy was wrong:
// thl.interact.js was never carried across, so example-report.html requested a
// script that 404'd and every interactive behaviour it demonstrates was dead on
// the hosted page while working perfectly from the repo. A mirror nobody
// regenerates is a mirror that drifts.
//
//   node scripts/sync-static.mjs
//
// Runs ahead of `dev` and `build`. The copies stay tracked in git so a checkout
// without a build still serves something.

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../..');
const systemsDir = join(repoRoot, 'systems');
const publicDir = resolve(here, '../public');
const appDir = resolve(here, '../app');

mkdirSync(publicDir, { recursive: true });

let copied = 0;
const systems = [];

for (const system of readdirSync(systemsDir)) {
  const staticDir = join(systemsDir, system, 'static');
  const pkgPath = join(systemsDir, system, 'tokens', 'package.json');
  if (!existsSync(staticDir) || !existsSync(pkgPath)) continue;

  // Same derivation the emitter uses: @thl/tokens -> thl. The bundles are named
  // for the registry namespace a consumer types, not for the directory.
  const pkgName = JSON.parse(readFileSync(pkgPath, 'utf8')).name;
  const short = pkgName.match(/^@([^/]+)\//)?.[1] ?? system;

  for (const file of readdirSync(staticDir)) {
    // Bundles keep their names — the HTML links ./thl.css relative to itself,
    // and everything lands in the same directory here.
    const isBundle = file.startsWith(`${short}.`);
    const isDoc = file.endsWith('.html');
    if (!isBundle && !isDoc) continue;

    // Only the catalogue is namespaced, because /thl-catalog.html is the URL the
    // docs app already links. The rest keep their names: one system exists, and
    // a naming scheme for the collision between two of them is a scheme that
    // would be designed without either of them to test it. Rule of two.
    const out = file === 'catalog.html' ? `${short}-catalog.html` : file;

    copyFileSync(join(staticDir, file), join(publicDir, out));
    copied++;
  }

  // The brand tier, under its own namespaced directory. Unlike the report kit
  // these are NOT flattened into public/ — favicon.svg and mark.svg are generic
  // names that a second system would collide with immediately, and unlike the
  // bundles nothing links them relative to a sibling document.
  //
  // The docs app's own favicon does not come from here: Next resolves
  // app/systems/<slug>/icon.svg, written just below. This copy is so the assets
  // have stable public URLs for anything outside the app.
  const brandDir = join(systemsDir, system, 'brand');
  if (existsSync(brandDir)) {
    const outDir = join(publicDir, 'brand', short);
    mkdirSync(outDir, { recursive: true });
    for (const file of readdirSync(brandDir)) {
      // Skip .verify/ — those rasters exist to be looked at, not served.
      if (!statSync(join(brandDir, file)).isFile()) continue;
      copyFileSync(join(brandDir, file), join(outDir, file));
      copied++;
    }

    // The route-segment favicon. Next resolves app/<segment>/icon.svg by file
    // convention, so it has to be a real file inside app/ — a symlink to the
    // source fails the build with "Cannot find module for page", and a
    // hand-kept copy is the drift this script exists to prevent. So it is
    // generated, like everything else here.
    //
    // The house has no mark, so this is scoped to the system's own segment
    // rather than app/icon.svg; `/` stays unbranded on purpose.
    const favicon = join(brandDir, 'favicon.svg');
    const segment = join(appDir, 'systems', system);
    if (existsSync(favicon) && existsSync(segment)) {
      copyFileSync(favicon, join(segment, 'icon.svg'));
      copied++;
    }
  }

  systems.push(short);
}

console.log(
  `sync-static: ${copied} file(s) from ${systems.length} system(s) [${systems.join(', ')}] -> apps/docs/public/`
);
