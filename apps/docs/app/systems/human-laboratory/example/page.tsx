import { BentoCard } from '@thl/ui/components/bento-card';
import { BentoGrid } from '@thl/ui/components/bento-grid';
import { Button } from '@thl/ui/components/button';
import { ImageFrame } from '@thl/ui/components/image-frame';
import { PageShell } from '@thl/ui/components/page-shell';
import { SectionHeader } from '@thl/ui/components/section-header';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

import { asset } from '../../../../lib/base-path';
import { SystemNav } from '../system-nav';

import { CENSUS, type LadderRole, LINE_LADDER, MOTION_RUNGS, TEXT_FLOOR } from './data';
import { HeroSection } from './hero-section';
import { StickyNav } from './sticky-nav';

/**
 * How each rung of the line ladder is drawn, keyed by the role it names.
 *
 * Complete literal strings, never `border-${rung}`. Tailwind scans for literals,
 * so a class assembled from a variable generates no CSS and fails silently —
 * here that would be a 2px rule rendering at zero height, on the one section
 * whose entire subject is line weight. See "Utilities rendered through a
 * variable" in CLAUDE.md.
 *
 * `h-0.5` is 2px: the spacing base is 0.25rem, so the rule matches the 2px
 * border its row is drawn with rather than approximating it.
 */
const LADDER_STYLE: Record<LadderRole, { box: string; rule: string }> = {
  '--color-ambient': { box: 'border border-ambient', rule: 'h-px bg-ambient' },
  '--color-line': { box: 'border border-line', rule: 'h-px bg-line' },
  '--color-line-strong': { box: 'border-2 border-line-strong', rule: 'h-0.5 bg-line-strong' },
  '--color-accent': { box: 'border-2 border-accent', rule: 'h-0.5 bg-accent' }
};

const SAMPLES = [
  {
    src: asset('/samples/specimen-02.jpg'),
    alt: 'Field sample alpha — specimen plate',
    label: 'SAMPLE_A',
    className: ''
  },
  {
    src: asset('/samples/specimen-03.jpg'),
    alt: 'Field sample beta — specimen plate',
    label: 'SAMPLE_B',
    className: ''
  },
  {
    // Intentionally broken src — exercises ImageFrame's SIGNAL_LOST state.
    src: asset('/samples/does-not-exist.jpg'),
    alt: 'Field sample gamma — deliberately broken source',
    label: 'SAMPLE_C',
    className: 'md:col-span-2 lg:col-span-1'
  }
] as const;

export default function DemoPage() {
  return (
    // The nav is sticky, not fixed, so it occupies its own height in flow and
    // the page cannot mis-clear it. The previous `fixed` + `pt-12` pairing was
    // a constant clearing a variable: at 375px the nav wrapped to three lines,
    // measured 102px, and its bottom rule cut 6px into the first eyebrow.
    <div className="min-h-screen w-full">
      {/* Navigation Bar — opaque. A translucent, blurred bar is glassmorphism,
          which is precisely the vocabulary this system exists to reject.
          Its rule is earned rather than permanent; see StickyNav. */}
      <StickyNav>
        <PageShell className="flex items-center justify-between py-3">
          <SystemNav base="/systems/human-laboratory" current="/example" />
          <span className="text-micro tracking-label text-ink-subtle">
            {/* biome-ignore lint/suspicious/noCommentText: decorative separator */}
            EXAMPLE // <span className="text-accent">FULL_PAGE</span>
          </span>
        </PageShell>
      </StickyNav>

      <HeroSection />

      {/* Field samples */}
      <section className="w-full border-b border-line py-16">
        <PageShell>
          <SectionHeader label="FIELD_SAMPLES" className="mb-8" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SAMPLES.map((sample) => (
              <ImageFrame
                key={sample.label}
                src={sample.src}
                alt={sample.alt}
                badge={{ label: sample.label }}
                className={`h-75 ${sample.className}`}
              />
            ))}
          </div>
        </PageShell>
      </section>

      {/* Census — the system reporting on itself.
          This replaces twelve empty aspect-square cells that occupied ~1750px
          of page to display twelve hex labels. A dense readout is the same
          gesture at a tenth the height, and every number here is real. */}
      <section className="w-full border-b border-line py-16">
        <PageShell>
          <SectionHeader label="SYSTEM_CENSUS" className="mb-8" />
          <BentoGrid>
            {CENSUS.map((tile) => (
              <BentoCard key={tile.label}>
                <div className="space-y-2 p-6">
                  <span className="block text-micro tracking-label text-ink-subtle">
                    {tile.label}
                  </span>
                  {/* The accent lands on exactly one tile — the one carrying
                      the finding. Four identical lime readouts is the accent
                      becoming texture, which is what this page shipped. */}
                  <span
                    className={`block text-2xl font-bold ${tile.marked ? 'text-accent' : 'text-ink'}`}
                  >
                    {tile.value}
                  </span>
                  <span className="block text-micro text-ink-subtle">{tile.note}</span>
                </div>
              </BentoCard>
            ))}
          </BentoGrid>
        </PageShell>
      </section>

      {/* The line ladder, measured. */}
      <section className="w-full border-b border-line py-24">
        <PageShell>
          <SectionHeader label="LINE_LADDER" className="mb-8" />
          <p className="mb-12 max-w-lg border-l-2 border-line-strong pl-4 text-sm leading-prose">
            Four tiers of boundary, each with a job. Ambient is darker than line on purpose:
            decoration that outranks the structure containing it is the inversion this ladder exists
            to prevent.
          </p>
          <div className="space-y-4">
            {/* Each row is bounded by the tier it names, and the rule running
                through it is that same tier. Blur this block and the four rows
                should separate into four weights — if they do not, the ladder
                is not doing its job. */}
            {LINE_LADDER.map((rung) => {
              const style = LADDER_STYLE[rung.role];
              return (
                <div key={rung.role} className={`flex h-12 items-center px-4 ${style.box}`}>
                  <span className="w-40 shrink-0 text-xs text-ink-subtle">{rung.label}</span>
                  <span className="w-12 shrink-0 text-xs text-ink-subtle">{rung.weight}</span>
                  <span className="hidden text-xs text-ink-subtle sm:inline">{rung.job}</span>
                  <div className={`ml-4 flex-1 ${style.rule}`} />
                  <span className="ml-4 text-xs text-ink">{rung.ratio ?? '—'}</span>
                </div>
              );
            })}
          </div>
        </PageShell>
      </section>

      {/* Contrast and time — two more measured tables. */}
      <section className="w-full border-b border-line py-24">
        <PageShell>
          <SectionHeader label="CALIBRATION" className="mb-8" />
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="space-y-4">
              <span className="block text-micro tracking-label text-ink-subtle">
                TEXT_FLOOR / 4.5:1 AGAINST CANVAS
              </span>
              <div className="divide-y divide-ambient border border-line">
                {TEXT_FLOOR.map((role) => (
                  <div key={role.name} className="flex items-center gap-4 px-4 py-3">
                    <span
                      className="size-3 shrink-0 border border-ambient"
                      style={{ backgroundColor: role.value }}
                    />
                    <span className="flex-1 text-xs text-ink-subtle">{role.label}</span>
                    <span className="text-xs text-ink">{role.ratio}</span>
                    <span
                      className={`w-24 text-right text-micro ${
                        role.clears ? 'text-ink-subtle' : 'text-warning'
                      }`}
                    >
                      {role.clears ? 'CLEARS' : 'NEVER TEXT'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <span className="block text-micro tracking-label text-ink-subtle">
                DURATION_LADDER
              </span>
              <div className="divide-y divide-ambient border border-line">
                {MOTION_RUNGS.map((rung) => (
                  <div key={rung.label} className="flex items-center gap-4 px-4 py-3">
                    <span className="flex-1 text-xs text-ink-subtle">{rung.label}</span>
                    <span className="text-xs text-ink">{rung.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PageShell>
      </section>

      {/* The call to action. The page had no <button> at all before this — which
          is why press feedback and focus, two of the contracts this system
          argues hardest for, were invisible on the one artifact meant to prove
          it assembles. */}
      <section className="w-full border-b border-line py-24">
        <PageShell>
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-lg space-y-3">
              <SectionHeader label="ADOPT_THE_SYSTEM" marked />
              <p className="text-sm leading-prose">
                Components are copied into your project, not installed as a dependency. You adopt a
                version deliberately, and it diverges from there.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button asChild variant="primary">
                <Link href="/systems/human-laboratory/components">
                  Components
                  <ArrowUpRight size={16} className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/systems/human-laboratory/foundations">Foundations</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/systems/human-laboratory/changelog">Changelog</Link>
              </Button>
            </div>
          </div>
        </PageShell>
      </section>

      <footer className="w-full py-8">
        <PageShell className="flex flex-wrap items-center justify-between gap-4">
          {/* biome-ignore lint/suspicious/noCommentText: decorative separator */}
          <span className="text-xs text-ink-subtle">THE_HUMAN_LABORATORY // EXAMPLE_PAGE</span>
          <span className="text-xs text-ink-subtle">
            EVERY READOUT ON THIS PAGE IS READ FROM THE TOKEN MODEL
          </span>
        </PageShell>
      </footer>
    </div>
  );
}
