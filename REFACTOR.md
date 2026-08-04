# REFACTOR.md — `imprint_lab`

Working spec for turning this repo from *a portfolio that contains a design system* into
**a house that publishes several**. The Human Laboratory becomes inhabitant #1, not the trunk.

Companion report: the rendered version of this plan lives as an artifact. This file is the
one that executes — each phase below is a session's worth of work.

**Baseline commit:** `47588b3` (contrast floor, closed type scale, unified primitives)

---

## 0. How to use this document

Each phase is one session. Start it with:

> Execute Phase `<N>` from `REFACTOR.md`.

Then **stop**. Do not chain phases. The verification for each phase must pass and be reviewed
before the next begins — the failure mode this avoids is a subtle loss in an early phase
becoming archaeology by a later one.

One branch and one commit per phase, so any phase reverts without unwinding the others.

---

## 1. Current state

Already landed in `47588b3`, so **not** to-do items:

- `--text-*` is reset and the scale is explicit and closed, including `--text-micro` (10px).
- `--tracking-label` (0.2em) exists; stop hand-picking `tracking-widest` for eyebrows.
- `--color-ambient` `#3A3A3A` exists as a **decoration-only** token.
- `--color-text-tertiary` raised to `#7C7C7C` (4.59:1) so labels clear the contrast floor.
- `--color-text` `#8E8E93` removed — it had no consumers.
- `cn()` carries an `extendTailwindMerge` config; custom scale names must be registered there
  or `tailwind-merge` silently drops colours that collide with font sizes.
- `PageShell` and `SectionHeader` exist as layout primitives.

Components in scope for the port: `Button`, `BentoCard`, `BentoGrid`, `ImageFrame`,
`PageShell`, `SectionHeader`.

### Resolved — why token CSS is excluded from Biome

The old config excluded `packages/tailwind-config` wholesale, which read like a preference.
It isn't: **Biome 2.2's CSS parser cannot parse Tailwind v4's namespace-reset syntax.**

```
--color-*: initial;
          ^ expected `,` but instead found `*`
```

One such line cascades into 399 parse errors across the file. `noUnknownAtRules: off` does not
help — that silences a *lint* rule, while this fails in the *parser*. `@theme`, `@utility` and
`--text-x--line-height` all parse fine on their own; the asterisk is the sole blocker.

So the exclusion is now narrow and reasoned, rather than a whole dark directory:

| Excluded | Why |
|---|---|
| `systems/*/tokens/theme.css` | Parser limitation above. Revisit when Biome supports it. |
| `systems/*/tokens/tokens.generated.ts`, `systems/*/tokens/generated` | Generated. Formatting them churns — verified: the formatter's output is reverted by the next `generate:tokens` run. |
| `.refactor` | Captured build output, not source. |

Everything else in `tokens/` is now linted, including `base.css` — which the old blanket
exclusion had been hiding.

---

## 2. Target structure

```
imprint_lab/
├── systems/                          # self-contained · no cross-imports between systems
│   └── human-laboratory/
│       ├── registry.json             # namespace @thl · registry:style · extends: none
│       ├── tokens/
│       │   ├── theme.css             # SOURCE OF TRUTH — primitives + roles
│       │   ├── base.css              # opinions, selector-scopable
│       │   └── generated/            # never hand-edited
│       │       ├── theme.scoped.css  # [data-system="…"] — for apps/docs
│       │       ├── tokens.css        # plain :root — for HTML reports
│       │       ├── tokens.json       # DTCG — for Figma
│       │       ├── tokens.ts         # typed — for docs tables
│       │       └── tw-merge.ts       # extendTailwindMerge config
│       ├── ui/                       # React · roles only · lint-enforced
│       ├── static/                   # pure HTML/CSS tier
│       │   ├── thl.css               # tokens + base + ~15 primitives · zero deps
│       │   ├── thl.fonts.css         # optional · Space Grotesk as data URI
│       │   ├── thl.chart.css         # axes · grids · series palette · sparklines
│       │   ├── catalog.html          # every class rendered · copy-paste ready
│       │   ├── report.html           # starter skeleton
│       │   └── SKILL.md              # agent instructions
│       ├── brand/                    # wordmark · favicon · OG card
│       ├── BRAND.md
│       └── SKILL.md
├── packages/
│   ├── token-tools/                  # parser + 5 emitters · shared day one
│   ├── system-template/              # scaffold for `bun run new-system`
│   └── typescript-config/
└── apps/
    └── docs/                         # THE SHOWCASE — every system in its own skin — and registry host
```

There is deliberately **no `packages/core`**. The shared component layer is the abstraction we
would get wrong today; designed now it would be The Human Laboratory wearing a generic name.
Rule of two — wait for system 02 to say what is actually common.

---

## 3. The four contracts

These are what make this a collection rather than four forks. They migrate into `CLAUDE.md`
as each phase lands (see §7).

### 3.1 Components speak roles, never primitives

Anything in `systems/*/ui/` may reference only role tokens — `bg-canvas`, `text-accent`,
`border-line`. Never `bg-lime`. App code and one-off compositions stay free to use primitives.

**A Biome rule fails the build on violation.** Without enforcement this is a wish.

### 3.2 The system version is the atomic unit

Tokens and components ship together at one version. A consumer adopts a version deliberately
rather than receiving token updates live — otherwise a role rename breaks every project
silently, which is unacceptable once systems evolve on their own timelines.

### 3.3 Decoration and text are different roles

`--color-ambient` is for grid overlays, idle brackets, rules. **Never text.** Text roles carry
a 4.5:1 floor against the canvas. Every system feels the pull to dim a label until it
disappears; splitting the tokens makes that impossible rather than merely discouraged.

### 3.4 Base layers must be scopable

`base.css` rules are authored so they can bind to either `:root` or `[data-system="…"]`.
Otherwise THL's crosshair cursor follows you into system 02's documentation. **Enforced from
system #1** — retrofitting across four is miserable.

---

## 4. Role vocabulary v1

Reverse-engineered from what the six components actually reference. **Expected to need revision
when system 02 arrives** — a system built on elevation rather than borders will want shadow
roles THL has no use for. That revision is cheap precisely because only `ui/` touches these.

| Role | Utility | THL maps to | Job |
|---|---|---|---|
| `--color-canvas` | `bg-canvas` | obsidian `#0F0F0F` | Page ground |
| `--color-surface` | `bg-surface` | `#0A0A0A` | Panels, table headers, insets |
| `--color-line` | `border-line` | steel `#333333` | Structural hairline |
| `--color-ambient` | `border-ambient` | `#3A3A3A` | Decoration only. **Never text.** |
| `--color-ink` | `text-ink` | white `#FFFFFF` | Headings, emphasis |
| `--color-ink-muted` | `text-ink-muted` | `#A3A3A3` · 7.62:1 | Body copy |
| `--color-ink-subtle` | `text-ink-subtle` | `#7C7C7C` · 4.59:1 | Labels, metadata, eyebrows |
| `--color-accent` | `bg-accent` `text-accent` | lime `#DFFF00` | Signal — **and success** |
| `--color-accent-ink` | `text-accent-ink` | black `#000000` | Text on the accent |
| `--color-critical` | `text-critical` | `#FF4A4A` | **New.** Errors, destructive |
| `--color-warning` | `text-warning` | `#FF8A00` | **New.** Orange, not amber |

**Success has no token.** The codebase already renders `NOMINAL`, `RENDERING` and
`IMG_SRC_LOADED` in lime. A green would duplicate that and collide with the accent.

**Warning is orange, not amber.** Amber sits too close to lime's yellow-green on a dark ground
and reads as accent. Permanent constraint of a lime-accented system, not a preference.

Non-colour roles: declare `--radius-*` explicitly as `0` (so system 02 can be rounded without
restructuring). `--text-*`, `--tracking-label`, `--font-sans` / `--font-mono` already landed.

Shadows stay **primitives** — `--shadow-lime-glow` names an appearance, not a job. Roles-only
components simply do not use them. Same for the `.scan-line` utility.

---

## 5. Phases

### Phase 00 — Prerequisite ✅ CLEARED

The contrast/type-scale/layout-primitive work landed in `47588b3`. Nothing blocks Phase 01.

### Phase 01 — Restructure

Move everything, change nothing.

- Rename the repo to `imprint_lab`.
- `packages/tailwind-config/` → `systems/human-laboratory/tokens/`
- `packages/ui/src/` → `systems/human-laboratory/ui/`
- Split `theme.css` into `theme.css` (tokens) + `base.css` (opinions).
- Scaffold `packages/token-tools/` around the existing generator, logic unchanged for now.
- Use `git mv` so history follows.

> **Claim:** nothing changed but paths.
> **Falsify it:** diff the baseline capture (§6) against the same routes afterwards. Any delta
> means an import or token was lost. `git log --follow` must still trace every moved file.

### Phase 02 — Role layer

- Layer the 11 roles above the existing primitives in `theme.css`.
- Add `--color-critical` and `--color-warning`.
- Declare `--radius-*` explicitly as `0`.

> **Claim:** roles alias primitives exactly.
> **Falsify it:** each role must resolve to the identical computed value as the primitive it
> points at. Nothing consumes roles yet, so the rendered output must still be unchanged — if it
> moved, a role overwrote something.

### Phase 03 — Pipeline

- Replace the regex parser in `token-tools` with lightningcss, resolving `var()` chains.
- Build the five emitters.
- Wire as the `build` task so `turbo build` regenerates everything.

> **Claim:** five emitters agree with the source.
> **Falsify it:** values in `tokens.css` must equal what the browser computes from `theme.css`.
> Diff new `tokens.ts` against the old `tokens.generated.ts` — additions only, never a changed
> value.

### ⏸ CHECKPOINT — review the role vocabulary before components move

Phases 01–03 are mechanical and interlocking, so they may run as one session. **Stop here.**
Renaming a role after Phase 04 means sweeping six components; before it, it is a one-line edit.

### Phase 04 — Port

- **Land the Biome lint rule first.** Watch it fail against current code, *then* port until it
  passes. This turns the phase from "trust the convention" into "the build says when it's done."
- Port `Button`, `BentoCard`, `BentoGrid`, `ImageFrame`, `PageShell`, `SectionHeader`.
- Expect friction: `image-frame.module.css` reaches straight for `--color-lime` and
  `--shadow-lime-glow`.

> **Claim:** roles-only changed nothing visible.
> **Falsify it:** diff against baseline again — this is the phase most likely to drift. Then
> break the rule on purpose: put `bg-lime` in a `ui/` component and confirm the build fails.
> **A lint rule that has never failed hasn't been tested.**

### Phase 4.5 — Report kit

- `thl.css` — ~15 report primitives, written against roles, zero dependencies, small enough to
  inline into a `<style>` block. Ship with system-font fallbacks.
- `thl.fonts.css` and `thl.chart.css` as separate opt-in layers.
- `catalog.html`, `report.html`, `SKILL.md`.
- Register as `@thl/report-kit`.

Load the `dataviz` skill before writing `thl.chart.css`. Deriving 5–6 distinguishable series
colours from a palette whose only accent is a high-chroma lime, on near-black, without any of
them reading as "the accent," is the hard part.

> **Claim:** an agent can use it cold.
> **Falsify it:** fresh project, only `thl.css` and `SKILL.md`, no conversation history — ask
> for a report. If the output isn't recognisably The Human Laboratory, **the SKILL.md is wrong,
> not the agent.** This is the only test that matters here, and it is a judgment call by design.

### Phase 05 — Docs + registry

- `apps/docs` — the showcase. Components, every variant, token tables, swatches, spacing,
  effects, per system, with `[data-system]` skinning.
- Imports `systems/*/ui/` **directly**, not via the registry, so docs never lag the source.
- `registry.json` declaring `@thl` as `registry:style` with `extends: "none"`.
- `shadcn build` → `public/r/*.json`, served from the same deploy.
- `bun run new-system <name>` scaffold.
- Deployed publicly; the repo stays private. Registry served without auth so `shadcn add` needs
  no token in consuming projects. Hostnames cannot contain underscores — the deploy will be
  `imprint-lab.*`, which does not affect the repo or git-dep path.

> **Claim:** distribution works and skins don't leak.
> **Falsify it:** `shadcn add @thl/button` into a scratch project must yield a working component
> with no manual fixes. Two systems on one page must not bleed — check the cursor, the scrollbar
> and the body font, the base-layer rules most likely to escape scope.

### Phase 06 — Evict

- `apps/web` → its own repo.
- Adds `@thl` to `components.json`, installs from the registry.
- `imprint_lab` is left with no product code — only systems, tooling and the showcase.

> **Claim:** the portfolio survives on installed code.
> **Falsify it:** it builds from registry-installed components and renders identically. **If it
> needs even one manual patch, the registry manifest is incomplete** — fix the manifest, not the
> portfolio.

---

## 6. Baseline

Reference capture for the pixel-identical claims in Phases 01, 02 and 04, stored in
`.refactor/baseline/`.

Regenerate or compare with the dev server running:

```bash
bun run dev --filter=web            # or: cd apps/web && bunx next dev --port 3117
bun run .refactor/capture.sh        # writes/compares HTML + compiled CSS per route
```

Routes covered: `/`, `/design-system`, `/demo`.

The CSS diff is the more precise signal — it catches a lost token or a dropped utility exactly,
where a screenshot only catches it if the loss happens to be visible. Do both.

---

## 7. Standing judgments

The phases say what changes. These say where to think rather than follow.

1. **Pixel-identical is the default expectation.** Phases 01–04 change structure, not
   appearance. Any visible difference is a regression until proven a decision. If something
   looks *better* afterwards, that is still a finding to surface, not a bonus to keep quietly.

2. **If you can't name the job without naming the look, it isn't a role.** `--color-accent`
   names a job. `--shadow-lime-glow` names an appearance — it stays a primitive.

3. **A role with one consumer isn't a role yet.** Bias toward fewer. Adding later is a one-line
   edit; removing after six components depend on it is a sweep. The vocabulary should feel
   slightly too small when Phase 02 ends.

4. **Prefer deleting to porting.** If something has no consumer, it does not earn a seat in the
   new structure.

5. **Don't fix what you notice in passing.** Missing components, light mode, `ImageFrame`'s
   opinionated API — all real, all out of scope. Note them and move on. Scope creep inside a
   structural refactor destroys the ability to verify that nothing broke.

6. **Stop before anything expensive to reverse.** Role names before Phase 04. Registry item
   names once anything has installed them. The repo name. Ask rather than pick.

---

## 8. Staged `CLAUDE.md` additions

Apply each block to `CLAUDE.md` as its phase lands — not before, so the file never describes a
structure that doesn't exist yet.

**After Phase 01:**

> ### Repository Purpose
> `imprint_lab` produces design systems; it does not contain products. Each system under
> `systems/<name>/` is self-contained — tokens, components, static report kit, brand, docs
> content — and must never import from another system. Shared tooling lives in `packages/`.

**After Phase 02:**

> ### Role Tokens
> Colour tokens come in two tiers. **Primitives** (`--color-lime`, `--color-obsidian`) are named
> by appearance and are system-specific. **Roles** (`--color-accent`, `--color-canvas`) are named
> by job and carry the same names in every system.
>
> If you cannot name what a token *does* without naming how it *looks*, it is a primitive.

**After Phase 04:**

> ### The Roles-Only Rule
> Components in `systems/*/ui/` may reference **only** role tokens. `bg-lime` in a component is
> a build failure; `bg-accent` is correct. App code and one-off compositions may use primitives
> freely. This is what lets a component move to another system unchanged.

**After Phase 4.5:**

> ### Static Report Kit
> Any HTML report, audit or standalone document must use `systems/<system>/static/<system>.css`
> rather than hand-rolled CSS. See its `SKILL.md`. Never re-derive the palette inline — that is
> the drift this kit exists to prevent.

---

## 9. Scope boundaries

**Not in scope:**

- No `packages/core` — rule of two.
- No system 02. This builds the room, not the occupant.
- No light mode. Dark-only stays policy; the role layer makes adding it later small.
- No new components. The coverage gap (input, card, badge, dialog, table) is real but separate,
  and cheaper to close after the contract exists.
- No React Native emitter. Web-only; the emitter layer stays pluggable anyway.
- No print stylesheet, no slide layouts.
- The portfolio is the only thing evicted. `apps/docs` stays and grows.

**Risks accepted:**

- Role vocabulary v1 will be revised at system 02. The lint rule keeps that a mechanical sweep.
- The repo name becomes permanent once a project installs from it — settled in Phase 01.
- Registry items are copied, not linked. Consumers hold snapshots and update by re-running
  `shadcn add`. Intended trade.
- Component code is readable via the public registry JSON. The repo, brand files and docs source
  stay private.
