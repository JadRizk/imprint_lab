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

**Tracking is a property of the size, not a decision at the call site.** Letters read too far
apart as type grows and too close as it shrinks, so a single letter-spacing is wrong somewhere by
construction. Each step of the scale declares its own — `display` (-0.02em) at 4xl and above,
`tight` (-0.01em) at 2xl–3xl, `normal` (0) everywhere below — so `text-6xl` arrives already
tracked. `--tracking-*` is reset alongside `--text-*`, which closes the last open typographic
scale: the example hero used to carry Tailwind's `tracking-tighter` (-0.05em, roughly 2.5x what
display type wants) unchanged across three responsive steps from 30px to 60px, and one fixed
value could never have been right at all of them.

`label` (0.2em) is the uppercase instrument-label treatment, and `label-dense` (0.12em) is the
same job where 0.2em will not fit — a chip, a cell in an SVG diagram.

Leading comes off the scale too: every step declares one. `--leading-prose` (1.65) is the single
rung the scale cannot express, because prose wants more air than its size implies.

Weights carry jobs rather than taste. **500** is the instrument-label weight — at 10–12px with
0.2em tracking on a dark ground, 400 reads frail, because light-on-dark optically thins strokes.
**600** is buttons and inline emphasis; inline 700 in monospaced body copy is a hard stop that
breaks the line. **700** is headings only. **300** is display sizes and nothing else.

Prose is measured in characters, not pixels, because the body face is monospaced: every glyph is
the width of an `m`, so the comfortable line is 60–72 characters rather than the 75–90 of a
proportional face. `PageShell width="prose"` is `64ch`.

## Motion

Time is a dimension of this system like line or type, and it is a ladder for the same reason:
one duration doing every job is how motion stops meaning anything. Four rungs, picked by what
the motion **means** — `ack` (0ms), `state` (120ms), `transit` (320ms), `process` (1200ms).

**Feedback enters at `ack` and decays at `state`.** The asymmetry is the whole point. Symmetric
timing makes an interface feel like it is animating at you; asymmetric timing makes it feel like
it is answering you. The system shipped at a flat 300ms in both directions, which is slow enough
that the pointer arrives somewhere before the colour does.

**A press is acknowledged on pointer-down, never on release.** Every interactive surface answers
the instant it is touched, and the answer is the same everywhere: an accent edge, plus emission.
This is what `--shadow-glow` is *for* — `:active` is the machine being live, literally — so
acknowledging a press costs no new colour and spends nothing the accent does not already own.

The rule exists because hover is not feedback. Touch has no hover at all: before this, a button
on a phone gave nothing between the tap and the result, and the system's own thesis is an
instrument panel. An instrument whose switches do not register the throw is a broken instrument.

**Things switch on rather than grow into place.** An entrance is a fade at `transit` followed by
the edge climbing `ambient` → `line` — the ladder used as motion. No transform, because a
fractional scale lands these hard borders off the pixel grid and the edge shimmers, and no accent,
because a screen full of cards each firing lime is the accent becoming texture.

Springs are deliberately absent. Overshoot is a claim about mass and elasticity — the organic
vocabulary this system rejects, the same argument as drop shadows. What is worth taking from
gesture-driven design is *continuity*, not bounce: if a draggable surface is ever added here it
tracks the pointer 1:1 from the grab offset, animates from its on-screen value rather than its
target, and stays interruptible — at zero overshoot.

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
- **One accent, and it has a budget.** Lime `#DFFF00`, used as signal. It is the success state
  where the system speaks *about itself* — `NOMINAL` and `RENDERING` render in it — so there is
  still no separate green. It is not for uniform table columns, scale bars, inline code, or hover.
  If every row is lime, lime distinguishes nothing.
- **On a surface that reports state per item, success is the absence of colour.** The accent rule
  above holds for a page describing itself and inverts for an instrument panel, where `ok` is the
  most common state on the screen: lime is 16.83:1 here and critical is 5.78:1, so healthy-means-
  lime spends the loudest ink on the quietest state and the one red mark stops arriving first.
  `--color-nominal` is the quietest ink that still clears the text floor, and `--color-unmeasured`
  is the state this system had no way to express at all — *present, and unread*.
- **Glow is emission, not a drop shadow.** Zero offset, bright tight core, thin falloff. It says
  *this element is on*, so it follows current — focus, active, live, a growing edge. Never hover:
  hover is a state of the pointer, not of the machine.
- **Every interactive surface answers on pointer-down.** Instant in, decayed out — `ack` then
  `state`. The press is an accent edge plus emission, identical across variants, and it must
  differ from *both* rest and hover, because touch has no hover to differ from.
- **Every typographic scale is closed.** `--text-*`, `--tracking-*` and `--leading-*` are all
  reset. Tracking and leading are declared per size step, so they cannot be picked by eye at a
  call site — and Tailwind's own rungs (`tracking-tighter`, `leading-snug`) no longer exist.
- **Time comes off the ladder.** `duration-ack` · `duration-state` · `duration-transit` ·
  `duration-process`. A duration typed by hand is a value nobody chose against the others.
- **The ladder answers `prefers-contrast: more`.** Every rung climbs and the order is preserved —
  `line` reaches 4.59:1 so a control's boundary clears the 3:1 that WCAG 1.4.11 asks of it. In a
  system where line is the only structure, a user asking for more contrast is asking about
  everything there is.
- **Reduced motion silences travel, not feedback.** The preference is about vestibular triggers;
  a colour change is not one. Position, scale and keyframes go instant — colour, outline, shadow
  and opacity keep answering.
- **Text clears 4.5:1** against the canvas. Measured ratios live beside the tokens. If a label
  looks too loud, change the hierarchy or the size, never the contrast.
- **Severity reads by luminance.** Warning stays darker than critical. On a near-black ground the
  brighter colour is the more urgent one, so a bright warning inverts the pair.
- **Decoration and text are different tokens.** `--color-ambient` is for grid overlays and idle
  brackets. Never text.
