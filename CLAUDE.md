# CLAUDE.md — Project Intelligence

## What this repository is

`imprint_lab` is **a house of design systems**. It produces them; it does not
contain products. Each system under `systems/<name>/` owns its tokens,
components, report kit, brand and version, and evolves on its own timeline.
Projects live in their own repositories and adopt a system at a version.

One inhabitant so far: **The Human Laboratory** (`@thl`).

If you are looking for a portfolio or a product app, it is not here and should
not be added here.

## Tech Stack

- **Runtime**: Bun (package manager + runtime)
- **Framework**: Next.js 16 (App Router) — one app, the docs site
- **UI**: React 19, Tailwind CSS v4
- **Language**: TypeScript 5.9 (strict)
- **Monorepo**: Turborepo
- **Linting/Formatting**: Biome

## Structure

```
systems/
  human-laboratory/
    tokens/          theme.css (source of truth) · base.css · generated/
    ui/              React components + lib/utils.ts
    static/          the report kit: parts/ (authored) + thl.* bundles (generated)
    brand/           wordmark, favicon, OG card
    registry.json    the @thl namespace
    BRAND.md         thesis, voice, non-negotiables
packages/
  token-tools/       parser, emitters, check-roles, validate-palette, smoke-install
  system-template/   bun run new-system
  typescript-config/
apps/
  docs/              the only app — thesis · components · example · report kit
```

**Systems never import each other.** Only `system → packages/*`. That keeps any
individual system extractable.

There is deliberately **no `packages/core`**. A shared component layer designed
before a second system exists would be The Human Laboratory wearing a generic
name. Rule of two.

---

## The contracts

These are what make this a collection rather than several forks. Breaking one is
not a style disagreement.

### 1. Components speak roles, never primitives

Tokens come in two tiers. **Primitives** (`--color-lime`, `--color-obsidian`) are
named by appearance and are a system's private vocabulary. **Roles**
(`--color-accent`, `--color-canvas`) are named by job and carry the same eleven
names in every system.

Anything in `systems/*/ui/` may reference **roles only**. App code and one-off
compositions may use primitives freely.

> **The test:** if you cannot name what a token *does* without naming how it
> *looks*, it is a primitive. `--color-accent` names a job; `--shadow-lime-glow`
> does not.

`check-roles` fails the build on violation. It derives its banned list from
`theme.css`, so adding a primitive guards it automatically.

The eleven roles: `canvas` · `surface` · `line` · `ambient` · `ink` ·
`ink-muted` · `ink-subtle` · `accent` · `accent-ink` · `critical` · `warning`.
Plus one non-colour role, `--shadow-glow`.

### 2. The system version is the atomic unit

Tokens and components ship together at one version. A consumer adopts a version
deliberately rather than receiving token updates live — otherwise a role rename
breaks every project silently.

### 3. Decoration and text are different roles

`--color-ambient` is for grid overlays, idle brackets and rules. **Never text.**

**Any token used for text must clear 4.5:1 against the canvas.** Measured ratios
live beside each token in `theme.css`. Not negotiable per-component — if a label
looks too loud, change the hierarchy or the size, not the contrast.

| Token | Ratio | Use for |
|---|---|---|
| `--color-ink-muted` `#A3A3A3` | 7.62:1 | Body copy — the `body` default |
| `--color-ink-subtle` `#7C7C7C` | 4.59:1 | Labels, metadata, eyebrows |
| `--color-ambient` `#3A3A3A` | — | **Decoration only. Never text.** |

### 4. Base layers must be scopable

`base.css` rules must bind to either `:root` or a `[data-system]` scope, or one
system's opinions leak into another's page in the docs app — **and they must
bind to roles, not primitives**, or they resolve to nothing under a second
system. Both halves are met: the look is scoped to
`[data-system="human-laboratory"]` and reads `canvas` / `ink-muted` / `accent` /
`line`.

Because `base.css` no longer styles `body`, the app names its host system —
`apps/docs` sets `data-system` on `<body>`, and standalone consumers of the
registry `style` item do the same.

> **The document-level boundary.** `color-scheme`, the `*` reset and the page
> scrollbar have no container to move to and stay global. Two systems with
> different colour schemes cannot share a document; the second needs its own
> page. That is a constraint to design around, not a bug to fix.

---

## The token pipeline

`theme.css` is hand-authored and is the single source. `token-tools` emits
everything else:

| Artifact | For |
|---|---|
| `generated/tokens.ts` | docs tables, introspection |
| `generated/tokens.css` | plain `:root` — what a standalone document inlines |
| `generated/theme.scoped.css` | `[data-system]` — per-system skinning in the docs app |
| `generated/tokens.json` | W3C DTCG interchange — Figma, Style Dictionary |
| `generated/safelist.css` | `@source inline()` — see below |
| `ui/lib/tw-merge.generated.ts` | the `extendTailwindMerge` config `cn()` consumes |
| `static/thl.*` | the report-kit bundles |

Regenerate with `bun run --filter=@thl/tokens generate:tokens`; `turbo build`
does it automatically. **Never hand-edit anything under `generated/`, any
`thl.*` bundle, or `tw-merge.generated.ts`.**

### Utilities rendered through a variable

Tailwind v4 scans for **literal** class names. A page that builds one from a
runtime value — `` className={`${token.utility} …`} `` — generates nothing, and
fails silently: `text-6xl` was missing from the served CSS for the whole
refactor while the type-scale table rendered its largest step at inherited size.

`generated/safelist.css` forces every utility the token model declares, and
`apps/docs/app/globals.css` imports it alongside the other `@import`s (CSS
requires imports to precede all other rules). It is generated from `theme.css`,
so it cannot drift — **never hand-keep a safelist.**

### Type scale

`--text-*` is reset, so the scale is **closed**: `micro` through `6xl` are the
only sizes that exist. `text-micro` (10px) is the instrument-label step — reach
for it instead of `text-[10px]`. Label tracking is `tracking-label` (0.2em).

Adding a scale value needs no manual step: `tw-merge.generated.ts` is emitted
from the tokens, so registration is automatic. Without it, `tailwind-merge`
cannot tell a custom font size from a colour and silently drops the colour.

> Class names built at runtime are **not** scanned by Tailwind. A generated
> `text-${token}` produces no CSS on its own — `generated/safelist.css` is what
> makes it work. See "Utilities rendered through a variable" above.

### Layout primitives

- **`PageShell`** owns the horizontal gutter and page measure (`default` ·
  `prose` · `full`). Use it instead of Tailwind's `container`, whose width varies
  by breakpoint. **Never nest it.**
- **`SectionHeader`** is the lime-square eyebrow. Use it rather than rebuilding
  the square-plus-label pattern.

---

## The report kit

Every system ships a pure HTML/CSS tier for standalone documents — no React, no
build step, no network request. It is how any report, audit or spec in a project
that has adopted the system stays on-brand.

**Read [`systems/human-laboratory/static/SKILL.md`](systems/human-laboratory/static/SKILL.md)
before writing an HTML document.** It carries the class vocabulary, the four
diagram forms, the chart rules and the editorial voice.

- **Never re-derive the palette inline.** Copying hex values into a `<style>`
  block is the exact drift the kit exists to prevent.
- **Never link a font, script or stylesheet from a CDN.** Inline or omit — a
  standalone document is usually served under a strict CSP.
- Charts: **four series is the ceiling**, the accent is never a series colour,
  and `validate-palette` runs in lint. Do not relax its thresholds.

---

## Conventions

### TypeScript

- Strict mode always. No `any` — use `unknown` and narrow.
- `interface` for object shapes, `type` for unions/intersections/mapped types.
- Export types alongside implementations; `import type` for type-only imports.
- Files in kebab-case.

### React

- Functional components, `function` declarations for named exports.
- Props interfaces named `<Component>Props`.
- Default to Server Components; `"use client"` only for browser APIs, handlers
  or state, and kept as deep in the tree as possible.
- Composition over configuration.

### Imports

- Package imports: `@thl/ui`, `@thl/tokens`, `@repo/typescript-config`.
- Within a system's `ui/`, relative imports — a registry consumer receives these
  as plain files with no workspace to resolve a scoped package against.
- Order: React/Next, external packages, `@thl/*` and `@repo/*`, then local.

---

## Commands

```bash
bun install
bun run dev                 # docs site on :3001
bun run build               # regenerates token artifacts, then builds
bun run lint                # Biome + check-roles + validate-palette
bun run check               # Biome across the repo
bun run check-types
bun run smoke               # proves the registry is installable
bun run new-system <slug> <ns> ["Name"]
```

**Verify visually.** Headless Chrome needs no extension and catches what source
review cannot:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars --window-size=1440,2600 \
  --virtual-time-budget=8000 --screenshot=out.png http://localhost:3001/
```

---

## Key decisions

| Decision | Choice | Rationale |
|---|---|---|
| Repo purpose | Produces systems, contains no products | A portfolio living in the systems repo is the conflation that started this refactor |
| Token tiers | Primitives + roles, roles-only in components | The contract that lets a component move to another system unchanged |
| Shared core | None, until a second system exists | Rule of two — designed now it would be one system wearing a generic name |
| Distribution | shadcn registry, one namespace per system | Copy-in matches the copy-paste-not-node_modules philosophy; divergence is a feature |
| Token source | `theme.css`, hand-authored, everything generated | Native to Tailwind v4; one source, many targets |
| CSS parser | Hand-rolled, not lightningcss | lightningcss sees zero custom properties inside `@theme` and throws on the namespace-reset syntax |
| Unused tokens | `@theme static` | Hand-authored CSS must be able to rely on a variable existing; measured cost 328 bytes |
| Chart series | Four, validated on all pairs | No fifth colour clears the floors while staying clear of the accent and status hues |
| Text contrast | 4.5:1 floor, enforced by token | Splitting decoration into `--color-ambient` keeps the mood without sacrificing legibility |
| Type scale | Closed and tokenized, incl. `micro` | `--text-*` is reset so it cannot silently fall back to Tailwind's defaults |
| Page measure | `PageShell`, not `container` | Tailwind's `container` is breakpoint-dependent |
| Theming | Dark only | Deferred, not forgotten; the role layer makes adding light mode small |
| Radius | Zero, everywhere | A constraint, not an omission |

---

## Open work

`REFACTOR.md` records how the repo reached this shape, including deviations and
gaps. `REMEDIATION.md` and `.refactor/AUDIT-FINDINGS.md` are independent audits
of what actually landed; treat them as the backlog.

Nothing currently blocks a second system — the scaffold passes build,
check-types, lint, check and test cold, and the base-layer contract is met.

**Still open:** the repo name is unsettled (`imprint_lab` in `package.json`,
`the_human_laboratory` on disk and on the remote, and a `registry.json` homepage
that does not resolve). Settle it **before anything installs from the registry**.
The component coverage gap (input, card, badge, dialog, table) and light mode
remain deliberately out of scope.

## Verification

`.refactor/capture.sh` diffs the CSS a dev server serves against a committed
baseline. It carries **three** signals: `tokens.txt` (custom properties),
`utilities.txt` (class-selector names) and `rules.txt` (selector **plus
normalised declaration body**).

`rules.txt` is the one that matters. The other two carry only *names*, so
anything changing what a rule *does* passes them silently — `cursor: crosshair`
was deleted from the served CSS and both reported "identical". **Do not trust a
"verified" claim citing only the first two**, and run
`./.refactor/self-test.sh`, which asserts each mutation class is still caught.

**CSS diffs are not a substitute for looking.** Headless Chrome needs no
extension:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --disable-gpu --hide-scrollbars --window-size=1440,2400 \
  --virtual-time-budget=9000 --screenshot=out.png \
  http://localhost:3001/systems/human-laboratory/components
```
