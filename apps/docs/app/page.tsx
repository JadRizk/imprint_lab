import { PageShell } from '@thl/ui/components/page-shell';
import { SectionHeader } from '@thl/ui/components/section-header';
import Link from 'next/link';

import { systems } from '../lib/systems';

/**
 * The house index. Chrome here is roles-only — it has to read correctly whatever
 * system a visitor arrives from, so it must not borrow one system's primitives.
 */
export default function HomePage() {
  return (
    <div data-system="human-laboratory" className="min-h-screen w-full pt-10 pb-20">
      <PageShell>
        <header className="border-b border-line pb-8">
          <h1 className="mb-4 text-4xl font-bold text-ink">
            {/* biome-ignore lint/suspicious/noCommentText: decorative separator */}
            IMPRINT_LAB // <span className="text-accent">SYSTEMS</span>
          </h1>
          <p className="max-w-2xl text-lg">
            A house of design systems. Each one owns its tokens, components, report kit and brand,
            and evolves on its own timeline. Projects live elsewhere and adopt a system at a
            version.
          </p>
        </header>

        <div className="mt-16 space-y-8">
          <SectionHeader number="01" label="INSTALLED_SYSTEMS" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {systems.map((system) => (
              <Link
                key={system.slug}
                href={`/systems/${system.slug}`}
                data-system={system.slug}
                className="group relative border border-line p-6 transition-colors duration-state hover:border-line-strong"
              >
                <div className="flex items-baseline justify-between gap-4">
                  {/* Neutral, not accent. brand/README.md: the mark already spends
                      the accent, so the namespace does not — and `Wordmark` sets
                      `// @thl` in a text role for exactly that reason. Rank comes
                      from `ink` against the metadata's `ink-subtle` beside it,
                      which costs nothing from the budget. */}
                  <span className="text-micro tracking-label text-ink">{system.namespace}</span>
                  <span className="text-micro tracking-label text-ink-subtle">
                    V{system.version} · {system.tokens.length} TOKENS · {system.roleColors.length}{' '}
                    ROLES
                  </span>
                </div>
                <h2 className="mt-3 text-xl font-bold text-ink">{system.name}</h2>
                <p className="mt-2 text-sm text-ink-muted">{system.tagline}</p>
                {/* Hover climbs to `ink` rather than firing the accent: hover is a
                    state of the pointer, not of the machine. Same correction
                    BentoCard took, and the same rule the report kit already keeps. */}
                <span className="mt-4 block text-micro tracking-label text-ink-subtle transition-colors duration-state group-hover:text-ink">
                  OPEN -&gt;
                </span>
              </Link>
            ))}
          </div>

          <p className="max-w-2xl text-xs text-ink-subtle">
            Each card renders inside its own <code className="text-ink">data-system</code> scope, so
            it previews in that system&apos;s palette rather than the site&apos;s. Adding a system
            means one entry in <code className="text-ink">lib/systems.ts</code>, one import in{' '}
            <code className="text-ink">globals.css</code>, and a page.
          </p>
        </div>
      </PageShell>
    </div>
  );
}
