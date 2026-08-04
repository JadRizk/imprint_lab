'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { type ReactNode, useContext } from 'react';

import { cn } from '../lib/utils';
import { BentoGridContext } from './bento-grid';

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  /** Extra entrance delay in seconds. Only applies to standalone cards (outside BentoGrid). Default 0. */
  delay?: number;
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 }
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
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0 }
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
    transition: { duration: 0.5, delay }
  };
}

export function BentoCard({ className, delay = 0, children }: BentoCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const isOrchestrated = useContext(BentoGridContext);
  const motionProps = getMotionProps(prefersReducedMotion, isOrchestrated, delay);

  return (
    <motion.article
      {...motionProps}
      className={cn(
        'group relative overflow-hidden border border-line bg-canvas',
        // No scale on hover: a 1% transform lands a hard 1px border on
        // fractional pixels and the edge shimmers. A brutalist card snaps.
        // No fill change either — there is no surface token to change it to.
        'transition-colors duration-300 hover:border-line-strong',
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
            'absolute z-20 size-3 border-ambient transition-colors group-hover:border-line-strong',
            corner
          )}
        />
      ))}

      {children}
    </motion.article>
  );
}

export type { BentoCardProps };
