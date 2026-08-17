# Sample plates

Placeholder photography for `ImageFrame` on the example page. Three files, 442KB
total, committed deliberately.

## Why they are committed rather than fetched

The example page and the component gallery used to point `ImageFrame` at
`https://picsum.photos/seed/…`, which is a runtime dependency on a third party
for the imagery of the one artifact meant to prove this system assembles.
That fails in three ways nothing in CI would catch: offline, under a strict CSP
(the same constraint the report kit already designs around — see
`static/SKILL.md`), and on a slow connection, where the flagship demo paints a
row of empty frames.

They are served through `asset()` from [`lib/base-path.ts`](../../lib/base-path.ts),
not as a bare `/samples/…`, because GitHub Pages serves this site under
`/imprint_lab` and Next does not rewrite a raw `src`.

## Provenance

| File | Source | Rendered at |
|---|---|---|
| `specimen-01.jpg` | Lorem Picsum, seed `thl-hero`, 1400×933 | hero frame, ~830px wide |
| `specimen-02.jpg` | Lorem Picsum, seed `demo-a`, 1000×750 | field sample, ~440px wide |
| `specimen-03.jpg` | Lorem Picsum, seed `demo-b`, 1000×750 | field sample, ~440px wide |

Lorem Picsum serves Unsplash photographs. The Unsplash License permits use,
including commercially, without attribution. The seeds are the ones the page
already used, so the composition is unchanged from what it rendered before.

**These are placeholders.** Swap them for real artwork when there is any, and
update the `alt` text in [`example/data.ts`](../../app/systems/human-laboratory/example/data.ts)
and [`example/page.tsx`](../../app/systems/human-laboratory/example/page.tsx) to
describe what the picture actually shows — the current strings describe a stand-in,
which is honest only while one is what is there.

## The fourth path is meant to 404

`example/page.tsx` points `SAMPLE_C` at `/samples/does-not-exist.jpg` on purpose:
it is what exercises `ImageFrame`'s `SIGNAL_LOST` state. Do not "fix" it by
adding the file.
