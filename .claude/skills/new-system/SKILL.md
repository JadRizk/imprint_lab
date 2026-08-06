---
name: new-system
description: Stand up a new design system inside imprint_lab — scaffold, token pipeline, role contract, report kit, registry and docs wiring — from a direction already decided. Use when adding a system under systems/, running bun run new-system, wiring a system into apps/docs, or verifying that a new system passes every gate. Covers the silent failures specific to this stack and the verification doctrine this repo paid for.
---

# Adding a system to imprint_lab

The mechanical half. The direction — thesis, voice, palette, type, form — is
decided **before** this skill runs, by the `design-direction` skill, and arrives
as two documents.

> **Cost-per-new-system is the metric that decides whether this repo is a
> collection or a folder with one thing in it.** If standing up system 02 means
> hand-building six phases of scaffolding, it will not happen. Everything here
> exists to keep that cost near zero — so when a step is annoying, fix the step
> rather than working around it.

---

## Preflight — do not skip

**1. The direction exists.** `BRAND.md` and `PALETTE.md`, with measured ratios.
If they do not exist, stop and run `design-direction` first. The scaffold ships a
deliberately awful magenta accent and four `TODO`s precisely so that this cannot
be skipped quietly.

**2. The slug and namespace are settled.** Both are expensive to reverse — the
slug lands in `data-system` and in every generated selector; the namespace lands
in the registry, and a registry item is permanent the moment anything installs
it. Ask rather than pick.

**3. Read the role list from code, not from prose.** The authoritative set is
`ROLE_COLOR_NAMES` and `ROLE_OTHER_NAMES` in
[`packages/token-tools/lib/emit.mjs`](../../../packages/token-tools/lib/emit.mjs).
**`CLAUDE.md` has been wrong about this before** and will be again — it described
a repo that had stopped existing six phases earlier, while being loaded into
context every session.

> A colour token that is not in `ROLE_COLOR_NAMES` is a **primitive**, and
> `check-roles` bans it inside `ui/`. So adding a twelfth role is not a
> `theme.css` edit — it is a `theme.css` edit **and** an `emit.mjs` edit. Doing
> only the first produces a role that fails the build the moment a component
> uses it.

---

## Steps

### 1 · Scaffold

```bash
bun run new-system <slug> <ns> "Display Name"
bun install
```

> **Gate:** `systems/<slug>/` exists and the tree matches
> `packages/system-template/new-system.mjs`.

### 2 · Make the decisions real

Replace every placeholder in `systems/<slug>/tokens/theme.css` with the values
from `PALETTE.md`, and **carry the measured ratio across as a trailing comment on
every text token.** Those comments are the enforcement — a ratio written beside a
token is very hard to quietly dim.

Then write `systems/<slug>/BRAND.md` from the direction's prose. It has one
source: the docs thesis page renders this markdown at build time. Transcribing it
into JSX is the drift this repo is built against.

Give the primary form device its full range (see `PALETTE.md`). One hairline is
not a line system — this repo shipped 392 borders at a single weight and the page
dissolved at squint distance.

> **Gate:** no `TODO` remains in `tokens/theme.css` or `BRAND.md`, and every text
> token carries its ratio.

### 3 · Wire it into the docs app

Four edits, and **three of them fail silently**. Read
[`references/wiring.md`](references/wiring.md) before touching `globals.css`.

> **Gate:** the system's page renders in its own skin, and a component of its own
> renders styled — not merely unstyled-but-present.

### 4 · Generate

```bash
bun run --filter=@<ns>/tokens generate:tokens
```

Never hand-edit anything under `generated/`, any bundle in `static/`, or
`ui/lib/tw-merge.generated.ts` / `version.generated.ts`.

The generator reads `CHANGELOG.md` and **refuses to run without it** — the
newest `## [x.y.z] — YYYY-MM-DD` heading is the only declaration of the system's
version, and the scaffold writes the file at `0.1.0`. Do not add a `version`
field to either `package.json`; that is a second declaration, and `check-version`
fails on it.

> **Gate:** running it twice produces no diff. An unstable generator means the
> committed artifacts and the generator disagree, and nobody finds out until a
> build in CI.

### 5 · Enforce

The five tools, and the fixtures that must still defeat nothing. See
[`references/enforcement.md`](references/enforcement.md).

> **Gate:** `check-roles` reports the expected number of guarded primitives — and
> has been **watched failing** on a deliberate violation before being trusted.
> Same for `check-version`: bump the changelog without regenerating and watch it
> catch the stale artifacts, because a version is unusually good at being wrong
> while everything still parses, builds and deploys.

### 6 · Verify

```bash
bun run build && bun run check-types && bun run lint && bun run check
bun run test && bun run smoke
```

Then the two things no script covers: **look at it**, and run the report kit
cold. See [`references/verification.md`](references/verification.md).

> **Gate:** every command green, every route rendered and looked at, and the
> cold-start test run.

---

## The doctrine

Four rules, each of which this repo learned by getting it wrong. The long version
is in [`references/failure-catalogue.md`](references/failure-catalogue.md).

**1 · A clean diff is not a pass.** Ask what the change *should* have produced
before accepting that it produced nothing. Phase 02 reported zero drift while its
entire payload was missing — Tailwind had tree-shaken every unused token.

**2 · Watch the rule fail before trusting that it passes.** `check-roles` was
observed failing on 43 violations, then passing at zero, then failing again on a
single deliberately reintroduced `bg-lime`. **A rule that has only ever passed
has not been tested.**

**3 · Distrust "verified" that cites only a name count.** `.refactor/capture.sh`
carries three signals and only `rules.txt` includes declaration bodies.
`cursor: crosshair` was deleted from the served CSS and the other two reported
"identical" across six phases. Run `./.refactor/self-test.sh`, which asserts each
mutation class is still caught.

**4 · Look at it.** `text-6xl` rendered *smaller* than `text-5xl` on the page
whose only purpose was displaying the type scale, and every automated check
passed for the entire refactor.

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --disable-gpu --hide-scrollbars --window-size=1440,2400 \
  --virtual-time-budget=9000 --screenshot=out.png \
  http://localhost:3001/systems/<slug>/components
```

---

## Scope

**In:** the system, its wiring, its gates.

**Out, deliberately:** `packages/core` — rule of two, and a shared component
layer designed before the second system exists is system 01 wearing a generic
name. Also out: light mode, and the component coverage gap (input, card, badge,
dialog, table).

**Do not fix what you notice in passing.** Note it and move on. Scope creep
inside structural work destroys the ability to verify that nothing broke.
