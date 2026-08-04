'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

import { cn, focusRing } from '../lib/utils';
import styles from './image-frame.module.css';

interface ImageFrameProps {
  src: string;
  alt: string;
  badge?: {
    label: string;
    icon?: ReactNode;
    onClick?: () => void;
  };
  grayscale?: boolean;
  imageOpacity?: number;
  className?: string;
}

export function ImageFrame({
  src,
  alt,
  badge,
  grayscale = true,
  imageOpacity = 0.7,
  className
}: ImageFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true });
  const prefersReducedMotion = useReducedMotion();
  const [loaded, setLoaded] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [errored, setErrored] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: src prop change should reset state
  useEffect(() => {
    setLoaded(false);
    setRevealed(false);
    setErrored(false);
  }, [src]);

  const shouldReveal = loaded && inView;

  const BadgeElement = badge?.onClick ? 'button' : 'div';

  return (
    <div
      ref={containerRef}
      // `@container frame` lets the corner brackets size themselves against
      // this frame rather than the viewport — see image-frame.module.css.
      className={cn(
        'group relative overflow-hidden border border-line bg-canvas [container-type:inline-size] [container-name:frame]',
        className
      )}
    >
      {/* Grid Background */}
      <div className={styles.gridBackground} />

      {/* Image layer — height reveal from top to bottom */}
      <motion.div
        initial={{ height: '0%' }}
        animate={{ height: shouldReveal ? '100%' : '0%' }}
        transition={{ duration: prefersReducedMotion ? 0 : 1.5, ease: 'circInOut' }}
        onAnimationComplete={() => {
          if (shouldReveal) setRevealed(true);
        }}
        className={cn(styles.imageLayer, !revealed && styles.imageLayerBorder)}
      >
        {errored ? (
          <div className={styles.errorOverlay} role="img" aria-label={`${alt} — failed to load`}>
            <div className={styles.errorCrosshair}>
              <div className={styles.errorCrosshairH} />
              <div className={styles.errorCrosshairV} />
            </div>
            <span className={styles.errorLabel}>SIGNAL_LOST</span>
          </div>
        ) : (
          <img
            ref={(img) => {
              if (img?.complete) {
                setLoaded(true);
                if (img.naturalWidth === 0) setErrored(true);
              }
            }}
            src={src}
            alt={alt}
            className={styles.image}
            onLoad={() => setLoaded(true)}
            onError={() => {
              setLoaded(true);
              setErrored(true);
            }}
            style={{
              opacity: imageOpacity,
              filter: grayscale ? 'grayscale(100%)' : 'none',
              visibility: loaded ? 'visible' : 'hidden'
            }}
          />
        )}
        {/* Scan line — pulses at the growing edge */}
        <motion.div
          className={styles.scanLine}
          initial={{ opacity: 0 }}
          animate={
            revealed
              ? { opacity: 0 }
              : prefersReducedMotion
                ? { opacity: 0.5 }
                : { opacity: [0, 1, 0] }
          }
          transition={
            revealed || prefersReducedMotion ? { duration: 0.3 } : { duration: 2, repeat: Infinity }
          }
        />
      </motion.div>

      {/* Corner Markers */}
      <div className={styles.cornerTopLeft} />
      <div className={styles.cornerTopRight} />
      <div className={styles.cornerBottomLeft} />
      <div className={styles.cornerBottomRight} />

      {/* Status Badge */}
      {badge && (
        <BadgeElement
          className={cn(
            styles.badge,
            'flex items-center gap-2 border border-line bg-canvas',
            badge.onClick && ['cursor-pointer', focusRing]
          )}
          {...(badge.onClick ? { onClick: badge.onClick, type: 'button' as const } : {})}
        >
          <span className="text-micro text-accent">{badge.label}</span>
          {badge.icon}
        </BadgeElement>
      )}
    </div>
  );
}
