# @imprint/token-tools

The token pipeline and the contract enforcement, shared by every system.

Nothing here is system-specific. Each tool takes a system directory and works the
same way for all of them — which is what keeps the cost of a second system near
zero.

## The four tools

### `token-tools [tokenDir]` — the pipeline

Parses a system's `theme.css` and emits every derived artifact: typed tokens, a
plain `:root` stylesheet, a `[data-system]`-scoped stylesheet, token JSON, the
tailwind-merge config, and the report-kit bundles.

Wired as each token package's `build`, so `turbo build` regenerates everything.

**Why the parser is hand-rolled.** lightningcss parses `theme.css` without
complaint but treats `@theme` as an unknown at-rule — a Declaration visitor sees
*zero* custom properties inside it, and `--color-*` is re-emitted as
`--color- * `. Declaring it as a custom at-rule makes it throw outright. A real
CSS parser buys nothing here. What it would have bought is robustness against
comments and multi-line values, and `lib/parse.mjs` handles both directly.

> The parser has known gaps: a `}` inside a comment silently truncates the token
> list, and quoted strings are not tracked. See `REMEDIATION.md` R2.2.

### `check-roles [systemDir]` — the role contract

Fails the build when a component references a primitive. The banned list is
derived from `theme.css` rather than hand-kept, so adding a primitive guards it
automatically. Catches Tailwind utilities including variants, and raw
`var(--token)` in CSS modules.

> Known holes: arbitrary-value utilities (`bg-[#DFFF00]`), raw hex in a CSS
> module, and the `var(--x, fallback)` form all pass. See `REMEDIATION.md` R2.1.

### `validate-palette [hexes]` — the chart palette

Computes, never eyeballs. Checks every **pair** — not adjacent ones, since
adjacency in a token list is arbitrary and any two series can share a legend —
under simulated protanopia, deuteranopia and tritanopia, plus a normal-vision
floor, lightness band, chroma floor and contrast against both surfaces.

Runs in lint against the shipped values. Cross-checked against the reference
implementation: identical verdicts.

**Do not relax the thresholds to make an edit pass.** If a palette will not clear
them, it needs fewer series, not a lower floor.

### `smoke-install [registryDir]` — the registry manifest

Materialises every registry item into a temp project and typechecks it, then
asserts that every bare import is declared in the item's dependency closure and
every relative import resolves to a file the registry actually ships.

The third check exists because the first two are not enough: the ambient
`declare module '*.module.css'` that any real project has makes a *missing*
stylesheet resolve happily, so dropping a CSS module from a manifest typechecked
clean until relative-import resolution was checked separately.

It does **not** exercise the shadcn CLI or a real Next.js build. A failure that
only appears in a real bundler could survive it.

## Adding a system

`bun run new-system <slug> <ns> ["Name"]` — see `packages/system-template`. The
new system is wired to all four tools automatically; nothing here needs editing.
