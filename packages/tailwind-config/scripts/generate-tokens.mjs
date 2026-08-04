// Parses theme.css and writes a typed token module.
// Run: bun run --filter=@repo/tailwind-config generate:tokens

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const themePath = join(__dirname, '..', 'theme.css');
const outPath = join(__dirname, '..', 'tokens.generated.ts');

const css = readFileSync(themePath, 'utf8');

const themeMatch = css.match(/@theme\s*\{([\s\S]*?)\n\}/);
if (!themeMatch) {
  throw new Error('generate-tokens: no @theme { ... } block found in theme.css');
}
const themeBody = themeMatch[1];

const SEMANTIC_COLOR_NAMES = new Set([
  '--color-surface',
  '--color-text-secondary',
  '--color-text-tertiary',
  '--color-ambient'
]);

function categorize(name) {
  if (name.startsWith('--color-')) return 'color';
  if (name.startsWith('--font-')) return 'font';
  if (name.startsWith('--text-')) return 'text';
  if (name.startsWith('--tracking-')) return 'tracking';
  if (name.startsWith('--shadow-')) return 'shadow';
  if (name.startsWith('--animate-')) return 'animate';
  if (name === '--spacing' || name.startsWith('--spacing-')) return 'spacing';
  return 'other';
}

// Decoration-only colors: too low-contrast for text, so the reference
// table must not advertise a text-* utility for them.
const NON_TEXT_COLOR_NAMES = new Set(['--color-ambient']);

function utilityHint(name) {
  if (name.startsWith('--color-')) {
    const n = name.slice('--color-'.length);
    if (NON_TEXT_COLOR_NAMES.has(name)) return `bg-${n} · border-${n}`;
    return `bg-${n} · text-${n} · border-${n}`;
  }
  if (name.startsWith('--font-')) {
    const n = name.slice('--font-'.length);
    return `font-${n}`;
  }
  if (name.startsWith('--text-')) {
    const n = name.slice('--text-'.length);
    return `text-${n}`;
  }
  if (name.startsWith('--tracking-')) {
    const n = name.slice('--tracking-'.length);
    return `tracking-${n}`;
  }
  if (name.startsWith('--shadow-')) {
    const n = name.slice('--shadow-'.length);
    return `shadow-${n}`;
  }
  if (name.startsWith('--animate-')) {
    const n = name.slice('--animate-'.length);
    return `animate-${n}`;
  }
  return '';
}

function colorSubcategory(name) {
  if (SEMANTIC_COLOR_NAMES.has(name)) return 'semantic';
  return 'core';
}

// Pass 1 — collect every declaration.
const declarations = [];
for (const line of themeBody.split('\n')) {
  const m = line.match(/^\s*(--[a-z0-9-]+(?:\*)?)\s*:\s*(.+?);/i);
  if (!m) continue;
  const [, name, rawValue] = m;
  const value = rawValue.trim();
  if (name.endsWith('*')) continue;
  if (value === 'initial') continue;
  declarations.push({ name, value });
}

// Tailwind pairs a font size with its line height via a `--line-height`
// suffix. Fold those into the size row rather than listing them as
// tokens in their own right.
const lineHeights = new Map();
for (const { name, value } of declarations) {
  if (name.endsWith('--line-height')) {
    lineHeights.set(name.slice(0, -'--line-height'.length), value);
  }
}

// Pass 2 — emit tokens.
const tokens = [];
for (const { name, value } of declarations) {
  if (name.endsWith('--line-height')) continue;

  const paired = lineHeights.get(name);
  const token = {
    name,
    value: paired ? `${value} / ${paired}` : value,
    category: categorize(name),
    utility: utilityHint(name)
  };
  if (token.category === 'color') {
    token.subcategory = colorSubcategory(name);
  }
  tokens.push(token);
}

const content = `// AUTO-GENERATED FROM theme.css — do not edit by hand.
// Run: bun run --filter=@repo/tailwind-config generate:tokens

export type TokenCategory =
  | 'color'
  | 'font'
  | 'text'
  | 'tracking'
  | 'shadow'
  | 'animate'
  | 'spacing'
  | 'other';

export interface Token {
  name: string;
  value: string;
  category: TokenCategory;
  utility: string;
  subcategory?: 'core' | 'semantic';
}

export const tokens: Token[] = ${JSON.stringify(tokens, null, 2)};

export const colorTokens = tokens.filter((t) => t.category === 'color');
export const coreColors = colorTokens.filter((t) => t.subcategory === 'core');
export const semanticColors = colorTokens.filter((t) => t.subcategory === 'semantic');
export const textTokens = tokens.filter((t) => t.category === 'text');
`;

writeFileSync(outPath, content);
console.log(`generate-tokens: wrote ${tokens.length} tokens → ${outPath}`);
