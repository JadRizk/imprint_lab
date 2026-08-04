// Emitters. One parsed theme.css in, five artifacts out.

// Superseded by roles, kept until nothing references them.
const SEMANTIC_COLOR_NAMES = new Set(['--color-text-secondary', '--color-text-tertiary']);

// Roles are the cross-system contract: named by job, not appearance.
// --color-surface and --color-ambient are here rather than aliased through a
// second name — they already carry role names and role semantics.
export const ROLE_COLOR_NAMES = new Set([
  '--color-canvas',
  '--color-surface',
  '--color-line',
  '--color-ambient',
  '--color-ink',
  '--color-ink-muted',
  '--color-ink-subtle',
  '--color-accent',
  '--color-accent-ink',
  '--color-critical',
  '--color-warning'
]);

// Non-colour roles. Shadows are otherwise system-specific: --shadow-lime-glow
// names an appearance, so it stays a primitive — but the *job* it does (an
// emphasis glow on an active edge) is one another system would want to express
// differently, or not at all. Hence one role pointing at it.
export const ROLE_OTHER_NAMES = new Set(['--shadow-glow']);

// Decoration-only colors: too low-contrast for text, so the reference table
// must not advertise a text-* utility for them.
const NON_TEXT_COLOR_NAMES = new Set(['--color-ambient']);

export function categorize(name) {
  if (name.startsWith('--color-')) return 'color';
  if (name.startsWith('--font-')) return 'font';
  if (name.startsWith('--text-')) return 'text';
  if (name.startsWith('--tracking-')) return 'tracking';
  if (name.startsWith('--shadow-')) return 'shadow';
  if (name.startsWith('--animate-')) return 'animate';
  if (name === '--spacing' || name.startsWith('--spacing-')) return 'spacing';
  return 'other';
}

function utilityHint(name) {
  if (name.startsWith('--color-')) {
    const n = name.slice('--color-'.length);
    return NON_TEXT_COLOR_NAMES.has(name)
      ? `bg-${n} · border-${n}`
      : `bg-${n} · text-${n} · border-${n}`;
  }
  for (const [prefix, util] of [
    ['--font-', 'font'],
    ['--text-', 'text'],
    ['--tracking-', 'tracking'],
    ['--shadow-', 'shadow'],
    ['--animate-', 'animate']
  ]) {
    if (name.startsWith(prefix)) return `${util}-${name.slice(prefix.length)}`;
  }
  return '';
}

function colorSubcategory(name) {
  if (ROLE_COLOR_NAMES.has(name)) return 'role';
  if (SEMANTIC_COLOR_NAMES.has(name)) return 'semantic';
  return 'core';
}

/** Fold Tailwind's `--x--line-height` companions into their size row. */
export function buildTokens({ declarations, resolve, aliasOf }) {
  const lineHeights = new Map();
  for (const { name, value } of declarations) {
    if (name.endsWith('--line-height')) {
      lineHeights.set(name.slice(0, -'--line-height'.length), value);
    }
  }

  const tokens = [];
  for (const { name, value, note } of declarations) {
    if (name.endsWith('--line-height')) continue;
    const paired = lineHeights.get(name);
    const resolved = resolve(value);
    const token = {
      name,
      value: paired ? `${value} / ${paired}` : value,
      resolved: paired ? `${resolved} / ${resolve(paired)}` : resolved,
      // Unfolded, for consumers that need the size alone. DTCG has no notion of
      // Tailwind's "size / line-height" shorthand.
      base: resolved,
      category: categorize(name),
      utility: utilityHint(name)
    };
    if (paired) token.lineHeight = resolve(paired);
    const alias = aliasOf(value);
    if (alias) token.aliasOf = alias;
    if (note) token.note = note;
    if (token.category === 'color') token.subcategory = colorSubcategory(name);
    tokens.push(token);
  }
  return tokens;
}

// The regenerate command names the system's own package, not system 01's.
let PKG = '@thl/tokens';
export function setPackageName(name) {
  PKG = name;
}
const BANNER = (what) =>
  `AUTO-GENERATED FROM theme.css — do not edit by hand.\nRun: bun run --filter=${PKG} generate:tokens${what ? `\n${what}` : ''}`;

export function emitTokensTs(tokens) {
  return `// ${BANNER('').split('\n').join('\n// ')}

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
  /** As authored — role tokens keep their var() so the alias stays visible. */
  value: string;
  /** var() chains flattened, for anything that cannot resolve them itself. */
  resolved: string;
  /** Resolved, without the paired line height folded in. */
  base: string;
  /** Companion line height, for font sizes that declare one. */
  lineHeight?: string;
  category: TokenCategory;
  utility: string;
  /** Set when this token is a pure alias of another token in this file. */
  aliasOf?: string;
  /** Trailing annotation from theme.css, e.g. a measured contrast ratio. */
  note?: string;
  subcategory?: 'core' | 'semantic' | 'role';
}

export const tokens: Token[] = ${JSON.stringify(tokens, null, 2)};

export const colorTokens = tokens.filter((t) => t.category === 'color');
export const coreColors = colorTokens.filter((t) => t.subcategory === 'core');
export const semanticColors = colorTokens.filter((t) => t.subcategory === 'semantic');
export const roleColors = colorTokens.filter((t) => t.subcategory === 'role');
export const textTokens = tokens.filter((t) => t.category === 'text');
`;
}

/**
 * Plain `:root` custom properties — no Tailwind, no @theme, no build step.
 * This is what a standalone HTML report inlines.
 *
 * Values are emitted as authored, var() intact: every token lands in the same
 * scope, so the chains resolve in the browser and the file stays re-themeable —
 * override --color-lime and --color-accent follows.
 *
 * Takes raw declarations, NOT the token model. The model folds a font size and
 * its line height into one `1rem / 1.5rem` string for the docs table; writing
 * that into CSS would emit an invalid font-size value. Here every declaration
 * stands on its own, exactly as theme.css declares it.
 */
export function emitTokensCss(declarations, { selector = ':root' } = {}) {
  const width = Math.max(...declarations.map((d) => d.name.length));
  const lines = declarations.map((d) => {
    const note = d.note ? ` /* ${d.note} */` : '';
    return `  ${d.name}:${' '.repeat(width - d.name.length + 1)}${d.value};${note}`;
  });
  return `/* ${BANNER('').split('\n').join('\n   ')} */

${selector} {
${lines.join('\n')}
}
`;
}

/**
 * The same tokens bound to a [data-system] scope, so apps/docs can render
 * several systems on one page without their palettes annihilating each other.
 */
export function emitThemeScopedCss(declarations, system) {
  return emitTokensCss(declarations, { selector: `[data-system="${system}"]` });
}

const DTCG_GROUP = {
  color: ['color', 'color'],
  text: ['fontSize', 'dimension'],
  tracking: ['letterSpacing', 'dimension'],
  spacing: ['spacing', 'dimension'],
  font: ['fontFamily', 'fontFamily'],
  shadow: ['shadow', null],
  animate: ['animation', null],
  other: ['other', null]
};

/** W3C Design Tokens (DTCG) — the interchange format Figma and friends read. */
export function emitTokensJson(tokens, system) {
  const out = {
    $description: `Design tokens for ${system}. Generated from theme.css. Groups without a $type hold raw CSS declarations that DTCG has no primitive for.`
  };

  for (const t of tokens) {
    const [group, type] = DTCG_GROUP[t.category] ?? DTCG_GROUP.other;
    const prefix = t.category === 'spacing' ? '--spacing' : `--${t.category}-`;
    const leaf = t.name === '--spacing' ? 'base' : t.name.slice(prefix.length);

    out[group] ??= type ? { $type: type } : {};
    const entry = {
      // DTCG expresses an alias as a reference to another token's path.
      $value: t.aliasOf
        ? `{${DTCG_GROUP[categorize(t.aliasOf)][0]}.${t.aliasOf.slice(`--${categorize(t.aliasOf)}-`.length)}}`
        : t.base
    };
    if (t.note) entry.$description = t.note;
    out[group][leaf] = entry;

    // Line heights travel as their own dimension tokens rather than being
    // folded into the size, which would make the value invalid DTCG.
    if (t.lineHeight) {
      out.lineHeight ??= { $type: 'dimension' };
      out.lineHeight[leaf] = { $value: t.lineHeight };
    }
  }

  return `${JSON.stringify(out, null, 2)}\n`;
}

/**
 * tailwind-merge cannot tell a custom font size from a color, so `text-micro`
 * and `text-ink-subtle` land in the same conflict group and the color is
 * silently dropped. Every scale name has to be registered.
 *
 * Emitting the full scale rather than a hand-kept diff against Tailwind's
 * defaults: redundancy is harmless, omission is the bug — and this way adding a
 * scale value to theme.css registers it automatically.
 */
export function emitTwMerge(tokens) {
  const namesFor = (category, prefix) =>
    tokens
      .filter((t) => t.category === category && !t.name.endsWith('--line-height'))
      .map((t) => t.name.slice(prefix.length));

  const config = {
    extend: {
      theme: {
        text: namesFor('text', '--text-'),
        tracking: namesFor('tracking', '--tracking-')
      }
    }
  };

  return `// ${BANNER('').split('\n').join('\n// ')}
//
// Feeds extendTailwindMerge. Without it, tailwind-merge cannot distinguish a
// custom font size from a color — text-micro and text-ink-subtle collide in one
// conflict group and the color is silently dropped.

export const twMergeConfig = ${JSON.stringify(config, null, 2)};
`;
}
