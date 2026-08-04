# Brand — The Human Laboratory

The mark belongs to **the system, not the house**. `imprint_lab` has no mark and
should not acquire one until it has more than one inhabitant to be neutral
between. Everything here ships with `@thl` through the registry, which is what
keeps the system extractable.

## The mark

A bounded thing with one edge promoted a tier. The frame is `--color-line`, the
corner is `--color-accent` at twice the weight — **the 1:2 ratio is the line
ladder**, not a proportion chosen by eye. The mark argues the system's central
claim rather than decorating with it.

| File | For |
|---|---|
| `mark.svg` | The mark. Frame + live corner. |
| `mark-mono.svg` | Print, single-colour, any ground without the accent. |
| `favicon.svg` | **A different drawing.** See below. |

The React tier is `Mark` and `Wordmark` in [`../ui/components/`](../ui/components).
They reference roles only, so they reskin under another system unchanged — which
a flat SVG cannot do.

## The geometry is fixed

At a 32px render the frame stroke spans pixels 4–6 and the accent spans 4–8,
both on whole pixels; at 16px they halve cleanly. **Changing the stroke widths
breaks that alignment** and the mark softens at exactly the sizes it is hardest
to fix. If it must be redrawn, keep the 1:2 ratio and keep both strokes even.

- **Live corner: top-left.** Read first, and in a horizontal lockup it leads the
  eye into the name. Rotating it is a semantic change, not a layout one —
  bottom-right would say *growing edge* instead of *origin*.
- **Arm: 42% of the side.** Shorter disappears at 16px; longer stops reading as
  a corner and becomes two adjacent edges, at which point the frame does nothing.
- **Clear space: 4 units of the 32-unit grid** — one frame stroke plus one — on
  every side. The frame is the boundary, so clear space is measured from it.
- **Minimum size: 24px** for `mark.svg`. Below that use `favicon.svg`.

## It does not glow

Glow follows current — focus, an active item, a live readout, a growing edge — and
a brand mark is none of those. A permanently emitting logo is the decorative
spend `--shadow-glow` exists to prevent. `Mark` therefore has no `glow` prop.

## The favicon is not an export

Two measured reasons. A 1px stroke in `--color-line` is 1.69:1 against the canvas
and stops rendering below roughly 24px, so at 16px the frame contributes noise
rather than structure — it is dropped entirely. And a transparent mark disappears
against chrome this system does not control, so the obsidian tile is part of the
artwork rather than something the browser supplies.

The favicon spends the accent for **mass** rather than as signal. That is a
deliberate exception to the accent budget, justified the same way
`--color-warning` being darker than `--color-critical` is: on this ground,
legibility outranks the general rule. Lime measures 16.83:1 and is the only value
in the palette that survives at 16px.

## There is no wordmark SVG, on purpose

This system **names no font** — it resolves `--font-mono` through a
consumer-defined `--font-mono-face`. An SVG with the letterforms outlined would
hard-code a typeface the system deliberately refuses to specify; an SVG with live
`<text>` would fall back silently to whatever mono the viewer happens to have.

So the wordmark is *type*, set in the system's own rules: mono, weight 500,
uppercase, `tracking-label`. Use the `Wordmark` component, or in a standalone
HTML document use the snippet in
[`../static/SKILL.md`](../static/SKILL.md).

**The namespace is neutral, not accent.** The mark already spends the accent, and
two lime events in one lockup is the same budget violation `SectionHeader` was
fixed for.

## Raster

`favicon-32.png` and `apple-icon-180.png` are generated from `favicon.svg`, not
drawn by hand:

```bash
bun run brand:raster
```

It also validates every SVG here. **An SVG comment may not contain a double
hyphen** — XML forbids it — and every CSS custom property name starts with one,
so writing `--color-line` in a comment makes the file invalid and it silently
stops loading as `<img>` or as a favicon. Reference roles without the leading
dashes. This shipped broken once: the fault is invisible to anything that
*inlines* the SVG into HTML, because HTML parsing is lenient.

`.verify/favicon-16.png` is generated but not shipped. It exists so the 16px
claim above is checked against a real raster rather than a browser-scaled
vector, which is a materially easier test.

Regenerate them if `favicon.svg` changes. They are committed so a checkout
without a build still has them.
