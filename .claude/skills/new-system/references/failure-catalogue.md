# Failure catalogue

Every entry here actually happened in this repo. They are listed by **symptom**,
because that is how you will meet them.

The common shape: **the thing that failed reported success.** Almost nothing here
announced itself.

---

## Silent failures in this stack

### A token is defined and never reaches the browser

**Symptom:** the diff is clean and the feature is missing. A phase reported zero
drift while its entire payload was absent.

**Cause:** Tailwind v4 tree-shakes unused theme variables. Nine roles were
defined, nothing referenced them yet, and none were emitted.

**Fix:** `@theme static`. It is the right default for a design system rather than
a workaround — the tokens are a *contract*, and hand-authored CSS must be able to
rely on a variable existing. Measured cost: **328 bytes** for 36 tokens.

**The tell that confirmed it:** the tenth token to appear when `static` was
adopted had been defined since before the refactor and had never once been
delivered to a browser.

### A class built from a variable produces no CSS

**Symptom:** one row of a table renders at inherited size. `text-6xl` occurred
**0 times** in the built CSS while `text-micro`, `text-xs` and `text-5xl`
occurred 3 times each — those only because their literal names happened to appear
elsewhere in the repo.

**Cause:** Tailwind scans for **literal** class names. `` className={`${token.utility}`} ``
generates nothing.

**Fix:** `generated/safelist.css`, imported from `globals.css` alongside the
other `@import`s. Generated from `theme.css`, so it cannot drift. **Never
hand-keep a safelist.**

### A component silently loses its colour

**Symptom:** `cn()` drops a colour class. `<Button variant="tag" size="sm">`
renders uncoloured.

**Cause:** `tailwind-merge` cannot tell `text-micro` (a font size) from
`text-accent` (a colour) unless told about custom scale names — it lumps both
into the text-colour group and drops the real colour.

**Fix:** `tw-merge.generated.ts`, emitted from the tokens, so adding a scale value
registers automatically.

### A CSS module's colour depends on an unrelated page

**Symptom:** removing a utility from an app page silently breaks a component's
stylesheet.

**Cause:** `image-frame.module.css` reads `var(--color-ambient)` and only
resolved because an unrelated `bg-ambient` utility happened to be used elsewhere.
Same root cause as tree-shaking, different disguise.

### A system renders completely unstyled, with nothing reported

**Cause:** the `@source` line for that system is missing from `globals.css`. It
compiles, it renders, no error anywhere.

### A registry item installs and does not work

**Symptom:** typecheck passes in the workspace, breaks for a consumer.

**Causes, both real:** a scoped-package import (`@thl/tokens/tw-merge`) that a
consumer has no workspace to resolve; and a registry `target` that does not
mirror the source layout, so `../lib/utils` resolves outside the namespace.

**And the smoke test's own false negative:** deleting a CSS module from the
manifest passed, because the ambient `declare module '*.module.css'` any real
project has makes a missing stylesheet resolve happily. The
every-relative-import-resolves-to-a-shipped-file check exists because of it.

---

## Instrument failures

### The CSS diff cannot see what a rule does

`cursor: crosshair` → `cursor: default` in the served CSS. `tokens.txt` and
`utilities.txt` both reported **identical**, exit 0. Verified the mutation
reached the wire — 0 occurrences of the original, 5 of the replacement.

Two second-order defects in the same script: `tokens.txt` was `sort -u` with **no
selector context**, so moving a declaration from `:root` into a `[data-system]`
block was invisible — *precisely* the transformation being verified. And the
utility regex matched any dot-prefixed token, so 37 of 290 baseline lines were
CSS decimals and font-file content hashes, not selectors.

**Rule:** distrust "Verified:" followed by a name count.

### Enforcement tools that pass everything

`check-roles` at one point accepted `bg-[#DFFF00]`, `shadow-[…rgba(…)]`, raw hex
in a CSS module, `oklch()`, and `var(--color-lime, red)` — while correctly
catching the two control cases. The design was sound; the coverage was not.

The parser silently dropped every token after a `}` inside a comment, mangled
quoted values, and parsed a **decoy `@theme` inside a comment** in preference to
the real block. All silent.

**Rule:** run the fixtures. A rule that has only ever passed has not been tested.

### A test that passes for the wrong reason

`url(#fade)` in an SVG matches a hex-colour pattern exactly. The guard against it
was **unreachable code**, and the false positive was hidden because the test
happened to use `url(#grad)` — whose letters are not hex.

### The palette validator checked the wrong pairs

Adjacent pairs cleared at ΔE 11.1; **all pairs** collapsed to 5.6 under
deuteranopia. Worse, the validator was **not committed**, so the claim was
unreproducible as shipped — the exact archaeology the repo exists to prevent.

A prior audit had reported a *different* pair failing under tritanopia. Both
found something; the first found the rare condition (~0.01%) and missed the
common one (~6%).

### Warm-cache captures report the previous build

The same comparison read 3 dropped utilities warm and 7 cold. If a diff looks
implausible, restart the server and delete `.next/dev` before believing it.

### The build cache replays a task whose real input it never hashed

Distinct from the entry above, which is the Next dev server. This is turbo's
task cache, and it has now produced the same fault **three times**.

`$TURBO_DEFAULT$` hashes the package directory. A system's token package reads
several files that live *outside* it, and each one, undeclared, gave a green
`FULL TURBO` while the artifacts stayed stale:

| Undeclared input | What it silently did |
|---|---|
| `../static/parts/**` | Appending a rule to `components.css` replayed "4 bundles in static/" while `thl.css` kept the previous contents — and `smoke`'s byte check compared the registry against that same stale file, so it agreed |
| `NEXT_PUBLIC_SITE_URL` (env, not a file) | Two different published sites hashed identically; a local no-basePath build restored over a subpath build and every asset URL lost its prefix |
| `../CHANGELOG.md` | A version bump changed no hashed file, so every artifact kept claiming the previous version — **including the one that ships to a consumer's disk** |

Measured in both directions for the third, which is the test the first two
deserved: with the input removed, editing the changelog gave `cache hit,
replaying logs` / `>>> FULL TURBO`; with it declared, the same edit gave
`cache miss, executing`.

**Rule:** when a task reads or writes anything outside its own package, declare
it in `inputs` *and* `outputs`, then prove it by mutating that file with a warm
cache. A replayed log line is indistinguishable from a real one — including the
generator's own summary, which is why "it printed the right version" is not
evidence.

> The same asymmetry applies to `outputs`. `token-tools` writes six files the
> token package does not contain; undeclared, deleting all six and re-running
> gave FULL TURBO with the files still missing and the task reporting success.

---

## Documentation failures

### The context file described a repo that no longer existed

`CLAUDE.md` carried **21 references** to structure the branch had deleted, across
six landed phases. It is loaded into context every session, so it did not merely
go stale — it **actively misdirected the work**, plausibly causing some of the
drift found later.

`REFACTOR.md` staged the updates to apply "as each phase lands". Six phases
landed; none were applied.

**Rule:** the context file is updated in the same change as the structure, or it
is a liability. And read role lists from `emit.mjs`, not from prose.

### Prose transcribed instead of sourced

The system's manifesto was trapped in JSX. `BRAND.md` now holds it once and the
thesis page renders the markdown at build time.

### Self-assessment is not verification

`REFACTOR.md` graded its own homework. `REMEDIATION.md` declared Phase 06 out of
scope in §6 while Phase 06 was landing. Neither found the blind instrument in
§Instrument failures; an independent audit did.

### A hand-rolled artifact contradicting the kit that replaces it

A review document was committed at the repo root linking
`fonts.googleapis.com` — in a repo whose static tier is defined as *"no React, no
build step, no network request"*, and after a prior audit had flagged it. It is
both the artifact class the report kit exists to replace and a direct
contradiction of its stated contract, now in version control.

---

## Design failures found by measurement

### One hairline is not a line system

**392 borders** on the components page, every one 1px at 1.52:1 — nothing could
outrank anything and the page dissolved at squint distance. The primary form
device needs the full range the devices it replaces would have carried.

### A role the ground cannot render

`--color-surface` at `#0A0A0A` measured **1.03:1** against the canvas; pure black
reached only 1.14:1. The sunken-panel step never rendered at all, and making it
visible would have meant elevation — which the thesis rules out. Deleted.

### Severity inverted by luminance

Warning `#FF8A00` at 8.11:1 against critical `#FF4A4A` at 5.78:1: the colour
meaning "degraded" shouted **1.40× louder** than the one meaning "this is worse".
Both cleared every contrast floor and separated cleanly from the accent. On a
near-black ground, contrast **is** urgency.

### Focus indistinguishable from hover

Focus was a flat outline in the same accent as eight hover rules — so the one
state a keyboard user depends on looked identical to one a mouse user causes by
accident. Decide how focus *differs* from hover, not just what colour it is.
