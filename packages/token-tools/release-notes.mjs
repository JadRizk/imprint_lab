#!/usr/bin/env node
// Resolves a release tag to the changelog entry it names, and refuses if they
// disagree.
//
//   node packages/token-tools/release-notes.mjs thl/v1.0.0
//   -> prints the body of that entry on stdout
//
// Tags are scoped per system — `thl/v1.0.0`, not `v1.0.0` — because systems here
// evolve on their own timelines. A flat tag would force a THL release every time
// another system moved, which is the coupling `systems/*` exists to avoid.
//
// The check this performs is the one a release process is actually for. A tag is
// the one artifact in this pipeline that is NOT generated: someone types it. So
// it is the one thing that can name a version the repository does not contain —
// `thl/v1.1.0` pushed at a commit whose changelog still says 1.0.0 publishes a
// GitHub Release for a version that exists nowhere else, and every derived
// artifact in that release keeps saying 1.0.0. Nothing else in the chain would
// notice, because everything else reads the changelog and agrees with itself.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readSystemVersion, releaseNotes } from './lib/version.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const systemsDir = join(repoRoot, 'systems');

const tag = process.argv[2];
if (!tag) {
  console.error('usage: release-notes.mjs <namespace>/v<version>   eg: thl/v1.0.0');
  process.exit(1);
}

const m = /^([a-z][a-z0-9]*)\/v(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?)$/.exec(tag);
if (!m) {
  console.error(
    `release-notes: "${tag}" is not a release tag.\n` +
      '  Expected <namespace>/v<semver>, eg thl/v1.0.0 — scoped, because a flat\n' +
      '  tag would claim to version every system in the repo at once.'
  );
  process.exit(1);
}
const [, namespace, version] = m;

// namespace -> system directory, via the token package's scope. Same derivation
// the emitter and sync-static use, so a system cannot be found here under a name
// its artifacts are not published under.
let systemDir = null;
for (const slug of readdirSync(systemsDir)) {
  const pkg = join(systemsDir, slug, 'tokens', 'package.json');
  if (!existsSync(pkg)) continue;
  if (JSON.parse(readFileSync(pkg, 'utf8')).name === `@${namespace}/tokens`) {
    systemDir = join(systemsDir, slug);
    break;
  }
}

if (!systemDir) {
  console.error(`release-notes: no system publishes the namespace @${namespace}`);
  process.exit(1);
}

const current = readSystemVersion(systemDir);
if (current.version !== version) {
  console.error(
    `release-notes: tag ${tag} disagrees with the changelog.\n` +
      `  tag says:        ${version}\n` +
      `  CHANGELOG.md says: ${current.version} (${current.date})\n` +
      '  The changelog is the source. Either the tag is on the wrong commit, or\n' +
      '  the entry was never written.'
  );
  process.exit(1);
}

process.stdout.write(`${releaseNotes(systemDir, version)}\n`);
