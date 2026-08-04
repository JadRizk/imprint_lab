#!/usr/bin/env node
// Validates a categorical chart palette. Computed, never eyeballed.
//
//   validate-palette                       # checks the shipped palettes
//   validate-palette "#aaa,#bbb" --surface "#0F0F0F"
//
// Committed because an uncommitted validator makes its own claim
// unreproducible — the archaeology this repo exists to prevent. Cross-checked
// against the reference implementation: identical verdicts on every set tried.
//
// The checks, in order of how often they catch something:
//
//   CVD separation   OKLab ΔE×100 between every PAIR under simulated
//                    protanopia, deuteranopia and tritanopia. ALL pairs, not
//                    adjacent ones — adjacency in a token list is arbitrary and
//                    any two series can share a legend.
//   Normal vision    the same distance unsimulated. A pair below this floor is
//                    hard to separate even with full colour vision.
//   Lightness band   OKLCH L inside the band the ground requires.
//   Chroma floor     below it a hue reads as grey.
//   Contrast         WCAG against every surface the chart sits on.

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Machado, Oliveira & Fernandes (2009), severity 1.0, linear RGB.
const M = {
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998]
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881]
  ],
  tritan: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039]
  ]
};

const BAND = [0.48, 0.67];
const CHROMA_FLOOR = 0.1;
const CVD_FLOOR = 8.0;
const NORMAL_FLOOR = 15.0;
const CONTRAST_MIN = 3.0;

const s2lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const hexToLin = (h) => {
  const n = h.trim().replace(/^#/, '');
  if (!/^[0-9a-f]{6}$/i.test(n)) throw new Error(`not a hex colour: ${h}`);
  return [0, 2, 4].map((i) => s2lin(Number.parseInt(n.slice(i, i + 2), 16) / 255));
};
const oklab = ([r, g, b]) => {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  ];
};
const lch = (v) => {
  const [L, a, b] = oklab(v);
  return { L, C: Math.hypot(a, b) };
};
const sim = (v, t) =>
  M[t].map((r) => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]).map((c) => Math.max(0, Math.min(1, c)));
const dE = (a, b) => {
  const x = oklab(a),
    y = oklab(b);
  return 100 * Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
};
const relLum = (v) => 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
const contrast = (a, b) => {
  const [hi, lo] = [relLum(a), relLum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

export function validate(hexes, surfaces) {
  const v = hexes.map(hexToLin);
  const s = surfaces.map(hexToLin);
  const fails = [];

  const outOfBand = hexes.filter((_, i) => {
    const { L } = lch(v[i]);
    return L < BAND[0] || L > BAND[1];
  });
  if (outOfBand.length)
    fails.push(`lightness band — outside L ${BAND[0]}–${BAND[1]}: ${outOfBand.join(', ')}`);

  const grey = hexes.filter((_, i) => lch(v[i]).C < CHROMA_FLOOR);
  if (grey.length) fails.push(`chroma floor — reads grey: ${grey.join(', ')}`);

  let wCvd = { d: Infinity },
    wNorm = { d: Infinity };
  for (let i = 0; i < v.length; i++) {
    for (let j = i + 1; j < v.length; j++) {
      const n = dE(v[i], v[j]);
      if (n < wNorm.d) wNorm = { d: n, a: hexes[i], b: hexes[j] };
      for (const t of Object.keys(M)) {
        const d = dE(sim(v[i], t), sim(v[j], t));
        if (d < wCvd.d) wCvd = { d, a: hexes[i], b: hexes[j], t };
      }
    }
  }
  if (wCvd.d < CVD_FLOOR)
    fails.push(
      `CVD separation — ${wCvd.a}↔${wCvd.b} ΔE ${wCvd.d.toFixed(1)} (${wCvd.t}), floor ${CVD_FLOOR}`
    );
  if (wNorm.d < NORMAL_FLOOR)
    fails.push(
      `normal vision — ${wNorm.a}↔${wNorm.b} ΔE ${wNorm.d.toFixed(1)}, floor ${NORMAL_FLOOR}`
    );

  for (let i = 0; i < v.length; i++) {
    for (let k = 0; k < s.length; k++) {
      const c = contrast(v[i], s[k]);
      if (c < CONTRAST_MIN)
        fails.push(`contrast — ${hexes[i]} on ${surfaces[k]} at ${c.toFixed(2)}:1`);
    }
  }

  return { fails, worstCvd: wCvd, worstNormal: wNorm };
}

// ── CLI ──
const args = process.argv.slice(2);
const flag = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i === -1 ? d : args[i + 1];
};
const positional = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));

let sets;
if (positional.length) {
  sets = [
    {
      name: 'argv',
      hexes: positional[0]
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    }
  ];
} else {
  // Default: read the shipped series palette out of the system's chart layer.
  const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const css = readFileSync(join(repo, 'systems/human-laboratory/static/parts/chart.css'), 'utf8');
  const hexes = [...css.matchAll(/--chart-(\d):\s*(#[0-9a-fA-F]{6})/g)].map((m) => m[2]);
  if (!hexes.length) {
    console.error('validate-palette: no --chart-N tokens found');
    process.exit(1);
  }
  sets = [{ name: 'human-laboratory series', hexes }];
}

// The grounds a chart can sit on. System 01 has exactly one — panels are
// bounded by line, not filled, so --color-surface no longer exists. Override
// with --surface for a system that does fill.
const surfaces = flag('surface', '#0F0F0F')
  .split(',')
  .map((x) => x.trim());

let bad = 0;
for (const { name, hexes } of sets) {
  const { fails, worstCvd, worstNormal } = validate(hexes, surfaces);
  console.log(
    `validate-palette: ${name} — ${hexes.length} slots, all pairs, vs ${surfaces.join(' + ')}`
  );
  if (fails.length === 0) {
    console.log(
      `  PASS  worst CVD ΔE ${worstCvd.d.toFixed(1)} (${worstCvd.t}) · worst normal ΔE ${worstNormal.d.toFixed(1)}`
    );
  } else {
    bad++;
    for (const f of fails) console.error(`  FAIL  ${f}`);
  }
}
if (bad) {
  console.error(
    '\nA shipped palette does not clear its own floors. Re-solve it — do not\nrelax the thresholds, and do not add a series the set cannot carry.'
  );
  process.exit(1);
}
