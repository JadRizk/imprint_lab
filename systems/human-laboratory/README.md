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
| `ui/` | Six React components, roles only, enforced by `check-roles` |
| [`static/`](static) | The report kit — pure HTML/CSS, no build step |
| `brand/` | Wordmark, favicon, OG card |
| `registry.json` | The `@thl` namespace: a style item, six components, the report kit |

## Components

`Button` · `PageShell` · `SectionHeader` · `BentoGrid` · `BentoCard` ·
`ImageFrame`

Each references role tokens only, which is what lets it move to another system
unchanged. `PageShell` owns the page gutter and measure — use it instead of
Tailwind's `container`, and never nest it.

The coverage gap is real and known: no input, card, badge, dialog or table yet.

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
{ "registries": { "@thl": "https://imprint-lab.vercel.app/r/thl/{name}.json" } }
```

Then `npx shadcn add @thl/button`, or `@thl/report-kit` for the document tier.
The `style` item carries the tokens, base layer and `cn()`, and every component
depends on it.
