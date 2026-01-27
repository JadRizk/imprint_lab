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
    return {
      variants: cardVariants,
      whileHover: { scale: 1.01 },
      whileTap: { scale: 0.98 }
    };
  }

  return {
    variants: cardVariants,
    initial: 'hidden' as const,
    whileInView: 'visible' as const,
    viewport: { once: true },
    transition: { duration: 0.5, delay },
    whileHover: { scale: 1.01 },
    whileTap: { scale: 0.98 }
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
        'group relative overflow-hidden border border-steel bg-obsidian',
        'transition-colors duration-300 hover:border-lime hover:bg-surface',
        className
      )}
    >
      {/* Corner brackets — decorative, hidden from assistive technology */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 z-20 h-2 w-2 border-t border-l border-text-tertiary transition-colors group-hover:border-lime"
      />
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 z-20 h-2 w-2 border-t border-r border-text-tertiary transition-colors group-hover:border-lime"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 z-20 h-2 w-2 border-b border-l border-text-tertiary transition-colors group-hover:border-lime"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 z-20 h-2 w-2 border-b border-r border-text-tertiary transition-colors group-hover:border-lime"
      />

      {children}
    </motion.article>
  );
}

export type { BentoCardProps };
