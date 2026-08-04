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

### Phase 02 — Role layer ✅ DONE

Nine role tokens added; `--color-surface` and `--color-ambient` already carried role names and
role semantics, so aliasing them to themselves would have added a second name for one idea.
Eleven roles total. `--color-critical` and `--color-warning` hold literals rather than aliases —
this system has no appearance-name for either hue, and one consumer does not earn a primitive.

**Reversal: `--radius-*` was not declared.** The plan called for declaring it as `0` for the
sake of system 02. But **zero components use `rounded-*`** — so there is nothing to restructure
later, and five tokens with no consumers is exactly the speculative abstraction Standing Judgment
3 exists to prevent. The first component that needs a radius is when the token gets added.

**Finding: Tailwind v4 tree-shakes unused theme variables.** The first verification pass reported
a clean diff, which looked like success and was actually vacuous — the roles had been defined but
never emitted, because nothing referenced them. Adopting `@theme static` fixes this, and it is
the right default for a design system rather than a workaround:

- The tokens are a *contract*. Hand-authored CSS must be able to rely on a variable existing.
- This was already a latent bug: `image-frame.module.css` reads `var(--color-ambient)` and only
  works today because an unrelated `border-ambient` utility happens to be used elsewhere. Remove
  that utility and the CSS module silently loses its colour.
- Phase 05's `[data-system]` scoping needs every role present regardless of use.
- Cost is ~1KB for 36 tokens.

The tenth token to appear in the diff was `--shadow-lime-glow-lg` — defined in `theme.css` since
before this refactor and never once delivered to a browser. That is the tree-shaking finding
confirming itself.

`@theme` may now carry options, so `token-tools` matches `@theme(\s+[a-z]+)*` rather than
`@theme\s*` — caught by the build failing, not by inspection.

> **Claim:** roles alias primitives exactly, and nothing consumes them yet.
> **Verified:** all seven aliasing roles emit as `var(--color-<primitive>)` and each primitive
> resolves to its expected hex. `utilities.txt` identical at 279 — no component uses a role yet.
> `tokens.txt` +10, **zero removals or changes**. Additions-only is the correct shape for this
> phase; a modification would mean a role had overwritten a primitive.

### Phase 03 — Pipeline ✅ DONE

`packages/token-tools` now parses `theme.css` into a token model and emits five artifacts into
`systems/<system>/tokens/generated/`:

| Artifact | For |
|---|---|
| `tokens.ts` | docs tables, introspection |
| `tokens.css` | plain `:root` — what an HTML report inlines |
| `theme.scoped.css` | `[data-system="…"]` — per-system skinning in `apps/docs` |
| `tokens.json` | W3C DTCG — Figma, Style Dictionary |
| `tw-merge.ts` | `extendTailwindMerge` config, consumed by `cn()` |

**Deviation: lightningcss is not used.** It parses `theme.css` without complaint, but treats
`@theme` as an unknown at-rule — a `Declaration` visitor sees **zero** custom properties inside
it, and `--color-*` is re-emitted as `--color- * `. A real CSS parser buys nothing here. What it
would have bought is robustness against comments and multi-line values, and `lib/parse.mjs`
handles both directly: comments stripped, declarations split on `;` at brace depth zero.

`var()` chains resolve only for tokens this file defines. `--font-sans: var(--font-sans-face,
sans-serif)` survives intact, because `--font-sans-face` is the consumer's contract and
flattening it to the fallback would break font wiring.

`cn()` no longer hand-keeps its scale list — it imports the generated config, so adding a scale
value to `theme.css` registers it automatically. Emitting the whole scale rather than a diff
against Tailwind's defaults: redundancy is harmless, omission is the bug.

> **Claim:** the five emitters agree with the source.
> **Verified:**
> - Old `tokens.generated.ts` vs new `tokens.ts`: 36 tokens both sides, **zero changed, zero
>   added** — every name→value pair preserved across the rewrite.
> - `tokens.css` vs browser-computed values: **45 exact, 2 equivalent** (`rgba(223,255,0,0.3)`
>   against `#dfff004d` — Lightning CSS's minifier, same colour).
> - `cn()` behaviour tested directly, since a class-merge regression would never show up in a
>   CSS diff: `text-micro text-lime` keeps both, competing sizes and colours resolve last-wins.
> - `capture.sh --compare` unchanged at 120 / 279.
>
> **Bug the cross-check caught:** `tokens.css` was emitting `--text-micro: 0.625rem / 1rem`. That
> folding is a docs-table convenience, and as CSS it is an invalid font size — every report
> inlining the file would have had a broken type scale. The CSS emitters now take raw
> declarations rather than the token model.

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

**Re-baseline after each accepted phase.** Once a phase's diff has been reviewed and accepted,
run `./.refactor/capture.sh` (no flag) to promote the current state to the baseline, and commit
it with that phase. Otherwise diffs accumulate across phases and the check becomes unreadable
noise that nobody reads — which is the same as having no check.

**A clean diff is not automatically a pass.** Phase 02 reported zero drift while its entire
payload was missing, because Tailwind had tree-shaken the unused tokens. Ask what the change
*should* have produced before accepting that it produced nothing.

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
