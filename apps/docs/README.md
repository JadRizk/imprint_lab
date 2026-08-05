# docs

The only app. Showcase and registry host.

```bash
bun run dev            # :3001
bun run registry:build # rebuilds public/r and stages the report-kit bundles
```

## Routes

```
/                                    the systems index
/systems/human-laboratory            thesis — rendered from the system's BRAND.md
/systems/human-laboratory/components the showcase
/systems/human-laboratory/example    a whole page built in the system
/systems/human-laboratory/report     the report kit, live in an iframe
```

It imports `systems/*/ui/` **directly**, not through the registry, so the docs
never lag the source. The install path is proven separately by `bun run smoke`.

The report tab is an iframe rather than a re-implementation: `catalog.html`
carries its own reset and would fight the app's cascade, and this way what
renders is the standalone bundle exactly as a consumer receives it.

## Adding a system

An entry in `lib/systems.ts`, an `@import` of its `theme.scoped.css` in
`app/globals.css`, a `@source` line for its `ui/`, and a page under
`app/systems/<slug>/`.

> `public/r/` and the staged `thl.*` files are generated at build time and
> gitignored. Do not commit them.
