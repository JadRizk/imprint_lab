// Parses a system's theme.css into a token model.
//
// Why not lightningcss: it parses the file happily, but treats `@theme` as an
// unknown at-rule and passes its body through as opaque raw tokens — a
// Declaration visitor sees zero custom properties inside it, and `--color-*` is
// re-emitted as `--color- * `. So a real CSS parser buys nothing here. What it
// would have bought is robustness against comments and multi-line values, and
// that is what this module handles directly.

/**
 * Collect the trailing annotation on each declaration, e.g. the measured
 * contrast ratio in `--color-ink-subtle: #7C7C7C; /* 4.59:1 — labels *␘/`.
 *
 * The comment must sit on the SAME LINE as the declaration it annotates.
 * Allowing a newline in between makes every section header (`/* ── Roles ── ... *␘/`)
 * attach itself to whatever declaration happened to precede it.
 */
function collectTrailingNotes(body) {
  const notes = new Map();
  for (const line of body.split('\n')) {
    const m = line.match(/(--[\w-]+)\s*:[^;]*;[ \t]*\/\*(.*?)\*\//);
    if (m) notes.set(m[1], m[2].trim().replace(/\s+/g, ' '));
  }
  return notes;
}

/**
 * Replace every comment with same-length whitespace, preserving newlines.
 *
 * Length-preserving on purpose: structure (brace counting, `@theme` location,
 * declaration splitting) is read off the blanked text, while trailing notes are
 * sliced out of the RAW text at the same offsets. Deleting comments instead
 * would desynchronise the two.
 *
 * This is also what makes a comment containing a brace safe. Counting braces on
 * raw CSS meant `/* a } here *␘/` closed the block early and every token after
 * it was dropped silently — and an `@theme { … }` written inside a comment was
 * parsed in preference to the real one.
 */
function blankComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

/**
 * Walk `css` from `i`, returning the index just past the matching close of the
 * block opened at `i`. String-aware: a brace or paren inside a quoted value is
 * data, not structure.
 */
function scan(css, i, open, close) {
  let depth = 0;
  let quote = null;
  for (; i < css.length; i++) {
    const ch = css[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === open) depth++;
    else if (ch === close && --depth === 0) return i;
  }
  return -1;
}

/**
 * Split a declaration block on `;` that sit at brace/paren depth zero and
 * outside any string, so multi-line and function-valued declarations survive
 * intact and `--font-sans: "Foo;Bar", sans-serif` is not truncated at the
 * quoted semicolon.
 */
function splitDeclarations(body) {
  const out = [];
  let depth = 0;
  let quote = null;
  let buf = '';
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (quote) {
      buf += ch;
      if (ch === '\\' && i + 1 < body.length) buf += body[++i];
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '(' || ch === '{' || ch === '[') depth++;
    else if (ch === ')' || ch === '}' || ch === ']') depth--;
    if (ch === ';' && depth === 0) {
      out.push(buf);
      buf = '';
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) out.push(buf);
  return out;
}

/**
 * Offsets of the `@theme` body, which may carry options (`static`).
 * Located on comment-blanked CSS so a commented-out block cannot win.
 */
function themeBodyRange(css) {
  const blanked = blankComments(css);
  const open = blanked.match(/@theme(?:\s+[a-z]+)*\s*\{/);
  if (!open) throw new Error('token-tools: no @theme { ... } block found');
  const brace = open.index + open[0].length - 1;
  const end = scan(blanked, brace, '{', '}');
  if (end === -1) throw new Error('token-tools: unterminated @theme block');
  return { start: brace + 1, end, blanked };
}

/** Extract the body of the `@theme` block, which may carry options (`static`). */
export function extractThemeBody(css) {
  const { start, end } = themeBodyRange(css);
  return css.slice(start, end);
}

/**
 * Parse theme.css into declarations.
 *
 * Returns `{ declarations, byName, resolve }` where each declaration is
 * `{ name, value, note }`. Namespace resets (`--color-*: initial`) are dropped:
 * they configure Tailwind, they are not tokens.
 */
export function parseTheme(css) {
  const { start, end, blanked } = themeBodyRange(css);
  // Notes come from the raw text (they ARE comments); structure from the
  // blanked text. Same offsets, so the two always describe the same block.
  const notes = collectTrailingNotes(css.slice(start, end));
  const body = blanked.slice(start, end);

  const declarations = [];
  for (const chunk of splitDeclarations(body)) {
    const idx = chunk.indexOf(':');
    if (idx === -1) continue;
    const name = chunk.slice(0, idx).trim();
    const value = chunk
      .slice(idx + 1)
      .trim()
      .replace(/\s+/g, ' ');
    if (!name.startsWith('--')) continue;
    if (name.endsWith('*')) continue; // namespace reset
    if (value === 'initial') continue;
    declarations.push({ name, value, note: notes.get(name) });
  }

  const byName = new Map(declarations.map((d) => [d.name, d.value]));

  /**
   * Resolve var() chains down to a literal — but only for tokens this file
   * defines. `--font-sans: var(--font-sans-face, sans-serif)` must survive
   * intact: --font-sans-face is the consumer's contract, deliberately undefined
   * here, and flattening it to the fallback would break font wiring.
   */
  function resolve(value, seen = new Set()) {
    let out = '';
    let i = 0;
    while (i < value.length) {
      const at = value.indexOf('var(', i);
      if (at === -1) return out + value.slice(i);

      // Paren-balanced, not `[^)]*`: a fallback may itself contain parens, as in
      // var(--a, rgba(0,0,0,.5)). Stopping at the first `)` left the remainder
      // dangling and emitted values like `#123456)` into tokens.ts and tokens.json.
      const close = scan(value, at + 3, '(', ')');
      if (close === -1) return out + value.slice(i);

      const inner = value.slice(at + 4, close);
      const ref = inner.match(/^\s*(--[\w-]+)\s*(?:,|$)/)?.[1];
      out += value.slice(i, at);
      if (ref && byName.has(ref)) {
        if (seen.has(ref)) {
          throw new Error(`token-tools: circular var() reference at ${ref}`);
        }
        out += resolve(byName.get(ref), new Set([...seen, ref]));
      } else {
        out += value.slice(at, close + 1);
      }
      i = close + 1;
    }
    return out;
  }

  /** The single token this value aliases, or null if it is not a pure alias. */
  function aliasOf(value) {
    const m = value.match(/^var\(\s*(--[\w-]+)\s*\)$/);
    return m && byName.has(m[1]) ? m[1] : null;
  }

  return { declarations, byName, resolve, aliasOf };
}
