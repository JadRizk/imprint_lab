import type { SVGProps } from 'react';

import { cn } from '../lib/utils';

type MarkTone = 'accent' | 'mono';

interface MarkProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /**
   * Accessible name. Omit when the mark sits beside the wordmark — there the
   * text already names the system and the mark is decorative, so announcing it
   * twice is noise.
   */
  label?: string;
  /**
   * `mono` for print, single-colour reproduction, or any ground where the
   * accent is unavailable. Rank moves from hue to luminance; the geometry does
   * not change.
   */
  tone?: MarkTone;
}

/**
 * The Human Laboratory mark: a bounded thing with one edge promoted a tier.
 *
 * The frame is `line` and the corner is `accent` at twice the weight — the 1:2
 * ratio is the line ladder itself, not a proportion picked by eye. The mark
 * argues the system's central claim rather than decorating with it.
 *
 * It does NOT emit. Glow follows current — focus, an active item, a live
 * readout, a growing edge — and a brand mark is none of those. A permanently
 * glowing logo is exactly the decorative spend `--shadow-glow` must never
 * become. If a live header indicator is wanted later, that is an additive
 * change to the surface using it, not to the mark.
 *
 * Renders at `size-8` unless told otherwise; the geometry is pixel-honest at
 * 16, 24 and 32, so prefer those steps for small renders.
 */
export function Mark({ label, tone = 'accent', className, ...props }: MarkProps) {
  const isMono = tone === 'mono';

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn('size-8 shrink-0', className)}
      {...props}
    >
      <rect
        x="5"
        y="5"
        width="22"
        height="22"
        strokeWidth="2"
        className={isMono ? 'stroke-line-strong' : 'stroke-line'}
      />
      <path
        d="M6 14 L6 6 L14 6"
        strokeWidth="4"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        className={isMono ? 'stroke-ink' : 'stroke-accent'}
      />
    </svg>
  );
}

export type { MarkProps, MarkTone };
