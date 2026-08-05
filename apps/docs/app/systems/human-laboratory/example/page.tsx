import { ImageFrame } from '@thl/ui/components/image-frame';
import { PageShell } from '@thl/ui/components/page-shell';
import { SectionHeader } from '@thl/ui/components/section-header';

import { ArrowDownRight } from 'lucide-react';

import { SystemNav } from '../system-nav';

import { HeroSection } from './hero-section';
import { StickyNav } from './sticky-nav';

const SAMPLES = [
  {
    src: 'https://picsum.photos/seed/demo-a/800/600',
    alt: 'Field sample alpha — placeholder photograph',
    label: 'SAMPLE_A',
    className: ''
  },
  {
    src: 'https://picsum.photos/seed/demo-b/800/600',
    alt: 'Field sample beta — placeholder photograph',
    label: 'SAMPLE_B',
    className: ''
  },
  {
    // Intentionally broken src — exercises ImageFrame's SIGNAL_LOST state.
    src: 'https://picsum.photos/seed/demo-c/this-will-404',
    alt: 'Field sample gamma — deliberately broken source',
    label: 'SAMPLE_C // ERR',
    className: 'md:col-span-2 lg:col-span-1'
  }
] as const;

const READOUTS = ['SWEEP', 'PARALLAX', 'VISIBILITY', 'REDUCED_MOTION'] as const;

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

      {/* Hero Section — full composition */}
      <HeroSection />

      {/* Field samples */}
      <section className="w-full border-b border-steel py-16">
        <PageShell>
          <SectionHeader label="FIELD_SAMPLES" className="mb-8" />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SAMPLES.map((sample) => (
              <ImageFrame
                key={sample.label}
                src={sample.src}
                alt={sample.alt}
                badge={{
                  label: sample.label,
                  icon: <ArrowDownRight size={12} className="text-lime" />
                }}
                className={`h-75 ${sample.className}`}
              />
            ))}
          </div>
        </PageShell>
      </section>

      {/* Signal processing grid */}
      <section className="w-full border-b border-steel py-24">
        <PageShell>
          <SectionHeader label="SIGNAL_PROCESSING" className="mb-8" />
          {/* The line ladder: one structural edge around the whole block, the
              hairline tier for the subdivisions inside it. Twelve equally-weighted
              1px cells read as nothing at squint distance — every boundary was
              asserting itself exactly as hard as every other. */}
          <div className="grid grid-cols-3 border border-line">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`block-${i.toString()}`}
                className="flex aspect-square items-center justify-center border-r border-b border-ambient last:border-r-0"
              >
                <span className="font-mono text-xs text-text-tertiary">
                  {`0x${i.toString(16).toUpperCase().padStart(2, '0')}`}
                </span>
              </div>
            ))}
          </div>
        </PageShell>
      </section>

      {/* Depth calibration */}
      <section className="relative w-full overflow-hidden border-b border-steel py-24">
        <PageShell className="relative z-10">
          <SectionHeader label="DEPTH_CALIBRATION" className="mb-8" />
          <p className="mb-12 max-w-lg border-l-2 border-line-strong pl-4 text-sm leading-prose">
            Static layer readout. Scroll-driven parallax is not implemented yet — these coefficients
            are the placeholder for that work, not a live measurement.
          </p>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`bar-${i.toString()}`}
                className="flex h-12 items-center border border-steel px-4"
              >
                <span className="font-mono text-xs text-text-tertiary">
                  {`LAYER_${(i + 1).toString().padStart(2, '0')}`}
                </span>
                <div className="ml-4 h-px flex-1 bg-ambient" />
                <span className="ml-4 font-mono text-xs text-ink">
                  {`${((i + 1) * 0.15).toFixed(2)}x`}
                </span>
              </div>
            ))}
          </div>
        </PageShell>
      </section>

      {/* Ambient analysis */}
      <section className="w-full border-b border-steel py-24">
        <PageShell>
          <SectionHeader label="AMBIENT_ANALYSIS" className="mb-8" />
          <p className="mb-8 max-w-lg text-sm leading-prose">
            Placeholder readouts. These tiles report a fixed value — they are not yet wired to
            anything that measures.
          </p>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {READOUTS.map((label) => (
              <div key={label} className="border border-steel p-6">
                <span className="mb-2 block font-mono text-xs text-text-tertiary">{label}</span>
                <span className="block text-2xl font-bold text-white">OK</span>
                <span className="mt-1 block text-xs text-lime">NOMINAL</span>
              </div>
            ))}
          </div>
        </PageShell>
      </section>

      {/* Footer */}
      <footer className="w-full py-8">
        <PageShell className="flex items-center justify-between">
          {/* biome-ignore lint/suspicious/noCommentText: decorative separator */}
          <span className="text-xs text-text-tertiary">THE_HUMAN_LABORATORY // DEMO_PAGE</span>
          <span className="text-xs text-text-tertiary">
            STATUS: <span className="text-lime">RENDERING</span>
          </span>
        </PageShell>
      </footer>
    </div>
  );
}
