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
.claude/
  skills/new-system/ how to add a system here — the only part of .claude tracked
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

The eleven roles: `canvas` · `ambient` · `line` · `line-strong` · `ink` ·
`ink-muted` · `ink-subtle` · `accent` · `accent-ink` · `critical` · `warning`.
Plus two non-colour roles, `--shadow-glow` and `--shadow-glow-strong`.

There is deliberately **no `surface`**. It measured 1.03:1 against the canvas and
never rendered; pure black only reaches 1.14:1 here, so a panel cannot be made
perceptibly darker and the only visible fill is a lighter grey box — which is
elevation. Panels are bounded by line. See contract 5.

### 2. The system version is the atomic unit

Tokens and components ship together at one version. A consumer adopts a version
deliberately rather than receiving token updates live — otherwise a role rename
breaks every project silently.

### 3. Decoration and text are different roles

`--color-ambient` is for grid overlays, idle brackets and rules. **Never text.**
This includes `//` separators in an eyebrow — two shipped report templates used
it as a text colour before August 2026.

**Any token used for text must clear 4.5:1 against the canvas.** Measured ratios
live beside each token in `theme.css`. Not negotiable per-component — if a label
looks too loud, change the hierarchy or the size, not the contrast.

| Token | Ratio | Use for |
|---|---|---|
| `--color-ink-muted` `#A3A3A3` | 7.62:1 | Body copy — the `body` default |
| `--color-ink-subtle` `#7C7C7C` | 4.59:1 | Labels, metadata, eyebrows |
| `--color-ambient` `#242424` | — | **Decoration only. Never text.** |

Severity reads by luminance on this ground, so `--color-warning` `#C86A00`
(5.04:1) must stay **darker** than `--color-critical` `#FF4A4A` (5.78:1). It
shipped at `#FF8A00` / 8.11:1 and shouted 1.4x louder than the colour meaning
"this is worse".

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

### 5. Line carries the hierarchy, and the accent has a budget

This system draws structure with line and nothing else, so line needs the range
elevation would otherwise provide. Four tiers, picked by what a boundary
**means** — never by taste:

| Role | Weight | Ratio | Job |
|---|---|---|---|
| `--color-ambient` `#242424` | 1px | 1.23:1 | Subdivision *inside* a panel — table rules, grid overlays |
| `--color-line` `#3A3A3A` | 1px | 1.69:1 | The edge *of* a thing — card, panel, frame, input. The default |
| `--color-line-strong` `#585858` | 2px | 2.69:1 | A boundary that outranks its neighbours — section divisions, selected edge |
| `--color-accent` `#DFFF00` | 2px | 16.83:1 | Live state — focus, the growing edge, the finding |

Ambient is **darker** than line on purpose. Decoration that outranks the
structure containing it is the inversion this system shipped with: ambient was
`#3A3A3A` against a `#333333` line, so an `ImageFrame`'s grid overlay drew
brighter than the frame around it.

> **The squint test.** Blur the page until you cannot read it. What survives
> should be what matters. Before this ladder, 392 of the components page's
> borders were the same 1px at 1.52:1 — nothing outranked anything, and whole
> sections vanished.

**The accent is a signal with a budget**, not a texture — a handful of events per
screen. It is not for uniform table columns, scale bars, inline code, card
labels, or hover. If every row is lime, lime distinguishes nothing.
`SectionHeader` is neutral by default and takes `marked` for the one section
carrying the finding. Hover climbs the line ladder instead: hover is a state of
the pointer, not of the machine.

**Glow is emission, not a drop shadow.** A drop shadow claims depth — offset,
soft spread, imaginary sun — and is the vocabulary this system rejects. Glow
claims *energy*: this element is on. Zero offset, bright tight core, thin
falloff. It belongs on focus, the active item, a live readout and a growing
edge. Never on hover.

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

## Skills

Three, and they are loaded at different moments. **Check here before writing a
long prompt explaining how something in this repo works — it is probably already
a skill.**

| Skill | Lives in | Loaded |
|---|---|---|
| `thl-report` | `systems/human-laboratory/static/SKILL.md` | Writing any standalone HTML document |
| `new-system` | `.claude/skills/new-system/` | Adding a system to this repo |
| `design-direction` | personal, `~/.claude/skills/` | Deciding a system's thesis, voice and palette — **before** `new-system` |

**`thl-report` is canonical in `static/`, not in `.claude/skills/`**, because it
ships to consumers as part of the `@thl/report-kit` registry item — a project
that adopts the system receives the instructions alongside the stylesheets.
`.claude/skills/thl-report/SKILL.md` is a **stub that routes to it**, so the kit
is discoverable without the vocabulary existing twice.

> A symlink was tried first and **fails silently**: the loader does not follow
> one, so the file resolved on disk while the skill stayed unregistered. If you
> tidy that stub into a symlink, you will quietly un-register the skill.

The stub duplicates exactly one line — the `description`, which the loader reads
from the stub itself. **Change it in both places or neither.** The real fix is to
move the canonical file into `.claude/skills/thl-report/` and point
`registry.json` at that path, which removes the duplication; it was not done
because `static/SKILL.md` had uncommitted edits in a parallel session.

> ⚠ **The report kit's instructions are not auto-discoverable in a consuming
> project.** The registry lands `SKILL.md` at `~/thl/SKILL.md`, which is not a
> skills directory, so an agent there must be pointed at it by hand. The
> cold-start test that validated the kit was run by handing the agent the file
> explicitly — so it proved the *content* is sufficient, not that the *delivery*
> works. Retargeting it to `~/.claude/skills/thl-report/SKILL.md` would fix this
> and is additive, but changes a published registry item: decide it before
> anything installs from the registry, not after.

`design-direction` is deliberately outside this repo — it is stack-agnostic and
used on projects that have nothing to do with imprint_lab. The cost is that it
is **not version-controlled with anything**; it exists on one machine.

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

**Adding a system: use the `new-system` skill, not the bare command.** The
scaffold emits structure and deliberately refuses to invent an aesthetic — it
ships a magenta accent and four `TODO`s so the first act is a real decision.
[`.claude/skills/new-system/`](.claude/skills/new-system/SKILL.md) wraps it with
the parts the command cannot do: the four `globals.css`/`systems.ts` edits
(**three of which fail silently**), the adversarial fixtures the enforcement
tools must still defeat, and the gate list. Its
[`references/failure-catalogue.md`](.claude/skills/new-system/references/failure-catalogue.md)
is the catalogue of everything in this stack that fails while reporting success.

The direction — thesis, voice, palette, type, form — is decided *before* that, by
the `design-direction` skill, which is personal rather than repo-local. It
outputs `BRAND.md` and `PALETTE.md`; `new-system` refuses to start without them.

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
| Chart series | Four, validated on all pairs | No fifth colour clears the floors while staying clear of the accent and status hues; a fifth category folds into the neutral `--chart-other` |
| Elevation | None — no surface fill | A 1.03:1 step is not subtle, it is absent; line carries every boundary instead |
| Line weight | Four tiers: ambient / line / line-strong / accent | One hairline doing every job is why pages dissolved at squint distance |
| Glow | Emission, not shadow | Zero offset, tight core; follows current (focus, live, growing edge), never hover |
| Font weights | 300/500/600/700 have assigned jobs | Only 400 and 700 ever rendered, so the interface read flat even where it was dense |
| Text contrast | 4.5:1 floor, enforced by token | Splitting decoration into `--color-ambient` keeps the mood without sacrificing legibility |
| Type scale | Closed and tokenized, incl. `micro` | `--text-*` is reset so it cannot silently fall back to Tailwind's defaults |
| Page measure | `PageShell`, not `container` | Tailwind's `container` is breakpoint-dependent |
| Prose measure | `64ch`, not a pixel width | The body face is monospaced; every glyph is an `m`, so the comfortable line is 60–72 characters |
| Theming | Dark only | Deferred, not forgotten; the role layer makes adding light mode small |
| Radius | Zero, everywhere | A constraint, not an omission |

---

## Open work

`REFACTOR.md` records how the repo reached this shape, including deviations and
gaps. `REMEDIATION.md` and `.refactor/AUDIT-FINDINGS.md` are independent audits
of what actually landed; treat them as the backlog.

Nothing currently blocks a second system — the scaffold passes build,
check-types, lint, check and test cold, and the base-layer contract is met.

### Naming — settled

**The repo is `imprint_lab`.** Do not re-open this. Everything in code and docs
already says so: `package.json`, `registry.json`, `README.md`, `REFACTOR.md`, the
scaffold template, and the registry URL `https://imprint-lab.vercel.app/r/…`.

`the_human_laboratory` is **system 01's name, not the repo's** — the directory
`systems/human-laboratory/` and the `@thl` namespace keep it and must not be
renamed.

Two things still carry the old name, and **neither can be changed from inside the
repo** — they need doing by hand:

1. The git remote is `github.com/JadRizk/the_human_laboratory`.
2. The working directory is `the_human_laboratory`.

And one thing is aspirational rather than wrong: `https://imprint-lab.vercel.app`
is the intended registry host and is referenced consistently, but **nothing is
deployed there yet**, so `shadcn add @thl/button` fails against it today. Deploy
`apps/docs` before telling anyone to install from the registry — a published
registry item advertising a dead homepage is the one part of this that is hard to
walk back.

**Also out of scope, deliberately:** the component coverage gap (input, card,
badge, dialog, table) and light mode.

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
