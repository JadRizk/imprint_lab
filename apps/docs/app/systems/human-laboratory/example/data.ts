import { colorTokens, roleColors, textTokens, tokens } from '@thl/tokens/tokens';
import { released, version } from '@thl/ui/lib/version';

import { asset } from '../../../../lib/base-path';
import { durationTokens, ratio, token } from '../../../../lib/token-lookup';

/**
 * Everything this page reports is measured, not invented.
 *
 * The page used to carry two sections that said so in their own copy — "scroll
 * driven parallax is not implemented yet", "these tiles report a fixed value"
 * — which is a demo admitting it is a mock. An instrument that displays a
 * number it did not measure is the one thing this system's voice cannot do, so
 * every readout below is read out of the token model at build time.
 */

interface HeroContent {
  badge: string;
  heading: string;
  headingAccent: string;
  description: string;
  image: {
    src: string;
    alt: string;
    badge: { label: string };
  };
}

export const heroContent: HeroContent = {
  badge: 'RESEARCH_OBJECTIVE',
  heading: 'A PAGE BUILT IN THIS',
  headingAccent: ' SYSTEM',
  description:
    'An end-to-end composition rather than a component gallery — the same primitives assembled the way a real page assembles them, reporting real numbers off the token model.',
  image: {
    src: asset('/samples/specimen-01.jpg'),
    alt: 'Specimen plate standing in for real artwork in the hero frame',
    badge: { label: 'IMG_SRC_LOADED' }
  }
};

/**
 * The line ladder, measured.
 *
 * Data only — the tier each row is *drawn* in lives beside the JSX in
 * `page.tsx`. This module reports measurements; how a measurement is rendered is
 * the view's business, and keeping class strings next to the markup that uses
 * them is what makes them easy to check against what the page actually shows.
 *
 * `--color-accent` carries no measured note in `theme.css`, so `ratio()` returns
 * undefined for it and the row renders an em dash. That is honest: the accent's
 * ratio is not annotated at the token, and typing it here would be the second
 * copy of a number this module exists to avoid.
 */
export const LINE_LADDER = (
  [
    { role: '--color-ambient', weight: '1px', job: 'SUBDIVISION' },
    { role: '--color-line', weight: '1px', job: 'EDGE' },
    { role: '--color-line-strong', weight: '2px', job: 'OUTRANKS' },
    { role: '--color-accent', weight: '2px', job: 'LIVE' }
    // `as const` narrows `role` to the union of the four names, so the style
    // lookup in `page.tsx` is exhaustive rather than a `Record<string, …>` that
    // strict mode has to treat as possibly undefined.
  ] as const
).map((rung) => ({
  ...rung,
  label: rung.role.replace('--color-', '').replace(/-/g, '_').toUpperCase(),
  ratio: ratio(rung.role)
}));

/** The four role names the ladder draws, for an exhaustive style lookup. */
export type LadderRole = (typeof LINE_LADDER)[number]['role'];

/** The duration ladder, in the order the rungs escalate. */
export const MOTION_RUNGS = durationTokens.map((t) => ({
  label: t.utility.replace('duration-', '').toUpperCase(),
  value: t.resolved
}));

/**
 * The system's own census. `marked` is set on exactly one tile — the section
 * header contract applied to a readout: a signal that fires on every tile
 * distinguishes nothing.
 */
export const CENSUS = [
  { label: 'SYSTEM_VERSION', value: version, note: `RELEASED ${released}`, marked: true },
  { label: 'TOKENS', value: String(tokens.length), note: 'GENERATED FROM THEME.CSS' },
  {
    label: 'ROLES',
    value: String(roleColors.length),
    note: `OF ${colorTokens.length} COLOUR TOKENS`
  },
  { label: 'TYPE_STEPS', value: String(textTokens.length), note: 'A CLOSED SCALE' }
];

/**
 * The 4.5:1 text floor, and the one role that does not clear it.
 *
 * `--color-ink` is deliberately absent: it is pure white, so it carries no
 * measured annotation in `theme.css` and there is nothing to read. This table
 * is the roles where the number is the argument — two that may carry text, and
 * `ambient`, which exists for grid lines and idle brackets and never may.
 */
export const TEXT_FLOOR = ['--color-ink-muted', '--color-ink-subtle', '--color-ambient'].map(
  (name) => ({
    name,
    label: name.replace('--color-', '').replace(/-/g, '_').toUpperCase(),
    value: token(name)?.resolved,
    ratio: ratio(name),
    clears: name !== '--color-ambient'
  })
);
