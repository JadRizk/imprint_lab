// Fixtures for the hand-rolled @theme parser.
//
//   bun test packages/token-tools/parse.test.mjs
//
// Every case here is a bug that shipped. The parser counted braces on raw CSS
// before stripping comments and had no notion of quoted strings, so each of
// these silently dropped tokens or mangled a value — silently being the point:
// the artifacts stayed plausible and nothing failed. lightningcss is still the
// wrong tool for `@theme` (see parse.mjs), so hand-rolling stands; it just has
// to be hand-rolled correctly, and correctness needs fixtures.

import { expect, test } from 'bun:test';

import { parseTheme } from './lib/parse.mjs';

const names = (css) => parseTheme(css).declarations.map((d) => d.name);
const valueFor = (css, name) => parseTheme(css).byName.get(name);

test('baseline', () => {
  expect(names('@theme static {\n --color-a: #111;\n --color-b: #222;\n}')).toEqual([
    '--color-a',
    '--color-b'
  ]);
});

test('a comment containing } does not close the block early', () => {
  const css = '@theme static {\n --color-a: #111;\n /* a brace } here */\n --color-b: #222;\n}';
  expect(names(css)).toEqual(['--color-a', '--color-b']);
});

test('a comment containing { does not leave the block unterminated', () => {
  const css = '@theme static {\n --color-a: #111;\n /* a brace { here */\n --color-b: #222;\n}';
  expect(names(css)).toEqual(['--color-a', '--color-b']);
});

test('a brace inside a quoted value is data, not structure', () => {
  const css = '@theme static {\n --color-a: #111;\n --content-x: "}";\n --color-b: #222;\n}';
  expect(names(css)).toEqual(['--color-a', '--content-x', '--color-b']);
  expect(valueFor(css, '--content-x')).toBe('"}"');
});

test('a commented-out @theme does not win over the real one', () => {
  const css = '/* @theme { --color-decoy: red; } */\n@theme static {\n --color-a: #111;\n}';
  expect(names(css)).toEqual(['--color-a']);
});

test('a semicolon inside a quoted value does not split the declaration', () => {
  const css = '@theme static {\n --font-sans: "Foo;Bar", sans-serif;\n --color-b: #222;\n}';
  expect(valueFor(css, '--font-sans')).toBe('"Foo;Bar", sans-serif');
  expect(names(css)).toContain('--color-b');
});

test('a var() fallback containing parens resolves without a stray paren', () => {
  const { resolve, byName } = parseTheme(
    '@theme static {\n --a: #123456;\n --b: var(--a, rgba(0,0,0,0.5));\n}'
  );
  expect(resolve(byName.get('--b'))).toBe('#123456');
});

test('an undefined var() survives intact, fallback and all', () => {
  // --font-sans-face is the consumer's contract, deliberately undefined here.
  const { resolve, byName } = parseTheme(
    '@theme static {\n --font-sans: var(--font-sans-face, sans-serif);\n}'
  );
  expect(resolve(byName.get('--font-sans'))).toBe('var(--font-sans-face, sans-serif)');
});

test('CRLF line endings parse', () => {
  expect(names('@theme static {\r\n --color-a: #111;\r\n --color-b: #222;\r\n}')).toEqual([
    '--color-a',
    '--color-b'
  ]);
});

test('comments containing ; and : are ignored', () => {
  const css =
    '@theme static {\n --color-a: #111;\n /* note: has; punctuation */\n --color-b: #222;\n}';
  expect(names(css)).toEqual(['--color-a', '--color-b']);
});

test('a trailing comment annotates its declaration and only its own', () => {
  const css = '@theme static {\n --color-a: #7C7C7C; /* 4.59:1 — labels */\n --color-b: #222;\n}';
  const { declarations } = parseTheme(css);
  expect(declarations[0].note).toBe('4.59:1 — labels');
  expect(declarations[1].note).toBeUndefined();
});

test('namespace resets and initial values are not tokens', () => {
  const css = '@theme static {\n --color-*: initial;\n --color-a: #111;\n}';
  expect(names(css)).toEqual(['--color-a']);
});

test('a circular reference throws rather than recursing forever', () => {
  const { resolve, byName } = parseTheme('@theme static {\n --a: var(--b);\n --b: var(--a);\n}');
  expect(() => resolve(byName.get('--a'))).toThrow(/circular/);
});

test('a missing @theme block throws', () => {
  expect(() => parseTheme(':root { --a: 1 }')).toThrow(/no @theme/);
});
