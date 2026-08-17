import { PageShell } from '@thl/ui/components/page-shell';
import { SectionHeader } from '@thl/ui/components/section-header';
import { cn, focusRing } from '@thl/ui/lib/utils';
import type { ReactNode } from 'react';

/**
 * The numbered specimen block, shared by `/foundations` and `/components`.
 *
 * The ordinal is **derived from array position**, never authored. It used to be
 * a hand-typed string on each section and the components page shipped
 * `01…07, 09, 10` — there was no 08, and nothing could have caught it. Numbering
 * that describes a sequence has to be computed from the sequence.
 */
interface SpecDef {
  label: string;
  description?: ReactNode;
  /**
   * Render the body at full page width instead of inside the shell. For
   * specimens that are themselves page-level sections and bring their own
   * PageShell — nesting those would double the gutter.
   */
  bleed?: boolean;
  content: ReactNode;
}

/**
 * The anchor for a specimen.
 *
 * Derived from the LABEL, never from the ordinal. The ordinal is a function of
 * array position — inserting a specimen would silently repoint every link below
 * it, and a contents entry that scrolls somewhere else is worse than none. The
 * labels are already `A-Z0-9_`, so lowercasing is the whole transform.
 */
export function specId(label: string): string {
  return label.toLowerCase();
}

export function SpecList({ specs }: { specs: SpecDef[] }) {
  // No top margin here: `SystemPage` owns the gap below the bar.
  return (
    <div className="space-y-24">
      {specs.map((spec, i) => (
        <section
          key={spec.label}
          id={specId(spec.label)}
          // The bar is sticky, so an anchor lands UNDER it without this — the
          // section header scrolls to y=0 and the chrome sits on top of it.
          // 96px clears the bar's ~54px with the region gap the page already
          // uses between chrome and document.
          className="scroll-mt-24 space-y-8"
        >
          <PageShell className="space-y-8">
            <SectionHeader number={String(i + 1).padStart(2, '0')} label={spec.label} rule />
            {spec.description ? (
              <div className="max-w-2xl space-y-2 text-xs">{spec.description}</div>
            ) : null}
          </PageShell>
          {spec.bleed ? spec.content : <PageShell className="space-y-8">{spec.content}</PageShell>}
        </section>
      ))}
    </div>
  );
}

/**
 * The index of what is on this page.
 *
 * `/foundations` and `/components` carry eight specimens each — 16 of the site's
 * ~22 destinations, and 62% of its built HTML, behind two of six tabs. Without
 * this the only way to find the motion ladder is to scroll 147KB of page
 * looking for it.
 *
 * It is an index at the top rather than a rail down the side, deliberately. The
 * page measure is 1216px inside a 1440px viewport, so a side rail would have to
 * come out of the content's width — narrowing every specimen on the two pages
 * whose specimens are the widest things on the site. A rail earns that trade
 * once these become child routes; an index does the finding job today and costs
 * no layout.
 *
 * The ordinals are computed from the same array that renders the specimens, so
 * the index cannot disagree with the page.
 */
export function Contents({ specs }: { specs: SpecDef[] }) {
  return (
    <PageShell className="space-y-6">
      <SectionHeader label="CONTENTS" as="h2" />
      <ul className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3">
        {specs.map((spec, i) => (
          <li key={spec.label}>
            <a
              href={`#${specId(spec.label)}`}
              className={cn(
                'flex items-baseline gap-3 border-t border-ambient py-3',
                'text-xs uppercase tracking-label',
                // The same grammar as the nav: rest muted, hover climbs one
                // rank. No accent — an index is not a live state, and the bar's
                // current-section brackets have already spent this page's one.
                'text-ink-muted transition-colors duration-state hover:text-ink hover:duration-ack',
                focusRing
              )}
            >
              {/* The ordinal is a coordinate, not the name — one rank below the
                  label it points at, so the eye reads the words first. */}
              <span className="text-ink-subtle">{String(i + 1).padStart(2, '0')}</span>
              <span>{spec.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}

/** The instrument label above a specimen. */
export function Label({ children }: { children: ReactNode }) {
  return (
    <span className="block text-micro uppercase tracking-label text-ink-subtle">{children}</span>
  );
}

/**
 * The masthead every system page under this route shares.
 *
 * Draws no rule of its own — `SystemPage` already puts one under the nav, and
 * two rules with the title wedged between them is what the components page
 * shipped before.
 */
export function Masthead({ title, standfirst }: { title: ReactNode; standfirst: ReactNode }) {
  return (
    <PageShell>
      <header className="space-y-4">
        {/* Responsive because THE_HUMAN_LABORATORY is one unbreakable word — the
            underscores offer no wrap opportunity — and at 4xl it overflows a
            phone viewport and gives the document a horizontal scroll. Both
            sizes are steps on the closed scale. */}
        <h1 className="text-2xl font-bold text-ink md:text-4xl">{title}</h1>
        <p className="max-w-2xl text-lg">{standfirst}</p>
      </header>
    </PageShell>
  );
}

export type { SpecDef };
