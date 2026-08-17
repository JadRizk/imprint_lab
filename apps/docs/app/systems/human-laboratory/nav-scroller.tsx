'use client';

import { type ReactNode, useEffect, useRef } from 'react';

interface NavScrollerProps {
  children: ReactNode;
  className?: string;
  /** Accessible name for the landmark. */
  label: string;
  /**
   * The current tab's href. Only a dependency: it re-centres the strip when a
   * client-side navigation changes which tab is current without remounting.
   */
  activeHref: string;
}

/**
 * The scrolling strip, and the only client boundary in the nav.
 *
 * It exists for one reason. The strip needs 648px and has 343px at 375px, so it
 * scrolls — and a scroll container starts at zero, which means the current
 * section can begin outside the viewport. With CHANGELOG current on a phone,
 * the one signal saying where you are was off-screen. There is no CSS that
 * scrolls a container to a child on load.
 *
 * The links themselves stay server-rendered: they are passed in as `children`,
 * so this boundary costs a ref and an effect, not the six `Link`s.
 *
 * ⚠ **The centring maths is verified; the callback delivery is not.** Headless
 * Chrome over CDP never delivers a ResizeObserver callback here — not even the
 * mandatory one that fires on `observe()` — and CSS transitions never advance
 * either, which is the same cause: the pane does not run the rendering
 * lifecycle those two dispatch from. So `centre()` was verified by replaying it
 * against the real post-resize layout (it moved CHANGELOG from a scrollLeft of
 * 0 to a clamped 655 and the tab became fully visible), and the observer wiring
 * around it has to be confirmed in a real browser. Do not read a green run in
 * automation as evidence that resize handling works.
 */
export function NavScroller({ children, className, label, activeHref }: NavScrollerProps) {
  const ref = useRef<HTMLElement>(null);

  /* `activeHref` is a re-run trigger, not a value the body reads. Navigating
   * between two pages renders this same component in the same position, so
   * React reconciles rather than remounts — an empty dependency list would
   * never fire again, and the strip would stay parked on the previous
   * section's scroll offset with the new one off-screen. */
  // biome-ignore lint/correctness/useExhaustiveDependencies: activeHref is the re-run trigger; see above
  useEffect(() => {
    const strip = ref.current;
    if (!strip) return;

    const centre = () => {
      // Nothing to centre when the row already fits — which is every viewport
      // wide enough to show all six, i.e. the common case.
      if (strip.scrollWidth <= strip.clientWidth) return;

      const active = strip.querySelector<HTMLElement>('[aria-current="page"]');
      if (!active) return;

      const stripBox = strip.getBoundingClientRect();
      const activeBox = active.getBoundingClientRect();

      // Already readable: leave the strip alone. Without this the observer
      // below would yank the row back to centre every time anything resized,
      // undoing a scroll the reader had just made by hand.
      if (activeBox.left >= stripBox.left && activeBox.right <= stripBox.right) return;

      // Deltas from getBoundingClientRect rather than `offsetLeft`, which is
      // measured against the nearest positioned ancestor — an element this
      // component does not own and a host could introduce at any time.
      const delta = activeBox.left - stripBox.left - (stripBox.width - activeBox.width) / 2;

      // scrollLeft, not scrollIntoView(). scrollIntoView can move the PAGE
      // vertically as well as the strip horizontally, and on a page landed at a
      // #hash that is a visible jump. This cannot touch anything but the strip.
      strip.scrollLeft += delta;
    };

    centre();

    // Mount alone is not enough, for two different reasons.
    //
    // 1. The strip fits at desktop width and overflows at phone width, so a
    //    rotation or a window drag moves the current section out of view long
    //    after mount. ResizeObserver catches that.
    //
    // 2. A font swap changes text metrics WITHOUT changing the strip's own box,
    //    so every tab shifts and ResizeObserver never fires — it watches the
    //    content box, which is unchanged. `next/font` ships fallback metrics
    //    that keep the shift small, not zero, and "small" is enough to leave a
    //    centred tab clipped. `fonts.ready` is the only signal for this one.
    let cancelled = false;
    const recentre = () => {
      if (!cancelled) centre();
    };

    if (document.fonts && document.fonts.status !== 'loaded') {
      document.fonts.ready.then(recentre);
    }

    const observer = new ResizeObserver(recentre);
    observer.observe(strip);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [activeHref]);

  return (
    <nav ref={ref} aria-label={label} className={className}>
      {children}
    </nav>
  );
}

export type { NavScrollerProps };
