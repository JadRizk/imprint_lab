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
    brand/           the mark, its mono and favicon variants, the rules
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

**The version is declared once, in `systems/<slug>/CHANGELOG.md`**, as the newest
`## [x.y.z] — YYYY-MM-DD` heading. Nothing else declares it and nothing else may.
That placement is not decoration: it makes it impossible to bump a version
without writing the entry that says what changed, because they are the same edit.

Everything else is derived, by `token-tools`:

| Derived | Where | For |
|---|---|---|
| `ui/lib/version.generated.ts` | beside `cn()` | the only copy that reaches a consumer's disk |
| report-kit bundle headers | `static/<ns>.*.css` | the no-JS tier, which has nothing to import |
| `version` + `released` on the registry index | stamped at build | "what is current?" |
| `meta.version` on every registry item | stamped at build | the install path — `shadcn add` never reads the index |
| the docs site's version chip and system card | `@thl/ui/lib/version` | read, never transcribed |

> ⚠ **The registry can only advertise a version; it cannot record one.**
> `shadcn add` copies *files* and persists no item metadata, so a version living
> only in `meta` answers "what is current?" and never "what do I have?" — which
> is the question a consumer is actually stuck on. `version.generated.ts` ships
> in the `style` item for exactly that reason. Also: shadcn 3.5.0's
> registry-item schema has **no `version` field** at all; `meta` is the escape
> hatch, verified against a throwaway registry rather than assumed.

**Semver here is about roles, not primitives.** Renaming a role, changing a
component's props or deleting a report-kit class is **major** — a consumer's copy
breaks. Moving `--color-lime` is a **patch**, because nothing in `ui/` is allowed
to reference it. That asymmetry is what the two tiers are for.

`check-version` enforces the whole chain under `lint`: the changelog parses, its
releases descend without duplicates, an `## [Unreleased]` section exists, no
system `package.json` has re-grown a `version` field, and every generated
artifact carries the **current** number. That last one is the staleness check — a
changelog edited without a regenerate is otherwise invisible until someone
installs.

> ⚠ **`../CHANGELOG.md` is in turbo's `inputs` for the token build**, and has to
> be. Measured, not assumed: with it removed, editing the changelog and
> re-running gave `cache hit, replaying logs` and `>>> FULL TURBO` — the bump
> changed no file turbo hashed, so every artifact kept claiming the previous
> version, including the one that ships to a consumer's disk. With it declared,
> the same edit gives `cache miss, executing`.

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

**The ladder answers `prefers-contrast: more`.** At rest it runs 1.23 / 1.69 /
2.69 against the canvas — at or below the threshold of visible for exactly the
people who set that preference, in a system where line is the *only* structure.
The text contract does not cover this: 4.5:1 governs text, while WCAG 1.4.11 asks
3:1 of the visual boundary of a control, and `--color-line` at 1.69:1 is what
bounds an input.

| Role | Rest | `contrast: more` |
|---|---|---|
| `--color-ambient` | 1.23:1 | 2.69:1 |
| `--color-line` | 1.69:1 | **4.59:1** — clears the 3:1 floor |
| `--color-line-strong` | 2.69:1 | 7.62:1 |

All three are promoted so every "outranks" relationship survives — the tiers are
relative to each other, and ambient outranking line is the inversion the ladder
exists to prevent. **Text is deliberately untouched**: it already clears 4.5:1 by
contract, and promoting `ink-subtle` to `ink-muted`'s ratio would merge two roles
and cost the hierarchy that carries the meaning.

The values live in `theme.css` as `--<role>--contrast` companions, beside the
ratios they were measured against. `token-tools` generates the rebinding into
`tokens.css` and `theme.scoped.css` so the report kit and a multi-system page
both get it; `theme.css` carries the same block for a consumer importing it
directly through `ui/styles.css`. Neither copy holds a value, so they cannot
drift. **A contrast companion must reference a primitive**, never a role that is
itself reassigned — `var(--color-line-strong)` inside the media block resolves to
the *promoted* value and collapses the ladder onto one grey.

> This could not live in `base.css`: contract 4 requires that file to bind to
> roles only, and the high-contrast greys are system-specific values.

**The accent is a signal with a budget**, not a texture — a handful of events per
screen. It is not for uniform table columns, scale bars, inline code, card
labels, or hover. If every row is lime, lime distinguishes nothing.
`SectionHeader` is neutral by default and takes `marked` for the one section
carrying the finding. Hover climbs the line ladder instead: hover is a state of
the pointer, not of the machine.

**Floating chrome earns its rule.** A divider separates chrome from the content
it overlaps, so a sticky bar sitting at the top of the page has nothing to
divide — it is simply the first region of the document. Once content is passing
underneath it stops being a region and becomes chrome floating over content,
which is a boundary that outranks its neighbours: `line-strong` at 2px, settling
at `duration-state`. This is the one idea worth taking from Apple's scroll-edge
effects; the rest of that pattern is a translucent blurred bar, which is the
vocabulary this system exists to reject. The bar stays opaque and only the line
reacts. See [`example/sticky-nav.tsx`](apps/docs/app/systems/human-laboratory/example/sticky-nav.tsx).

> The border box is present at 2px in **both** states and only changes colour.
> Growing a real border on stick changes the bar's height in flow and nudges the
> page at the exact moment of sticking — the same reason `Button` carries an
> invisible border box so heights match across a row.

**Glow is emission, not a drop shadow.** A drop shadow claims depth — offset,
soft spread, imaginary sun — and is the vocabulary this system rejects. Glow
claims *energy*: this element is on. Zero offset, bright tight core, thin
falloff. It belongs on focus, the active item, a live readout and a growing
edge. Never on hover.

### 6. Feedback is instant, and time comes off a ladder

Motion is tokenized for the same reason line is: one duration doing every job means motion
carries no information. Four rungs, picked by what the motion **means**:

| Role | Value | Job |
|---|---|---|
| `--transition-duration-ack` | `0ms` | The machine acknowledging input. Any delay here is the delay the whole system is judged by |
| `--transition-duration-state` | `120ms` | A state settling — hover decaying, focus releasing, a press letting go |
| `--transition-duration-transit` | `320ms` | Something entering or leaving the page |
| `--transition-duration-process` | `1200ms` | The machine *doing* something — a reveal, a scan. The one rung where the duration is the content |

**Feedback enters at `ack` and decays at `state`.** Symmetric timing reads as the interface
animating at you; asymmetric timing reads as it answering you.

**Every interactive surface answers on pointer-down**, and the answer is uniform: an accent edge
plus `--shadow-glow`. `:active` is the one state that is unambiguously *live*, which is what
emission is for — so a press costs no new colour. It must differ from **both** rest and hover:
touch has no hover, and before this a button on a phone gave no feedback at all between the tap
and the result.

> ⚠ **The namespace is Tailwind's, not ours.** `duration-*` resolves `--transition-duration-*`.
> A `--duration-*` variable generates **no utility**, and because `@theme static` emits the
> variable anyway, the failure is a class name that silently does nothing. Likewise
> tailwind-merge takes this group through `classGroups`, not `theme` — Tailwind has no
> `--duration-*` namespace, so `theme: { duration: [...] }` is accepted and silently ignored,
> and `duration-500` would stop overriding `duration-state` with nothing reporting it. Both were
> verified against tailwindcss 4.3.3 and tailwind-merge 3.4.0 rather than assumed.

**Reduced motion silences travel, not feedback.** The preference is about
vestibular triggers — things that move, scale or spin — and a colour change is
not one. The report kit's reset used to flatten `transition-duration` to 0.01ms
across `*`, which took every hover, focus and press response with it: the one
signal telling those users a control had answered was removed by a rule aimed at
motion sickness. It now restricts **what may transition** — `color`,
`background-color`, `border-color`, `outline-color`, `box-shadow`, `opacity` —
so anything positional lands instantly while feedback survives at full duration.
Keyframe `animation` stays flattened outright; the scan line is the vestibular
case this preference exists for.

Springs are deliberately absent — overshoot is a claim about mass, the same vocabulary drop
shadows make. Continuity is worth taking from gesture-driven design; bounce is not.

**The ladder reaches JS too.** Framer Motion takes a number of seconds and cannot read a custom
property, so `token-tools` emits [`ui/lib/motion.generated.ts`](systems/human-laboratory/ui/lib/motion.generated.ts)
beside `cn()` — same reason `tw-merge.generated.ts` lives there, since a registry consumer gets
these as plain files with no workspace to resolve `@thl/tokens` against. It ships in the `style`
registry item; a component importing it without that entry would install broken.

Two values stay literal on purpose. `BentoGrid`'s **stagger interval** (0.1s) and `ImageFrame`'s
**pulse period** (2s) are not durations: every rung answers *how long a change takes*, while these
answer *how far apart things start* and *how often a loop repeats*. Inventing rungs for them would
name quantities the ladder does not measure.

### The entrance

An instrument does not grow into place; it switches on. Two beats, and neither is a transform:

1. **Opacity 0 → 1 at `transit`**, staggered by `BentoGrid`.
2. **The edge climbs `ambient` → `line` at `state`**, once the fade has landed.

The second beat is the line ladder used as motion — the card arrives as a dormant outline and only
then takes its place in the hierarchy. It deliberately spends **no accent**: `ImageFrame` can put
lime on its growing edge because there are few frames and the reveal *is* the content, but six
cards each firing lime is the accent becoming texture.

> ⚠ The entrance used to run `scale: 0.95 → 1` — the exact thing hover is forbidden to do, four
> lines away in the same file. A fractional transform lands a hard 1px border off the pixel grid
> and the edge shimmers; at 5% over half a second, on every card, on first view. Verified after the
> change by sampling 171 frames over CDP: `transform` is `none` for the entire entrance.

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
| `ui/lib/version.generated.ts` | the version, from `CHANGELOG.md` — see contract 2 |
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
for it instead of `text-[10px]`.

**`--tracking-*` and `--leading-*` are reset too**, and tracking is declared *per
size step* via Tailwind's `--text-<n>--letter-spacing` companion rather than
applied by hand. So `text-6xl` arrives already tracked, and tracking cannot be
picked by eye at a call site:

| Rung | Value | Steps |
|---|---|---|
| `tracking-display` | `-0.02em` | 4xl · 5xl · 6xl |
| `tracking-tight` | `-0.01em` | 2xl · 3xl |
| `tracking-normal` | `0em` | micro → xl. Declared, not omitted — letter-spacing **inherits**, so a step without one takes the tracking of whatever encloses it |
| `tracking-label` | `0.2em` | uppercase eyebrows and instrument labels |
| `tracking-label-dense` | `0.12em` | the same job where 0.2em will not fit — a chip, an SVG diagram cell |

`--leading-prose` (1.65) is the one leading rung the scale cannot express. It is
1.65 rather than Tailwind's 1.625 because the report kit's body already measured
1.65 — the two tiers disagreed, and one of them was a number nobody picked.

This closed the last open typographic scale. The example hero — the largest type
on the site — carried `tracking-tighter leading-tight`, both Tailwind defaults,
unchanged across three responsive steps from 30px to 60px. `-0.05em` is roughly
2.5x what display type wants and was visibly cramped at every one of them.

> ⚠ **Closing a namespace deletes Tailwind's rungs.** `tracking-tighter`,
> `tracking-wide`, `leading-snug` and the rest now generate **nothing** — the
> same trade `--text-*` already makes, and the same silent-failure shape. A
> reset and the call sites it breaks must land in one commit.
> `tracking-tight` survives as a *name* but is this system's `-0.01em`, not
> Tailwind's `-0.025em`.
>
> The companions are **folded** by `token-tools`. Left unfolded,
> `--text-2xl--letter-spacing` categorises as a font size, takes a row of its own
> in the docs type scale, and emits `text-2xl--letter-spacing` into the safelist
> as a class that does not exist.

The static tier has to name its own rung: `reset.css` sets sizes through
`var(--text-*)` rather than through a utility, so the companions never reach it.
It previously ran one `-0.02em` from `h1` down to `h6` — display tracking on
14px headings.

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

## Releasing a system

Tags are **scoped per system** — `thl/v1.0.0`, never a bare `v1.0.0`. Systems
here evolve on their own timelines, and a flat tag would force a THL release
every time another system moved, which is the coupling `systems/*` exists to
avoid. GitHub's tag filters treat `*` as not matching `/`, so the workflow's
`'*/v*'` pattern catches the scoped form and ignores a flat one.

```bash
# 1. Write the entry. Move what is under [Unreleased] into a new heading:
#      ## [1.1.0] — 2026-09-02
# 2. Regenerate, so every derived artifact catches up.
bun run --filter=@thl/tokens generate:tokens
# 3. The gates. check-version is the one that matters here.
bun run lint && bun run check-types && bun run test && bun run smoke
# 4. Commit, then tag the commit that contains the entry.
git tag thl/v1.1.0 && git push origin thl/v1.1.0
```

The tag push runs [`release.yml`](.github/workflows/release.yml), which resolves
the tag to that changelog entry via `release-notes.mjs` and publishes it as a
GitHub Release. **It refuses if the tag names a version the changelog does not
carry.** That check is the point: the tag is the one artifact in this pipeline
nobody generates — someone types it — so it is the only thing that can name a
version the repository does not contain. Everything else reads the changelog and
therefore agrees with itself by construction.

There is deliberately **no repo-level changelog**. A release here is a statement
about a *system*, which is the unit a consumer adopts; `token-tools` and the
scaffold are not consumer-facing, and a change to either shows up in the systems
that regenerate because of it.

Publishing the docs site is a **separate** workflow on a separate trigger. The
site tracks `main`; a release is a statement about a point in history. Coupling
them would mean either publishing docs only at release time, or being unable to
tag without redeploying.

## The brand

**The mark belongs to the system, not to the house.** `imprint_lab` has no mark
and should not get one until it has more than one inhabitant to be neutral
between — a neutral mark designed now would be system 01 wearing a generic name,
the same argument as `packages/core`. So `@thl`'s icon is scoped to its own route
segment and `/` stays unbranded.

Read [`systems/human-laboratory/brand/README.md`](systems/human-laboratory/brand/README.md)
before touching any of it. The short version:

- The mark is a frame in `--color-line` with one corner in `--color-accent` at
  **twice the weight** — that 1:2 ratio is the line ladder, not a proportion
  chosen by eye. The stroke widths are load-bearing: they are even so the mark
  lands on whole pixels at 16, 24 and 32.
- **The favicon is a different drawing**, not an export. The frame is 1.69:1 and
  stops rendering below ~24px, and a transparent mark vanishes against chrome
  this system does not control — so it drops the frame and carries its own tile.
- **It does not glow.** Emission follows current; a brand mark is not live.
- **There is no wordmark SVG.** This system names no font, so the wordmark is
  *type* — use `Wordmark`, or the snippet in `static/SKILL.md`.
- The namespace `@thl` is **neutral**, not accent: the mark already spent it.

> ⚠ **An SVG comment may not contain `--`.** XML forbids it, and every custom
> property starts with one — so writing `--color-line` in a comment invalidates
> the file and it silently stops loading as `<img>` or as a favicon. It stays
> invisible to anything that *inlines* the SVG into HTML, because HTML parsing is
> lenient. `bun run brand:raster` validates this and fails on it.

The rasters and the app's `icon.svg` are **generated** — by `brand:raster` and
`sync-static.mjs` respectively. The OG card is generated too, from the token
pipeline, in `apps/docs/app/systems/human-laboratory/opengraph-image.tsx`. None
of them is hand-kept, for the same reason the safelist is not.

---

## Skills

Four, and they are loaded at different moments. **Check here before writing a
long prompt explaining how something in this repo works — it is probably already
a skill.**

| Skill | Lives in | Loaded |
|---|---|---|
| `thl-report` | `systems/human-laboratory/static/SKILL.md` | Writing any standalone HTML document |
| `new-system` | `.claude/skills/new-system/` | Adding a system to this repo |
| `release-system` | `.claude/skills/release-system/` | Releasing a version of an existing system — and every "is this a major?" |
| `design-direction` | personal, `~/.claude/skills/` | Deciding a system's thesis, voice and palette — **before** `new-system` |

`new-system` and `release-system` are split by **trigger, not by subject**. A
skill is selected by its description, so an agent asked to cut `@thl v1.1.0`
would never load one described as "stand up a new design system" — folding the
release procedure into it would make it unreachable at the only moment it is
wanted. `new-system` ends at 0.1.0 and hands over.

The rationale for the versioning design stays in contract 2 above; the skill
holds the **classification judgement** — what makes a change major rather than
minor against this system's public surface — which lives in no other file.

**`thl-report` is canonical in `static/`, not in `.claude/skills/`**, because it
ships to consumers as part of the `@thl/report-kit` registry item — a project
that adopts the system receives the instructions alongside the stylesheets.
`.claude/skills/thl-report/SKILL.md` is a **stub that routes to it**, so the kit
is discoverable without the vocabulary existing twice.

The stub duplicates exactly one line — the `description`, which the loader reads
from the stub itself. **Change it in both places or neither.**

> **A note retracted.** An earlier version of this section said symlinking the
> stub "fails silently". That was wrong: the file-symlink probe and the plain
> file that replaced it *both* reported unregistered for several turns, so the
> test measured index-refresh latency rather than symlink resolution. Directory
> symlinks are known to work — `~/.claude/skills/find-skills` and
> `using-git-worktrees` are both symlinks into `~/.agents/skills/`.
>
> A directory symlink (`.claude/skills/thl-report` → `systems/human-laboratory/static`)
> would remove the duplication entirely and is probably the better shape. Confirm
> it registers in a **fresh session** before adopting it; in-session probes are
> not a reliable signal.

Moving the canonical file here and pointing `registry.json` at it also works; it
was not done because `static/SKILL.md` had uncommitted edits in a parallel
session.

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
bun run brand:raster          # regenerate brand PNGs; validates every brand SVG

node packages/token-tools/check-version.mjs          # every system (runs under lint)
node packages/token-tools/release-notes.mjs thl/v1.0.0   # what a tag would publish
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

## Deployment

`apps/docs` is a **static export** published to GitHub Pages at
`https://jadrizk.github.io/imprint_lab/` by
[`.github/workflows/deploy-docs.yml`](.github/workflows/deploy-docs.yml) on every
push to `main`. Pull requests build without publishing, so a broken export is
caught on the PR.

The workflow runs `bun run build` — turbo, not `next build` — so every token
artifact is regenerated before the site is built. Building the app alone would
publish whatever happened to be committed under `generated/`.

### What static export forbids

`output: 'export'` rules out API routes, server actions, middleware, ISR,
`revalidate`, rewrites/redirects/headers, and `next/image` with the default
loader. None are used today; `images.unoptimized` is set so that adding an
`<Image>` fails at review rather than in CI. **Anything needing a server does not
belong in this app** — it is a documentation site and a registry host.

### The subpath is the sharp edge

Pages serves a project site from `/imprint_lab`. **`NEXT_PUBLIC_SITE_URL` — the
full published URL, origin and subpath together — is the only place that is
declared**, and it is declared in the workflow. Three things derive from it and
none of them repeats it:

| Derived | Where |
|---|---|
| `basePath` | `next.config.js`, split off the URL's pathname |
| `metadataBase` | `app/layout.tsx`, via `lib/base-path.ts`'s `siteUrl` |
| registry `homepage` | `scripts/build-registries.mjs`, stamped into the built index |

It is unset in `dev`, where `basePath` collapses to `''` and `siteUrl` falls
back to `http://localhost:3001`. Moving to a custom domain is one edit here plus
a CNAME. This was four independent literals until August 2026, and the comment
in the workflow claimed otherwise — a repo rename would have fixed the deploy
and left the OG card and the registry homepage pointing at a dead origin, with
nothing failing.

Next rewrites `<Link href>`, `next/image` and its own `_next/*` URLs. It does
**not** rewrite a raw `<a href="/thl-catalog.html">`, an `<iframe src>`, or a
hand-written `<link>`/`<script>` pointing into `public/`. Those need
[`lib/base-path.ts`](apps/docs/lib/base-path.ts)'s `asset()`.

> This class of bug is invisible locally — with no basePath in `dev`, an
> unprefixed path resolves correctly and only 404s once deployed. The report page
> had four of them. **Verify an export by serving it under the subpath**, not by
> looking at `dev`:
>
> ```bash
> NEXT_PUBLIC_SITE_URL=https://jadrizk.github.io/imprint_lab bun run build
> mkdir -p /tmp/pages && ln -sfn "$PWD/apps/docs/out" /tmp/pages/imprint_lab
> python3 -m http.server 4321 --directory /tmp/pages
> # then open http://localhost:4321/imprint_lab/
> ```
>
> Set the **whole URL**, not a bare path. `NEXT_PUBLIC_BASE_PATH` is an output of
> `next.config.js`, not an input — exporting it does nothing, and the build it
> produces has no basePath at all. That is a verification step that reports
> success while measuring the wrong artifact, which is worse than not running it.

Do not use `asset()` on a `<Link href>` — Next prefixes those already, and doing
it twice yields `/imprint_lab/imprint_lab/…`.

**`metadataBase` must carry the basePath too.** Next does not apply `basePath` to
metadata URLs, so an origin-only `https://jadrizk.github.io` emits an `og:image`
at `/systems/…` rather than `/imprint_lab/systems/…`. It is the worst member of
this family to catch: nothing renders wrong and nothing 404s in a page you look
at — the card is simply never shown when a link is shared. This is why it reads
`siteUrl` rather than composing an origin with `basePath`: the URL that already
carries both cannot disagree with itself.

---

## Key decisions

| Decision | Choice | Rationale |
|---|---|---|
| Repo purpose | Produces systems, contains no products | A portfolio living in the systems repo is the conflation that started this refactor |
| Token tiers | Primitives + roles, roles-only in components | The contract that lets a component move to another system unchanged |
| Shared core | None, until a second system exists | Rule of two — designed now it would be one system wearing a generic name |
| Distribution | shadcn registry, one namespace per system | Copy-in matches the copy-paste-not-node_modules philosophy; divergence is a feature |
| Hosting | GitHub Pages, static export | The site is documentation and JSON; nothing here needs a server, and the registry host stops being a second vendor to keep alive |
| basePath | One env var, read in config and app | A project site lives at a subpath; hardcoding it breaks `dev` and makes a rename a repo-wide search |
| Token source | `theme.css`, hand-authored, everything generated | Native to Tailwind v4; one source, many targets |
| Version source | The newest heading in the system's `CHANGELOG.md` | One declaration, and the one placement that makes bumping without documenting impossible — they are the same edit |
| Version delivery | Advertised in the registry **and** shipped as a file | `shadcn add` records no metadata, so a version that never lands on disk cannot answer "what do I have?" |
| Tags | Scoped per system, `thl/v1.0.0` | A flat tag would version every system at once, which is the coupling `systems/*` avoids |
| Changelog | Hand-authored, Keep a Changelog | Every document here states reasons; a list generated from commit subjects would read as foreign, and PR #1 shows squashes do not preserve them anyway |
| Release notes | Extracted from the changelog by the tag | A second place to write notes is a second thing to disagree with the first |
| CSS parser | Hand-rolled, not lightningcss | lightningcss sees zero custom properties inside `@theme` and throws on the namespace-reset syntax |
| Unused tokens | `@theme static` | Hand-authored CSS must be able to rely on a variable existing; measured cost 328 bytes |
| Chart series | Four, validated on all pairs | No fifth colour clears the floors while staying clear of the accent and status hues; a fifth category folds into the neutral `--chart-other` |
| Elevation | None — no surface fill | A 1.03:1 step is not subtle, it is absent; line carries every boundary instead |
| Line weight | Four tiers: ambient / line / line-strong / accent | One hairline doing every job is why pages dissolved at squint distance |
| Glow | Emission, not shadow | Zero offset, tight core; follows current (focus, live, growing edge, **press**), never hover |
| Sticky chrome | The rule appears only once content is beneath | A divider separates chrome from what it overlaps; at the top of the page it overlaps nothing |
| High contrast | Promote the whole line ladder, leave text | Line is the only structure here, so `prefers-contrast` is about all of it; promoting text would merge two roles and cost the hierarchy |
| Reduced motion | Restrict *what* transitions, not how long | A colour change is not vestibular, and it was the only feedback these users had |
| Motion | Four-rung duration ladder, no springs | Time was the last dimension left to taste; overshoot is a claim about mass, which is the vocabulary drop shadows make |
| Entrance | Fade, then the edge firms — never a scale | A fractional transform shimmers a hard 1px border for the whole animation; the argument that banned it on hover is stronger at 5% |
| Press feedback | Instant in, decayed out; accent edge + emission | Hover is not feedback — touch has none, so a tap gave nothing between input and result |
| Font weights | 300/500/600/700 have assigned jobs | Only 400 and 700 ever rendered, so the interface read flat even where it was dense |
| Text contrast | 4.5:1 floor, enforced by token | Splitting decoration into `--color-ambient` keeps the mood without sacrificing legibility |
| Type scale | Closed and tokenized, incl. `micro` | `--text-*` is reset so it cannot silently fall back to Tailwind's defaults |
| Tracking | A property of the size, declared per step | A fixed letter-spacing is wrong somewhere by construction; the hero crossed three steps on one value |
| Leading | Per step, plus one `prose` rung | The scale carries the rest; prose is the only job the size cannot imply |
| Page measure | `PageShell`, not `container` | Tailwind's `container` is breakpoint-dependent |
| Prose measure | `64ch`, not a pixel width | The body face is monospaced; every glyph is an `m`, so the comfortable line is 60–72 characters |
| Theming | Dark only | Deferred, not forgotten; the role layer makes adding light mode small |
| Radius | Zero, everywhere | A constraint, not an omission |
| Brand ownership | The system, never the house | A neutral house mark with one inhabitant is system 01 wearing a generic name — the `packages/core` argument again |
| The mark | Frame in `line`, one corner in `accent` at 2× | The 1:2 ratio *is* the line ladder; the mark argues the contract rather than decorating with it |
| Favicon | A separate drawing, not an export | The frame is 1.69:1 and gone by 16px; a transparent mark vanishes on chrome the system does not control |
| Wordmark | Type, not an SVG | The system names no font — outlined letterforms would hard-code one, live `<text>` would fall back silently |

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
scaffold template, and the registry URL `https://jadrizk.github.io/imprint_lab/r/…`.

`the_human_laboratory` is **system 01's name, not the repo's** — the directory
`systems/human-laboratory/` and the `@thl` namespace keep it and must not be
renamed.

The GitHub repo has been renamed to `imprint_lab`. One thing still carries the
old name and **cannot be changed from inside the repo**: the working directory is
`the_human_laboratory`.

**Vercel was connected, but `imprint-lab.vercel.app` never existed.** An earlier
version of this section said Vercel "was never used" — that was wrong, and the
correction matters because it is the difference between a name nobody claimed and
a live integration nobody noticed.

A Vercel project called **`the-human-laboratory-web`** was installed on this repo
through the Vercel GitHub App and built it on push. It has been deleted. The
aspirational-hostname claim still holds, though: that project would have served
`the-human-laboratory-web.vercel.app`, so `imprint-lab.vercel.app` was only ever
a name in this repo's documentation.

**The site is published to GitHub Pages** at `https://jadrizk.github.io/imprint_lab/`
by [`.github/workflows/deploy-docs.yml`](.github/workflows/deploy-docs.yml), and
the registry resolves at `https://jadrizk.github.io/imprint_lab/r/thl/{name}.json`.

> ⚠ **Deleting a Vercel project does not remove its failures from a PR.** It
> posted a `Vercel` **commit status** (the legacy Statuses API, not a check run),
> and a status is immutable once written — GitHub exposes no way to retract one.
> It stays on the SHA it was posted against for good, so a PR keeps showing red
> until its head commit changes. Push any new commit and the check list comes back
> clean.
>
> Deleting the project also does **not** uninstall the GitHub App, which keeps
> repo access and can post again the moment another project is linked. Remove the
> repo from the app's access list to stop it for good. Verified on PR #1: the
> failing status was the only Vercel status across the preceding eight commits, so
> the integration was dormant rather than routinely green.

**The underscore is the brand, and the hyphen was a hostname constraint.**
`imprint-lab` only ever appeared in `imprint-lab.vercel.app` because DNS
hostnames cannot contain underscores. A URL *path* can, so moving to
`/imprint_lab` restores the name the rest of the repo already uses —
`package.json`, the `<title>`, the OG card, and the wordmark that renders
`IMPRINT_LAB // SYSTEMS`. Do not "tidy" it to a hyphen; that would be the
constraint outliving its cause.

> **Renaming the repo after this point breaks the site.** GitHub redirects web
> traffic, git operations, issues and stars on rename — **project-site Pages URLs
> are the one documented exception** and are not redirected. A rename would
> silently 404 both `jadrizk.github.io/imprint_lab/` and the registry URL
> consumers subscribe to. If the name must ever become insulated from this, the
> fix is a custom domain, which is what GitHub recommends for exactly this
> reason.

See [Deployment](#deployment) for what static export constrains.

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

> ⚠ **Client-component behaviour cannot be verified against `dev`.** Measured in
> headless Chrome over CDP: on the dev server **nothing hydrates** — the sticky
> nav, `ImageFrame` and the page's first div all lack React fibers despite 54
> scripts loading, and the console carries `Failed to fetch RSC payload`. The
> same page from `apps/docs/out` hydrates completely. So anything that depends on
> state, effects or events — a scroll reaction, an entrance animation, a press —
> reads as inert in `dev` and proves nothing. **Build the export and serve it.**
> This is the same shape as the basePath trap: a verification step that reports
> a result while measuring the wrong artifact.
>
> Note also that `window.scrollTo()` does not dispatch scroll events in every
> automation context. Use CDP's `Input.synthesizeScrollGesture` for a real one —
> a listener added by hand counted zero events after a `scrollTo` that moved
> `scrollY` to 800.

**CSS diffs are not a substitute for looking.** Headless Chrome needs no
extension:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --disable-gpu --hide-scrollbars --window-size=1440,2400 \
  --virtual-time-budget=9000 --screenshot=out.png \
  http://localhost:3001/systems/human-laboratory/components
```
