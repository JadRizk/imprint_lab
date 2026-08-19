#!/usr/bin/env node
// Fails the build if a system's version has drifted from the one place it is
// declared.
//
//   node packages/token-tools/check-version.mjs [systemDir]
//   default: every systems/*/ that has a CHANGELOG.md
//
// A version is unusually good at reporting success while being wrong. It is a
// short string copied into a stylesheet header, a TypeScript file and a registry
// manifest; every copy still parses, still builds and still deploys when it is
// stale. Nothing renders differently. The only symptom is a consumer installing
// 1.1.0 and receiving a stylesheet that says 1.0.0 — which they will believe,
// because why would it lie.
//
// So this asserts the four things that can silently disagree:
//
//   1. The changelog parses, and its releases descend without duplicates.
//   2. There is an Unreleased section to write the next entry into.
//   3. No system package.json has re-grown a `version` field — that is a second
//      declaration, and a second declaration is the whole failure mode.
//   4. Every generated artifact carrying the version carries the CURRENT one.
//      This is the staleness check: it catches a changelog edited without a
//      regenerate, which is otherwise invisible until someone installs.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compareSemver, parseChangelog, readSystemVersion } from './lib/version.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const systemsDir = join(repoRoot, 'systems');

const targets = process.argv[2]
  ? [resolve(process.argv[2])]
  : readdirSync(systemsDir)
      .map((slug) => join(systemsDir, slug))
      .filter((dir) => existsSync(join(dir, 'CHANGELOG.md')));

if (targets.length === 0) {
  console.error('check-version: no system with a CHANGELOG.md found');
  process.exit(1);
}

const failures = [];
const fail = (system, msg) => failures.push(`  ${system}: ${msg}`);

for (const systemDir of targets) {
  const system = systemDir.split('/').pop();
  // Per system, not global: one system failing must not silence the report for
  // the next one.
  const before = failures.length;

  // 1 + 2 — the changelog itself.
  let release;
  let parsed;
  try {
    parsed = parseChangelog(systemDir);
    release = readSystemVersion(systemDir);
  } catch (err) {
    fail(system, err.message.split('\n').join('\n    '));
    continue;
  }

  for (let i = 1; i < parsed.releases.length; i++) {
    const prev = parsed.releases[i - 1];
    const cur = parsed.releases[i];
    const order = compareSemver(prev.version, cur.version);
    if (order === 0) {
      fail(system, `CHANGELOG.md declares ${cur.version} twice (line ${cur.line})`);
    } else if (order < 0) {
      fail(
        system,
        `CHANGELOG.md is out of order — ${cur.version} (line ${cur.line}) is newer than ` +
          `${prev.version} above it. Newest first.`
      );
    }
    if (cur.date > prev.date) {
      fail(
        system,
        `CHANGELOG.md dates run backwards — ${cur.version} is dated ${cur.date}, ` +
          `after ${prev.version}'s ${prev.date} (line ${cur.line})`
      );
    }
  }

  if (!parsed.unreleased) {
    fail(
      system,
      'CHANGELOG.md has no `## [Unreleased]` section. Without one the next change ' +
        'has nowhere to go but a new version heading, which is how a patch bump ' +
        'ends up describing three unrelated things.'
    );
  }

  // 3 — no second declaration.
  const namespace = (() => {
    const pkg = join(systemDir, 'tokens', 'package.json');
    if (!existsSync(pkg)) return null;
    const name = JSON.parse(readFileSync(pkg, 'utf8')).name ?? '';
    return name.match(/^@([^/]+)\//)?.[1] ?? null;
  })();

  for (const pkgDir of ['tokens', 'ui']) {
    const pkg = join(systemDir, pkgDir, 'package.json');
    if (!existsSync(pkg)) continue;
    if (JSON.parse(readFileSync(pkg, 'utf8')).version !== undefined) {
      fail(
        system,
        `${pkgDir}/package.json has a \`version\` field. The system version is the ` +
          'atomic unit and lives only in CHANGELOG.md — tokens and ui shipping ' +
          'separate numbers is the contract failing quietly. Delete the field; the ' +
          'packages are private, so nothing reads it.'
      );
    }
  }

  // 4 — the generated artifacts agree.
  const stale = (label, path, needle) => {
    if (!existsSync(path)) return;
    if (!readFileSync(path, 'utf8').includes(needle)) {
      fail(
        system,
        `${label} does not carry v${release.version}. Run:\n` +
          `      bun run --filter=@${namespace}/tokens generate:tokens`
      );
    }
  };

  stale(
    'ui/lib/version.generated.ts',
    join(systemDir, 'ui', 'lib', 'version.generated.ts'),
    `export const version = '${release.version}'`
  );

  const staticDir = join(systemDir, 'static');
  if (namespace && existsSync(staticDir)) {
    for (const file of readdirSync(staticDir)) {
      if (!file.startsWith(`${namespace}.`) || !file.endsWith('.css')) continue;
      const path = join(staticDir, file);
      // Only the generated bundles carry a version header. thl.fonts.css is
      // hand-authored and sits in the same directory under the same prefix.
      if (!readFileSync(path, 'utf8').includes('AUTO-GENERATED')) continue;
      stale(`static/${file}`, path, `@${namespace} v${release.version}`);
    }
  }

  if (failures.length === before) {
    console.log(`check-version: ${system} @${namespace} v${release.version} — consistent`);
  }
}

if (failures.length > 0) {
  console.error(`check-version: ${failures.length} problem(s)\n${failures.join('\n')}`);
  process.exit(1);
}
