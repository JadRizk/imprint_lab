import { ImageFrame } from '@repo/ui/components/image-frame';
import { PageShell } from '@repo/ui/components/page-shell';
import { SectionHeader } from '@repo/ui/components/section-header';

import { ArrowDownRight } from 'lucide-react';
import Link from 'next/link';

import { HeroSection } from '../sections/hero/hero-section';

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
    // pt-12 clears the fixed nav. The nav's height is the page's concern,
    // not something HeroSection should be padded to compensate for.
    <div className="min-h-screen w-full pt-12">
      {/* Navigation Bar */}
      <nav className="fixed top-0 z-50 w-full border-b border-steel bg-obsidian/80 backdrop-blur-sm">
        <PageShell className="flex items-center justify-between py-3">
          <Link
            href="/"
            className="text-xs font-bold tracking-label text-text-secondary transition-colors hover:text-lime"
          >
            &lt;- HOME
          </Link>
          <span className="text-xs font-bold tracking-label text-text-tertiary">
            {/* biome-ignore lint/suspicious/noCommentText: decorative separator */}
            DEMO // <span className="text-lime">LANDING_PAGE</span>
          </span>
        </PageShell>
      </nav>

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
          <div className="grid grid-cols-3 gap-px">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`block-${i.toString()}`}
                className="flex aspect-square items-center justify-center border border-steel"
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
          <p className="mb-12 max-w-lg border-l-2 border-steel pl-4 text-sm leading-relaxed">
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
                <span className="ml-4 font-mono text-xs text-lime">
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
          <p className="mb-8 max-w-lg text-sm leading-relaxed">
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
