# The Human Laboratory

System 01. Neo-brutalist. Obsidian ground, a single lime signal, hard borders, monospaced body.

## Thesis

Neo Brutalism rejects the polished sameness of modern UI. No soft gradients, no rounded corners,
no friendly pastels. This design system strips interfaces down to **raw structure** — obsidian
backgrounds, monospaced type, hard borders, and a single accent that cuts like a *signal through
noise*.

Every element earns its place. Borders are structural, not decorative. Color is functional, not
atmospheric. The crosshair cursor, the scan lines, the grid overlays — these aren't nostalgia.
They're a commitment to treating the interface as what it is: **a machine for communicating
information**. Utility over ornament. Clarity over comfort.

The Human Laboratory is the space where this philosophy takes form. A design system built on the
belief that constraint produces coherence, and that the most honest interface is one that doesn't
pretend to be anything other than **code rendered on a screen**.

## Voice

The register is a lab notebook driving an instrument panel. It is consistent across the system and
it is most of what makes output recognisable.

- **Labels and eyebrows are `SCREAMING_SNAKE_CASE`** — `RESEARCH_OBJECTIVE`, `FIELD_SAMPLES`,
  `DEPTH_CALIBRATION`, `SIGNAL_PROCESSING`.
- **`//` separates the parts of a label** — `DEMO // LANDING_PAGE`.
- **Status words come from instrumentation** — `NOMINAL`, `RENDERING`, `SIGNAL_LOST`,
  `UNDER_CONSTRUCTION`. Not "OK", "Done", "Error".
- **Identifiers look like readings** — `SYSTEM_ID: 0x8291`, `LAYER_01`.
- **Back-links are drawn, not worded** — `<- HOME`.

Prose itself is plain and declarative. The instrument vocabulary belongs to labels and chrome;
body copy is not written in it. Headings state the finding, not the topic.

## Typography

Space Grotesk for headings, IBM Plex Mono for body — an inversion of the usual pairing, and a
deliberate one: the body text of an instrument panel is monospaced. The system itself names no
font. It resolves `--font-sans` and `--font-mono` through `--font-sans-face` and
`--font-mono-face`, which the consumer defines.

The type scale is closed. `micro` through `6xl` are the only sizes that exist; `--text-*` is reset
so nothing arrives by default. `text-micro` (10px) is the instrument-label step the interface
leans on for metadata and eyebrows.

Weights carry jobs rather than taste. **500** is the instrument-label weight — at 10–12px with
0.2em tracking on a dark ground, 400 reads frail, because light-on-dark optically thins strokes.
**600** is buttons and inline emphasis; inline 700 in monospaced body copy is a hard stop that
breaks the line. **700** is headings only. **300** is display sizes and nothing else.

Prose is measured in characters, not pixels, because the body face is monospaced: every glyph is
the width of an `m`, so the comfortable line is 60–72 characters rather than the 75–90 of a
proportional face. `PageShell width="prose"` is `64ch`.

## Non-negotiables

- **Zero border radius.** Everywhere. A constraint, not an omission.
- **Dark only.** `color-scheme: dark` is hard-coded. Light mode is deferred, not forgotten.
- **Borders are the structure.** Not shadows, not elevation, not spacing alone. There is no
  surface fill: `--color-surface` was deleted because it measured 1.03:1 against the canvas and
  never rendered. On this ground pure black only reaches 1.14:1, so a panel cannot be made
  perceptibly darker — the only visible fill is a lighter grey box, which is elevation. A panel
  is bounded by its edge.
- **Line carries the hierarchy, in four tiers.** `--color-ambient` subdivides *inside* a panel,
  `--color-line` is the edge *of* a thing, `--color-line-strong` is a boundary that outranks its
  neighbours, and the accent is live state. Pick by what the boundary means. One weight doing
  every job is how a page dissolves at squint distance.
- **One accent, and it has a budget.** Lime `#DFFF00`, used as signal. It is also the success
  state — `NOMINAL` and `RENDERING` render in it — so the system ships no separate green. It is
  not for uniform table columns, scale bars, inline code, or hover. If every row is lime, lime
  distinguishes nothing.
- **Glow is emission, not a drop shadow.** Zero offset, bright tight core, thin falloff. It says
  *this element is on*, so it follows current — focus, active, live, a growing edge. Never hover:
  hover is a state of the pointer, not of the machine.
- **Text clears 4.5:1** against the canvas. Measured ratios live beside the tokens. If a label
  looks too loud, change the hierarchy or the size, never the contrast.
- **Severity reads by luminance.** Warning stays darker than critical. On a near-black ground the
  brighter colour is the more urgent one, so a bright warning inverts the pair.
- **Decoration and text are different tokens.** `--color-ambient` is for grid overlays and idle
  brackets. Never text.
