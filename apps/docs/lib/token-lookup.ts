import { type Token, tokens } from '@thl/tokens/tokens';

/**
 * Reading the token model, so the docs never transcribe a value.
 *
 * Every measured ratio, every `prefers-contrast` promotion and every alias is
 * already in `generated/tokens.ts`, emitted from `theme.css`. A ratio typed into
 * JSX is a second copy of a number that was measured once — exactly the drift
 * `generated/safelist.css` exists to prevent for utilities.
 */

const byName = new Map(tokens.map((t) => [t.name, t]));

export function token(name: string): Token | undefined {
  return byName.get(name);
}

/**
 * A role's measured ratio lives on the **primitive it aliases**, not on the
 * role — `theme.css` annotates `--color-steel` with `1.69:1`, and
 * `--color-line` is a bare `var()` pointing at it. So a role's ratio is one hop
 * away, and asking a role for its own `note` returns nothing.
 *
 * The two status roles are the exception: `--color-critical` and
 * `--color-warning` are held as literals rather than aliased, so they carry
 * their own note.
 */
export function noteOf(t: Token | undefined): string | undefined {
  if (!t) return undefined;
  if (t.note) return t.note;
  return t.aliasOf ? byName.get(t.aliasOf)?.note : undefined;
}

/** Notes read `1.69:1 — the default drawn line`. Split the measurement off. */
export function ratioOf(t: Token | undefined): string | undefined {
  return noteOf(t)?.match(/^\d+(?:\.\d+)?:1/)?.[0];
}

/** Look a ratio up by token name. */
export function ratio(name: string): string | undefined {
  return ratioOf(byName.get(name));
}

/**
 * The ratio measured for a raw hex, whichever token happens to carry it.
 *
 * The `prefers-contrast` companions hold values, not aliases — and they hold
 * them in a different case: `--color-line--contrast` is `#7c7c7c` while the
 * primitive it matches, `--color-text-tertiary`, is `#7C7C7C`. An `===` here
 * silently returns nothing for two of the three promoted rungs.
 */
export function ratioForValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const wanted = value.toLowerCase();
  return ratioOf(tokens.find((t) => t.resolved.toLowerCase() === wanted));
}

/** The value a role takes under `prefers-contrast: more`, if it is promoted. */
export function contrastOf(name: string): string | undefined {
  return byName.get(name)?.contrast;
}

export const durationTokens = tokens.filter(
  // `--default-transition-duration` is the fallback a bare `transition-*` lands
  // on, not a rung — it generates no utility, and listing it would put a fifth
  // step on a ladder that has four.
  (t) => t.category === 'duration' && t.utility !== ''
);

export const trackingTokens = tokens.filter((t) => t.category === 'tracking');

/** The two emission roles. The `--shadow-lime-*` primitives they alias are
 * named by appearance and are not the contract — see CLAUDE.md contract 1. */
export const shadowRoles = tokens.filter((t) => t.category === 'shadow' && t.aliasOf);
