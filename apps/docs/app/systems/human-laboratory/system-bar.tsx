import { PageShell } from '@thl/ui/components/page-shell';
import { cn, focusRing } from '@thl/ui/lib/utils';
import { version } from '@thl/ui/lib/version';
import Link from 'next/link';

import { StickyNav } from './sticky-nav';
import { SystemNav } from './system-nav';

/**
 * The one bar every page under this route wears.
 *
 * It used to be two. `SystemPage` drew a static header with its own rule while
 * the example page composed a sticky bar by hand, so the site's most-repeated
 * element existed in two definitions that had already drifted — different
 * spacing, a different rule weight, and a badge on one of them. The sticky
 * treatment is the better of the two and there was no reason it belonged to one
 * page, so it is now the only one.
 *
 * Three regions, and only the middle one scrolls:
 *
 *   [ IMPRINT_LAB ] │ [ THESIS  FOUNDATIONS  … ] [ v1.0.0 ]
 *      identity     │        the six faces        the fact
 *
 * The wordmark and the chip sit OUTSIDE the scrolling strip on purpose. Identity
 * that scrolls away is not identity, and the version is a fact about the whole
 * page rather than an item in a list.
 */
export function SystemBar({ base, current }: { base: string; current: string }) {
  return (
    <StickyNav>
      <PageShell className="flex items-center gap-4 py-1">
        {/* The house wordmark is TYPE, not a mark.
         *
         * imprint_lab deliberately has no drawn mark and must not get one until
         * it has more than one system to be neutral between — a house mark
         * designed now would be system 01 wearing a generic name, which is the
         * argument BRAND.md already makes. It cannot borrow `Wordmark` either:
         * that lockup carries @thl's mark and would brand the house with system
         * 01's identity.
         *
         * So it is set the way this system sets a wordmark — mono, 500,
         * uppercase, `tracking-label` — and spends no accent, because the nav's
         * current-section brackets have already spent the one this bar gets. */}
        <Link
          href="/"
          className={cn(
            'shrink-0 whitespace-nowrap py-1.5',
            'text-xs font-medium uppercase tracking-label',
            'transition-colors duration-state hover:duration-ack',
            'text-ink-muted hover:text-ink',
            focusRing
          )}
        >
          IMPRINT_LAB
        </Link>

        {/* `line` is the edge OF a thing, which is what a divider between the
            house and the system's own sections is. */}
        <span aria-hidden="true" className="h-4 w-px shrink-0 bg-line" />

        <SystemNav base={base} current={current} />

        {/* Read from the generated artifact, never transcribed, so the bar
            cannot claim a version the system does not carry. Deliberately not
            accent: a version is a fact about the system, not a live event. It
            takes `line`, the edge OF a thing, which is what a chip is.

            Hidden below `sm`, and that is a measurement rather than a taste. At
            375px the gutter leaves 343px; the wordmark and its divider take
            122 and the chip takes 73, which left the strip 127px — narrower
            than COMPONENTS at 134px, so the widest tab could not fit however
            far it scrolled and its brackets were clipped at both ends. Of the
            three regions the chip is the one a phone can spare: it states a
            fact, while the other two navigate. Dropping it returns the strip to
            221px, which clears the widest tab. */}
        <span className="hidden shrink-0 border border-line px-2 py-1 text-micro tracking-label-dense text-ink-muted sm:block">
          v{version}
        </span>
      </PageShell>
    </StickyNav>
  );
}
