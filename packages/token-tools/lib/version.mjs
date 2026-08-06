// Reads a system's version. There is exactly one declaration of it, and it is
// the newest released heading in that system's CHANGELOG.md.
//
// Why the changelog rather than a VERSION file or a package.json field: this
// repo has already paid for the alternative. NEXT_PUBLIC_SITE_URL was four
// independent literals, and a repo rename would have fixed the deploy while
// leaving the OG card and the registry homepage pointing at a dead origin with
// nothing failing. A version is the same shape of value — it wants to be copied
// into a manifest, a stylesheet header, a docs page and a git tag — so it gets
// the same treatment: declared once, derived everywhere.
//
// Choosing the changelog specifically makes one failure impossible rather than
// merely discouraged: you cannot bump the version without writing the entry that
// says what changed, because they are the same edit.
//
//   import { readSystemVersion } from './lib/version.mjs'
//   readSystemVersion('systems/human-laboratory')  // -> { version, date, ... }

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** `## [1.2.3] — 2026-08-06`, with any of the three dashes. */
const RELEASE_HEADING =
  /^##\s+\[(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?)\]\s*[-–—]\s*(\d{4}-\d{2}-\d{2})\s*$/;

/** `## [Unreleased]` and anything else bracketed that is not a semver triple. */
const UNRELEASED_HEADING = /^##\s+\[unreleased\]/i;

export const CHANGELOG = 'CHANGELOG.md';

export function changelogPath(systemDir) {
  return join(systemDir, CHANGELOG);
}

/**
 * Every released heading, in file order (newest first, by convention).
 *
 * Returns `{ version, date, line }` per release plus the raw text, so callers
 * that need a section body do not read the file twice.
 */
export function parseChangelog(systemDir) {
  const path = changelogPath(systemDir);
  if (!existsSync(path)) {
    throw new Error(
      `version: ${path} not found.\n` +
        `  Every system declares its version in its changelog — see\n` +
        `  systems/human-laboratory/CHANGELOG.md for the shape.`
    );
  }

  const text = readFileSync(path, 'utf8');
  const lines = text.split('\n');
  const releases = [];
  let unreleased = false;

  for (const [i, line] of lines.entries()) {
    if (UNRELEASED_HEADING.test(line)) {
      unreleased = true;
      continue;
    }
    const m = RELEASE_HEADING.exec(line);
    if (m) releases.push({ version: m[1], date: m[2], line: i + 1 });
  }

  return { path, text, lines, releases, unreleased };
}

/**
 * The system's version: the first released heading in the file.
 *
 * Throws rather than defaulting. A version that quietly falls back to `0.0.0`
 * would publish a registry claiming a version nobody chose, which is worse than
 * a build that stops.
 */
export function readSystemVersion(systemDir) {
  const { path, releases } = parseChangelog(systemDir);
  if (releases.length === 0) {
    throw new Error(
      `version: no release heading in ${path}.\n` +
        `  Expected a line like:  ## [1.0.0] — 2026-08-06\n` +
        `  (square brackets, a semver triple, a dash, an ISO date).`
    );
  }
  return releases[0];
}

/**
 * The body of one release's entry — heading excluded, trailing link definitions
 * and the next heading excluded. This is what a GitHub Release is made of, so
 * the release notes and the changelog cannot disagree.
 */
export function releaseNotes(systemDir, version) {
  const { path, lines, releases } = parseChangelog(systemDir);
  const at = releases.findIndex((r) => r.version === version);
  if (at === -1) {
    throw new Error(
      `version: ${path} has no entry for ${version}.\n` +
        `  Found: ${releases.map((r) => r.version).join(', ') || '(none)'}`
    );
  }

  const start = releases[at].line; // 1-indexed heading line == 0-indexed next line
  const end = releases[at + 1] ? releases[at + 1].line - 1 : lines.length;

  return lines
    .slice(start, end)
    .filter((l) => !/^\[[^\]]+\]:\s*http/.test(l)) // link definitions are file-scoped
    .join('\n')
    .replace(/^\s*-{3,}\s*$/gm, '') // the rules that separate entries in the file
    .trim();
}

/** -1 / 0 / 1. Build metadata is ignored, prerelease tags sort before a release. */
export function compareSemver(a, b) {
  const split = (v) => {
    const [core, pre] = v.split('+')[0].split('-');
    return [core.split('.').map(Number), pre];
  };
  const [ac, apre] = split(a);
  const [bc, bpre] = split(b);
  for (let i = 0; i < 3; i++) {
    if (ac[i] !== bc[i]) return ac[i] < bc[i] ? -1 : 1;
  }
  if (apre === bpre) return 0;
  if (apre === undefined) return 1;
  if (bpre === undefined) return -1;
  return apre < bpre ? -1 : 1;
}

/** `thl/v1.0.0`. Scoped, because systems version on their own timelines. */
export function releaseTag(namespace, version) {
  return `${namespace}/v${version}`;
}
