#!/usr/bin/env node
// Enforces the roles-only contract.
//
// Components in systems/<system>/ui/ may reference role tokens only. Primitives
// are this system's private vocabulary — using one in a component is what makes
// the component un-portable to the next system, which is the whole point of the
// role layer.
//
//   check-roles [systemDir]        (default: cwd)
//
// The banned list is derived from theme.css, not hand-kept, so adding a
// primitive there is covered here automatically.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';

import { categorize, ROLE_COLOR_NAMES, ROLE_OTHER_NAMES } from './lib/emit.mjs';
import { parseTheme } from './lib/parse.mjs';

const systemDir = resolve(process.argv[2] ?? process.cwd());
const system = basename(systemDir);
const uiDir = join(systemDir, 'ui');

const { declarations } = parseTheme(readFileSync(join(systemDir, 'tokens', 'theme.css'), 'utf8'));

// A primitive is any colour or shadow token that is not a declared role.
const primitives = declarations
  .map((d) => d.name)
  .filter((n) => ['color', 'shadow'].includes(categorize(n)))
  .filter((n) => !ROLE_COLOR_NAMES.has(n) && !ROLE_OTHER_NAMES.has(n));

const bare = primitives.map((n) => n.replace(/^--(color|shadow)-/, ''));

// Utility prefixes that take a colour or shadow value.
const PREFIXES =
  'bg|text|border|outline|ring|fill|stroke|divide|decoration|caret|placeholder|accent|from|via|to|shadow';

// Preceded by start, whitespace, quote, or a variant colon (hover:, group-hover:).
const classRe = new RegExp(`(^|[\\s"'\`:])((?:${PREFIXES})-(?:${bare.join('|')}))\\b`, 'g');
const varRe = new RegExp(`var\\(\\s*(${primitives.join('|')})\\s*\\)`, 'g');

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(tsx?|css)$/.test(entry)) out.push(p);
  }
  return out;
}

const violations = [];
for (const file of walk(uiDir)) {
  const src = readFileSync(file, 'utf8');
  src.split('\n').forEach((line, i) => {
    for (const re of [classRe, varRe]) {
      for (const m of line.matchAll(re)) {
        violations.push({
          file: relative(process.cwd(), file),
          line: i + 1,
          token: (m[2] ?? m[1]).trim()
        });
      }
    }
  });
}

if (violations.length === 0) {
  console.log(`check-roles: ${system} — ${primitives.length} primitives guarded, no violations`);
  process.exit(0);
}

console.error(`check-roles: ${system} — ${violations.length} primitive(s) used inside ui/\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  ${v.token}`);
}
console.error(`
Components must reference roles, not primitives. A primitive is this system's
private vocabulary; a role is the contract every system shares, and is what lets
a component move systems unchanged.

  bg-obsidian -> bg-canvas        text-lime  -> text-accent
  border-steel -> border-line     text-black -> text-accent-ink
  text-text-secondary -> text-ink-muted
  text-text-tertiary  -> text-ink-subtle
  shadow-lime-glow    -> shadow-glow

App code and one-off compositions may use primitives freely — this rule covers
systems/*/ui/ only.`);
process.exit(1);
