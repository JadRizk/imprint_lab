import { PageShell } from '@thl/ui/components/page-shell';
import { SectionHeader } from '@thl/ui/components/section-header';
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

export function SpecList({ specs }: { specs: SpecDef[] }) {
  // No top margin here: `SystemPage` owns the gap below the nav rule.
  return (
    <div className="space-y-24">
      {specs.map((spec, i) => (
        <section key={spec.label} className="space-y-8">
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
