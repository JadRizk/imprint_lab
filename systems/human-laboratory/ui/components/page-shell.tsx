import type { HTMLAttributes } from 'react';

import { cn } from '../lib/utils';

/**
 * `default` — the standard page measure for dense, technical layouts.
 * `prose`   — a narrow measure for long-form reading.
 * `full`    — gutters only, no max width.
 *
 * `prose` is set in `ch`, not pixels, because this system's body face is
 * monospaced. `max-w-3xl` (768px) ran to ~80 characters of IBM Plex Mono —
 * eighty columns is a terminal convention, not a reading measure. Every glyph
 * in a mono face is the width of an `m`, so the comfortable line is shorter
 * than it would be in a proportional face: 60–72 characters, not 75–90.
 */
const WIDTHS = {
  default: 'max-w-[1280px]',
  prose: 'max-w-[64ch]',
  full: 'max-w-none'
} as const;

interface PageShellProps extends HTMLAttributes<HTMLDivElement> {
  width?: keyof typeof WIDTHS;
}

/**
 * The horizontal gutter and measure for page content.
 *
 * Replaces Tailwind's `container`, whose width is a function of the current
 * breakpoint rather than an explicit number — which is how `/` ended up
 * 768px wide while `/design-system` and `/demo` were 1280px.
 *
 * Do not nest these. A section that already sits inside a PageShell should
 * lay out at full width and let the parent own the gutter.
 */
export function PageShell({ width = 'default', className, ...props }: PageShellProps) {
  return <div className={cn('mx-auto w-full px-4 md:px-8', WIDTHS[width], className)} {...props} />;
}

export type { PageShellProps };
