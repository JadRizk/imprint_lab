# @thl/tokens

Design tokens and base layer for The Human Laboratory.

`theme.css` is the **only hand-authored file** here. Everything under
`generated/` is emitted from it by `@imprint/token-tools` and must not be edited.

## What ships

| | |
|---|---|
| `theme.css` | Tokens — primitives, roles, type scale, shadows, animation. Plus the `@keyframes` and the `.scan-line` utility. |
| `base.css` | The opinions — reset, dark colour scheme, crosshair cursor, mono body / sans headings, selection, scrollbar. Separate so a consumer can take the tokens without the attitude. |
| `generated/tokens.ts` | Typed token list, for docs tables and introspection. |
| `generated/tokens.css` | Plain `:root` custom properties — no Tailwind, no build step. What a standalone document inlines. |
| `generated/theme.scoped.css` | The same tokens under `[data-system="human-laboratory"]`, so the docs app can render several systems on one page. |
| `generated/tokens.json` | Token interchange. **Does not currently conform to DTCG** — see `REMEDIATION.md` R7. |

The `extendTailwindMerge` config is emitted next to `cn()` at
`../ui/lib/tw-merge.generated.ts`, not here: a registry consumer receives `ui/`
as plain files with no workspace to resolve a scoped package against, so the
import has to be relative.

## Two tiers

**Primitives** are named by appearance and are private to this system —
`--color-lime`, `--color-obsidian`, `--color-steel`.

**Roles** are named by job and carry the same fourteen names in every system —
`--color-canvas`, `--color-ambient`, `--color-line`, `--color-line-strong`,
`--color-ink`, `--color-ink-muted`, `--color-ink-subtle`, `--color-accent`,
`--color-accent-ink`, `--color-critical`, `--color-warning`, `--color-nominal`,
`--color-unmeasured`, `--color-status-ink`. Plus the two non-colour roles,
`--shadow-glow` and `--shadow-glow-strong`.

There is deliberately **no `--color-surface`** — see the note in `theme.css`.
This list is the one `check-roles` enforces (`ROLE_COLOR_NAMES` in
`token-tools/lib/emit.mjs`) and the one CLAUDE.md contract 1 states.

Components reference roles only. `check-roles` enforces it.

Two decisions worth knowing: **`nominal` is not the accent** — lime still
signals `NOMINAL` where the system speaks about itself, but a surface that
reports state per item makes success the absence of colour, because the
commonest state cannot wear the loudest ink — and **warning is orange, not
amber**, because amber sits too close to lime on this ground and reads as the
accent.

## Consumer bootstrap

Two files. In `globals.css`:

```css
@import "tailwindcss";
@import "@thl/tokens";
@import "@thl/tokens/base.css";
@source "../../../systems/human-laboratory/ui";

@theme inline {
  --font-sans-face: var(--font-space-grotesk, "Space Grotesk", sans-serif);
  --font-mono-face: var(--font-ibm-plex-mono, "IBM Plex Mono", monospace);
}
```

Then expose those two font variables from your layout via `next/font`, loading
Space Grotesk and IBM Plex Mono at weights 300–700.

**The design system names no font.** `--font-sans` and `--font-mono` resolve
through the `-face` indirection, so substituting a different pairing means
pointing those two variables somewhere else and changing nothing here.

## Regenerating

```bash
bun run --filter=@thl/tokens generate:tokens
```

`turbo build` runs it as this package's build step, so any build picks up a
`theme.css` edit. `bun run lint` runs `validate-palette` against the chart
series — do not relax its thresholds to make an edit pass.

## Notes

`@theme` carries `static`, which keeps unused tokens from being tree-shaken.
That is deliberate: hand-authored CSS — a component's CSS module, a report
stylesheet — must be able to rely on a variable existing regardless of whether a
utility happens to reference it. Measured cost is 328 bytes.
