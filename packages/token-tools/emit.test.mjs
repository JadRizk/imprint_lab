// Fixtures for the DTCG emitter and the raw-colour rule.
//
//   bun test packages/token-tools/emit.test.mjs
//
// Both of these shipped broken once, in the commit that was supposed to FIX
// them — which is the argument for the file. In particular `url(#abc)` is here
// because the original check used `url(#grad)`, whose letters are not hex: it
// passed for the wrong reason and hid a false positive.

import { expect, test } from 'bun:test';

import { buildTokens, emitTokensJson } from './lib/emit.mjs';
import { parseTheme } from './lib/parse.mjs';

// The closed set of DTCG types. `string` is deliberately absent — it is not one.
const DTCG_TYPES = new Set([
  'color',
  'dimension',
  'fontFamily',
  'fontWeight',
  'duration',
  'cubicBezier',
  'number',
  'strokeStyle',
  'border',
  'transition',
  'shadow',
  'gradient',
  'typography'
]);

function emit(themeBody) {
  const parsed = parseTheme(`@theme static {\n${themeBody}\n}`);
  return emitTokensJson(buildTokens(parsed), 'fixture');
}

/** Every token in the tree, with the $type it resolves (own or inherited). */
function typedTokens(json) {
  const out = [];
  const walk = (node, path = [], inherited = null) => {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$') || v === null || typeof v !== 'object') continue;
      const type = v.$type ?? inherited;
      if ('$value' in v) out.push({ path: [...path, k].join('.'), type });
      else walk(v, [...path, k], type);
    }
  };
  walk(JSON.parse(json));
  return out;
}

test('every emitted token resolves a type from the DTCG closed set', () => {
  const { json } = emit(`
    --color-obsidian: #0F0F0F;
    --color-canvas: var(--color-obsidian);
    --text-micro: 0.625rem;
    --text-micro--line-height: 1rem;
    --text-5xl: 3rem;
    --text-5xl--line-height: 1;
    --tracking-label: 0.2em;
    --font-sans: var(--font-sans-face, sans-serif);
    --shadow-lime-glow: 0 0 15px rgba(223, 255, 0, 0.3);
    --animate-scan: scan 4s linear infinite;
  `);
  for (const t of typedTokens(json)) {
    expect(DTCG_TYPES.has(t.type)).toBe(true);
  }
});

test('an unrepresentable value is omitted and reported, never given a fake type', () => {
  // `none` is what packages/system-template emits for --shadow-glow, so a fresh
  // scaffold hit this path and produced $type:"string" — invalid DTCG.
  const { json, skipped } = emit('  --shadow-glow: none;');
  expect(skipped).toHaveLength(1);
  expect(skipped[0]).toContain('--shadow-glow');
  expect(json).not.toContain('"string"');
  expect(JSON.parse(json).shadow).toBeUndefined();
});

test('rem font sizes are {value, unit}, not the legacy string', () => {
  const { json } = emit('  --text-micro: 0.625rem;');
  expect(JSON.parse(json).fontSize.micro.$value).toEqual({ value: 0.625, unit: 'rem' });
});

test('em letter-spacing is a number, not a fabricated rem dimension', () => {
  const { json } = emit('  --tracking-label: 0.2em;');
  const t = JSON.parse(json).letterSpacing.label;
  expect(t.$value).toBe(0.2);
  expect(t.$extensions['com.imprintlab'].css).toBe('0.2em');
});

test('a two-layer shadow emits an array of composites', () => {
  const { json } = emit('  --shadow-x: 0 0 30px rgba(1,2,3,0.4), 0 0 60px rgba(1,2,3,0.1);');
  const v = JSON.parse(json).shadow.x.$value;
  expect(Array.isArray(v)).toBe(true);
  expect(v).toHaveLength(2);
  expect(v[0].blur).toEqual({ value: 30, unit: 'px' });
});

test('fontFamily emits a family list, with the var() indirection in $extensions', () => {
  const { json } = emit('  --font-sans: var(--font-sans-face, sans-serif);');
  const t = JSON.parse(json).fontFamily.sans;
  expect(t.$value).toEqual(['sans-serif']);
  expect(t.$extensions['com.imprintlab'].css).toBe('var(--font-sans-face, sans-serif)');
});

test('an alias emits a DTCG reference, not the resolved value', () => {
  const { json } = emit('  --color-obsidian: #0F0F0F;\n  --color-canvas: var(--color-obsidian);');
  expect(JSON.parse(json).color.canvas.$value).toBe('{color.obsidian}');
});

// ── the raw-colour rule ────────────────────────────────────────────────────
// Mirrors check-roles.mjs. Kept in sync deliberately: these are the exact
// patterns, and the point is that the boundary cases are pinned.
const literalRe =
  /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_-])|(?<![a-zA-Z-])(?:rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\s*\(/g;
const stripNonColour = (line) => line.replace(/url\([^)]*\)/g, 'url()');
const flags = (line) => stripNonColour(line).match(literalRe) !== null;

test.each([
  ['background: #DFFF00;'],
  ['background: #fff;'],
  ['background: #DFFF00AA;'],
  ['background: rgba(1,2,3,.4);'],
  ['background: oklch(0.94 0.2 118);'],
  ['background: color-mix(in oklch, #fff, #000);'],
  // Tailwind spells spaces as `_`, so there is no word boundary before rgba(.
  ['className="shadow-[0_0_15px_rgba(223,255,0,0.3)]"']
])('flags a raw colour: %s', (line) => {
  expect(flags(line)).toBe(true);
});

test.each([
  // url(#abc) matches the hex pattern exactly. This is the case the original
  // test missed by using url(#grad).
  ['background: url(#abc);'],
  ['background: url(#grad);'],
  ['background: url(#fade123);'],
  ['background: var(--color-surface);'],
  ['width: calc(100% - 2px);'],
  ['className="z-10 duration-300"']
])('does not flag: %s', (line) => {
  expect(flags(line)).toBe(false);
});
