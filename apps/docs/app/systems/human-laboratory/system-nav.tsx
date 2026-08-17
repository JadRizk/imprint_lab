import { cn, focusRing } from '@thl/ui/lib/utils';
import Link from 'next/link';

import { NavScroller } from './nav-scroller';
import styles from './system-nav.module.css';

const TABS = [
  { href: '', label: 'THESIS' },
  { href: '/foundations', label: 'FOUNDATIONS' },
  { href: '/components', label: 'COMPONENTS' },
  { href: '/example', label: 'EXAMPLE' },
  { href: '/report', label: 'REPORT_KIT' },
  { href: '/changelog', label: 'CHANGELOG' }
] as const;

/**
 * Shared by every item in the strip, so the row has one vertical rhythm and one
 * target size.
 *
 * `text-xs`, not `text-micro`. 10px at 0.2em is the instrument-label step, and
 * it was carrying primary wayfinding for six items — which also made the tap
 * target a measured 16px tall, under the 24x24 that WCAG 2.2 SC 2.5.8 asks for.
 * With `py-1.5` the target is 28px.
 */
const ITEM = 'shrink-0 whitespace-nowrap py-1.5 text-xs font-medium uppercase tracking-label';

/**
 * Feedback enters at `ack` and decays at `state` — asymmetric on purpose, so the
 * row reads as answering the pointer rather than animating at it.
 */
const TIMING = 'transition-colors duration-state hover:duration-ack focus-visible:duration-ack';

/**
 * The six faces of a system. Server component — `current` is passed by each
 * page rather than read from a hook, which keeps the links off the client
 * boundary. `NavScroller` is the one client part, and it receives them as
 * children rather than rendering them.
 *
 * **This is the scrolling region of `SystemBar` and nothing else.** It draws no
 * rule, owns no identity and states no version — the bar around it does all
 * three. It used to carry its own `border-b … pb-3`, which held only while it
 * was a block child filling its container; as a flex item it shrank to its
 * content and the rule stopped dead after REPORT_KIT. A rule belongs to the
 * element whose width it is meant to describe.
 *
 * The level-up link lived here too, dressed as a seventh peer. It is now the
 * house wordmark, pinned outside this strip — identity that scrolls away is not
 * identity.
 *
 * **The current section is marked by brackets, not by colour alone.** Hover no
 * longer spends the accent: it climbs `ink-subtle → ink-muted`, because hover is
 * a state of the pointer and not of the machine. Before this, hover and current
 * both resolved to `#DFFF00`, so hovering an inactive tab made it look active.
 * See `system-nav.module.css` for the bracket mechanics and why they cannot take
 * a line colour.
 */
export function SystemNav({ base, current }: { base: string; current: string }) {
  return (
    <NavScroller
      label="System sections"
      activeHref={current}
      className={cn(
        styles.strip,
        // `min-w-0` is not optional, and `flex-1` is what makes this the region
        // that gives: inside the bar's flex row an item defaults to
        // `min-width: auto` and refuses to shrink below its content, so the
        // strip would push the version chip off the screen instead of scrolling.
        'flex min-w-0 flex-1 items-center gap-6 overflow-x-auto overscroll-x-contain',
        // `overflow-x` also clips the VERTICAL axis, so the focus ring's
        // 2px outline at 2px offset would be cut. This is the room it needs;
        // the outer falloff of `shadow-glow-strong` is still clipped, and the
        // bright core plus the outline are what carry the state.
        'py-2',
        // Keeps the current tab off the very edge once the strip is scrolled.
        'scroll-px-6'
      )}
    >
      {TABS.map((tab) => {
        const active = tab.href === current;
        return (
          <Link
            key={tab.label}
            href={`${base}${tab.href}`}
            aria-current={active ? 'page' : undefined}
            className={cn(
              ITEM,
              TIMING,
              focusRing,
              styles.tab,
              'text-ink-subtle hover:text-ink-muted',
              // The label goes to ink; only the brackets take the accent, so
              // the accent marks rather than fills and the row reads in three
              // ranks instead of two.
              'aria-[current=page]:text-ink'
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </NavScroller>
  );
}
