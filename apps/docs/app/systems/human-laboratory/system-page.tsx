import { PageShell } from '@thl/ui/components/page-shell';
import type { ReactNode } from 'react';

import { SystemNav } from './system-nav';

/**
 * The standard chrome for a system's documentation page.
 *
 * Every page under a system gets the same top spacing, the same gutter and
 * measure, and one rule beneath the nav at the same width. That used to be four
 * pages agreeing by hand, and they did not: the thesis put the nav inside a
 * `prose` shell so its rule ran 550px and its h1 wrapped, the components page
 * stacked the nav's rule and a `<header>` rule with the h1 wedged between them,
 * and the example page turned the nav into a flex item so its rule stopped
 * mid-air. Uniformity has to be structural or it decays.
 */

/**
 * The nav and its rule, in the page gutter. Internal: the example page needs the
 * nav in a flex row beside a badge inside a full-bleed sticky bar, so it
 * composes `SystemNav` directly and draws the rule on the bar instead.
 */
function SystemHeader({ base, current }: { base: string; current: string }) {
  return (
    <PageShell className="pt-10">
      {/* The rule is the header's, not the nav's — it describes the width of
          the page, so the element that knows that width draws it. */}
      <div className="border-b border-line pb-3">
        <SystemNav base={base} current={current} />
      </div>
    </PageShell>
  );
}

interface SystemPageProps {
  /** Slug for `data-system`. Binds the subtree to that system's scoped tokens. */
  system: string;
  base: string;
  current: string;
  /**
   * Laid out below the header rather than inside its shell, because the
   * components page renders full-bleed sections that bring their own
   * PageShell — and nesting those would double the gutter.
   */
  children: ReactNode;
}

export function SystemPage({ system, base, current, children }: SystemPageProps) {
  return (
    // data-system binds this subtree to the system's scoped token block, so the
    // page renders in its own skin. The app sets a default on <body>; a page for
    // another system overrides it here, because colour, font and cursor all
    // inherit from the nearest data-system ancestor.
    <div data-system={system} className="min-h-screen w-full pb-20">
      <SystemHeader base={base} current={current} />
      {children}
    </div>
  );
}
