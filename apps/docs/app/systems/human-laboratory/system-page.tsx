import type { ReactNode } from 'react';

import { SystemBar } from './system-bar';

/**
 * The standard chrome for a system's documentation page.
 *
 * Every page under a system gets the same top spacing, the same gutter and
 * measure, and the same bar. That used to be four pages agreeing by hand, and
 * they did not: the thesis put the nav inside a `prose` shell so its rule ran
 * 550px and its h1 wrapped, the components page stacked the nav's rule and a
 * `<header>` rule with the h1 wedged between them, and the example page turned
 * the nav into a flex item so its rule stopped mid-air. Uniformity has to be
 * structural or it decays.
 *
 * The header used to be defined here and separately on the example page. It is
 * now `SystemBar` for both, which is also where the rule lives: as sticky
 * chrome, the bar earns its rule once content passes beneath it rather than
 * drawing one permanently.
 */

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

/**
 * The gap between the nav's rule and whatever the page opens with.
 *
 * Owned here, once, because owning it per-page is a thing this route has now
 * failed at twice. It was `mt-10` typed onto four pages; `/foundations` and
 * `/components` were then written with the masthead ahead of the content block
 * that carried it, so both opened with their title sitting flush on the rule — a
 * measured 0px, where the only apparent air was the h1's own line-height. That is
 * not a value anyone would choose; it is a value nobody set.
 *
 * 48px rather than the 40 it replaces. The rule above is chrome and the masthead
 * below is the document, so the gap has to read as a change of region — wider
 * than the 32px that separates blocks inside a specimen, well short of the 96px
 * between specimens. It lands on the 4px grid, like every other spacing decision
 * here.
 *
 * `space-y-24` is the second half, and it is not optional. A page that opens with
 * a masthead and then a `SpecList` puts two siblings in here, and with no rhythm
 * between them the standfirst ran directly into the first section's eyebrow —
 * which is what centralising the top gap alone produced. 96px is the interval
 * `SpecList` already uses between specimens, so the masthead is separated from
 * the first one exactly as the specimens are from each other. On the pages that
 * pass a single child it is inert.
 */
const HEADER_GAP = 'pt-12 space-y-24';

export function SystemPage({ system, base, current, children }: SystemPageProps) {
  return (
    // data-system binds this subtree to the system's scoped token block, so the
    // page renders in its own skin. The app sets a default on <body>; a page for
    // another system overrides it here, because colour, font and cursor all
    // inherit from the nearest data-system ancestor.
    <div data-system={system} className="min-h-screen w-full pb-20">
      <SystemBar base={base} current={current} />
      {/* Bare div, no PageShell — children bring their own gutter, and several
          render full-bleed sections. This contributes spacing and nothing else. */}
      <div className={HEADER_GAP}>{children}</div>
    </div>
  );
}
