import { cn } from '../lib/utils';

type SectionHeaderElement = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';

interface SectionHeaderProps {
  /** The label text. Rendered uppercase. */
  label: string;
  /** Optional ordinal, joined to the label with an underscore: `03_SPACING_SCALE`. */
  number?: string;
  /** Draw the horizontal rule beneath the header. */
  rule?: boolean;
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
  as: Tag = 'h2',
  className
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center gap-2', rule && 'border-b border-line pb-2', className)}>
      <span aria-hidden="true" className="size-2 shrink-0 bg-accent" />
      <Tag className="text-xs font-bold uppercase tracking-label text-ink-muted">
        {number ? `${number}_${label}` : label}
      </Tag>
    </div>
  );
}

export type { SectionHeaderProps };
