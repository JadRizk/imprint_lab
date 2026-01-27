import { ImageFrame } from '@repo/ui/components/image-frame';

import { ArrowDownRight } from 'lucide-react';
import Link from 'next/link';

import { HeroSection } from '../sections/hero/hero-section';

export default function DemoPage() {
  return (
    <div className="min-h-screen w-full">
      {/* Navigation Bar */}
      <nav className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-steel bg-obsidian/80 px-4 py-3 backdrop-blur-sm md:px-8">
        <Link
          href="/"
          className="text-xs font-bold tracking-widest text-text-secondary transition-colors hover:text-lime"
        >
          &lt;- HOME
        </Link>
        <span className="text-xs font-bold tracking-[0.2em] text-text-tertiary">
          {/* biome-ignore lint/suspicious/noCommentText: decorative separator */}
          DEMO // <span className="text-lime">LANDING_PAGE</span>
        </span>
      </nav>

      {/* Hero Section — full composition */}
      <HeroSection />

      {/* Secondary Content Block */}
      <section className="w-full border-b border-steel py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-8 flex items-center gap-2">
            <div className="h-2 w-2 bg-lime" />
            <h2 className="text-xs font-bold tracking-[0.2em] text-text-secondary">
              FIELD_SAMPLES
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ImageFrame
              src="https://picsum.photos/seed/demo-a/800/600"
              alt="Field sample alpha"
              badge={{
                label: 'SAMPLE_A',
                icon: <ArrowDownRight size={12} className="text-lime" />
              }}
              className="h-75"
            />
            <ImageFrame
              src="https://picsum.photos/seed/demo-b/800/600"
              alt="Field sample beta"
              badge={{
                label: 'SAMPLE_B',
                icon: <ArrowDownRight size={12} className="text-lime" />
              }}
              className="h-75"
            />
            <ImageFrame
              src="https://picsum.photos/seed/demo-c/this-will-404"
              alt="Field sample gamma — broken src"
              badge={{
                label: 'SAMPLE_C // ERR',
                icon: <ArrowDownRight size={12} className="text-lime" />
              }}
              className="h-75 md:col-span-2 lg:col-span-1"
            />
          </div>
        </div>
      </section>

      {/* Spacer sections for parallax scroll testing */}
      <section className="w-full border-b border-steel py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-8 flex items-center gap-2">
            <div className="h-2 w-2 bg-lime" />
            <h2 className="text-xs font-bold tracking-[0.2em] text-text-secondary">
              SIGNAL_PROCESSING
            </h2>
          </div>
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
        </div>
      </section>

      <section className="relative w-full overflow-hidden border-b border-steel py-24">
        <div className="relative z-10 container mx-auto px-4 md:px-8">
          <div className="mb-8 flex items-center gap-2">
            <div className="h-2 w-2 bg-lime" />
            <h2 className="text-xs font-bold tracking-[0.2em] text-text-secondary">
              DEPTH_CALIBRATION
            </h2>
          </div>
          <p className="mb-12 max-w-lg border-l-2 border-steel pl-4 text-sm leading-relaxed text-text-secondary">
            This section also has a ScanGridPulse background. Scroll to compare the parallax offset
            here versus the hero grid above — both shift independently based on scroll position.
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
                <div className="ml-4 h-px flex-1 bg-steel" />
                <span className="ml-4 font-mono text-xs text-lime">
                  {`${((i + 1) * 0.15).toFixed(2)}x`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full border-b border-steel py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-8 flex items-center gap-2">
            <div className="h-2 w-2 bg-lime" />
            <h2 className="text-xs font-bold tracking-[0.2em] text-text-secondary">
              AMBIENT_ANALYSIS
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {['SWEEP', 'PARALLAX', 'VISIBILITY', 'REDUCED_MOTION'].map((label) => (
              <div key={label} className="border border-steel p-6">
                <span className="mb-2 block font-mono text-xs text-text-tertiary">{label}</span>
                <span className="block text-2xl font-bold text-white">OK</span>
                <span className="mt-1 block text-xs text-lime">NOMINAL</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8">
        <div className="container mx-auto flex items-center justify-between px-4 md:px-8">
          {/* biome-ignore lint/suspicious/noCommentText: decorative separator */}
          <span className="text-xs text-text-tertiary">THE_HUMAN_LABORATORY // DEMO_PAGE</span>
          <span className="text-xs text-text-tertiary">
            STATUS: <span className="text-lime">RENDERING</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
