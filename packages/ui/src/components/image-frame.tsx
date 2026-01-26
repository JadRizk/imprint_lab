"use client";

import type { ReactNode } from "react";
import { useRef, useState } from "react";

import { motion, useInView, useReducedMotion } from "framer-motion";

import { cn } from "../lib/utils";
import styles from "./image-frame.module.css";

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
  className,
}: ImageFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true });
  const prefersReducedMotion = useReducedMotion();
  const [loaded, setLoaded] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const shouldReveal = loaded && inView;

  const BadgeElement = badge?.onClick ? "button" : "div";

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative overflow-hidden border border-steel bg-surface",
        className,
      )}
    >
      {/* Grid Background */}
      <div className={styles.gridBackground} />

      {/* Image layer — height reveal from top to bottom */}
      <motion.div
        initial={{ height: "0%" }}
        animate={{ height: shouldReveal ? "100%" : "0%" }}
        transition={{ duration: prefersReducedMotion ? 0 : 1.5, ease: "circInOut" }}
        onAnimationComplete={() => {
          if (shouldReveal) setRevealed(true);
        }}
        className={cn(
          styles.imageLayer,
          !revealed && styles.imageLayerBorder,
        )}
      >
        <img
          src={src}
          alt={alt}
          className={styles.image}
          onLoad={() => setLoaded(true)}
          style={{
            opacity: imageOpacity,
            filter: grayscale ? "grayscale(100%)" : "none",
            visibility: loaded ? "visible" : "hidden",
          }}
        />
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
            revealed || prefersReducedMotion
              ? { duration: 0.3 }
              : { duration: 2, repeat: Infinity }
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
            "flex items-center gap-2 border border-steel bg-obsidian",
            badge.onClick && "cursor-pointer focus-visible:outline-2 focus-visible:outline-lime focus-visible:outline-offset-2",
          )}
          {...(badge.onClick ? { onClick: badge.onClick, type: "button" as const } : {})}
        >
          <span className="text-[10px] text-lime">{badge.label}</span>
          {badge.icon}
        </BadgeElement>
      )}
    </div>
  );
}
