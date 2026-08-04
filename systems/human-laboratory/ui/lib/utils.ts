import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import { twMergeConfig } from './tw-merge.generated';

/**
 * tailwind-merge has to be told about scale values we invent in theme.css.
 * Without this it cannot tell `text-micro` (a font size) from `text-accent`
 * (a color), lumps both into the text-color group, and silently drops the
 * real color — so `<Button variant="tag" size="sm">` renders uncolored.
 *
 * The scale names are generated from theme.css rather than kept by hand, so
 * adding a value there registers it here automatically — see
 * packages/token-tools. Keys mirror Tailwind v4's CSS variable namespaces:
 * `--text-*` → `text`, `--tracking-*` → `tracking`.
 */
const twMerge = extendTailwindMerge(twMergeConfig);

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * The one focus indicator for the system. Every interactive surface uses
 * this so keyboard focus reads identically everywhere.
 */
export const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
