#!/usr/bin/env node
// Builds every system's registry into its own namespace path.
//
//   public/r/thl/{name}.json   <- systems/human-laboratory/registry.json  (@thl)
//   public/r/pg/{name}.json    <- systems/proving-ground/registry.json    (@pg)
//
// One registry per namespace, because that is the unit a consumer subscribes to:
//
//   { "registries": { "@thl": "https://imprint-lab.vercel.app/r/thl/{name}.json" } }
//
// `shadcn build` takes a single registry file, so this loops rather than globs —
// passing a glob silently becomes "too many arguments" the moment a second
// system exists.

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(docsRoot, '..', '..');
const systemsDir = join(repoRoot, 'systems');

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
  built.push(`@${name} -> public/r/${name}`);
}

if (built.length === 0) {
  console.error('build-registries: no systems/*/registry.json found');
  process.exit(1);
}
console.log(`build-registries: ${built.join(', ')}`);
