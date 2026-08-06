// Emitters. One parsed theme.css in, five artifacts out.

// Superseded by roles, kept until nothing references them.
const SEMANTIC_COLOR_NAMES = new Set(['--color-text-secondary', '--color-text-tertiary']);

// Roles are the cross-system contract: named by job, not appearance.
// --color-ambient is here rather than aliased through a second name — it
// already carries a role name and role semantics.
//
// --color-ambient / --color-line / --color-line-strong are one ladder, not
// three unrelated greys: subdivision inside a panel, the edge of a thing, and
// a boundary that outranks its neighbours. A system that draws structure with
// line instead of elevation needs all three.
export const ROLE_COLOR_NAMES = new Set([
  '--color-canvas',
  '--color-ambient',
  '--color-line',
  '--color-line-strong',
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
export const ROLE_OTHER_NAMES = new Set(['--shadow-glow', '--shadow-glow-strong']);

// Decoration-only colors: too low-contrast for text, so the reference table
// must not advertise a text-* utility for them.
const NON_TEXT_COLOR_NAMES = new Set(['--color-ambient']);

export function categorize(name) {
  if (name.startsWith('--color-')) return 'color';
  if (name.startsWith('--font-')) return 'font';
  if (name.startsWith('--text-')) return 'text';
  if (name.startsWith('--tracking-')) return 'tracking';
  if (name.startsWith('--leading-')) return 'leading';
  if (name.startsWith('--shadow-')) return 'shadow';
  if (name.startsWith('--animate-')) return 'animate';
  // The motion ladder. Tailwind resolves `duration-*` against
  // --transition-duration-*, so the token names carry Tailwind's namespace
  // rather than a shorter one of ours — a --duration-* variable emits no
  // utility at all. --default-transition-duration is the rung a bare
  // `transition-*` falls back to, and belongs to the same ladder.
  if (name === '--default-transition-duration' || name.startsWith('--transition-duration-')) {
    return 'duration';
  }
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
    ['--leading-', 'leading'],
    ['--shadow-', 'shadow'],
    ['--animate-', 'animate'],
    ['--transition-duration-', 'duration']
  ]) {
    if (name.startsWith(prefix)) return `${util}-${name.slice(prefix.length)}`;
  }
  // --default-transition-duration deliberately falls through: it is a binding,
  // not a utility, and safelisting a class that does not exist would be noise.
  return '';
}

function colorSubcategory(name) {
  if (ROLE_COLOR_NAMES.has(name)) return 'role';
  if (SEMANTIC_COLOR_NAMES.has(name)) return 'semantic';
  return 'core';
}

// Tailwind's font-size companions: `--text-2xl--line-height`,
// `--text-2xl--letter-spacing`. They are not tokens in their own right — they
// are properties OF a size, and a size is what the docs table and the safelist
// enumerate. Left unfolded, `--text-2xl--letter-spacing` categorises as `text`,
// takes a row of its own in the type scale, and emits `text-2xl--letter-spacing`
// into the safelist as a class that does not exist.
const COMPANIONS = [
  ['--line-height', 'lineHeight'],
  ['--letter-spacing', 'letterSpacing'],
  // `--color-line--contrast` is the value --color-line takes under
  // `prefers-contrast: more`. A companion rather than a token of its own: it
  // never wants a utility (`border-line--contrast` is not a class anyone
  // types), so it must stay out of the safelist and out of the docs tables.
  ['--contrast', 'contrast']
];

const companionOf = (name) => COMPANIONS.find(([suffix]) => name.endsWith(suffix));

/** Fold Tailwind's font-size companions into their size row. */
export function buildTokens({ declarations, resolve, aliasOf }) {
  const byCompanion = new Map(COMPANIONS.map(([, key]) => [key, new Map()]));
  for (const { name, value } of declarations) {
    const c = companionOf(name);
    if (c) byCompanion.get(c[1]).set(name.slice(0, -c[0].length), value);
  }
  const lineHeights = byCompanion.get('lineHeight');
  const letterSpacings = byCompanion.get('letterSpacing');

  const tokens = [];
  for (const { name, value, note } of declarations) {
    if (companionOf(name)) continue;
    const paired = lineHeights.get(name);
    const tracking = letterSpacings.get(name);
    const resolved = resolve(value);
    const token = {
      name,
      // Only the line height folds into `value`. Tailwind spells a font size as
      // `size / line-height`; there is no third slot in that shorthand, so
      // tracking travels as its own field rather than being wedged in.
      value: paired ? `${value} / ${paired}` : value,
      resolved: paired ? `${resolved} / ${resolve(paired)}` : resolved,
      // Unfolded, for consumers that need the size alone. DTCG has no notion of
      // Tailwind's "size / line-height" shorthand.
      base: resolved,
      category: categorize(name),
      utility: utilityHint(name)
    };
    if (paired) token.lineHeight = resolve(paired);
    if (tracking) token.letterSpacing = resolve(tracking);
    const contrast = byCompanion.get('contrast').get(name);
    if (contrast) token.contrast = resolve(contrast);
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

/**
 * The system's version, as a value JS can read.
 *
 * This is the half of contract 2 the registry cannot deliver on its own.
 * `shadcn add` copies FILES — it does not record an item's `meta` anywhere in
 * the consuming project, so a version advertised only by the registry answers
 * "what is current?" and never "what do I have?". A shipped file answers the
 * second, which is the one a consumer is actually stuck on.
 *
 * It lands beside `cn()` for the same reason `tw-merge.generated.ts` and
 * `motion.generated.ts` do: a registry consumer receives `ui/lib/` as plain
 * files with no workspace to resolve `@<ns>/tokens` against.
 */
export function emitVersion({ version, date, namespace }) {
  return `// AUTO-GENERATED FROM CHANGELOG.md — do not edit by hand.
// Run: bun run --filter=${PKG} generate:tokens
//
// The version of this system that these files were copied from. It is a
// snapshot, not a subscription: components are copied into your project, so
// this says what you adopted, not what is current. Compare it against the
// registry index to find out whether you are behind.

export const version = '${version}' as const;

/** The date the version above was released. */
export const released = '${date}' as const;

/** The registry namespace these files came from. */
export const namespace = '${namespace}' as const;
`;
}

export function emitTokensTs(tokens) {
  return `// ${BANNER('').split('\n').join('\n// ')}

export type TokenCategory =
  | 'color'
  | 'font'
  | 'text'
  | 'tracking'
  | 'leading'
  | 'shadow'
  | 'animate'
  | 'duration'
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
  /** Companion letter spacing. Tracking is a property of the size, not a
   * separate decision — every step of the scale declares one. */
  letterSpacing?: string;
  /** The value this role takes under \`prefers-contrast: more\`. */
  contrast?: string;
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
${emitContrastCss(declarations, selector)}`;
}

/**
 * The `prefers-contrast: more` block, derived from `--<role>--contrast`
 * companions. Only the REBINDING is generated — the values sit in theme.css
 * beside the ratios they were measured against, so there is nothing here that
 * can disagree with them.
 *
 * theme.css carries this block itself as well, for a consumer importing it
 * directly. That copy and this one state the same mechanical rebinding of names
 * a system already declared; neither holds a value, so they cannot drift apart.
 *
 * Returns '' when a system declares no contrast companions, which is why a
 * scaffold without them emits nothing rather than an empty media query.
 */
function emitContrastCss(declarations, selector) {
  const rebinds = declarations
    .filter((d) => d.name.endsWith('--contrast'))
    .map((d) => {
      const role = d.name.slice(0, -'--contrast'.length);
      return `    ${role}: var(${d.name});`;
    });
  if (rebinds.length === 0) return '';
  return `
@media (prefers-contrast: more) {
  ${selector} {
${rebinds.join('\n')}
  }
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
  tracking: ['letterSpacing', 'number'],
  // Shares the group the per-size line-height companions land in: they are the
  // same quantity, and `prose` cannot collide with a size name.
  leading: ['lineHeight', 'number'],
  spacing: ['spacing', 'dimension'],
  font: ['fontFamily', 'fontFamily'],
  shadow: ['shadow', 'shadow'],
  animate: ['animation', 'duration'],
  duration: ['duration', 'duration']
  // No `other`. DTCG's type set is closed; a category with no type in it has no
  // conformant representation, and such tokens are omitted with a warning
  // rather than emitted under an invented type.
};

/**
 * Token name -> its leaf key inside the DTCG group.
 *
 * A category's prefix is usually `--<category>-`, but not always: `--spacing`
 * has no leaf at all, and the motion ladder carries Tailwind's
 * `--transition-duration-` namespace rather than `--duration-`. Both the value
 * path and the ALIAS path need the same answer — computing it in one place is
 * what keeps `{duration.state}` from being emitted as `{duration.on-duration-state}`.
 */
const DTCG_PREFIX = { duration: '--transition-duration-' };

function dtcgLeaf(name, category) {
  if (name === '--spacing') return 'base';
  if (name === '--default-transition-duration') return 'default';
  const prefix = category === 'spacing' ? '--spacing' : (DTCG_PREFIX[category] ?? `--${category}-`);
  return name.slice(prefix.length);
}

const NS = 'com.imprintlab';

/**
 * DTCG dimensions are `{value, unit}` with unit `px` or `rem` — not the CSS
 * string this codebase stores. Anything else (`em`, unitless) is not a
 * dimension and must not claim to be one.
 */
function dtcgDimension(css) {
  const m = String(css)
    .trim()
    .match(/^(-?[\d.]+)(px|rem)$/);
  return m ? { value: Number(m[1]), unit: m[2] } : null;
}

/** `0` and `1` are unitless in CSS; DTCG calls that a number, not a dimension. */
function dtcgNumber(css) {
  const s = String(css).trim();
  return /^-?[\d.]+$/.test(s) ? Number(s) : null;
}

/**
 * `0 0 15px rgba(...)` -> the DTCG shadow composite. Comma-separated layers
 * become an array, which DTCG permits. Returns null if the shape is not one
 * this understands, so an unparseable value degrades to a documented string
 * rather than to a plausible lie.
 */
function dtcgShadow(css) {
  const layers = [];
  for (const raw of splitTopLevel(String(css), ',')) {
    const layer = raw.trim();
    if (!layer) continue;
    const color = layer.match(/(rgba?\([^)]*\)|hsla?\([^)]*\)|#[0-9a-fA-F]{3,8})/)?.[1];
    const lengths = layer
      .replace(/\w+\([^)]*\)|#[0-9a-fA-F]{3,8}/g, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!color || lengths.length < 3) return null;
    const [offsetX, offsetY, blur, spread = '0px'] = lengths;
    const dims = [offsetX, offsetY, blur, spread].map((v) => dtcgDimension(v === '0' ? '0px' : v));
    if (dims.some((d) => d === null)) return null;
    layers.push({
      color,
      offsetX: dims[0],
      offsetY: dims[1],
      blur: dims[2],
      spread: dims[3]
    });
  }
  return layers.length === 0 ? null : layers.length === 1 ? layers[0] : layers;
}

/** Split on `sep` at paren depth zero. */
function splitTopLevel(s, sep) {
  const out = [];
  let depth = 0;
  let buf = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === sep && depth === 0) {
      out.push(buf);
      buf = '';
      continue;
    }
    buf += ch;
  }
  out.push(buf);
  return out;
}

const EASING = {
  linear: [0, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1]
};

/** `scan 4s linear infinite` -> duration + timingFunction, keeping the CSS. */
function dtcgAnimation(css) {
  const s = String(css).trim();
  const dur = s.match(/(?:^|\s)(-?[\d.]+)(ms|s)(?:\s|$)/);
  if (!dur) return null;
  const easing =
    s
      .match(/cubic-bezier\(([^)]*)\)/)?.[1]
      ?.split(',')
      .map((n) => Number(n.trim())) ??
    EASING[Object.keys(EASING).find((k) => new RegExp(`(^|\\s)${k}(\\s|$)`).test(s))];
  return {
    duration: { value: Number(dur[1]), unit: dur[2] },
    timingFunction: easing ?? null
  };
}

/**
 * `var(--font-sans-face, sans-serif)` is not a font name. The families a tool
 * can actually use are the fallbacks; the var() indirection is this system's
 * wiring contract and belongs in $extensions, not in $value — a Figma import
 * of the raw string produces a font literally called `var(...)`.
 */
function dtcgFontFamily(css) {
  const s = String(css).trim();
  const inner = s.match(/^var\(\s*--[\w-]+\s*,\s*(.+)\)$/)?.[1] ?? s;
  const families = splitTopLevel(inner, ',')
    .map((f) => f.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
  return families.length ? families : null;
}

/**
 * W3C Design Tokens (DTCG) — the interchange format Figma and friends read.
 *
 * Every token resolves a `$type`, either from its group or from itself, because
 * a token whose type cannot be resolved is invalid and an importer is entitled
 * to reject the file. Where a CSS value has no DTCG equivalent the CSS is
 * carried in `$extensions["${NS}"].css` and the `$value` states the part DTCG
 * can represent — never the raw CSS string dressed up as a typed value.
 */
export function emitTokensJson(tokens, system) {
  const out = {
    $description: `Design tokens for ${system}. Generated from theme.css. Values are W3C DTCG; where CSS has no DTCG equivalent the original declaration is kept under $extensions["${NS}"].css.`
  };
  const skipped = [];

  for (const t of tokens) {
    const mapping = DTCG_GROUP[t.category];
    const leaf = dtcgLeaf(t.name, t.category);

    // A category with no DTCG type has no valid representation at all. Emitting
    // it with an invented $type is what made the previous version non-conformant.
    if (!mapping) {
      skipped.push(`${t.name} (no DTCG type for category '${t.category}')`);
      continue;
    }
    const [group, type] = mapping;

    const entry = {};
    if (t.aliasOf) {
      // DTCG expresses an alias as a reference to another token's path.
      const ref = categorize(t.aliasOf);
      entry.$value = `{${DTCG_GROUP[ref][0]}.${dtcgLeaf(t.aliasOf, ref)}}`;
    } else {
      const value = dtcgValue(t, type);
      // Unrepresentable in DTCG — `--shadow-glow: none` is the common case.
      // Omit it rather than fake a type: a file that silently claims
      // conformance is the defect this emitter was rewritten to fix.
      if (value === null) {
        skipped.push(`${t.name} (${JSON.stringify(t.base)} is not a valid ${type})`);
        continue;
      }
      Object.assign(entry, value);
    }

    out[group] ??= { $type: type };
    if (t.note) entry.$description = t.note;
    out[group][leaf] = entry;

    // Line heights travel as their own tokens rather than being folded into the
    // size — DTCG has no "size / line-height" shorthand. Unitless line heights
    // are numbers, not dimensions, so the group carries no $type and each token
    // declares its own.
    if (t.lineHeight) {
      out.lineHeight ??= {};
      const dim = dtcgDimension(t.lineHeight);
      out.lineHeight[leaf] = dim
        ? { $type: 'dimension', $value: dim }
        : { $type: 'number', $value: dtcgNumber(t.lineHeight) ?? 1 };
    }

    // Tracking travels the same way, and for the same reason. `em` is a
    // multiple of the font size rather than a dimension DTCG can express, so
    // the number is the honest representation and the CSS rides along — the
    // rule dtcgValue already applies to --tracking-*.
    if (t.letterSpacing) {
      out.letterSpacing ??= { $type: 'number' };
      const n = dtcgNumber(t.letterSpacing.replace(/em$/, ''));
      if (n === null) {
        skipped.push(
          `${t.name} letter-spacing (${JSON.stringify(t.letterSpacing)} is not a number)`
        );
      } else {
        out.letterSpacing[leaf] = {
          $value: n,
          $extensions: { [NS]: { css: t.letterSpacing } }
        };
      }
    }
  }

  return { json: `${JSON.stringify(out, null, 2)}\n`, skipped };
}

/**
 * The `$value` (and any `$type` override / `$extensions`) for one token, or
 * `null` when the CSS has no valid DTCG representation.
 *
 * Returning null matters. DTCG defines a CLOSED set of types and `string` is
 * not among them, so an unrepresentable value must be omitted rather than given
 * an invented type — inventing one is exactly how this file previously shipped
 * untyped tokens while claiming conformance.
 */
function dtcgValue(t, groupType) {
  const css = t.base;
  const ext = { $extensions: { [NS]: { css } } };

  switch (groupType) {
    case 'dimension': {
      const dim = dtcgDimension(css);
      if (dim) return { $value: dim };
      // `0.2em` and unitless values are not DTCG dimensions. Emit the number
      // and keep the CSS — em IS a multiple of the font size, so the number is
      // the honest representation rather than a fabricated rem.
      const n = dtcgNumber(css.replace(/em$/, ''));
      return n === null ? null : { $type: 'number', $value: n, ...ext };
    }
    case 'number': {
      const n = dtcgNumber(css.replace(/em$/, ''));
      return n === null ? null : { $value: n, ...ext };
    }
    case 'color':
      // A bare keyword — none, transparent, currentColor — is not a DTCG color.
      return /^(#|rgba?\(|hsla?\(|oklch\(|oklab\(|lab\(|lch\(|color\()/i.test(css.trim())
        ? { $value: css }
        : null;
    case 'shadow': {
      const shadow = dtcgShadow(css);
      return shadow ? { $value: shadow, ...ext } : null;
    }
    case 'duration': {
      const anim = dtcgAnimation(css);
      if (!anim) return null;
      return {
        $value: anim.duration,
        $extensions: {
          [NS]: {
            css,
            ...(anim.timingFunction ? { timingFunction: anim.timingFunction } : {})
          }
        }
      };
    }
    case 'fontFamily': {
      const families = dtcgFontFamily(css);
      return families ? { $value: families, ...ext } : null;
    }
    default:
      return null;
  }
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
/**
 * Utilities forced into the build regardless of whether a literal class name
 * appears in source.
 *
 * Tailwind v4 scans for literal strings. A showcase that builds its class from
 * a runtime value — `className={`${token.utility} …`}` — generates nothing, and
 * the failure is invisible: `text-6xl` was absent from the served CSS for the
 * whole refactor while the type-scale table rendered its largest step at
 * inherited size, smaller than text-5xl. Every other step happened to appear
 * literally somewhere else in the repo.
 *
 * Generated from the token model rather than hand-kept: a safelist that has to
 * be maintained by hand is the drift this pipeline exists to prevent. The token
 * set is closed, so this is exactly the utilities theme.css declares.
 */
export function emitSafelist(tokens) {
  const names = [
    ...new Set(
      tokens
        .flatMap((t) => t.utility.split('·'))
        .map((u) => u.trim())
        .filter(Boolean)
    )
  ].sort();

  return `/* ${BANNER('').split('\n').join('\n   ')}

   Import from the app's globals.css so tokens rendered through a variable still
   generate. See emitSafelist in token-tools for why this cannot be inferred. */

@source inline("${names.join(' ')}");
`;
}

/**
 * The motion ladder, in the unit a JS animation library wants.
 *
 * CSS gets the rungs through `duration-*` utilities, but Framer Motion takes a
 * number of SECONDS and cannot read a custom property. Without this the two
 * tiers drift by construction: the CSS side moved onto the ladder while
 * `bento-card` and `image-frame` kept 0.5, 1.5 and 2 — numbers chosen against
 * nothing, in the same components the ladder was supposed to govern.
 *
 * Emitted beside `cn()` rather than imported from the tokens package, for the
 * reason every file in `ui/lib` is: a registry consumer receives these as plain
 * files with no workspace to resolve `@<ns>/tokens` against.
 */
export function emitMotion(tokens) {
  const seconds = (css) => {
    const m = String(css)
      .trim()
      .match(/^(-?[\d.]+)(ms|s)$/);
    if (!m) return null;
    return m[2] === 'ms' ? Number(m[1]) / 1000 : Number(m[1]);
  };

  // `t.utility` excludes --default-transition-duration: it is the binding for a
  // bare CSS `transition-*`, not a rung anything animates against.
  const rungs = tokens
    .filter((t) => t.category === 'duration' && t.utility)
    .map((t) => [t.name.slice('--transition-duration-'.length), seconds(t.resolved)])
    .filter(([, v]) => v !== null);

  const body = rungs.map(([name, value]) => `  ${name}: ${value}`).join(',\n');

  return `// ${BANNER('').split('\n').join('\n// ')}
//
// The duration ladder in seconds, for JS animation. Pick the rung by what the
// motion MEANS — see the Motion block in theme.css. Feedback enters at \`ack\`
// and decays at \`state\`; \`transit\` is something entering or leaving the page;
// \`process\` is the machine doing something, and is the one rung where the
// duration is the content.

export const duration = {
${body}
} as const;

export type DurationRung = keyof typeof duration;
`;
}

export function emitTwMerge(tokens) {
  const namesFor = (category, prefix) =>
    tokens
      .filter((t) => t.category === category && !t.name.endsWith('--line-height'))
      .map((t) => t.name.slice(prefix.length));

  // Duration goes through classGroups, not theme. tailwind-merge's theme keys
  // mirror Tailwind's THEME NAMESPACES, and Tailwind has no --duration-*
  // namespace — so `theme: { duration: [...] }` is accepted and silently
  // ignored, which looks like it works. Extending the class group directly is
  // what actually makes `duration-500` override `duration-state`.
  const utilitiesFor = (category) =>
    tokens.filter((t) => t.category === category && t.utility).map((t) => t.utility);

  const config = {
    extend: {
      theme: {
        text: namesFor('text', '--text-'),
        tracking: namesFor('tracking', '--tracking-'),
        leading: namesFor('leading', '--leading-')
      },
      classGroups: {
        duration: utilitiesFor('duration')
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
