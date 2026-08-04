---
name: thl-report
description: Build a standalone HTML document — report, audit, spec, handoff, dashboard — in The Human Laboratory design system. Use whenever producing an HTML artifact for a project that has adopted @thl, including Claude artifacts. Covers the stylesheets, the class vocabulary, the four diagram forms, chart rules, interactive tables, and the editorial voice that makes the output read as one system.
---

# The Human Laboratory — report kit

A pure HTML/CSS tier. No React, no build step, no network request. Drop the
stylesheet in and the document is on-brand by construction.

**The stylesheet is the easy part.** Most of what makes these documents work is
in §4 and §5 — what to draw and how to write it. Read those before composing.

---

## 1. Wiring

Inline into `<style>` blocks, or link if the page can reach the files. A strict
CSP is the normal case for a standalone document, so **never link a font CDN** —
it fails silently and the page falls back to system faces.

| File | Size | When |
|---|---|---|
| `thl.css` | ~28KB | **Always.** Tokens, reset, ~40 primitives. |
| `thl.fonts.css` | ~114KB | When brand fidelity beats bytes. Embeds the display face. Load **before** `thl.css`. |
| `thl.chart.css` | ~7KB | The document carries data. |
| `thl.diagram.css` | ~4KB | The document draws a mechanism. |
| `thl.interact.js` | ~10KB | Sortable tables, filtering, expandable rows, chart tooltips, arrow-key tabs. |

Without the fonts bundle the page renders correctly in a system mono stack.
That is a supported degradation, not a bug.

**Everything works without the script.** Tables read, charts render, detail rows
stay visible. Never build a document whose meaning depends on JavaScript — the
kit's whole value is surviving email, PDF export and stripped script.

---

## 2. Page skeleton

```
.wrap                        ← 1440px. Use .wrap--prose (64ch) for reading-led docs.
  header.masthead
    .eyebrow                 ← PROJECT // DOC_TYPE // DATE
    h1                       ← states the finding, not the topic
    p.standfirst             ← 2–3 lines a reader could stop at
    .stat-grid > .stat       ← the numbers that matter, if any
  section.section
    .section-head            ← h2 + optional right-aligned .note
    …
  footer.report-footer
```

---

## 3. The vocabulary

| Class | For |
|---|---|
| `.masthead` `.eyebrow` `.standfirst` | Page opening |
| `.section` `.section-head` `.lede` | Section structure; `.note` is the right-aligned gloss |
| `.stat-grid` `.stat` | Headline numbers. `.label` + `.value` + `.foot` |
| `.table-wrap` + `table` | Any tabular data — **the wrapper is what scrolls** |
| `.chip` | State. `.is-accent` / `.is-critical` / `.is-warning` |
| `.panel` `.has-brackets` | A bounded block; brackets add the corner motif |
| `.callout` | A claim that needs weight. Takes the status modifiers |
| `.spec-list` (`dl`/`dt`/`dd`) | Label→value pairs |
| `.swatch-grid` `.swatch` | Colour specimens; `.is-absent` for proposed values |
| `pre` `code` `kbd` `.tree` | Code, keys and directory trees |
| `.cols` | Responsive multi-column grid |
| `.rule` | Section divider |
| `.scan-line` | The CRT motif; needs a positioned parent |
| `.tabs` `.tab-list` `.tab` `.tab-panel` | Alternate **views** of one finding — see below |
| `.accordion` + `details.disclosure` | The long tail: evidence, method, the full log |
| `.timeline` > `.event` | A sequence where the *interval* carries meaning |
| `.meter` `.meter-track` `.meter-fill` `.meter-mark` | One number against its ceiling |
| `.margin-note` · `.footnotes` `.fn-ref` | A note glosses; a footnote sources |

Everything is roles-only, so it reskins with the tokens. **Never hand-write a
colour.** If you need something bespoke, use the token variables.

**There is no surface fill.** A `.panel`, a `pre`, a `.diagram` and a table are
bounded by their edge, never by a background step — `--color-surface` was
removed because it measured 1.03:1 against the canvas and never rendered. Do not
reintroduce a panel background; if you need separation, use a line tier or use
space.

### Interactive tables

Add `is-sortable` to a table for click-to-sort columns (`data-nosort` on a
header opts out). For filtering, put a `.filter-bar` above it with an input
carrying `data-filter-target="#tableId"` and optionally `data-filter-count`.
For expandable rows, give a row `has-detail` and follow it with a `tr.detail`.

Sorting is numeric when a column's cells parse as numbers — otherwise "10"
sorts before "9" and the table quietly lies.

### Tabs

Hidden radios drive the panels in pure CSS, so a tab switch costs no script.
The script upgrades the labels to an ARIA tablist with arrow keys, but the radio
stays the state — the enhanced and unenhanced pages cannot disagree.

```
<div class="tabs">
  <input class="tab-radio" type="radio" name="g" id="g-1" checked>
  <input class="tab-radio" type="radio" name="g" id="g-2">
  <div class="tab-list"><label class="tab" for="g-1">ONE</label>…</div>
  <div class="tab-panels"><section class="tab-panel">…</section>…</div>
</div>
```

The pairing is **positional** — the nth radio shows the nth panel — so radios
must be direct children of `.tabs`, labels of `.tab-list`, panels of
`.tab-panels`. Six tabs is the ceiling; a seventh is a document that wants
sections. Every panel is revealed when the page prints.

> **Tabs hide content.** Never put a finding behind one — put the alternate
> *view* of a finding behind one: the chart and its data table, the summary and
> the raw log, the result and the method. If a reader must open every tab to
> follow the section, the section wanted headings.

### Disclosure, timeline, meter

`details.disclosure` inside `.accordion` is native, so it opens with the script
stripped. Use it for the long tail — evidence, method, the full log.

`.timeline > .event` (`.when` + `.what` + `.detail`) is for a sequence where the
**interval** carries meaning. If the gaps say nothing, it is a list.

`.meter` is one number against its ceiling: `.meter-fill` sized with `--v`,
`.meter-mark` placed with `--at` for the threshold. Give the track
`role="meter"` and the aria-value attributes — the bar alone tells a screen
reader nothing. It borrows the chart's accent-dashed target language, so a
budget reads the same in a meter and in a chart.

---

## 4. Diagrams

**A diagram earns its place by showing a mechanism.** How something works, what
depends on what, what is inside a boundary and what is outside it. If it is
restating a list, it is decoration — and a list is better.

Four forms cover almost every document. Wrap each in
`<figure class="diagram">` with a `<figcaption>` that says what to take from it.

| Form | Use when | Anatomy |
|---|---|---|
| **Flow** | Order is causal, not merely sequential | A spine, stages along it, and — often the most useful part — a band underneath carrying what verified each stage or what it cost |
| **Anatomy** | Showing what sits inside a boundary vs outside | Nested boxes. The strongest way to draw a blind spot, a scope, or a contract |
| **Graph** | The point is that the order is *forced* | Nodes and edges. `.is-hard` for a real dependency, plain for a soft one. If every edge looks the same you are only saying things are connected |
| **Field** | Placing many items at once, where the placement is the argument | Two axes, quadrants named. Label the quadrants with verbs — "do first", "defer" |

Style with the `d-` classes rather than inline fills: `.d-node` (`.is-active`
for the subject, `.is-ghost` for something absent or invisible), `.d-title`,
`.d-label`, `.d-sub`, `.d-edge`, `.d-rule`, `.d-quadrant`, `.d-dot`.

**Rules that keep them legible.**

- Give every `<svg>` a `role="img"` and an `aria-label` that states the finding,
  not the shape. A screen reader should get the point without the picture.
- Two type sizes maximum inside a diagram: a title and a sub.
- The accent marks the subject. If three things are accented, none of them are.
- A dashed ghost box says "absent" or "invisible" and nothing else. Do not use
  dashes for emphasis.
- Diagrams sit inside `.diagram`, which scrolls. Give the SVG a `viewBox` and no
  fixed width, so it scales.

---

## 4a. Line, weight and the accent budget

**Line carries the hierarchy.** This tier draws structure with line and nothing
else, so line needs the range elevation would otherwise provide. Pick the tier
by what the boundary *means*:

| Token | Weight | Job |
|---|---|---|
| `--color-ambient` | 1px | subdivision *inside* a block — table rules, grid overlays |
| `--color-line` | 1px | the edge *of* a thing — panel, figure, input. The default |
| `--color-line-strong` | 2px | a boundary that outranks its neighbours — section heads, the panel carrying the finding |
| `--color-accent` | 2px | live state, or the one mark the document is making |

If every rule in a document is the same 1px, nothing outranks anything and the
page dissolves when you stop reading it. Squint at the draft: what survives
should be what matters.

**Weights carry jobs.** 500 for labels and eyebrows (400 reads frail at 10–12px
on this ground), 600 for inline emphasis and buttons, 700 for headings only.

**The accent has a budget** — a handful of events per screen, not a texture.
Spend it on status, on the focus ring, and on the one mark the document exists
to make. Never on a uniform table column, a measuring bar, inline code, or
hover. If every row is accented, the accent distinguishes nothing. The worked
example spends lime twice in 5,200px, and that is why it reads.

**Glow is emission, not a drop shadow** — zero offset, tight bright core, thin
falloff. It means *this is on*: focus, live values, a growing edge. Never hover.

---

## 5. Charts

Load `thl.chart.css`. Then:

- **The accent is never a series colour.** It measures OKLCH L 0.944, far
  outside the band a categorical palette needs on this ground. It is reserved
  for emphasis — a highlighted mark, a target line, a sparkline endpoint.
  `--color-critical` and `--color-warning` are status and are never reused as a
  series.
- **Four series is the ceiling.** `.series-1` … `.series-4`, in fixed order,
  never cycled. The palette clears its floors on **all** pairs — an exhaustive
  search found no fifth colour that does so while staying clear of the accent
  and status hues. A fifth series folds into "Other", becomes small multiples,
  or means the chart is the wrong form.
- **One y-axis. Never two.** Two measures of different scale become two charts,
  small multiples, or one indexed to a common base.
- **A legend is always present from two series up**, so identity is never colour
  alone. Direct-label where it fits.
- **Text wears text tokens**, never the series colour.
- Sequential data uses `--chart-seq-*` (one hue, monotone lightness). Diverging
  uses `--chart-div-*`, whose midpoint is a neutral grey — never a hue.
- Marks are square-ended. This system resets radius and every surface is
  hard-edged.

**Anatomy the example gets right, and you should copy.** A chart without a value
axis is a picture of a trend, not a measurement — label the gridlines. Stacked
segments go in one `<g class="stack">` **per column**, which is what applies the
2px surface gap between fills; wrapping every segment in a single group looks
identical in the markup and silently loses the separation. Put a target or
threshold line where the data is *not* — a label parked next to the final point
collides with it.

Add `has-tooltip` to an SVG and `data-tip` to its marks for hover and keyboard
tooltips, when the script layer is loaded. Enhancers are idempotent, so calling
`thlInteract()` explicitly on a page that also auto-inits is safe.

**Before choosing a chart, ask whether it should be one.** A single number is a
`.stat`. Three numbers are usually a `.spec-list`. A chart earns its space when
the shape of the data is the point.

**If you change the palette**, run `validate-palette` — it is wired into lint
and reads the shipped values. Do not relax the thresholds.

---

## 6. Voice

The register is a lab notebook driving an instrument panel. It is consistent
across the system and it is most of what makes output recognisable.

- **Labels and eyebrows are `SCREAMING_SNAKE_CASE`** — `RESEARCH_OBJECTIVE`,
  `FIELD_SAMPLES`, `DEPTH_CALIBRATION`.
- **`//` separates the parts of a label** — `AUDIT // Q3_REVIEW`.
- **Status words come from instrumentation** — `NOMINAL`, `RENDERING`,
  `SIGNAL_LOST`, `DEGRADED`. Not "OK", "Done", "Error".
- **Identifiers look like readings** — `SYSTEM_ID: 0x8291`, `LAYER_01`.
- **Back-links are drawn** — `<- HOME`.

Prose itself is plain and declarative. The instrument vocabulary belongs to
labels and chrome; **body copy is not written in it.**

---

## 7. Editorial rules

These are what separate a document that uses the classes from one that reads.

**Headings state the finding, not the topic.** "Colours are named by appearance,
not by role" beats "Colour naming". A section head is a claim you then support.

**A stat is three parts.** `.label` says what is counted, `.value` is the
number, `.foot` qualifies it — the denominator, the caveat, the trend. A number
without a foot invites the wrong conclusion.

**A chip carries its own word.** State must never depend on colour alone.
`DEGRADED` in orange, not an orange dot.

**Tables lead with a key column.** The first column identifies the row; give it
`class="key"`. Everything after it describes.

**Structural devices must encode something true.** Numbered markers are for
genuine sequences. Severity chips are for real severity. If a device is not
carrying information, remove it — the system's whole argument is that every
element earns its place.

**Say what is not known.** A document that reports only what worked is not
trustworthy. Mark what was unverified, what was assumed, what would falsify the
conclusion. Both this kit and the system it documents were built that way.

**Wide content scrolls in its own container.** The page body never scrolls
sideways.

---

## 8. Hard rules

- **Never re-derive the palette inline.** Copying hex values into a new `<style>`
  block is the exact drift this kit exists to prevent. If a value is missing,
  add a token upstream and regenerate.
- **Never link a font, script or stylesheet from a CDN.** Inline or omit.
- **Dark only**, by policy. Do not add a light theme.
- **Zero border radius**, everywhere. A deliberate constraint, not an omission.
- **`--color-ambient` never carries text.** It is a line colour and does not meet
  the contrast floor. This includes the `//` separators in an eyebrow — use
  `--color-ink-subtle` and let the line tokens draw lines.
- **No fifth series colour, and no black one.** The fold-in slot is a neutral or
  a textured fill, never `#000` — on this ground black reads as a hole in the
  chart rather than a category.
- Give keyboard focus a visible state and respect `prefers-reduced-motion` —
  the reset already does both; do not undo them.
- Every `<svg>` gets `role="img"` and a meaningful `aria-label`.
