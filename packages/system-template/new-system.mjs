#!/usr/bin/env node
// Scaffolds a new design system.
//
//   bun run new-system <slug> <namespace> ["Display Name"]
//   bun run new-system atelier atl "Atelier"
//
// Cost-per-new-system is the metric that decides whether imprint_lab is a
// collection or a folder with one thing in it. If standing up system 02 means
// hand-building six phases of scaffolding, it will not happen — so this emits a
// system that is already wired to the pipeline, the role contract, the report
// kit and the registry.
//
// What it deliberately does NOT do: invent an aesthetic. Every token below is a
// placeholder that fails the contrast floor on purpose, so the first thing you
// must do is make real decisions.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const [slug, ns, displayName] = process.argv.slice(2);

if (!slug || !ns) {
  console.error('usage: bun run new-system <slug> <namespace> ["Display Name"]');
  console.error('   eg: bun run new-system atelier atl "Atelier"');
  process.exit(1);
}
if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
  console.error(`error: slug must be kebab-case — got "${slug}"`);
  process.exit(1);
}
if (!/^[a-z][a-z0-9]*$/.test(ns)) {
  console.error(`error: namespace must be lowercase alphanumeric — got "${ns}"`);
  process.exit(1);
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const root = join(repoRoot, 'systems', slug);
const title = displayName ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
// en-CA is ISO-8601 in LOCAL time. `toISOString()` is UTC, which stamps
// yesterday's date for anyone east of Greenwich working after evening — the
// scaffold dated its own first release a day before it existed when this was
// written at 02:31 in Beirut.
const today = new Date().toLocaleDateString('en-CA');

if (existsSync(root)) {
  console.error(`error: systems/${slug} already exists`);
  process.exit(1);
}

const write = (rel, contents) => {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, contents);
};

// ── tokens ──
// The eleven roles are mandatory: they are the contract every system shares and
// what check-roles enforces. Primitives are yours to name.
write(
  'tokens/theme.css',
  `@theme static {
  /* Reset. Keeps the system's vocabulary closed — nothing arrives by default. */
  --color-*: initial;
  --radius-*: initial;
  --shadow-*: initial;
  --font-*: initial;
  --text-*: initial;

  --spacing: 0.25rem;

  /* ── Palette ── TODO: replace. Named by appearance; private to this system. */
  --color-ink-000: #ffffff;
  --color-ink-900: #000000;
  --color-neutral-100: #f5f5f5;
  --color-neutral-500: #767676;
  --color-neutral-900: #141414;
  --color-brand: #ff00ff; /* deliberately awful — make a real decision */

  /* ── Roles ── The shared contract. These eleven names must exist in every
   * system; components reference only these. Point them wherever you like.
   *
   * Any role used for text must clear 4.5:1 against --color-canvas. Measure it
   * and record the ratio in a trailing comment, as system 01 does.
   *
   * ambient / line / line-strong are one LADDER, not three greys. Keep them in
   * that order of visibility — decoration must never outrank the structure that
   * contains it:
   *   ambient      subdivision inside a block   (quietest)
   *   line         the edge of a thing          (the default)
   *   line-strong  a boundary that outranks its neighbours
   *
   * There is no --color-surface. A system may of course fill a panel, but the
   * shared contract does not include one: system 01 found its fill measured
   * 1.03:1 and never rendered, and structure is carried by line instead. */
  --color-canvas: var(--color-neutral-900);
  --color-ambient: var(--color-neutral-500); /* decoration only — never text */
  --color-line: var(--color-neutral-500);
  --color-line-strong: var(--color-neutral-100);
  --color-ink: var(--color-ink-000);
  --color-ink-muted: var(--color-neutral-100);
  --color-ink-subtle: var(--color-neutral-500);
  --color-accent: var(--color-brand);
  --color-accent-ink: var(--color-ink-900);
  --color-critical: #ff4a4a;
  --color-warning: #ff8a00;
  /* The quiet half of the state axis. nominal is the state an interface is in
   * almost all the time, so it takes the quietest ink that still clears 4.5:1
   * — NOT the accent. unmeasured must be distinguishable from it, and since
   * nominal sits on the text floor there is no room below, so unmeasured goes
   * up. Separate them by glyph as well as by luminance; never by hue alone. */
  --color-nominal: var(--color-neutral-500); /* MEASURE and record the ratio */
  --color-unmeasured: var(--color-neutral-100); /* MEASURE and record the ratio */
  --color-status-ink: var(--color-ink-900); /* ink on a FILLED status mark */

  /* ── Typography ── Consumer defines the -face variables (typically next/font). */
  --font-sans: var(--font-sans-face, sans-serif);
  --font-mono: var(--font-mono-face, monospace);

  /* Closed scale: --text-* is reset above, so these are the only sizes that exist. */
  --text-micro: 0.625rem;
  --text-micro--line-height: 1rem;
  --text-xs: 0.75rem;
  --text-xs--line-height: 1rem;
  --text-sm: 0.875rem;
  --text-sm--line-height: 1.25rem;
  --text-base: 1rem;
  --text-base--line-height: 1.5rem;
  --text-lg: 1.125rem;
  --text-lg--line-height: 1.75rem;
  --text-xl: 1.25rem;
  --text-xl--line-height: 1.75rem;
  --text-2xl: 1.5rem;
  --text-2xl--line-height: 2rem;
  --text-3xl: 1.875rem;
  --text-3xl--line-height: 2.25rem;
  --text-4xl: 2.25rem;
  --text-4xl--line-height: 2.5rem;

  --tracking-label: 0.1em;

  /* The one shadow role. Point it at a primitive, or set it to none. */
  /* Both emission roles must exist, or a ported component's focus ring
   * resolves to nothing. A value of none is a legitimate answer for either. */
  --shadow-glow: none;
  --shadow-glow-strong: none;
}
`
);

write(
  'tokens/base.css',
  `/* Base layer — this system's opinions.
 *
 * Two rules govern this file:
 *
 * 1. Anything expressing this system's look is scoped to
 *    [data-system="${slug}"]. apps/docs renders several systems on one page and
 *    an unscoped \`body\` rule leaks across all of them. Colour, font and cursor
 *    inherit, so the nearest data-system ancestor wins.
 * 2. It binds to ROLES, never primitives — a primitive is private to one system
 *    and would resolve to nothing under another.
 *
 * \`color-scheme\`, the \`*\` reset and the PAGE scrollbar have no container to
 * move to and stay global. Two systems with different colour schemes cannot
 * share a document; the second one needs its own page.
 *
 * Standalone consumers put the attribute on <body>:
 *   <body data-system="${slug}">
 */

@layer base {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  [data-system='${slug}'] {
    background-color: var(--color-canvas);
    color: var(--color-ink-muted);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }

  [data-system='${slug}'] ::selection {
    background-color: var(--color-accent);
    color: var(--color-accent-ink);
  }
}
`
);

write(
  'tokens/package.json',
  `${JSON.stringify(
    {
      name: `@${ns}/tokens`,
      private: true,
      exports: {
        '.': './theme.css',
        './base.css': './base.css',
        './tokens': './generated/tokens.ts',
        './tw-merge': './generated/tw-merge.ts',
        './tokens.css': './generated/tokens.css',
        './theme.scoped.css': './generated/theme.scoped.css',
        './tokens.json': './generated/tokens.json'
      },
      scripts: {
        'generate:tokens': 'token-tools',
        build: 'token-tools',
        lint: 'node ../../../packages/token-tools/check-version.mjs ..'
      },
      devDependencies: { '@imprint/token-tools': '*' }
    },
    null,
    2
  )}\n`
);

// ── ui ──
write(
  'ui/package.json',
  `${JSON.stringify(
    {
      name: `@${ns}/ui`,
      private: true,
      exports: {
        './lib/utils': './lib/utils.ts',
        './lib/version': './lib/version.generated.ts'
      },
      scripts: { lint: 'check-roles .. && biome check .', 'check-types': 'tsc --noEmit' },
      dependencies: { clsx: '^2.1.1', react: '^19.2.0', 'tailwind-merge': '^3.3.0' },
      devDependencies: {
        '@imprint/token-tools': '*',
        '@repo/typescript-config': '*',
        [`@${ns}/tokens`]: '*',
        '@types/react': '19.2.2',
        typescript: '5.9.2'
      }
    },
    null,
    2
  )}\n`
);

write(
  'ui/tsconfig.json',
  `${JSON.stringify(
    {
      extends: '@repo/typescript-config/react-library.json',
      compilerOptions: { outDir: 'dist' },
      include: ['components', 'lib'],
      exclude: ['node_modules', 'dist']
    },
    null,
    2
  )}\n`
);

write(
  'ui/lib/utils.ts',
  `import { twMergeConfig } from '@${ns}/tokens/tw-merge';
import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * The scale names are generated from theme.css, so adding a value there
 * registers it here automatically. Without this, tailwind-merge cannot tell a
 * custom font size from a color and silently drops the color.
 */
const twMerge = extendTailwindMerge(twMergeConfig);

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
`
);

// ── static tier ──
write(
  'static/parts/reset.css',
  `/* Reset + base for the report kit. Roles only — never a primitive. */

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--color-canvas);
  color: var(--color-ink-muted);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  line-height: 1.6;
}
`
);

write(
  'static/parts/components.css',
  `/* Report primitives for ${title}. Roles only.
 *
 * Start by copying what system 01 ships in systems/human-laboratory/static/parts
 * and re-deciding each rule — the class NAMES are worth keeping identical so a
 * report can move between systems, but the styling is yours.
 */

.wrap {
  max-width: var(--measure, 1440px);
  margin-inline: auto;
  padding-inline: 28px;
}
`
);

write(
  'registry.json',
  `${JSON.stringify(
    {
      $schema: 'https://ui.shadcn.com/schema/registry.json',
      name: ns,
      homepage: 'https://jadrizk.github.io/imprint_lab',
      items: [
        {
          name: 'report-kit',
          type: 'registry:file',
          title: `${title} report kit`,
          description: `Pure HTML/CSS tier for standalone reports in ${title}.`,
          files: [
            {
              path: `systems/${slug}/static/${ns}.css`,
              type: 'registry:file',
              target: `~/${ns}/${ns}.css`
            }
          ]
        }
      ]
    },
    null,
    2
  )}\n`
);

// The version lives here and nowhere else, so this file is not optional
// furniture: `token-tools` reads it on every run and refuses without it, and a
// scaffold that cannot generate its own tokens is not a scaffold. It starts at
// 0.1.0 because that is what a system with a placeholder palette honestly is —
// pre-1.0, free to break, adopted by nobody.
write(
  'CHANGELOG.md',
  `# Changelog — ${title} (\`@${ns}\`)

All notable changes to this system. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the system is
versioned with [semantic versioning](https://semver.org/spec/v2.0.0.html).

> ⚠ **This file is parsed.** The newest \`## [x.y.z] — date\` heading below **is**
> the system's version — nothing else declares it. \`token-tools\` reads it and
> emits it into \`ui/lib/version.generated.ts\`, the report-kit bundle headers and
> the published registry, so a bump means: write the entry, then regenerate.
> Keep the heading shape exactly — square brackets, a semver triple, a dash, an
> ISO date. \`check-version\` fails the build if it drifts.

## What a version means here

The system version is the atomic unit: tokens, components, brand and report kit
ship together at one number, and a consumer adopts it deliberately.

| Bump | Means |
|---|---|
| **Major** | A consumer's existing copy breaks — a role renamed or removed, a component's props changed, a report-kit class deleted. |
| **Minor** | Additive. Something existing code can ignore. |
| **Patch** | A value moves without renaming anything. |

**Primitives are private**, so moving one is a patch: nothing in \`ui/\` is
allowed to reference it. Roles are the public surface.

## [Unreleased]

TODO — what you change while making this system real goes here, and moves into a
version heading when you release it.

## [0.1.0] — ${today}

### Added

Scaffolded from \`packages/system-template\`. **Nothing here is decided yet** —
the palette is a placeholder that fails its own contrast floor on purpose, and
\`BRAND.md\` is four TODOs. This entry exists so the system has a version to be
at, not because there is anything to adopt.
`
);

write(
  'BRAND.md',
  `# ${title}

## Thesis

TODO — one paragraph. What does this system believe that others do not? System 01's
answer is on its landing page: constraint produces coherence, and the most honest
interface is one that does not pretend to be anything other than code on a screen.

## Voice

TODO — the verbal system. System 01 uses SCREAMING_SNAKE labels, \`//\` separators,
instrument status words (NOMINAL, SIGNAL_LOST) and hex-style identifiers. Whatever
you choose, write it down: it is the part that makes output recognisable, and it is
the part most easily lost.

## Typography

TODO — the sans/mono pairing, and which does the body text.

## Non-negotiables

TODO — the constraints that define the system. For system 01: zero radius, dark
only, borders are structural, a single accent.
`
);

// Hand the output to the repo's own formatter rather than trying to match it
// from string templates. A scaffold that fails `lint` and `check` on the first
// run teaches that the gates are noise, and JSON.stringify's array wrapping does
// not agree with Biome's. This absorbs any future formatter config change too.
const fmt = spawnSync('bunx', ['biome', 'check', '--write', `systems/${slug}`], {
  cwd: repoRoot,
  encoding: 'utf8'
});
if (fmt.status !== 0) {
  console.error(`\nwarning: could not format systems/${slug} — run \`bun run check\` yourself`);
  if (fmt.stderr) console.error(fmt.stderr.trim());
}

console.log(`
Scaffolded systems/${slug} (@${ns})

  tokens/theme.css      the eleven roles are stubbed — replace the palette
  ui/lib/utils.ts       cn(), wired to the generated tw-merge config
  static/parts/         report kit source
  registry.json         @${ns} namespace
  BRAND.md              thesis and voice, unwritten
  CHANGELOG.md          the version lives here and nowhere else — 0.1.0

Next:
  1. bun install
  2. Make real palette decisions in tokens/theme.css. The placeholder brand
     colour is magenta on purpose.
  3. Every role used for text must clear 4.5:1 against --color-canvas. Measure
     it and record the ratio beside the token.
  4. bun run --filter=@${ns}/tokens generate:tokens
  5. Add to apps/docs/app/globals.css, BOTH lines — the @import alone is not
     enough, and the failure is silent (utilities simply never generate):
       @import "@${ns}/tokens/theme.scoped.css";
       @source "../../../systems/${slug}/ui";
  6. Add an entry to apps/docs/lib/systems.ts and a page under
     app/systems/${slug}/. Read its \`version\` from
     @${ns}/ui/lib/version — never type the number in.
  7. bun run lint && bun run check && bun run test
  8. When the system is real, write the entry in CHANGELOG.md, regenerate,
     commit, then tag it:  git tag ${ns}/v<version> && git push origin ${ns}/v<version>
     The tag publishes a GitHub Release from that entry, and refuses if the
     two disagree.
`);
