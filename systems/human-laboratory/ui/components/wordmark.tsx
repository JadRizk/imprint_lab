import type { HTMLAttributes } from 'react';

import { cn } from '../lib/utils';
import { Mark, type MarkTone } from './mark';

interface WordmarkProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** `stacked` puts the mark above the name. Use it where width is scarce. */
  orientation?: 'horizontal' | 'stacked';
  /** Drop the `// @thl` namespace and show the name alone. */
  namespace?: boolean;
  tone?: MarkTone;
}

/**
 * The lockup: mark plus name.
 *
 * There is deliberately no `wordmark.svg`. This system names no font — it
 * resolves `--font-mono` through a consumer-defined `--font-mono-face` — so an
 * SVG with the letterforms outlined would hard-code a typeface the system
 * refuses to specify, and an SVG with live `<text>` would silently fall back to
 * whatever mono the viewer happens to have. The wordmark is therefore *type*,
 * set in the system's own rules: mono, 500, uppercase, `tracking-label`.
 *
 * The namespace is neutral, not accent. The mark already spends the accent, and
 * two lime events in one lockup is the same budget violation `SectionHeader`
 * was fixed for — a signal that fires twice in one object distinguishes
 * nothing.
 */
export function Wordmark({
  orientation = 'horizontal',
  namespace = true,
  tone = 'accent',
  className,
  ...props
}: WordmarkProps) {
  const isStacked = orientation === 'stacked';

  return (
    <div
      className={cn(
        'flex',
        isStacked ? 'flex-col items-start gap-3' : 'items-center gap-3.5',
        className
      )}
      {...props}
    >
      <Mark tone={tone} className={isStacked ? 'size-11' : 'size-8'} />
      <span className="font-mono text-sm font-medium uppercase tracking-label text-ink">
        THE_HUMAN_LABORATORY
        {namespace ? (
          <>
            <span className="text-ink-subtle">{' // '}</span>
            <span className="text-ink-subtle">@thl</span>
          </>
        ) : null}
      </span>
    </div>
  );
}

export type { WordmarkProps };
