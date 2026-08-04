# Audit findings — `refactor/imprint-lab` @ `38bb719`

Third-party audit run against the brief in `.refactor/AUDIT-PROMPT.md`.

**Scope note — the brief is stale.** It describes 8 commits ending at Phase 05. The branch has
since landed **Phase 06 (`38bb719`)**, and a prior audit (`REMEDIATION.md`, findings `R1`–`R9`)
already covered `47588b3..f863a14`. This audit therefore does two things: **independently
re-derives** every prior finding against `HEAD` (not taking `REMEDIATION.md` at its word either),
and **audits Phase 06**, which no one has reviewed.

**Method.** Pinned to a detached worktree at `38bb719` so a concurrently-running session could not
move the tree mid-audit. Ran the apps, rendered all five routes headless at 1440×2400, executed
adversarial fixtures against `parse.mjs` and `check-roles.mjs`, mutated `base.css` and re-ran
`capture.sh`, scaffolded and gated a fresh system, and re-derived the chart palette from scratch.

> ⚠ **A concurrent session is writing this repo right now.** `bun run smoke` and
> `build-registries.mjs` were running during this audit, and the working tree changed shape three
> times (`biome.json`, `generate.mjs`, `registry.json`, `SKILL.md`, `parts/chart.css`,
> `parts/interact.js`, `validate-palette.mjs`). It appears to be working `R8` and `R2`.
> **Everything below cites `38bb719`. Re-check against the working tree before acting.**

---

## Confirmed defects, ranked

### 1. `capture.sh` cannot see a declaration body — every "Verified:" in Phases 01/02/04 rests on it

`.refactor/capture.sh:76-88`. The two signals are the set of custom-property *declarations* and
the set of class-selector *names*. Neither carries a rule body. `base.css` contains no custom
properties and no class selectors, so **the entire base layer is outside both signals.**

Reproduced cleanly — fresh baseline, mutate, compare:

```bash
# systems/human-laboratory/tokens/base.css:26
sed -i '' 's/cursor: crosshair/cursor: default/' systems/human-laboratory/tokens/base.css
PORT=3118 ./.refactor/capture.sh --compare
#   OK    tokens.txt identical to baseline
#   OK    utilities.txt identical to baseline   EXIT=0
```

I verified the mutation **actually reached the wire**, closing the HMR loophole the script's own
header warns about: in the captured CSS, `cursor: crosshair` → **0 occurrences**,
`cursor: default` → **5**. The signature interaction of the system was deleted from the served
stylesheet and the instrument reported clean. Same result mutating heading `font-family` and the
`body` background.

This is the finding that reframes the rest: it is not that the phases are wrong — Phase 01/02/04
appear substantively correct — it is that **`capture.sh` never established them**, and
`REFACTOR.md` says it did.

Two second-order defects in the same file:

- `capture.sh:77` — `tokens.txt` is `sort -u` with **no selector context**. Moving a declaration
  from `:root` into a `[data-system]` block is invisible. That is precisely the transformation
  Phase 05 performs and precisely the isolation it claims to have verified.
- `capture.sh:86` — the utility regex `\.[a-zA-Z0-9\\:_-]+` matches any dot-prefixed token, so
  **37 of 290 baseline lines are CSS decimals and font-file content hashes** (`.05em`, `.125rem`,
  `.10086973`), not selectors. A font rehash reads as utility drift.

### 2. `check-roles.mjs` is defeated by five smuggling vectors

`packages/token-tools/check-roles.mjs:35-40`. Ran against a real component in
`systems/human-laboratory/ui/`:

| Smuggled | Result |
|---|---|
| `className="bg-[#DFFF00] text-[#0F0F0F] border-[#333333]"` | **passes** |
| `className="shadow-[0_0_15px_rgba(223,255,0,0.3)]"` | **passes** |
| `.a { background: #DFFF00 }` in a CSS module | **passes** |
| `.a { background: oklch(0.94 0.2 118) }` | **passes** |
| `var(--color-lime, red)` — fallback form | **passes** |
| `className="bg-lime"` (control) | caught |
| `var(--color-lime)` (control) | caught |

`varRe` requires `\s*\)` immediately after the token name, so any `var()` with a fallback escapes.
Nothing looks at arbitrary-value brackets or at literal colour values. The controls being caught
matters: the rule works for what it covers, and the design (deriving the banned list from
`theme.css` rather than hand-keeping it) is sound. But `bg-[#DFFF00]` is the *most natural* way to
smuggle the accent, and it is unenforced — while `REFACTOR.md` §3.1 says *"Without enforcement
this is a wish."*

### 3. The token parser silently drops tokens

`packages/token-tools/lib/parse.mjs:54-68`. `extractThemeBody` counts braces on **raw CSS, before
`stripComments` runs** (`parse.mjs:78` calls it on `rawBody`, `:80` strips after), and
`splitDeclarations` has no notion of quoted strings. Every failure is silent omission:

| Input inside `@theme` | Result |
|---|---|
| A comment containing `}` | **every token after it silently dropped** |
| `--content-x: "}"` | same, plus value mangled to `"` |
| `@theme { … }` inside a comment *before* the real block | **parses the decoy, ignores the real block** |
| `--font-sans: "Foo;Bar", sans-serif` | truncated to `"Foo` |
| `var(--a, rgba(0,0,0,0.5))` with `--a` defined | resolves to `#123456)` — stray paren into `tokens.ts` *and* `tokens.json` |
| A comment containing `{` | throws `unterminated @theme block` (loud — acceptable) |
| CRLF, trailing comments, `;`/`:` in comments | correct |

Today's `theme.css` triggers none of these, so all five artifacts are currently right. The risk is
that this parser also feeds `check-roles`' banned list — **a silently dropped primitive is a
silently unguarded primitive**, chaining defect 3 into defect 2.

The stated reason for rejecting lightningcss is sound; hand-rolling is the right call. It just has
to be correct.

### 4. `new-system` produces a system that fails its own gates

Reproduced end to end at `HEAD`:

```bash
bun run new-system foo bar "Foo"
bun run build        # PASS
bun run check-types  # PASS
bun run lint         # FAIL — @bar/ui:lint exit 1
bun run check        # FAIL — 2 errors
```

Two exact causes:

- `systems/foo/static/bar.css` — the generator names the bundle after the **namespace**, but
  `biome.json:59-61` excludes generated bundles by **literal filename** (`thl.css`,
  `thl.chart.css`, `thl.fonts.css`). Any system not named `thl` ships an unexcluded,
  column-aligned generated file.
- `systems/foo/ui/tsconfig.json` — `packages/system-template` emits multi-line `include`/`exclude`
  arrays that the repo's own formatter rejects.

This blocks system 02 — the entire justification for the refactor.

### 5. `tokens.json` is not DTCG-conformant, and the repo ships a page saying it is

`packages/token-tools/lib/emit.mjs:188-229`. Validated against the spec:

- **Four untyped tokens** — `shadow.lime-glow`, `shadow.lime-glow-lg`, `shadow.glow`,
  `animation.scan`. The `shadow` and `animation` groups carry no `$type` and no ancestor supplies
  one. A token whose type cannot be resolved is invalid.
- The `$description` justifies this by saying DTCG *"has no primitive for"* these. **It does** —
  `shadow` is a defined composite type, and `duration`/`cubicBezier` cover animation.
- **Every dimension is a legacy string** — `"0.625rem"`, not `{value, unit}`.
- `letterSpacing.label: "0.2em"` — `em` is not a permitted dimension unit.
- `lineHeight.5xl` and `.6xl` are `"1"` — unitless, not a dimension at all.
- `fontFamily.sans: "var(--font-sans-face, sans-serif)"` — must be a font name or array. Figma
  imports a family literally called that.

Aggravating: the report kit's own catalog, rendered live at
`/systems/human-laboratory/report`, ships a table row reading **`tokens.json` · "Figma, Style
Dictionary" · SHIPPED**. The branding-export justification for Phase 03's rewrite rests on this
file importing cleanly. It will not.

### 6. Contract 3.4 — `base.css` states the rule and breaks it fifteen lines later

`systems/human-laboratory/tokens/base.css:1-30`. The file header reads:

> *"Every rule here must remain bindable to either `:root` or a `[data-system="…"]` scope —
> apps/docs renders several systems on one page, and an unscoped `body` rule would leak across
> them."*

Line 22 is an unscoped `body` rule. Imported unscoped at `apps/docs/app/globals.css:6`.

The proposed fix in `REFACTOR.md` (target a container, map `body` onto it) does not reach:

- **`base.css` binds to primitives, not roles** — `var(--color-obsidian)`,
  `var(--color-text-secondary)`, `var(--color-lime)`, `var(--color-steel)`. A second system's
  `theme.scoped.css` defines *its* roles, not THL's primitives, so rescoping the selector alone
  leaves every rule resolving to nothing. `base.css` must be **rewritten to roles as well as
  rescoped** — the larger half of the work.
- `html { color-scheme: dark }`, the universal `*` reset and the page scrollbar are
  **document-level**. There is no container to move them to. Two systems with different colour
  schemes cannot coexist on one page; that is a boundary to state, not a bug to fix.

The standalone report case is unaffected — `thl.css` owns the document by design.

**Related, same blast radius:** `apps/docs/app/globals.css:19` hardcodes
`@source "../../../systems/human-laboratory/ui"`, but the adding-a-system comment at `:12` lists
only the `@import` and the `lib/systems.ts` entry — and the scaffold's own printed step 5 omits it
too. **System 02's component utilities would not generate**, and nothing tells you why.

### 7. `text-6xl` is never generated — visually confirmed

`apps/docs/app/systems/human-laboratory/components/page.tsx:169` builds the class from a runtime
value: `` className={`${utility} text-white`} ``. Tailwind v4 scans for literal class names.

In the built CSS: `text-micro` 3 occurrences, `text-xs` 3, `text-5xl` 3, **`text-6xl` 0.**

In the render, the `text-6xl` row (3.75rem) displays visibly **smaller than `text-5xl`** (3rem) —
at inherited base size — on the page whose entire purpose is showing each size. Every other step
renders only because its literal name happens to appear elsewhere in the repo.

Not a regression — absent from the `fb04503` baseline too. That is the point: `utilities.txt`
reported "identical" across six phases while the page silently failed to render a token.

### 8. The showcase never displays the role layer — visually confirmed

`§02_COLOR_PALETTE` renders exactly two tiers: **CORE** (5 primitives) and **SEMANTIC** (2 tokens
`REFACTOR.md` describes as superseded). **None of the 11 roles appear.** `roleColors` is generated
and exported at `systems/human-laboratory/tokens/generated/tokens.ts:376`; the only import anywhere
is `apps/docs/app/page.tsx:41`, which uses `.length` for a count.

The page's own standfirst reads *"Components below reference roles only — the contract that lets
them move to another system unchanged."* The payload of Phases 02–04 is undocumented on the page
built to document it, and the tier ordering shows the implementation detail while hiding the
contract.

### 9. Chart palette: an under-floor pair, and it is not the one previously reported

`systems/human-laboratory/static/parts/chart.css:30-34`. **No validator is committed at `38bb719`**
(`git ls-files` finds none) — the claim is unreproducible as shipped, which is exactly the
archaeology `REFACTOR.md` §0 exists to prevent. I re-derived it independently (CIEDE2000 + linear-RGB
CVD simulation):

| | worst ΔE00 | verdict |
|---|---|---|
| worst **adjacent** pair | 11.1 | clears the 8.2 floor — adjacent-only validation passes |
| worst **all-pairs** | **5.6** — `--chart-2` purple / `--chart-4` periwinkle, **deuteranopia** | **under floor** |

`chart.css:24` says *"Assign slots in fixed order and never cycle them"*, so 2 and 4 co-occur in
any four-series chart. They sit 18.3 apart in normal vision and collapse to 5.6 under deuteranopia.

**This corrects `REMEDIATION.md` R8**, which reported blue/green collapsing at tritan ΔE 4.0. I
measure that pair at **8.6 — clearing the floor**. Simulation matrices differ, so treat the exact
figures as matrix-dependent; the structural conclusion is matrix-independent and *worse* than
reported, because **deuteranopia affects ~6% of males** where tritanopia affects ~0.01%. The
prior audit found the rare-CVD case and missed the common one.

Secondary: `--chart-2` clears the 3:1 contrast floor against obsidian by 0.23 (3.23:1).
`--chart-5`'s hue is 351, the comment says 345.

### 10. Phase 06 committed a hand-rolled HTML report that violates the kit's own rule

`visual-craft-review.html`, added at the repo root **in `38bb719`** (`git log --diff-filter=A`).
`REMEDIATION.md` R9.4 flagged it as untracked and asked for it to be deleted or regenerated
through the kit; Phase 06 committed it instead.

It links `fonts.googleapis.com/css2?family=IBM+Plex+Mono…`. `systems/human-laboratory/static/SKILL.md:8`
defines the static tier as *"No React, no build step, no network request."* This is both the
artifact class the report kit exists to replace and a direct contradiction of its stated contract,
now in version control.

### 11. `CLAUDE.md` describes a repo that stopped existing at Phase 01

**21 references** to structure this branch deleted — `packages/ui`, `@repo/ui`,
`@repo/tailwind-config`, `tokens.generated.ts`, the `/design-system` route. `REFACTOR.md` §8 stages
four blocks to apply *"as its phase lands"*. Six phases landed; **none were applied.**

This file is loaded into context every session, so it actively misdirects future work — including,
plausibly, some of the drift found above.

### 12. The repo is not renamed, and the registry points somewhere that does not resolve

`package.json` says `imprint_lab`; the working directory and `origin` are `the_human_laboratory`
(`https://github.com/JadRizk/the_human_laboratory.git`). `registry.json` sets
`homepage: https://imprint-lab.vercel.app`, which does not resolve. Settle this **before anything
installs from the registry** — a published registry item carrying a dead homepage is the one form
of this that is hard to walk back.

### 13. The showcase cites a path deleted in Phase 01

`apps/docs/app/systems/human-laboratory/components/page.tsx:263` tells readers tokens are generated
from `packages/tailwind-config/theme.css`. The next line correctly names the current command, so
this was half-updated. Correct path: `systems/human-laboratory/tokens/theme.css`.

---

## Resolved since the prior audit — verified, do not re-fix

| Prior finding | Status at `38bb719` |
|---|---|
| `R3.1` deployed CTA → `http://localhost:3001` | **Gone.** Phase 06 deleted `apps/web`; no `localhost:300*` remains in `apps/`, `systems/`, `packages/`. |
| `R6` registry has no components | **Fixed.** 8 items: `registry:style` (`extends: "none"`), six components with correct npm + registry deps, `report-kit`. |
| Install path never proven | **`bun run smoke` passes** — 8 items, 16 files materialised and typechecked, every import declared. |
| Generated artifacts unstable | **Stable.** `generate:tokens` twice → no diff; committed output matches generator output. |
| Clean build | **Passes.** `install && build && check-types` green from clean. |
| All five routes render | **Confirmed visually.** Corner brackets, chips, `SIGNAL_LOST`, ImageFrame reveal, scan line, callouts and swatches all correct. The report iframe genuinely isolates the standalone bundle. |

The report kit is the strongest thing on this branch. It renders exactly as documented.

---

## Judgment calls — not defects

**The example page is built on primitives, not roles.** `example/page.tsx:84,86` uses
`border-steel` and `text-text-tertiary`. This is legal — `check-roles` scopes to `systems/*/ui/`,
and app code may name primitives. But *"a whole page built in the system"* is the flagship
demonstration of the role contract, and it demonstrates the opposite. Either bring it onto roles or
stop describing it as the proof.

**No focus-ring role.** The 11-role vocabulary has no disabled, hover-surface, selected or
focus-ring token. `button.tsx` expresses hover as a border change so `hover:` variants suffice
*for this system*. I would add a focus-ring role now regardless — accessibility defaults are the
ones that never get retrofitted, and every system will need one.

**`--shadow-glow` does not survive the naming test.** *"Emphasis on an active or growing edge"*
describes the glow, not a job. The honest version is that `ImageFrame` could not be ported without
it — a perfectly good reason to ship a role. The rationale at `emit.mjs:23-27` takes three lines to
avoid saying so.

**CSS-module hash normalisation hides nothing.** `capture.sh:87` was added because a diff was
failing on file moves, and it is correct — local class names survive it. The audit brief flags this
as suspicious; it is not. The missing declaration bodies are the weak link, and that predates it.

---

## On `REFACTOR.md`'s self-assessment

The brief asks whether claims are supported by the evidence cited. Two patterns:

1. **The phrase to distrust is "Verified:" followed by a `tokens.txt`/`utilities.txt` count.** The
   underlying claims are mostly *true* — Phase 01 really is behaviour-preserving — but the cited
   instrument could not have established them, and in Phase 05's case (`:root` → `[data-system]`)
   it is structurally incapable of it.
2. **Phase 05 is marked `✅ DONE` with "distribution works"** on the strength of the static kit
   alone, deferring the component install proof to Phase 06. That has since been made true by the
   registry work and `smoke-install.mjs` — but it was not true when written, and the document does
   not record the gap.

Neither `REFACTOR.md` nor `REMEDIATION.md` is a reliable narrator of its own scope: the first grades
its own homework, and the second declares Phase 06 out of scope in §6 while Phase 06 was landing.
