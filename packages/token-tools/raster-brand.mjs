#!/usr/bin/env node
// Rasterises each system's brand/favicon.svg to the PNG sizes a browser and an
// iOS home screen actually ask for.
//
//   node packages/token-tools/raster-brand.mjs [systemDir]
//
// Why a script rather than a checked-in export: a hand-exported PNG is the same
// drift a hand-kept safelist is. The SVG is the source; these are emitted from
// it and committed so a checkout without a build still has them.
//
// This shells out to headless Chrome rather than taking an SVG-rasteriser
// dependency. That is a deliberate trade: Chrome is what will actually render
// the favicon, so its output is the honest answer about whether a 6-unit stroke
// survives at 16px — a Node rasteriser would give a prettier one. The cost is
// that this is a LOCAL tool. It is not wired into turbo build, because CI has no
// Chrome and a build step that silently no-ops is worse than one you run by hand.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser'
];

// 16 is not shipped — it exists so the 16px claim in brand/README.md is checked
// against a real raster rather than a browser-scaled vector, which is a
// materially easier test and was the one gap the specimen sheet could not close.
const SIZES = [
  { px: 16, name: 'favicon-16.png', ship: false },
  { px: 32, name: 'favicon-32.png', ship: true },
  { px: 180, name: 'apple-icon-180.png', ship: true }
];

const chrome = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!chrome) {
  console.error(
    `raster-brand: no Chrome or Chromium found. Looked in:\n  ${CHROME_CANDIDATES.join('\n  ')}`
  );
  process.exit(1);
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const explicit = process.argv[2] ? resolve(process.argv[2]) : null;
const systemDirs = explicit
  ? [explicit]
  : readdirSync(join(repoRoot, 'systems')).map((s) => join(repoRoot, 'systems', s));

/**
 * An SVG served to `<img>` or used as a favicon is parsed as strict XML, where a
 * comment may not contain a double hyphen. Every CSS custom property starts with
 * one, so documenting a token name in an SVG comment silently invalidates the
 * file — and it stays invisible to anything that INLINES the svg into HTML,
 * because HTML parsing is lenient. That includes this script's own rasteriser,
 * which is how it shipped broken the first time.
 */
function findXmlFaults(svg) {
  const faults = [];
  for (const [, body] of svg.matchAll(/<!--([\s\S]*?)-->/g)) {
    if (body.includes('--')) faults.push('comment contains a double hyphen (a token name?)');
  }
  if (!svg.includes('xmlns="http://www.w3.org/2000/svg"')) {
    faults.push('missing xmlns — a standalone SVG needs it to render as an image');
  }
  return faults;
}

const scratch = mkdtempSync(join(tmpdir(), 'thl-raster-'));
let wrote = 0;
let failed = false;

try {
  for (const systemDir of systemDirs) {
    const svgPath = join(systemDir, 'brand', 'favicon.svg');
    if (!existsSync(svgPath)) continue;

    const svg = readFileSync(svgPath, 'utf8');

    // Every SVG in brand/, not just the one being rasterised — they all ship,
    // and mark.svg is the one most likely to carry a token name in a comment.
    for (const sibling of readdirSync(join(systemDir, 'brand')).filter((f) => f.endsWith('.svg'))) {
      const faults = findXmlFaults(readFileSync(join(systemDir, 'brand', sibling), 'utf8'));
      for (const fault of faults) {
        console.error(`  INVALID  ${basename(systemDir)}/brand/${sibling}: ${fault}`);
        failed = true;
      }
    }

    for (const { px, name, ship } of SIZES) {
      // The SVG is sized by the wrapper rather than by its own width/height, so
      // one source drives every step. `margin:0` and an exact-size body are what
      // make the screenshot come back at precisely px x px.
      const page = join(scratch, `page-${px}.html`);
      writeFileSync(
        page,
        `<!doctype html><meta charset="utf-8">` +
          `<style>html,body{margin:0;padding:0;width:${px}px;height:${px}px;overflow:hidden}` +
          `svg{display:block;width:${px}px;height:${px}px}</style>${svg}`
      );

      const out = ship ? join(systemDir, 'brand', name) : join(systemDir, 'brand', '.verify', name);

      if (!ship) {
        execFileSync('mkdir', ['-p', dirname(out)]);
      }

      execFileSync(
        chrome,
        [
          '--headless',
          '--disable-gpu',
          '--hide-scrollbars',
          '--force-device-scale-factor=1',
          `--window-size=${px},${px}`,
          '--default-background-color=00000000',
          `--screenshot=${out}`,
          `file://${page}`
        ],
        { stdio: ['ignore', 'ignore', 'pipe'] }
      );

      wrote++;
      console.log(`  ${basename(systemDir)}/brand/${ship ? '' : '.verify/'}${name}  (${px}px)`);
    }
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

if (wrote === 0) {
  console.error('raster-brand: no systems/*/brand/favicon.svg found');
  process.exit(1);
}
if (failed) {
  console.error('raster-brand: invalid SVG above — the raster is stale, fix and rerun');
  process.exit(1);
}
console.log(`raster-brand: ${wrote} file(s) written, ${systemDirs.length} system(s) validated`);
