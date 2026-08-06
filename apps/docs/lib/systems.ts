import { coreColors, roleColors, semanticColors, textTokens, tokens } from '@thl/tokens/tokens';
import { version } from '@thl/ui/lib/version';

/**
 * The systems this docs site documents.
 *
 * Adding one means: a new entry here, one `@import` of its `theme.scoped.css`
 * in globals.css, and a page under `app/systems/<slug>/`. The `slug` is what
 * lands in `data-system`, so it must match the selector the system's scoped
 * stylesheet was generated with.
 */
export interface SystemEntry {
  slug: string;
  name: string;
  namespace: string;
  /**
   * The system's current version, read from its generated artifact — which is
   * generated from its CHANGELOG.md. Never typed in here: an index that states
   * a version by hand is a second declaration, and the whole point of this one
   * is that there is only ever one.
   */
  version: string;
  tagline: string;
  /** Token counts, read from the system's generated module. */
  tokens: typeof tokens;
  coreColors: typeof coreColors;
  semanticColors: typeof semanticColors;
  roleColors: typeof roleColors;
  textTokens: typeof textTokens;
}

export const systems: SystemEntry[] = [
  {
    slug: 'human-laboratory',
    name: 'The Human Laboratory',
    namespace: '@thl',
    version,
    tagline:
      'Neo-brutalist. Obsidian ground, a single lime signal, hard borders, monospaced body. Constraint produces coherence.',
    tokens,
    coreColors,
    semanticColors,
    roleColors,
    textTokens
  }
];

export function getSystem(slug: string): SystemEntry | undefined {
  return systems.find((s) => s.slug === slug);
}
