# CLAUDE.md — Project Intelligence

## Project Overview

Personal portfolio website built as a Turborepo monorepo. The main application lives in `apps/web` (Next.js 16, React 19). The shared design system lives in `packages/ui` (shadcn/ui + custom components, Tailwind CSS). Portfolio content is static TypeScript data co-located with its section.

## Tech Stack

- **Runtime**: Bun 1.2.17 (package manager + runtime)
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, shadcn/ui, Tailwind CSS v4
- **Language**: TypeScript 5.9 (strict mode)
- **Monorepo**: Turborepo 2.7
- **Linting**: ESLint 9 (flat config), Prettier
- **Fonts**: Geist Sans + Geist Mono

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
│   ├── eslint-config/                # Shared ESLint configs
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
```

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
bun run lint             # Lint all workspaces
bun run check-types      # Type-check all workspaces
bun run format           # Format with Prettier
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
