# @repo/tailwind-config

Design tokens + base layer for The Human Laboratory design system.

Ships:

- **Tokens** — colors, spacing, typography vars, shadows, animations (Tailwind v4 `@theme`).
- **Base layer** — body reset, dark color scheme, crosshair cursor, mono/sans mapping, selection, scrollbar.
- **`.scan-line` utility** — animated CRT-scan bar with gradient tail.
- **Generated `tokens` module** — typed TS export mirroring `theme.css` for docs/introspection.

## Consumer bootstrap

Two files in a consumer app are all you need.

**1. `globals.css`** — one CSS import, plus two font variables:

```css
@import "tailwindcss";
@import "@repo/tailwind-config";
@source "../../../packages/ui/src"; /* if consuming @repo/ui components */

@theme inline {
  --font-sans-face: var(--font-space-grotesk, "Space Grotesk", sans-serif);
  --font-mono-face: var(--font-ibm-plex-mono, "IBM Plex Mono", monospace);
}
```

**2. `layout.tsx`** — load the fonts and expose their CSS variables:

```tsx
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk"
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono"
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
```

## The font wiring contract

The design system is font-agnostic. Tokens resolve as:

```
--font-sans → var(--font-sans-face, sans-serif)
--font-mono → var(--font-mono-face, monospace)
```

The consumer must define `--font-sans-face` and `--font-mono-face`. The canonical choice is **Space Grotesk** for `sans` and **IBM Plex Mono** for `mono`, wired through `next/font`. Any font can be substituted by pointing those two variables somewhere else.

## Tokens as data

Generated at build time from `theme.css`:

```ts
import { tokens, coreColors, semanticColors } from "@repo/tailwind-config/tokens";
```

Regenerate whenever `theme.css` changes:

```bash
bun run --filter=@repo/tailwind-config generate:tokens
```

Turbo runs this automatically as the package's `build` step before dependent apps build.
