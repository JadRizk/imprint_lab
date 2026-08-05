'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { type ReactNode, useContext, useEffect, useState } from 'react';

import { duration } from '../lib/motion.generated';
import { cn } from '../lib/utils';
import { BentoGridContext } from './bento-grid';

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  /** Extra entrance delay in seconds. Only applies to standalone cards (outside BentoGrid). Default 0. */
  delay?: number;
}

/**
 * Opacity only. The entrance used to run `scale: 0.95 -> 1`, which is the exact
 * thing hover is forbidden to do a few lines below: a fractional transform lands
 * these hard 1px borders off the pixel grid and the edge shimmers — for the
 * whole half-second of the entrance, on every card, on first view. The argument
 * that ruled it out for a 1% hover is stronger against a 5% entrance, not
 * weaker.
 *
 * An instrument does not grow into place. It switches on — which is the second
 * beat, below.
 */
const cardVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const CORNERS = [
  'top-0 left-0 border-t-2 border-l-2',
  'top-0 right-0 border-t-2 border-r-2',
  'bottom-0 left-0 border-b-2 border-l-2',
  'bottom-0 right-0 border-b-2 border-r-2'
] as const;

function getMotionProps(
  prefersReducedMotion: boolean | null,
  isOrchestrated: boolean,
  delay: number
) {
  if (prefersReducedMotion) {
    return {
      animate: { opacity: 1 },
      transition: { duration: duration.ack }
    };
  }

  if (isOrchestrated) {
    return { variants: cardVariants };
  }

  return {
    variants: cardVariants,
    initial: 'hidden' as const,
    whileInView: 'visible' as const,
    viewport: { once: true },
    // `transit` — something entering the page. Was 0.5, a number chosen against
    // nothing, in a component the duration ladder is meant to govern.
    transition: { duration: duration.transit, delay }
  };
}

export function BentoCard({ className, delay = 0, children }: BentoCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const isOrchestrated = useContext(BentoGridContext);
  const motionProps = getMotionProps(prefersReducedMotion, isOrchestrated, delay);

  // The second beat. A card arrives as a dormant outline and only then takes its
  // place in the hierarchy: the edge climbs `ambient -> line` once the entrance
  // has landed. That is the line ladder used as motion, which costs no transform
  // and no accent — six cards each firing lime would spend the budget on
  // texture, which is the one thing the accent must never become.
  const [entered, setEntered] = useState(false);

  // Reduced motion has no entrance to complete, so the edge is live at once.
  useEffect(() => {
    if (prefersReducedMotion) setEntered(true);
  }, [prefersReducedMotion]);

  return (
    <motion.article
      {...motionProps}
      onAnimationComplete={() => setEntered(true)}
      className={cn(
        'group relative overflow-hidden border bg-canvas',
        // No scale on hover: a 1% transform lands a hard 1px border on
        // fractional pixels and the edge shimmers. A brutalist card snaps.
        // No fill change either — there is no surface token to change it to.
        'transition-colors duration-state hover:border-line-strong',
        // Ordered, not stacked as variants: `border-ambient` last wins the base
        // colour through tailwind-merge, while `hover:` stays its own group. A
        // `data-[entered]:` variant would instead race `hover:` on stylesheet
        // order, and whichever Tailwind emitted second would silently win.
        'border-line',
        !entered && 'border-ambient',
        className
      )}
    >
      {/* Corner brackets — decorative, hidden from assistive technology.
          Geometry matches ImageFrame so the bracket motif reads as one
          language across the system.

          Hover climbs the line ladder — ambient to line-strong — rather than
          firing the accent. A card is not an action, and hover is a state of
          the pointer, not of the system; spending lime here is what made the
          accent read as texture. Lime stays for focus, status and the finding. */}
      {CORNERS.map((corner) => (
        <div
          key={corner}
          aria-hidden="true"
          className={cn(
            'absolute z-20 size-3 border-ambient transition-colors duration-state group-hover:border-line-strong',
            corner
          )}
        />
      ))}

      {children}
    </motion.article>
  );
}

export type { BentoCardProps };
