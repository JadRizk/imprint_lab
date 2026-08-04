#!/usr/bin/env node
// Proves a built registry is installable — that the manifest is complete.
//
//   node packages/token-tools/smoke-install.mjs [registryDir]
//   default: apps/docs/public/r/thl
//
// This replaces the proving-ground app that an earlier plan called for. The risk
// worth catching is "I forgot to list a file or a dependency", and that is
// catchable statically. It does NOT exercise the shadcn CLI, which is not our
// code, nor a real Next.js build — see REFACTOR.md §9 for what that leaves open.
//
// Two checks:
//   1. Materialise every item into a temp project and typecheck it. Catches a
//      missing file, a broken relative import, a type error only visible once
//      the files are laid out at their target paths.
//   2. Assert every bare import in a shipped file is declared in that item's
//      `dependencies` (transitively, through registryDependencies). Catches the
//      classic: component ships, forgets to say it needs framer-motion.

import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const registryDir = resolve(process.argv[2] ?? join(repoRoot, 'apps/docs/public/r/thl'));

const items = new Map();
for (const f of readdirSync(registryDir)) {
  if (!f.endsWith('.json') || f === 'registry.json') continue;
  const item = JSON.parse(readFileSync(join(registryDir, f), 'utf8'));
  items.set(item.name, item);
}
if (items.size === 0) {
  console.error(`smoke-install: no items in ${registryDir} — run registry:build first`);
  process.exit(1);
}

/** Everything an item drags in, following registryDependencies. */
function closure(name, seen = new Set()) {
  if (seen.has(name)) return seen;
  seen.add(name);
  for (const dep of items.get(name)?.registryDependencies ?? []) {
    if (items.has(dep)) closure(dep, seen);
  }
  return seen;
}

// ── check 2: declared dependencies cover the bare imports ──
// Node builtins and the framework are assumed present in any consuming project.
const AMBIENT = /^(react|react-dom|next)(\/|$)/;
const failures = [];

for (const [name, item] of items) {
  const declared = new Set();
  for (const dep of closure(name)) {
    for (const d of items.get(dep)?.dependencies ?? [])
      declared.add(d.split('@').slice(0, -1).join('@') || d);
  }
  for (const file of item.files ?? []) {
    if (!/\.tsx?$/.test(file.target ?? file.path)) continue;
    for (const m of (file.content ?? '').matchAll(/^\s*import\s[^'"]*['"]([^'"]+)['"]/gm)) {
      const spec = m[1];
      if (spec.startsWith('.') || spec.startsWith('~') || spec.startsWith('node:')) continue;
      if (AMBIENT.test(spec)) continue;
      const pkg = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
      if (!declared.has(pkg)) {
        failures.push(
          `${name}: ships an import of "${pkg}" but no item in its closure declares it`
        );
      }
    }
  }
}

// ── check 3: every relative import resolves to a file the registry ships ──
//
// Typechecking alone does NOT catch this. A `declare module '*.module.css'`
// ambient type — which any real project has — makes a missing stylesheet resolve
// happily. Dropping image-frame.module.css from the manifest passed check 1
// silently until this existed.
const shipped = new Set();
for (const item of items.values()) {
  for (const file of item.files ?? []) shipped.add((file.target ?? file.path).replace(/^~\//, ''));
}

const CANDIDATES = ['', '.ts', '.tsx', '.css', '/index.ts', '/index.tsx'];
for (const [name, item] of items) {
  for (const file of item.files ?? []) {
    const from = (file.target ?? file.path).replace(/^~\//, '');
    if (!/\.tsx?$/.test(from)) continue;
    for (const m of (file.content ?? '').matchAll(
      /(?:^\s*import\s[^'"]*|from\s*)['"](\.[^'"]+)['"]/gm
    )) {
      const target = join(dirname(from), m[1]).replace(/\\/g, '/');
      if (!CANDIDATES.some((ext) => shipped.has(target + ext))) {
        failures.push(`${name}: ${from} imports "${m[1]}" but no registry item ships it`);
      }
    }
  }
}

// ── check 1: materialise and typecheck ──
const dir = mkdtempSync(join(tmpdir(), 'thl-smoke-'));
let typecheck = { ok: true, output: '' };
try {
  for (const item of items.values()) {
    for (const file of item.files ?? []) {
      const target = (file.target ?? file.path).replace(/^~\//, '');
      const out = join(dir, target);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, file.content ?? '');
    }
  }

  // Borrow the repo's modules rather than installing — this checks that imports
  // RESOLVE; whether they were declared is check 2's job.
  symlinkSync(join(repoRoot, 'node_modules'), join(dir, 'node_modules'), 'dir');

  writeFileSync(
    join(dir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          lib: ['DOM', 'DOM.Iterable', 'ES2022'],
          module: 'ESNext',
          moduleResolution: 'bundler',
          jsx: 'react-jsx',
          strict: true,
          noEmit: true,
          skipLibCheck: true,
          esModuleInterop: true
        },
        include: ['**/*.ts', '**/*.tsx']
      },
      null,
      2
    )
  );
  // CSS modules have no types outside a bundler.
  writeFileSync(
    join(dir, 'css.d.ts'),
    "declare module '*.module.css' {\n  const classes: Record<string, string>;\n  export default classes;\n}\n"
  );

  try {
    execFileSync(join(repoRoot, 'node_modules/.bin/tsc'), ['--noEmit', '-p', dir], {
      cwd: dir,
      stdio: 'pipe'
    });
  } catch (err) {
    typecheck = { ok: false, output: `${err.stdout ?? ''}${err.stderr ?? ''}`.trim() };
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}

// ── report ──
const files = [...items.values()].reduce((n, i) => n + (i.files?.length ?? 0), 0);
console.log(`smoke-install: ${items.size} items, ${files} files, materialised and typechecked`);

if (!typecheck.ok) {
  console.error('\nFAIL — the materialised project does not typecheck:\n');
  console.error(typecheck.output.split('\n').slice(0, 25).join('\n'));
}
for (const f of failures) console.error(`FAIL — ${f}`);

if (!typecheck.ok || failures.length > 0) {
  console.error(
    '\nA registry item is incomplete. Fix the manifest in systems/*/registry.json,\nnot the consuming project.'
  );
  process.exit(1);
}
console.log('all items install cleanly and declare every dependency they import');
