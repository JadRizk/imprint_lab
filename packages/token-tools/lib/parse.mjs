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

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Split a declaration block on `;` that sit at brace/paren depth zero, so
 * multi-line and function-valued declarations survive intact.
 */
function splitDeclarations(body) {
  const out = [];
  let depth = 0;
  let buf = '';
  for (const ch of body) {
    if (ch === '(' || ch === '{' || ch === '[') depth++;
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

/** Extract the body of the `@theme` block, which may carry options (`static`). */
export function extractThemeBody(css) {
  const open = css.match(/@theme(?:\s+[a-z]+)*\s*\{/);
  if (!open) throw new Error('token-tools: no @theme { ... } block found');
  let depth = 0;
  let i = open.index + open[0].length - 1;
  const start = i + 1;
  for (; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') {
      depth--;
      if (depth === 0) return css.slice(start, i);
    }
  }
  throw new Error('token-tools: unterminated @theme block');
}

/**
 * Parse theme.css into declarations.
 *
 * Returns `{ declarations, byName, resolve }` where each declaration is
 * `{ name, value, note }`. Namespace resets (`--color-*: initial`) are dropped:
 * they configure Tailwind, they are not tokens.
 */
export function parseTheme(css) {
  const rawBody = extractThemeBody(css);
  const notes = collectTrailingNotes(rawBody);
  const body = stripComments(rawBody);

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
    return value.replace(/var\(\s*(--[\w-]+)\s*(?:,([^)]*))?\)/g, (whole, ref) => {
      if (!byName.has(ref)) return whole;
      if (seen.has(ref)) {
        throw new Error(`token-tools: circular var() reference at ${ref}`);
      }
      return resolve(byName.get(ref), new Set([...seen, ref]));
    });
  }

  /** The single token this value aliases, or null if it is not a pure alias. */
  function aliasOf(value) {
    const m = value.match(/^var\(\s*(--[\w-]+)\s*\)$/);
    return m && byName.has(m[1]) ? m[1] : null;
  }

  return { declarations, byName, resolve, aliasOf };
}
