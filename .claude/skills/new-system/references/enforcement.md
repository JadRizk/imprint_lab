# Step 5 — Enforcement

> *"Without enforcement this is a wish."* — `REFACTOR.md` §3.1

Four tools in `packages/token-tools`, all system-agnostic: each takes a directory
and works the same way for every system. That is what keeps cost-per-system near
zero, and it means **nothing here needs editing when you add a system** — with
one exception, noted below.

---

## `token-tools [tokenDir]` — the pipeline

Parses `theme.css` and emits every derived artifact. Wired as each token
package's `build`, so `turbo build` regenerates everything.

**The parser is hand-rolled, deliberately.** lightningcss parses `theme.css`
without complaint but treats `@theme` as an unknown at-rule — a Declaration
visitor sees **zero** custom properties inside it, and `--color-*` is re-emitted
as `--color- * `. Declared as a custom at-rule it throws outright. A real CSS
parser buys nothing here.

**What that costs, and why it matters to you:** every parser failure mode is
*silent omission*. A `}` inside a comment truncates the token list. And the
parser feeds `check-roles`' banned list — so **a silently dropped primitive is a
silently unguarded primitive.** If `check-roles` reports fewer guarded primitives
than `theme.css` has, suspect the parser before suspecting the count.

---

## `check-roles [systemDir]` — the role contract

Fails the build when a component references a primitive. The banned list is
derived from `theme.css`, not hand-kept, so adding a primitive guards it
automatically.

Three rules, ascending strictness:

1. **Primitive utilities**, including variants (`hover:bg-lime`) and the same
   names inside `cva` maps, ternaries and `clsx` arguments — the check is textual
   and does not depend on parsing.
2. **`var(--primitive)`** in a CSS module, in **both** the bare and fallback
   forms. The fallback form (`var(--color-lime, red)`) escaped an earlier version
   that required a paren immediately after the name.
3. **Raw colour literals** — any hex, `rgb()`, `hsl()`, `oklch()` or
   `color-mix()`. A component has no business naming a colour at all, so this
   needs no allow-list, and it is what closes `className="bg-[#DFFF00]"` and
   `.a { background: #DFFF00 }` — which produce a primitive exactly while naming
   nothing the other two rules can see.

### ⚠ The one thing adding a system can require editing

A colour or shadow token **not** in `ROLE_COLOR_NAMES` / `ROLE_OTHER_NAMES`
(`lib/emit.mjs`) is classified a primitive and banned inside `ui/`. If your
system needs a role the vocabulary does not have, add it to that Set **in the
same change**. Otherwise you ship a role that fails the build the first time a
component uses it.

Adding a role is cheap and removing one is a sweep, so bias toward fewer — but
the vocabulary is expected to be revised when a system arrives that expresses
structure differently, and the lint rule is what keeps that revision mechanical.

---

## `validate-palette [hexes]` — the chart palette

Computes, never eyeballs. Checks every **pair** — not adjacent ones, since
adjacency in a token list is arbitrary and any two series can share a legend —
under simulated protanopia, deuteranopia and tritanopia, plus a normal-vision
floor, lightness band, chroma floor and contrast against both surfaces.

Adjacent-only validation is not a smaller version of this check, it is a
different one that passes when this fails: a palette here cleared adjacent pairs
at ΔE 11.1 while carrying an all-pairs collapse at **5.6 under deuteranopia**,
which affects ~6% of males.

**Do not relax the thresholds to make an edit pass.** If a palette will not clear
them, it needs fewer series, not a lower floor.

---

## `smoke-install [registryDir]` — the registry manifest

Materialises every registry item into a temp project, typechecks it, then asserts
every bare import is declared in the item's dependency closure and **every
relative import resolves to a file the registry actually ships.**

That third check exists because the first two are not enough: the ambient
`declare module '*.module.css'` any real project has makes a *missing* stylesheet
resolve happily, so dropping a CSS module from a manifest typechecked clean.

**It does not exercise the shadcn CLI or a real Next.js build.** A failure that
only appears in a real bundler survives it. That risk is accepted deliberately —
the cost of finding out on project 02 is a minute; the cost of a proving-ground
app is permanent.

### Registry consumers have no workspace

A consumer receives `lib/` as plain files with nothing to resolve a scoped
package against. **Imports between shipped files must be relative** — the only
form that works identically in the workspace and in a consumer. `cn()` had to
stop importing `@thl/tokens/tw-merge` for exactly this reason; `token-tools` now
also emits `ui/lib/tw-merge.generated.ts` beside `utils.ts`.

Registry targets must also mirror the source layout. Components targeting
`~/components/<ns>/` resolved their `../lib/utils` to `components/lib/utils` —
outside the namespace, and broken for every consumer.

---

## Adversarial fixtures — run these, do not assume

Every tool above was defeated on first audit. Each is now closed; the point of
re-running them is that **a rule you have not watched fail is a rule you are
guessing about.**

Against `check-roles`, in a real file under `systems/<slug>/ui/`, one at a time:

| Fixture | Must be |
|---|---|
| `className="bg-[#DFFF00]"` | caught |
| `className="shadow-[0_0_15px_rgba(223,255,0,0.3)]"` | caught |
| `.a { background: #DFFF00 }` in a CSS module | caught |
| `.a { background: oklch(0.94 0.2 118) }` | caught |
| `var(--color-<primitive>, red)` — fallback form | caught |
| `className="bg-<primitive>"` — control | caught |
| `url(#fade)` in an SVG | **not** caught (it is a fragment ref, not a colour) |

That last row is not padding. The guard against it was previously unreachable
code, and the false positive survived only because a test happened to use
`url(#grad)`, whose letters are not hex — **a test that passes for the wrong
reason is worth less than no test.**

Against the parser, inside `@theme`:

| Fixture | Must be |
|---|---|
| A comment containing `}` | not silently truncating the token list |
| `--content-x: "}"` | parsed, value intact |
| `--font-sans: "Foo;Bar", sans-serif` | not truncated at the `;` |
| `@theme { … }` inside a comment before the real block | ignored |

Then remember to revert every fixture. `bun run test` covers the parser cases via
`packages/token-tools/parse.test.mjs`; the `check-roles` ones are manual.
