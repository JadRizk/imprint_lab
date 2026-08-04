# REMEDIATION.md — findings against `refactor/imprint-lab`

Companion to `REFACTOR.md`. That document is the plan and grades its own homework; this one
is the audit of what actually landed, written by a session that did not do the work.

**Audited:** `47588b3..f863a14` — 8 commits, 70 files, +6239/−562, **against a clean working
tree**. Every finding cites committed code at `f863a14`.

> ⚠ **The tree diverged mid-audit.** A concurrent session began Phase 06 work at ~22:28 while
> this audit was running. It has already implemented **`R6` in full** — see the note there — and
> rewritten `REFACTOR.md` §Phase 06. Findings other than `R6` were re-checked against the
> committed state and are unaffected, but **re-verify against the working tree before acting**.
> Modified: `REFACTOR.md`, `biome.json`, `packages/token-tools/generate.mjs`,
> `systems/human-laboratory/registry.json`, `systems/human-laboratory/tokens/package.json`,
> `systems/human-laboratory/ui/lib/utils.ts`. New: `packages/token-tools/smoke-install.mjs`,
> `systems/human-laboratory/ui/lib/tw-merge.generated.ts`.
**Method:** ran both apps and the static tier in a headless browser; rebuilt `47588b3` in a
worktree and diffed renders; attacked `parse.mjs`, `check-roles.mjs` and `capture.sh` with
adversarial inputs; re-derived the chart palette numbers; ran the cold-start test; full clean
rebuild.

---

## 0. How to use this document

Same contract as `REFACTOR.md`: one phase per session, verification reviewed before the next
begins, one commit per phase. Each entry states **Problem**, **Currently** (with a reproduction),
**Fix**, and **Blocks**.

Severity ranking and execution order differ, and both are given. Execute in the order of §2 —
`R1` first is not a preference. Everything downstream is unverifiable until the instrument works.

**What not to re-litigate:** §5 lists the claims that survived audit. Several are stronger than
`REFACTOR.md` states. Do not spend a session re-checking them.

---

## 1. The finding that reframes the rest

`REFACTOR.md` rests its pixel-identical claims on `.refactor/capture.sh`. That script measures
two things — the set of custom-property declarations, and the set of class-selector *names*.
It never captures a declaration body.

`base.css` contains no custom properties and no class selectors. **The entire base layer — the
opinions that make this system recognisable — is outside both signals.**

This is not a theoretical gap. It was reproduced:

```
# base.css:  cursor: crosshair        -> cursor: default
#            h1-h6 var(--font-sans)   -> var(--font-mono)
#            scrollbar width: 6px     -> 24px
./.refactor/capture.sh --compare
  OK    tokens.txt identical to baseline
  OK    utilities.txt identical to baseline
  EXIT=0
```

The crosshair removed, every heading moved off the display face, the scrollbar quadrupled — and
the check passes clean.

So: the Phase 01/02/04 claims are, as far as I can determine, **true** — I verified them
independently and `/` is byte-identical before and after. But `capture.sh` did not establish
them, and the document says it did. The phrase to distrust throughout `REFACTOR.md` is
**"Verified:"** followed by a `tokens.txt` / `utilities.txt` count.

---

## 2. Execution order

| | Phase | Why here |
|---|---|---|
| 1 | `R1` Restore the instrument | Nothing else is verifiable first |
| 2 | `R2` Close the enforcement holes | Silent-failure classes; cheap and mechanical |
| 3 | `R3` Fix what ships wrong | User-visible in production today |
| 4 | `R4` Make the scaffold pass its own gates | Blocks system 02 |
| 5 | `R5` Contract 3.4, properly | Blocks system 02 getting a docs page |
| 6 | ~~`R6` Registry completeness~~ | ✅ Landed in the working tree by a concurrent session — verify, do not redo |
| 7 | `R7` DTCG — conform or drop the claim | A decision, not a patch |
| 8 | `R8` Chart palette: all-pairs CVD | Correctness of a shipped default |
| 9 | `R9` Documentation debt | Explicitly staged in `REFACTOR.md` §8, never applied |

---

## R1 — Restore the instrument

### R1.1 `capture.sh` cannot see a declaration body

**Problem.** Two signals, neither carrying declarations. Any change to what a rule *does* — as
opposed to whether its name exists — passes silently. This covers all of `base.css`, the
`@utility scan-line` body, every utility's declarations, and any swap between two class names
that both already appear somewhere in the set.

**Currently.** `.refactor/capture.sh:75-87`. Reproduction in §1 above.

Second-order: `tokens.txt` is `sort -u` with **no selector context**, so moving a declaration
from `:root` into a `[data-system]` block is invisible — precisely the transformation Phase 05
performs, and precisely the isolation Phase 05 claims to have verified.

**Fix.** Add a third signal that carries selector *and* normalised body, order-independent:

```bash
# Full rule surface. Subsumes both existing signals; keep them for readable diffs.
cat "$OUT"/*.css \
  | tr -d '\n' \
  | sed -E 's/\}/}\n/g' \
  | sed -E 's/(module)__[A-Za-z0-9_-]+__/\1__HASH__/g' \
  | sed -E 's/[[:space:]]+/ /g; s/^ //; s/ $//' \
  | grep -v '^$' \
  | sort -u > "$OUT/rules.txt"
```

Caveat to handle: nested at-rules (`@media`, `@supports`, `&::after` inside `@utility`) break
naive brace splitting. Either flatten them first or accept that nested bodies land as one chunk —
still infinitely better than not capturing them at all.

**Also fix while here:** `utilities.txt`'s regex matches any `.`-prefixed token, so 37 of 291
lines are CSS decimals and font-file content hashes (`.5em`, `.4564287c`), not selectors. Anchor
it to selector position. A font rehash currently reads as utility drift.

**Blocks.** Every `Verified:` line in Phases 01, 02 and 04.

### R1.2 The self-test only ever covered token loss

**Problem.** `fb04503`'s commit message claims the script was *"verified in both directions — a
simulated token loss is detected and exits non-zero."* True, and insufficient: a token loss is
the one failure mode `tokens.txt` was built to catch. Declaration change was never simulated.

**Fix.** Commit a fixture-based self-test that mutates each signal class in turn — token removed,
token changed, utility removed, **declaration body changed**, rule moved between selectors — and
asserts non-zero for each. A check that has only ever passed has not been tested; the same
sentence `REFACTOR.md` applies to `check-roles` applies here.

### R1.3 Nothing was ever looked at — and looking is cheap

**Problem.** `REFACTOR.md` §6 says *"Do both"* and records four failed attempts at the Chrome
extension across two phases. No page was opened for the entire refactor.

**Currently.** Headless Chrome works fine and needs no extension:

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless --disable-gpu --hide-scrollbars \
  --window-size=1440,2600 --virtual-time-budget=9000 \
  --screenshot=out.png http://localhost:3117/demo
```

This is how `/` was confirmed **byte-identical** (md5 match) against a worktree at `47588b3`.

**Fix.** Add a `--shots` mode to `capture.sh` that renders each route and stores an md5. Note the
one trap: `/demo` loads `picsum.photos`, so its render is a network race — the two `/demo`
captures differed only for that reason. Either stub the image for capture or exclude it from the
hash.

---

## R2 — Close the enforcement holes

### R2.1 `check-roles` is defeated by arbitrary values and raw hex

**Problem.** The rule derives its banned list from `theme.css` and scans source text. That design
is better than it looks — it caught 9 of 10 smuggling attempts, including `cva` variant maps,
ternaries, arrays, `clsx` arguments and `hover:` variants, because it does not depend on parsing.
The three it missed are runtime-composed strings that Tailwind cannot see either, so they are not
exploitable.

These are exploitable, produce exactly the primitive values, and pass silently:

| Smuggled into `systems/*/ui/` | Caught |
|---|---|
| `className="bg-[#DFFF00] text-[#0F0F0F] border-[#333333]"` | **no** |
| `className="shadow-[0_0_15px_rgba(223,255,0,0.3)]"` | **no** |
| `.a { background: #DFFF00; }` in a CSS module | **no** |
| `var(--color-lime, red)` — fallback form | **no** |
| `var(--color-lime)` | yes |

**Currently.** `packages/token-tools/check-roles.mjs:35-40`. `varRe` requires `\s*\)` immediately
after the token name, so any `var()` with a fallback escapes. Nothing in the rule looks at
arbitrary-value brackets or at literal colour values.

**Fix.** Three additions, in ascending order of effort:

1. `varRe` — allow a fallback: `var\(\s*(--name)\s*[,)]`. One character class.
2. Ban raw colour literals inside `systems/*/ui/` outright — any `#[0-9a-f]{3,8}`, `rgb(`,
   `rgba(`, `hsl(`, `oklch(` in a component or its CSS module. A component has no business
   naming a colour at all, so this needs no allow-list.
3. Ban arbitrary-value utilities whose bracket content resolves to a known primitive:
   `(bg|text|border|shadow|…)-\[` followed by a value matching any primitive's resolved form.

Item 2 is the one that matters. It is stricter than the current rule and easier to reason about.

**Blocks.** Contract 3.1. `REFACTOR.md` §3.1 says *"A Biome rule fails the build on violation.
Without enforcement this is a wish."* — the most natural violation is currently unenforced.

### R2.2 The parser silently drops tokens

**Problem.** `extractThemeBody` counts braces on **raw CSS, before `stripComments` runs**. It also
has no notion of quoted strings. Every failure mode is silent omission, not an error.

**Currently.** `packages/token-tools/lib/parse.mjs:54-68`. Verified behaviours:

| Input | Result |
|---|---|
| A comment containing `}` inside `@theme` | **every token after it silently dropped** |
| `--content-x: "}"` | same, plus value mangled to `"` |
| `@theme { … }` inside a comment *before* the real block | **parses the commented-out block, ignores the real one** |
| `--font-sans: "Foo;Bar", sans-serif` | value truncated to `"Foo` |
| `var(--a, rgba(0,0,0,0.5))`, `--a` defined | resolves to `#123456)` — stray paren into `tokens.ts` and `tokens.json` |

CRLF, trailing comments on multi-line declarations, and comments containing `;` or `:` all behave
correctly. Today's `theme.css` triggers none of these, so all five artifacts are currently right.

**Fix.** Strip comments **before** brace counting, and make `splitDeclarations` string-aware
(track `"` and `'` alongside brace depth). For `resolve`, make the fallback group paren-balanced
rather than `[^)]*`. Roughly twenty lines total.

The stated reason for rejecting lightningcss **is correct** — see §5 — so hand-rolling is the
right call. It just has to be hand-rolled correctly. Add the table above as test fixtures.

**Blocks.** All five emitters, the docs tables, and `check-roles` (which derives its banned list
from this parser — a dropped primitive is a silently unguarded primitive).

---

## R3 — Fix what ships wrong

### R3.1 The deployed portfolio links to `http://localhost:3001`

**Problem.** The `DESIGN_SYSTEM` call to action on the portfolio home page resolves to the
developer's laptop for every visitor.

**Currently.** `apps/web/app/page.tsx:6`:

```ts
const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? 'http://localhost:3001';
```

`NEXT_PUBLIC_DOCS_URL` appears nowhere else in the repo — no `.env.example`, no README, no deploy
config. `/` is statically prerendered, so the fallback is **baked into
`apps/web/.next/server/app/index.html`** at build time; setting the variable at runtime does not
help. Verified by grepping the production build output.

**Fix.** Commit `apps/web/.env.example`, document the variable, and either fail the production
build when it is unset or point the fallback at the real deploy host.

### R3.2 `text-6xl` is never generated

**Problem.** The showcase's type-scale table builds its class name from a runtime value. Tailwind
v4 scans for literal class names, so `.text-6xl` is absent from the served CSS. Every other step
renders only because its class name happens to appear literally elsewhere in the repo.

**Currently.** `apps/docs/app/systems/human-laboratory/page.tsx:174`:

```tsx
<span className={`${utility} text-white`}>The quick brown fox</span>
```

On the page whose entire job is to render each size, the largest step displays at inherited base
size — smaller than `text-5xl`, visible in any screenshot of `/systems/human-laboratory`.

**Not a regression.** `.text-6xl` is absent from the `fb04503` baseline too. It has never worked.
That is the point: `utilities.txt` reported "identical" across six phases while the page silently
failed to render a token.

**Fix.** A literal safelist is the honest answer here — the token set is closed and generated, so
emit a `safelist.ts` (or a `@source inline(…)`) from `token-tools` alongside the other five
artifacts. Do not hand-keep it; that is the failure this pipeline exists to prevent.

### R3.3 The showcase never displays the role layer

**Problem.** `roleColors` is generated, exported and never imported. The page documents 5 core
colours and 2 colours `REFACTOR.md` describes as superseded — and none of the 11 roles.

**Currently.** `apps/docs/app/systems/human-laboratory/page.tsx:1` imports `coreColors`,
`semanticColors`, `textTokens`, `tokens`. `roleColors` is exported at
`systems/human-laboratory/tokens/generated/tokens.ts:376`.

The page's own standfirst reads *"Components below reference roles only — the contract that lets
them move to another system unchanged."* The entire payload of Phases 02 through 04 is
undocumented on the page built to document it.

**Fix.** Add a `ROLE` tier to §02, above `CORE`, showing role → primitive → resolved value. Roles
are the contract; primitives are the implementation detail. The current ordering has it backwards.

### R3.4 The showcase cites a path deleted in Phase 01

**Currently.** `apps/docs/app/systems/human-laboratory/page.tsx:268` tells readers tokens are
generated from `packages/tailwind-config/theme.css`. The next line correctly names
`bun run --filter=@thl/tokens generate:tokens`, so this was half-updated.

**Fix.** `systems/human-laboratory/tokens/theme.css`.

---

## R4 — Make the scaffold pass its own gates

**Problem.** `bun run new-system foo bar "Foo"` produces a system that **fails both `lint` and
`check`** before anyone has touched it.

**Currently.** Reproduced end to end:

| Gate | Result |
|---|---|
| `bun run build` | passes |
| `bun run check-types` | passes |
| `check-roles` | passes |
| `bun run lint` | **fails** — `@bar/ui#lint` exit 1 |
| `bun run check` | **fails** — 2 errors |

Two distinct causes:

1. `packages/system-template/` emits a `ui/tsconfig.json` whose `include` / `exclude` arrays are
   multi-line; Biome wants them collapsed. The template output does not match the repo's own
   formatter.
2. `biome.json:58-60` excludes the generated static bundles **by literal filename** —
   `thl.css`, `thl.chart.css`, `thl.fonts.css`. The generator names the bundle after the
   *namespace*, so system `foo` / `@bar` emits `systems/foo/static/bar.css`, which is not
   excluded and is column-aligned like all generated CSS.

**Fix.** Run the template output through Biome as part of scaffolding (or fix the template).
Replace the three filename exclusions with a directory-level one — `!systems/*/static/*.css`
keeps `parts/` linted, which is where the hand-authored source lives.

**Also here:** `biome.json:56` excludes `systems/*/tokens/tokens.generated.ts`, deleted in
Phase 03. Dead exclusion, still listed in `REFACTOR.md` §1's table as live. And that table omits
the three `static/thl.*` exclusions added in Phase 4.5 — the "narrow and reasoned" set is no
longer the documented set.

**Blocks.** System 02. This is the third instance of the exact bug shape the throwaway
`proving-ground` system was meant to catch; `REFACTOR.md` records two. It was missed because the
throwaway was run through the pipeline and `check-roles` only, never through `lint` or `check`.
**Whatever replaces that throwaway must run the full gate set.**

---

## R5 — Contract 3.4, properly

**Problem.** `REFACTOR.md` records this contract as unmet and proposes a fix. The recorded
diagnosis is narrower than the actual one, and the proposed fix is insufficient.

**Currently.** `systems/human-laboratory/tokens/base.css:22-29`, imported unscoped at
`apps/docs/app/globals.css:6`.

`REFACTOR.md` names `body` as the problem and proposes targeting a container, with standalone
consumers mapping `body` onto it. Two things that does not reach:

1. **`base.css` binds to primitives, not roles** — `var(--color-obsidian)`,
   `var(--color-text-secondary)`, `var(--color-lime)`, `var(--color-steel)`. A second system's
   `theme.scoped.css` defines *its* primitives, not THL's. Scoping the selector alone leaves the
   rules resolving to nothing under system 02. **`base.css` must be rewritten to roles as well as
   rescoped**, and that is the larger half of the work.
2. **`html { color-scheme: dark }`, the universal `*` reset, and the page scrollbar are
   document-level.** There is no container to move them to. Two systems with different colour
   schemes cannot coexist on one page at all; that needs to be stated as a boundary rather than
   solved.

The standalone report case is unaffected — `thl.css` bundles its own reset and owns the document
by design.

**Also here.** `apps/docs/app/globals.css:19` hardcodes
`@source "../../../systems/human-laboratory/ui"`, but the adding-a-system comment at line 12
lists only the `@import` and the `lib/systems.ts` entry. System 02's component utilities would
not generate.

**Secondary.** `base.css` is why `--color-text-secondary` cannot be retired. `REFACTOR.md` §5
says the two remaining semantics *"can go once app code stops using them"* — but the consumer is
the system's own base layer, not app code. R5 is the phase that unblocks that deletion.

---

## R6 — Registry completeness

> ✅ **Already fixed in the working tree by a concurrent session, after this audit was taken.**
> `systems/human-laboratory/registry.json` now carries a `registry:style` item with
> `extends: "none"` and all six components with correct `dependencies` and `registryDependencies`;
> `packages/token-tools/smoke-install.mjs` is the install-path test this finding asked for; and
> `tw-merge` now generates into `ui/lib/` so a registry consumer can resolve it without a
> workspace. The finding is recorded below as audited, for the record. **Verify, do not redo.**
>
> Two things to check on that work: `REFACTOR.md`'s revised Phase 06 still says *"the registry
> ships exactly one item… none of the six React components are registered"*, which its own
> `registry.json` edit has made stale; and `smoke-install.mjs` does not exercise the `shadcn` CLI
> or a real Next.js build, which its header states plainly and §9 now accepts as a risk.

**Problem.** The registry contains one item, `report-kit`. There are no component items, no
`registry:style` item, and no `extends: "none"` — both specified in `REFACTOR.md` §2 and §5.

**Currently.** `systems/human-laboratory/registry.json`. Phase 06's falsification test is
`shadcn add @thl/button` into a scratch project. **There is no `button` item to add.**

Phase 05 is marked `✅ DONE` with *"distribution works"*, proven only for the static kit, and
does not record this gap. Its own text defers the proof — *"the evicted portfolio in Phase 06 is
what proves the install path instead"* — to a phase that cannot run.

**Fix.** Register the six components as `registry:ui` items with their dependencies
(`@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge`, `framer-motion`,
`lucide-react`), plus `lib/utils.ts` and the `image-frame.module.css` sidecar. Add the
`registry:style` item declaring `extends: "none"`. Then run the Phase 06 test for real, against a
scratch project, before Phase 06 starts.

**Blocks.** Phase 06 in full.

---

## R7 — DTCG: conform or drop the claim

**Problem.** `tokens.json` is described as W3C DTCG, *"for Figma, Style Dictionary"*. It was never
validated and it does not conform.

**Currently.** `packages/token-tools/lib/emit.mjs:188-229`.

| Issue | Detail |
|---|---|
| Untyped tokens | `shadow` and `animation` groups get no `$type` (`emit.mjs:194-196` map them to `null`), and no ancestor supplies one. A token whose type cannot be resolved is invalid. |
| The stated justification is wrong | The `$description` says these groups *"hold raw CSS declarations that DTCG has no primitive for"*. DTCG defines a `shadow` composite type (`{color, offsetX, offsetY, blur, spread}`) and `duration` / `cubicBezier` for animation. |
| `fontFamily` | `$value: "var(--font-sans-face, sans-serif)"`. Must be a font name or array of names. Figma imports a font literally called that. |
| `dimension` | Values are strings (`"0.625rem"`), the legacy shape. `letterSpacing.label` is `0.2em` — `em` is not an allowed unit. `lineHeight.5xl` / `6xl` are `"1"` — unitless, not a dimension. |

Alias syntax (`{color.obsidian}`) and the hex colour values are the parts most tools accept.

**Fix — pick one, do not split the difference.**

- **Conform.** Emit `shadow` as the composite type, split `--animate-scan` into `duration` +
  `timingFunction` + a name, emit dimensions as `{value, unit}`, drop `em` from the scale or
  convert, and resolve `--font-sans` to a real family list with the `var()` indirection carried
  as an extension rather than a value.
- **Drop the claim.** Rename the artifact `tokens.dtcg-ish.json`, say plainly what it is, and
  remove Figma and Style Dictionary from the table.

Either is defensible. What is not defensible is the current state, because the branding-export
justification for Phase 03's rewrite rests on this file importing cleanly, and it will not.

---

## R8 — Chart palette: validate all pairs, and commit the validator

**Problem.** The palette was validated on **adjacent** pairs only. Adjacency in a token list is
arbitrary — any two series can share a legend.

**Currently.** `systems/human-laboratory/static/parts/chart.css:30-34`.

I re-derived every claim. These hold exactly: accent OKLCH **L 0.944**; all five series inside the
0.48–0.67 band; all clear 3:1 against both `#0F0F0F` and `#0A0A0A`; worst **adjacent**
normal-vision ΔE **17.9**. Worst adjacent CVD measured 9.5 protan against the claimed 8.2 —
different simulation matrices, same conclusion. (`--chart-5` hue is 351, the comment says 345.)

The gap: across **all** pairs, `--chart-1` (blue) and `--chart-3` (green) collapse under
tritanopia at **ΔE 4.0** — half the 8.2 the document treats as its floor. `chart.css:24` says
*"Assign slots in fixed order and never cycle them"*, so 1 and 3 co-occur in any three-series
chart.

**The validator is not in the repo.** Grep finds OKLCH and CVD only in prose and CSS comments.
The claim is unreproducible as shipped, which is the archaeology `REFACTOR.md` §0 exists to
prevent.

**Fix.** Commit the validator under `packages/token-tools/`, change its adjacency check to
all-pairs, and re-solve for a five-slot set that clears the floor on every pair under all three
CVD types. Then wire it into `lint` so a palette edit cannot land unvalidated.

---

## R9 — Documentation debt

### R9.1 `CLAUDE.md` was never updated — an explicit deliverable of every phase

**Problem.** `REFACTOR.md` §8 stages four blocks to apply *"as its phase lands — not before, so
the file never describes a structure that doesn't exist yet."* Five phases landed. **None were
applied.**

**Currently.** `CLAUDE.md` still describes the repo as *"Personal portfolio website"* and
documents `packages/ui`, `packages/tailwind-config`, `@repo/ui`, `@repo/tailwind-config`,
`tokens.generated.ts`, `bun run --filter=@repo/tailwind-config generate:tokens`, and the
`/design-system` route — every one of which this branch removed.

The file it describes has not existed since Phase 01. It is loaded into context every session.

**Fix.** Apply all four staged blocks, then rewrite the structure, commands and decision-log
sections against what is actually there.

### R9.2 Package documentation

- `systems/human-laboratory/tokens/README.md` — still titled `# @repo/tailwind-config`, still
  references `@repo/ui`, `packages/ui/src`, and a `generate:tokens` command that no longer exists.
- `README.md:20` — still describes `@repo/ui`.

### R9.3 The repo is not renamed

`package.json` says `imprint_lab`. The working directory and `origin` are
`the_human_laboratory`. `registry.json` points `homepage` at `https://imprint-lab.vercel.app`,
which does not resolve.

Phase 01 lists the rename as a task; §7 Standing Judgment 6 says to ask rather than pick. Both
readings are consistent with the current state, but Phase 01 is marked landed. **Settle it before
anything installs from the registry** — Standing Judgment 6's own reason.

### R9.4 Loose artifacts at the repo root

`design-system-report.html` and `visual-craft-review.html` are untracked. The second links Google
Fonts, which `static/SKILL.md` explicitly forbids. Both are hand-rolled HTML reports, which is
exactly what the §8 block staged for Phase 4.5 forbids once the static tier exists. Delete or
regenerate through the kit.

---

## 3. Judgment calls — not defects

Recorded because they are worth a decision, not because they are wrong.

**Success = accent survives contact.** I went in sceptical. The cold-start test settled it: an
agent with no knowledge of the debate rendered the good stat in lime, the regression in orange
and the breach in red, and it reads correctly. Warning-as-orange holds for the same reason. Both
decisions are validated in situ — the strongest evidence available for either.

**The vocabulary is missing an interaction tier.** No disabled, no hover surface, no selected, no
focus-ring role. `button.tsx` expresses hover as a border change, so `hover:` variants of existing
roles suffice *for this system*; a system expressing hover as elevation has nowhere to put it.
Standing Judgment 3 says bias toward fewer, and that is right for *selected*. **A focus-ring role
I would add now** — accessibility defaults are the ones that never get retrofitted.

**`--shadow-glow` fails the naming test.** "Emphasis on an active or growing edge" describes the
glow, not a job. The honest version is that `ImageFrame` could not be ported without it, which is
a fine reason to ship a role. The rationale at `packages/token-tools/lib/emit.mjs:23-27` is
post-hoc, and the tell is that it takes three lines to avoid saying so.

**CSS-module hash normalisation hides nothing.** `capture.sh:86` was added because a diff was
failing on file moves, and it is defensible — local class names survive it. It is not the weak
link. The absence of declaration bodies is, and that predates it.

---

## 4. Ranked by severity

Independent of execution order.

| | Finding | Phase |
|---|---|---|
| 1 | `capture.sh` blind to every declaration body | `R1.1` |
| 2 | `check-roles` defeated by `bg-[#DFFF00]` and raw hex | `R2.1` |
| 3 | Parser silently drops tokens on a `}` in a comment | `R2.2` |
| 4 | Deployed CTA points at `localhost:3001` | `R3.1` |
| 5 | Scaffold fails `lint` and `check` out of the box | `R4` |
| 6 | Registry has no components — Phase 06 blocked | `R6` ✅ fixed post-audit |
| 7 | `tokens.json` not DTCG-conformant | `R7` |
| 8 | Contract 3.4 fix insufficient as proposed | `R5` |
| 9 | `CLAUDE.md` describes a repo that stopped existing at Phase 01 | `R9.1` |
| 10 | Showcase omits the role layer entirely | `R3.3` |
| 11 | `text-6xl` never generated | `R3.2` |
| 12 | Chart palette validated on adjacent pairs only; validator uncommitted | `R8` |
| 13 | Showcase cites a deleted path | `R3.4` |
| 14 | Dead and namespace-specific Biome exclusions | `R4` |

---

## 5. Verified — do not re-litigate

Checked independently. Several are stronger than `REFACTOR.md` claims.

| Claim | Verdict |
|---|---|
| Phase 01 "nothing changed but paths" | **True.** `/` is **byte-identical** before and after — md5 match on a 1440×2200 render against a worktree at `47588b3`. `/demo` differs only by a `picsum.photos` load race; layout, brackets, badges, `SIGNAL_LOST` and BentoGrid all identical. |
| `git log --follow` traces moved files | **True.** 4–6 commits through the move on every file sampled. Only two files genuinely deleted in the entire refactor. |
| Token drift across all six phases | **Exactly +11 lines, zero removals, zero modifications** (`fb04503` → `HEAD`): 9 roles, `--shadow-lime-glow-lg`, `--shadow-glow`. Matches the per-phase accounting. **No slow drift accumulated.** |
| lightningcss rejection | **True, and stronger than stated.** Without `customAtRules` the Declaration visitor sees 0 custom properties and re-emits `--color- *`. *With* `customAtRules` declared it throws `Unexpected token Delim('*')`. Hand-rolling is correct. |
| `@theme static` reasoning | **True.** `bg-ambient` at `apps/web/app/demo/page.tsx:116` is the only reason `image-frame.module.css`'s `var(--color-ambient)` ever resolved. (The document says `border-ambient`.) Measured cost: **328 bytes**, not the ~1KB claimed — the decision is better than documented. Nothing shipped that should not be. |
| Generated artifacts stable | **True.** `generate:tokens` twice → no diff; committed output matches generator output. `public/r/` correctly gitignored and rebuilt by `docs:build`. Nothing committed that should be generated. |
| Clean rebuild | **Passes.** `rm -rf node_modules .next .turbo` → `install && build && check-types && lint && check` all green, tree clean. |
| Registry over HTTP | **True.** `/r/thl/report-kit.json` 200, 147KB, 5 files with embedded content and `target` paths, valid `registry-item` shape. The per-namespace loop works — tested with a second namespace. |
| Tiers 5 core / 11 role / 2 semantic | **True.** |
| Every class in the bundles resolves | **True** — and extended: all 30 classes `SKILL.md` *promises* are defined too. |
| **Phase 4.5's outstanding cold-start test** | **PASSES.** Run properly: fresh context, empty directory, only `thl.css` and `SKILL.md`. Output is unmistakably The Human Laboratory — lime eyebrow square, `PLATFORM_CORE // Q3_INFRASTRUCTURE_REVIEW`, `FINDING_01 // LATENCY`, `SYSTEM_ID: 0x8291`, NOMINAL/DEGRADED/SIGNAL_LOST chips, corner brackets, zero radius, no invented CSS, no hardcoded hex, CSP-safe inlining. **`SKILL.md` is not wrong.** |

One gap the cold-start surfaced: `SKILL.md`'s wiring block presents three stylesheets, but a
partial install may carry only `thl.css`. The fonts degradation is documented; what to do when
`thl.chart.css` is absent and the report needs a chart is not.

---

## 6. What this document does not cover

- Phase 06. Not started, and `R6` blocks it.
- The component coverage gap (input, card, badge, dialog, table). Real, still out of scope.
- Light mode. Still policy.
- Whether the role vocabulary survives system 02. Unanswerable until system 02 exists — which is
  the point `REFACTOR.md` §4 makes, and it is right.
