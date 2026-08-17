'use client';

import { type ReactNode, useEffect, useState } from 'react';

/**
 * Sticky page chrome whose rule is earned rather than permanent.
 *
 * A divider's job is to separate chrome from the content it overlaps. At the
 * top of the page this bar overlaps nothing — it is simply the first region of
 * the document — so a rule there describes a boundary that is not being
 * crossed. Once content is passing underneath, the bar stops being a region and
 * becomes chrome floating over content, which is a boundary that outranks its
 * neighbours: `--color-line-strong`, at the 2px the ladder pairs with it.
 *
 * This is the one idea worth taking from Apple's scroll-edge effects. The rest
 * of that pattern — a translucent, blurred bar with content dissolving under it
 * — is glassmorphism, which is precisely the vocabulary this system exists to
 * reject. The bar stays opaque; only the line reacts.
 *
 * The border box is present at 2px in BOTH states and merely changes colour.
 * Growing a real border on stick would change the bar's height in flow and nudge
 * the whole page down by the difference at the exact moment of sticking — the
 * same reason Button carries an invisible border box so heights match across a
 * row.
 *
 * `scrollY > 0` IS the condition, not an approximation of it: this bar is the
 * first element in the document, so it is stuck exactly when the page has
 * scrolled at all. An IntersectionObserver would need a sentinel and the bar's
 * measured height to say the same thing, for no gain.
 *
 * The bar is now a fixed 54px at every width — the strip inside it scrolls
 * rather than wraps — so that height is no longer variable. The argument above
 * does not depend on it either way, which is why `scrollY > 0` survived the
 * change unaltered.
 */
export function StickyNav({ children }: { children: ReactNode }) {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    // Read once on mount: a restored scroll position or a #hash landing means
    // the page can already be scrolled before the first scroll event fires.
    const sync = () => {
      setStuck((was) => {
        const now = window.scrollY > 0;
        return was === now ? was : now;
      });
    };
    sync();
    window.addEventListener('scroll', sync, { passive: true });
    return () => window.removeEventListener('scroll', sync);
  }, []);

  return (
    // A div, not a nav. This is sticky chrome that happens to contain the
    // navigation; SystemNav renders the `<nav>` landmark itself and now carries
    // an accessible name, so wrapping it in a second, unnamed navigation
    // landmark listed the same six links twice in a landmark menu.
    <div
      className={`sticky top-0 z-50 w-full border-b-2 bg-canvas transition-colors duration-state ${
        stuck ? 'border-b-line-strong' : 'border-b-transparent'
      }`}
    >
      {children}
    </div>
  );
}
