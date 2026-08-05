import { cn } from '../lib/utils';

type SectionHeaderElement = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';

interface SectionHeaderProps {
  /** The label text. Rendered uppercase. */
  label: string;
  /** Optional ordinal, joined to the label with an underscore: `03_SPACING_SCALE`. */
  number?: string;
  /** Draw the horizontal rule beneath the header. */
  rule?: boolean;
  /**
   * Light the marker in the accent. Use it on the ONE section a view exists to
   * make — the finding, the active step, the thing that changed.
   *
   * Off by default, and that default is the point. The marker used to be lime
   * on every section of every page: ten identical accent events per view,
   * varying with nothing. A marker that never varies is a bullet, not a signal,
   * and it was the largest decorative spend of the accent in the system.
   */
  marked?: boolean;
  /** Heading level. Pick the one that fits the document outline. */
  as?: SectionHeaderElement;
  className?: string;
}

/**
 * The lime-square eyebrow that labels every section in the system.
 *
 * This exists because the pattern was hand-rolled seven times across four
 * files and had already drifted — two different square markups and two
 * different letter-spacings for what is visually one component.
 */
export function SectionHeader({
  label,
  number,
  rule = false,
  marked = false,
  as: Tag = 'h2',
  className
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2',
        // A section division outranks the rules inside it, so it takes the
        // emphatic tier of the line ladder rather than the same 1px hairline
        // every other boundary uses.
        rule && 'border-b-2 border-line-strong pb-2',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn('size-2 shrink-0', marked ? 'bg-accent shadow-glow' : 'bg-ink-subtle')}
      />
      {/* font-medium, not bold: at 12px with 0.2em tracking on a dark ground,
          400 reads frail (light-on-dark optically thins strokes) and 700 reads
          as a heading. 500 is the instrument-label weight. */}
      <Tag className="text-xs font-medium uppercase tracking-label text-ink-muted">
        {number ? `${number}_${label}` : label}
      </Tag>
    </div>
  );
}

export type { SectionHeaderProps };
