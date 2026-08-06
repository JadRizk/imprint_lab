# imprint_lab

A house of design systems.

Each system owns its tokens, components, report kit, brand and version history,
and evolves on its own timeline. Projects live in their own repositories and
adopt a system at a version. **This repository produces design systems; it does
not contain products.**

Currently one inhabitant: **The Human Laboratory** (`@thl`) — neo-brutalist,
obsidian ground, a single lime signal, hard borders, monospaced body.

---

## Layout

```
systems/                   each self-contained · no cross-imports between systems
  human-laboratory/
    tokens/                theme.css is the source of truth; five artifacts generated
    ui/                    React components · roles only, lint-enforced
    static/                the report kit — pure HTML/CSS, no build step
    registry.json          the @thl namespace
    BRAND.md               thesis and voice
packages/
  token-tools/             the token pipeline, shared by every system
  system-template/         `bun run new-system`
  typescript-config/
apps/
  docs/                    the site: thesis · components · example · report kit
```

There is deliberately no `packages/core`. A shared component layer designed today
would be The Human Laboratory wearing a generic name — it waits for a second
system to say what is actually common.

## Commands

| | |
|---|---|
| `bun install` | |
| `bun run dev` | the docs site on :3001 |
| `bun run build` | regenerates every token artifact, then builds |
| `bun run lint` | Biome, plus the role contract and the chart palette |
| `bun run check` | Biome across the repo |
| `bun run check-types` | |
| `bun run smoke` | proves the registry is installable |
| `bun run new-system <slug> <ns> ["Name"]` | scaffold a new design system |

## How a system is built

**Tokens come in two tiers.** *Primitives* (`--color-lime`) are named by
appearance and are private to a system. *Roles* (`--color-accent`) are named by
job and carry the same eleven names in every system. Components reference roles
only — that is what lets a component move to another system unchanged, and
`check-roles` fails the build if one reaches for a primitive.

**One file generates the rest.** `theme.css` is hand-authored; `token-tools`
emits typed tokens, a plain `:root` stylesheet, DTCG JSON, a scoped stylesheet
for the docs site, a tailwind-merge config, and the report-kit bundles. Nothing
under `generated/` or the `thl.*` bundles is edited by hand.

**Every system ships a report kit.** A pure HTML/CSS tier that produces
standalone documents — no React, no build step, no network request. See
[`systems/human-laboratory/static/SKILL.md`](systems/human-laboratory/static/SKILL.md).

## Consuming a system

Systems distribute through a shadcn-compatible registry, one namespace each:

```json
{ "registries": { "@thl": "https://jadrizk.github.io/imprint_lab/r/thl/{name}.json" } }
```

Then `npx shadcn add @thl/button`, or `@thl/report-kit` for the document tier.
Components are copied into your project, so per-project divergence is a feature
rather than a fork.

**The system version is the atomic unit.** Tokens, components, brand and report
kit ship together at one number, declared in the system's
[`CHANGELOG.md`](systems/human-laboratory/CHANGELOG.md) and nowhere else.

| Question | Answer |
|---|---|
| What is current? | `version` at the top of the registry index, or `meta.version` on any item |
| What did I install? | `~/thl/lib/version.generated.ts`, which arrives with the `style` item |
| What changed? | The changelog, and the [GitHub Release](https://github.com/JadRizk/imprint_lab/releases) published from it |

The second row is the one a registry cannot answer on its own: `shadcn add`
copies files and records no metadata, so the version has to arrive as a file or
it does not arrive at all. Every report-kit stylesheet carries it in its header
too, for documents that have no JavaScript to import anything from.

**Major means your copy breaks** — a role renamed or removed, a component's props
changed, a report-kit class deleted. **Minor** is additive. **Patch** moves a
value without renaming anything; that includes primitives like `--color-lime`,
which are private to the system and which no component is allowed to reference.

Releases are tagged per system — `thl/v1.0.0` — because each one evolves on its
own timeline.

## Working in this repo

- [`CLAUDE.md`](CLAUDE.md) — conventions and contracts, loaded into every session
- [`REFACTOR.md`](REFACTOR.md) — how the repo reached this shape, with the
  deviations and the gaps recorded rather than tidied away
- [`systems/human-laboratory/BRAND.md`](systems/human-laboratory/BRAND.md) — the
  system's thesis, voice and non-negotiables

**Dark mode only, by policy.** Zero border radius, everywhere. Both are
constraints, not omissions.
