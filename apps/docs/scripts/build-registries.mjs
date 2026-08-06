#!/usr/bin/env node
// Builds every system's registry into its own namespace path.
//
//   public/r/thl/{name}.json   <- systems/human-laboratory/registry.json  (@thl)
//   public/r/pg/{name}.json    <- systems/proving-ground/registry.json    (@pg)
//
// One registry per namespace, because that is the unit a consumer subscribes to:
//
//   { "registries": { "@thl": "<site>/r/thl/{name}.json" } }
//
// `shadcn build` takes a single registry file, so this loops rather than globs —
// passing a glob silently becomes "too many arguments" the moment a second
// system exists.
//
// `homepage` in the BUILT index is stamped from NEXT_PUBLIC_SITE_URL, the same
// variable next.config.js derives basePath from — see the comment there. The
// value committed in systems/*/registry.json is the local default, which is what
// `bun run smoke` and a bare `registry:build` use. Without this the published
// registry advertised a homepage that agreed with the deploy only by
// coincidence, and a repo rename broke it silently.
//
// `version` is stamped the same way and for the same reason, from the one place
// it is declared — the system's CHANGELOG.md. Stamped into the OUTPUT only: a
// version committed in systems/*/registry.json would be a second declaration
// that could disagree with the changelog, and rewriting the source in place
// would dirty the working tree on every build.
//
// shadcn 3.5.0's registry-item schema has no `version` field, so per item it
// goes in `meta`, which the schema does carry and the build preserves. Verified
// against a throwaway registry rather than assumed.

import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readSystemVersion } from '../../../packages/token-tools/lib/version.mjs';

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(docsRoot, '..', '..');
const systemsDir = join(repoRoot, 'systems');
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

const built = [];
for (const slug of readdirSync(systemsDir).sort()) {
  const registry = join(systemsDir, slug, 'registry.json');
  if (!existsSync(registry)) continue;

  const { name } = JSON.parse(readFileSync(registry, 'utf8'));
  const out = join(docsRoot, 'public', 'r', name);

  execFileSync('bunx', ['shadcn', 'build', registry, '--output', out], {
    cwd: repoRoot,
    stdio: 'inherit'
  });

  // Stamped after the build rather than before: shadcn reads the source file,
  // so rewriting it in place would dirty the working tree on every build.
  const { version, date } = readSystemVersion(join(systemsDir, slug));

  const index = join(out, 'registry.json');
  const parsed = JSON.parse(readFileSync(index, 'utf8'));
  // `homepage` lands only in the index, not in the per-item JSON.
  if (siteUrl) parsed.homepage = siteUrl;
  for (const item of parsed.items ?? []) item.meta = { ...item.meta, version, released: date };
  // Rebuilt rather than assigned into, so the version sits with the other header
  // fields. Assigning appends, which buries it under a few hundred lines of
  // items — findable by a parser, invisible to the person checking what is
  // current.
  const { items, ...head } = parsed;
  writeFileSync(index, `${JSON.stringify({ ...head, version, released: date, items }, null, 2)}\n`);

  // Per item as well as in the index, because the index is not what a consumer
  // resolves: `shadcn add @thl/button` fetches r/thl/button.json directly and
  // never reads the index at all. A version only in the index is a version the
  // install path cannot see.
  for (const file of readdirSync(out)) {
    if (!file.endsWith('.json') || file === 'registry.json') continue;
    const p = join(out, file);
    const item = JSON.parse(readFileSync(p, 'utf8'));
    item.meta = { ...item.meta, version, released: date, namespace: `@${name}` };
    writeFileSync(p, `${JSON.stringify(item, null, 2)}\n`);
  }

  built.push(`@${name} v${version} -> public/r/${name}`);
}

if (built.length === 0) {
  console.error('build-registries: no systems/*/registry.json found');
  process.exit(1);
}

// Stage each system's report kit into public/ so the /report route can load the
// real bundle in an iframe. Copied at build time rather than committed: these
// are generated artifacts, and a committed copy would drift from the source the
// moment theme.css changed.
const staged = [];
for (const slug of readdirSync(systemsDir).sort()) {
  const staticDir = join(systemsDir, slug, 'static');
  if (!existsSync(staticDir)) continue;
  const { name } = JSON.parse(readFileSync(join(systemsDir, slug, 'registry.json'), 'utf8'));

  for (const file of readdirSync(staticDir)) {
    if (!/\.(css|html)$/.test(file)) continue;
    // catalog.html is namespaced so several systems can coexist in public/.
    const out = file === 'catalog.html' ? `${name}-catalog.html` : file;
    copyFileSync(join(staticDir, file), join(docsRoot, 'public', out));
    staged.push(out);
  }
}

console.log(`build-registries: ${built.join(', ')}`);
console.log(`build-registries: staged ${staged.length} static files into public/`);
