import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge has to be told about scale values we invent in theme.css.
 * Without this it cannot tell `text-micro` (a font size) from `text-lime`
 * (a color), lumps both into the text-color group, and silently drops the
 * real color — so `<Button variant="tag" size="sm">` renders uncolored.
 *
 * Keys mirror Tailwind v4's CSS variable namespaces: `--text-*` → `text`,
 * `--tracking-*` → `tracking`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['micro'],
      tracking: ['label']
    }
  }
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * The one focus indicator for the system. Every interactive surface uses
 * this so keyboard focus reads identically everywhere.
 */
export const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime';
