'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { createContext, type HTMLAttributes, useRef } from 'react';

import { cn } from '../lib/utils';

/**
 * Context that signals to BentoCard children that a parent BentoGrid
 * is orchestrating their entrance animations via staggerChildren.
 * When true, cards defer to parent variant propagation instead of
 * self-triggering with whileInView.
 */
export const BentoGridContext = createContext(false);

/** React/Framer Motion event handler signature conflicts. */
type MotionConflicts =
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
  | 'onDrag'
  | 'onDragEnd'
  | 'onDragStart'
  | 'onDragOver'
  | 'onDrop';

interface BentoGridProps extends Omit<HTMLAttributes<HTMLElement>, MotionConflicts> {
  /** Enable dense auto-flow to backfill gaps from multi-span cards. */
  dense?: boolean;
}

// The stagger interval is deliberately not a ladder rung. Every rung answers
// "how long does this change take"; an interval answers "how far apart do they
// start", which is a different quantity — and one this system uses exactly once.
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function BentoGrid({ className, dense, ...props }: BentoGridProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <BentoGridContext.Provider value={true}>
      <motion.div
        ref={ref}
        variants={prefersReducedMotion ? undefined : containerVariants}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate={prefersReducedMotion ? undefined : isInView ? 'visible' : 'hidden'}
        className={cn(
          'grid grid-cols-1 gap-4 md:grid-cols-4',
          dense && 'grid-flow-dense',
          className
        )}
        {...props}
      />
    </BentoGridContext.Provider>
  );
}

export type { BentoGridProps };
