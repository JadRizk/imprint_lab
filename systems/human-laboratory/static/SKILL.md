---
name: thl-report
description: Build a standalone HTML report, audit, spec or document in The Human Laboratory design system. Use whenever producing an HTML artifact, page, or report for a project that has adopted @thl — including Claude Code artifacts. Covers the stylesheet, the class vocabulary, the voice, and the chart rules.
---

# The Human Laboratory — report kit

A pure HTML/CSS tier. No React, no build step, no network request. Drop the
stylesheet in and the document is on-brand by construction.

## Wiring

Inline the bundle into a `<style>` block, or link it if the page can reach the
file. A strict CSP is the normal case for a standalone report, so **never link a
font CDN** — it will fail silently and the page will fall back to system faces.

```html
<style>/* contents of thl.fonts.css — optional, ~116KB, embeds Space Grotesk */</style>
<style>/* contents of thl.css     — required, ~14KB: tokens + reset + primitives */</style>
<style>/* contents of thl.chart.css — only if the report carries data */</style>
```

Order matters: fonts first (they set `--font-sans-face`), then `thl.css`.

Without the fonts bundle the page still renders correctly in a system mono
stack — that is a supported degradation, not a bug.

## Page skeleton

```html
<div class="wrap">
  <header class="masthead">
    <div class="eyebrow">PROJECT_NAME // DOCUMENT_TYPE // 2026-08-04</div>
    <h1>A sentence that states the finding, not the topic</h1>
    <p class="standfirst">Two or three lines that let a reader stop here.</p>
  </header>

  <section class="section">
    <div class="section-head">
      <h2>Section name</h2>
      <span class="note">optional right-aligned gloss</span>
    </div>
    …
  </section>

  <footer class="report-footer">
    <span>PROJECT // DOCUMENT // STATUS</span>
  </footer>
</div>
```

Use `.wrap--prose` instead of `.wrap` for reading-led documents; it narrows the
measure to 80ch. The default is wide, for tables and dashboards.

## The vocabulary

| Class | Use for |
|---|---|
| `.masthead` `.eyebrow` `.standfirst` | Page opening |
| `.section` `.section-head` `.lede` | Section structure |
| `.stat-grid` `.stat` | A row of headline numbers |
| `.table-wrap` + `<table>` | Any tabular data — the wrapper is what scrolls |
| `.chip` | State, with `.is-accent` / `.is-critical` / `.is-warning` |
| `.panel` `.has-brackets` | A bounded block; brackets add the corner motif |
| `.callout` | A claim that needs weight |
| `.spec-list` (`dl`/`dt`/`dd`) | Label→value pairs |
| `.swatch-grid` `.swatch` | Colour specimens; `.is-absent` for proposed values |
| `pre` `code` `.tree` | Code and directory trees |
| `.cols` | Responsive multi-column grid |
| `.rule` | Section divider |
| `.scan-line` | The CRT motif; needs a `position: relative` parent |

Everything is roles-only, so it reskins with the tokens. Do not hand-write
colours — use the token variables if you need something bespoke.

## Voice

The register is a lab notebook driving an instrument panel. It is consistent
across the whole system and it is most of what makes output recognisable.

- **Labels and eyebrows are `SCREAMING_SNAKE_CASE`** — `RESEARCH_OBJECTIVE`,
  `FIELD_SAMPLES`, `DEPTH_CALIBRATION`, `SIGNAL_PROCESSING`.
- **`//` separates parts of a label** — `DEMO // LANDING_PAGE`.
- **Status words come from instrumentation** — `NOMINAL`, `RENDERING`,
  `SIGNAL_LOST`, `UNDER_CONSTRUCTION`. Not "OK", "Done", "Error".
- **Identifiers look like readings** — `SYSTEM_ID: 0x8291`, `LAYER_01`.
- **Back-links are drawn, not worded** — `<- HOME`.
- Prose itself is plain and declarative. The instrument vocabulary belongs to
  labels and chrome; body copy should not be written in it.

Headings state the finding, not the topic. "Colours are named by appearance,
not by role" beats "Colour naming".

## Charts

Load `thl.chart.css`. Then:

- **The accent is never a series colour.** `--color-accent` sits at OKLCH
  L 0.944, far outside the band a categorical palette needs on a dark ground.
  It is reserved for emphasis — a highlighted mark, a target line, a sparkline
  endpoint. `--color-critical` and `--color-warning` are status and are never
  reused as "series 4".
- **Use `.series-1` … `.series-5` in fixed order, never cycled.** The palette
  was generated in OKLCH and validated: all five checks pass on both surfaces,
  worst adjacent CVD ΔE 8.2. A sixth series folds into "Other", becomes small
  multiples, or means the chart is the wrong form.
- **One y-axis. Never two.** Two measures of different scale become two charts.
- **A legend is always present from two series up**, so identity is never
  colour alone. Direct-label up to four.
- **Text wears text tokens**, never the series colour.
- Sequential data uses `--chart-seq-*` (one hue, monotone lightness). Diverging
  uses `--chart-div-*`, which has a neutral gray midpoint — never a hue.

## Rules

- **Never re-derive the palette inline.** Copying hex values into a new
  `<style>` block is the exact drift this kit exists to prevent. If a value is
  missing, add a token to `theme.css` and regenerate.
- Wide content scrolls in its own container; the page body never scrolls
  sideways.
- Give keyboard focus a visible state — the reset already does.
- Respect `prefers-reduced-motion` — the reset already does.
- The system is **dark only**, by policy. Do not add a light theme.
- Zero border radius everywhere. It is a deliberate constraint, not an omission.
