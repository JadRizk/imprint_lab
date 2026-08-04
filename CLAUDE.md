# CLAUDE.md — Project Intelligence

## Project Overview

Personal portfolio website built as a Turborepo monorepo. The main application lives in `apps/web` (Next.js 16, React 19). The shared design system lives in `packages/ui` (shadcn/ui + custom components, Tailwind CSS). Portfolio content is static TypeScript data co-located with its section.

## Tech Stack

- **Runtime**: Bun 1.2.17 (package manager + runtime)
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, shadcn/ui, Tailwind CSS v4
- **Language**: TypeScript 5.9 (strict mode)
- **Monorepo**: Turborepo 2.7
- **Linting/Formatting**: Biome 2.2
- **Fonts**: Space Grotesk (sans) + IBM Plex Mono (mono)

## Monorepo Structure

```
wtf/
├── apps/
│   └── web/                          # Portfolio website
│       └── app/
│           ├── sections/             # Feature modules (hero, projects, about, contact, etc.)
│           │   └── <section>/
│           │       ├── components/   # Section-scoped components
│           │       ├── hooks/        # Section-scoped hooks (if needed)
│           │       └── data.ts       # Static content for this section
│           ├── components/           # App-wide shared components (nav, footer, layout shells)
│           ├── lib/                  # App-level utilities
│           ├── layout.tsx
│           └── page.tsx              # Composes sections
├── packages/
│   ├── ui/                           # Design system
│   │   ├── src/
│   │   │   ├── components/           # shadcn/ui components + custom primitives
│   │   │   └── lib/                  # cn() utility, shared helpers
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── tailwind-config/              # Shared Tailwind preset (design tokens)
│   └── typescript-config/            # Shared TypeScript configs
```

## Architecture Principles

### Modular-First

Every portfolio section (hero, projects, about, contact) is a self-contained module:

- Components, hooks, and data **co-locate** with their section under `app/sections/<name>/`
- Each section exports a single root component (e.g., `HeroSection`)
- `app/page.tsx` composes sections — it should read as a table of contents
- Only components used across 2+ sections get promoted to `app/components/` or `packages/ui/`

### Component Hierarchy

1. **`packages/ui`** — Design system primitives (Button, Card, Input, etc.). These are framework-agnostic, style-agnostic building blocks. shadcn/ui components live here.
2. **`app/components/`** — App-specific shared components (Navbar, Footer, ThemeToggle). These use `@repo/ui` primitives and know about the app's layout/routing.
3. **`app/sections/<name>/components/`** — Section-scoped components. These are private to their section and should not be imported elsewhere.

### Server-First Rendering

- Default to React Server Components (RSC). No `"use client"` unless the component needs browser APIs, event handlers, or React state/effects.
- Keep client boundaries as small and as deep in the tree as possible.
- Data fetching happens in Server Components; pass data down as props.

### Static Data Pattern

Portfolio content is defined as typed TypeScript constants:

```ts
// app/sections/projects/data.ts
import type { Project } from "./types";

export const projects: Project[] = [
  { title: "...", description: "...", href: "...", tags: ["..."] },
];
```

Each section owns its types and data. No global data layer needed.

## Design System (`packages/ui`)

### shadcn/ui Integration

- shadcn/ui components are installed into `packages/ui/src/components/`
- All apps consume components from `@repo/ui` — never install shadcn directly in an app
- Customize shadcn components by editing them in-place (they are copy-pasted, not node_modules)
- Use the `cn()` utility from `packages/ui/src/lib/utils.ts` for conditional class merging

### Tailwind CSS

- `packages/tailwind-config/` exports a shared preset defining design tokens (colors, typography scale, spacing scale, border radii, shadows)
- Each workspace (`apps/web`, `packages/ui`) has its own `tailwind.config` that extends the shared preset
- CSS custom properties bridge Tailwind tokens to runtime theming (dark/light mode)
- Use Tailwind utility classes as the primary styling method
- CSS Modules only when Tailwind utilities are genuinely insufficient (complex animations, etc.)

### Import Convention

```tsx
// Importing from the design system
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { tokens } from "@repo/tailwind-config/tokens";
```

The `@repo/ui` package uses an explicit `exports` map — every public component is listed by path. Adding a new component means editing `packages/ui/package.json`.

### Consumer Wiring Contract

The design system is portable — any Next.js app can adopt it with two imports and two font variables. See `packages/tailwind-config/README.md` for the full bootstrap.

**globals.css** (single import for tokens + base layer):

```css
@import "tailwindcss";
@import "@repo/tailwind-config";

@theme inline {
  --font-sans-face: var(--font-space-grotesk, "Space Grotesk", sans-serif);
  --font-mono-face: var(--font-ibm-plex-mono, "IBM Plex Mono", monospace);
}
```

**layout.tsx** must expose `--font-space-grotesk` and `--font-ibm-plex-mono` via `next/font` (both fonts loaded at weights 300–700).

The tokens `--font-sans` / `--font-mono` resolve through the `-face` indirection. Substitute a different sans/mono by pointing those two variables somewhere else — the design system itself never names a font.

### Token Generation

`packages/tailwind-config/tokens.generated.ts` is auto-generated from `theme.css`. It is the single source of truth for anything that needs to enumerate tokens (like the `/design-system` reference table). Regenerate after editing `theme.css`:

```bash
bun run --filter=@repo/tailwind-config generate:tokens
```

Turbo runs this as the package's `build` step, so any `turbo build` picks up changes automatically.

### Theming Policy

Dark mode only, for now. `html { color-scheme: dark }` is hard-coded in the base layer and every token is a single value. Light-mode support is deferred — when added, it will layer under `[data-theme]` selectors without changing the current default values.

### Contrast Policy

**Any token used for text must clear 4.5:1 against `--color-obsidian`.** Measured ratios live as comments beside each token in `theme.css`. This is not negotiable per-component — if a label looks too loud, change the hierarchy or the size, not the contrast.

Decoration and text are separate concerns and use separate tokens:

| Token | Ratio | Use for |
|-------|-------|---------|
| `--color-text-secondary` `#A3A3A3` | 7.62:1 | Body copy — this is the `body` default, so it rarely needs stating |
| `--color-text-tertiary` `#7C7C7C` | 4.59:1 | Labels, metadata, tags, eyebrows |
| `--color-ambient` `#3A3A3A` | — | **Decoration only.** Grid overlays, idle brackets, rules. Never text. |

The generator deliberately omits a `text-*` utility from `--color-ambient`'s row in the reference table, and `/design-system` prints `DECORATION ONLY — NEVER TEXT` under its swatch.

### Type Scale

`theme.css` resets `--text-*`, so the scale is **closed** — `micro` through `6xl` are the only sizes that exist. `text-micro` (10px) is the instrument-label step the interface leans on for metadata and eyebrows; reach for it instead of an arbitrary `text-[10px]`.

Letter-spacing for eyebrows and labels is `tracking-label` (0.2em). Don't hand-pick `tracking-widest` for that role.

> **Adding a scale value means updating `cn()`.** `tailwind-merge` cannot tell a custom font size from a color, so `text-micro` and `text-text-tertiary` land in the same conflict group and the color gets silently dropped. Custom scale names must be registered in `extendTailwindMerge` in `packages/ui/src/lib/utils.ts`.

### Layout Primitives

- **`PageShell`** owns the horizontal gutter and page measure (`default` 1280px · `prose` 3xl · `full`). Use it instead of Tailwind's `container`, whose width varies by breakpoint. **Never nest it** — a section that already sits inside a shell should lay out at full width and let the parent own the gutter.
- **`SectionHeader`** is the lime-square eyebrow. Use it rather than rebuilding the square-plus-label pattern.

Sections that bring their own `PageShell` (like `HeroSection`) must be rendered *outside* a parent shell — see the `bleed` prop on `/design-system`'s `Spec` wrapper.

## Coding Conventions

### TypeScript

- Strict mode always. No `any` — use `unknown` and narrow.
- Prefer `interface` for object shapes, `type` for unions/intersections/mapped types.
- Export types alongside their implementations. Use `import type` for type-only imports.
- Name files in kebab-case: `project-card.tsx`, `use-scroll-position.ts`

### React

- Functional components only. Use `function` declarations for named exports.
- Props interfaces named `<Component>Props` (e.g., `ProjectCardProps`).
- Colocate component + its types in the same file unless the type is shared.
- Prefer composition over configuration — small components composed together beat large components with many props.

### File Naming

- Components: `kebab-case.tsx` (e.g., `project-card.tsx`)
- Hooks: `use-<name>.ts` (e.g., `use-scroll-position.ts`)
- Types: `types.ts` within a module directory
- Data: `data.ts` within a section directory
- Utilities: `kebab-case.ts`

### Imports

- Use path aliases: `@/` maps to `apps/web/app/`
- Use package imports: `@repo/ui`, `@repo/tailwind-config`
- Order: (1) React/Next.js, (2) external packages, (3) `@repo/*`, (4) `@/` local imports — separated by blank lines

## Commands

```bash
bun install              # Install dependencies
bun run dev              # Start all dev servers (turbo)
bun run build            # Build all packages + apps
bun run lint             # Lint all workspaces (biome check)
bun run check-types      # Type-check all workspaces
bun run format           # Format with Biome
bun run check            # Run Biome check (lint + format) from root
```

## Key Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| App structure | Feature/section-based modules | Modular-first: each section is self-contained with its own components, hooks, data |
| Design system location | shadcn/ui in `packages/ui` | Single source of truth; all apps consume from `@repo/ui` |
| Tailwind config | Shared preset in `packages/tailwind-config` | Consistent design tokens across all workspaces |
| Content strategy | Static TypeScript constants | Simple, type-safe, no external dependencies; co-located with sections |
| Rendering default | React Server Components | Performance-first; client boundaries only when needed |
| Package manager | Bun | Already configured; fast installs and script execution |
| Linting/Formatting | Biome | Single tool replacing ESLint + Prettier; faster, simpler config |
| Text contrast | 4.5:1 floor, enforced by token | Dimness was making labels unreadable (2.6:1); splitting decoration into `--color-ambient` keeps the mood without sacrificing legibility |
| Type scale | Closed, tokenized, incl. `micro` | `--text-*` is reset so the scale can't silently fall back to Tailwind's defaults; kills 40 `text-[10px]` magic numbers |
| Button sizing | Explicit heights on the 4px grid | Icon and text buttons of the same size are now identical heights (24 / 36 / 48); previously `icon` was 48 while `default` was 34 |
| Page measure | `PageShell`, not `container` | Tailwind's `container` is breakpoint-dependent, which is how `/` ended up 768px while other routes were 1280px |
