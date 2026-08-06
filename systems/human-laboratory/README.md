# The Human Laboratory — `@thl`

System 01. Neo-brutalist: obsidian ground, a single lime signal, hard borders,
monospaced body.

Read [`BRAND.md`](BRAND.md) first — the thesis, the voice and the
non-negotiables. It is the canonical source, and the docs site renders it rather
than restating it.

## What is here

| | |
|---|---|
| [`tokens/`](tokens) | `theme.css` is the source of truth; five artifacts generated from it |
| `ui/` | Eight React components, roles only, enforced by `check-roles` |
| [`static/`](static) | The report kit — pure HTML/CSS, no build step |
| [`brand/`](brand) | The mark, its monochrome and favicon variants, and the rules |
| `registry.json` | The `@thl` namespace: a style item, eight components, the report kit, the brand |
| [`CHANGELOG.md`](CHANGELOG.md) | Every release — and the **only** declaration of this system's version |

## Components

`Button` · `PageShell` · `SectionHeader` · `BentoGrid` · `BentoCard` ·
`ImageFrame` · `Mark` · `Wordmark`

Each references role tokens only, which is what lets it move to another system
unchanged. `PageShell` owns the page gutter and measure — use it instead of
Tailwind's `container`, and never nest it.

The coverage gap is real and known: no input, card, badge, dialog or table yet.

## The mark

A bounded frame with one corner promoted a tier — the 1:2 line-to-accent ratio
is the line ladder itself. It belongs to **this system, not to imprint_lab**,
which has no mark and should not get one until it has more than one inhabitant
to be neutral between. Read [`brand/README.md`](brand/README.md) before changing
any of it; the geometry is pixel-honest and the stroke widths are load-bearing.

## The report kit

Any HTML document produced for a project that has adopted this system should use
it rather than hand-rolled CSS. **Read
[`static/SKILL.md`](static/SKILL.md)** — it carries the class vocabulary, the
four diagram forms, the chart rules and the editorial voice.

- [`static/catalog.html`](static/catalog.html) — every class, in isolation
- [`static/example-report.html`](static/example-report.html) — a worked specimen
  with all the forms composed together

## Installing it elsewhere

```json
{ "registries": { "@thl": "https://jadrizk.github.io/imprint_lab/r/thl/{name}.json" } }
```

Then `npx shadcn add @thl/button`, or `@thl/report-kit` for the document tier.
The `style` item carries the tokens, base layer and `cn()`, and every component
depends on it.

It also carries `version.generated.ts`, which lands at `~/thl/lib/` and is how
you find out later which version you adopted — the registry can advertise a
version but `shadcn add` records none, so it has to arrive as a file. Report-kit
stylesheets carry it in their header for the same reason, since a standalone
document has no JavaScript to import it from.

Releases are tagged `thl/v<version>` and published from
[`CHANGELOG.md`](CHANGELOG.md), which is the single declaration of the number.
