import Link from "next/link";

import { ArrowDownRight } from "lucide-react";

import { ImageFrame } from "@repo/ui/components/image-frame";

import { HeroSection } from "../sections/hero/hero-section";

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
                label: "SAMPLE_A",
                icon: <ArrowDownRight size={12} className="text-lime" />,
              }}
              className="h-75"
            />
            <ImageFrame
              src="https://picsum.photos/seed/demo-b/800/600"
              alt="Field sample beta"
              badge={{
                label: "SAMPLE_B",
                icon: <ArrowDownRight size={12} className="text-lime" />,
              }}
              className="h-75"
            />
            <ImageFrame
              src="https://picsum.photos/seed/demo-c/this-will-404"
              alt="Field sample gamma — broken src"
              badge={{
                label: "SAMPLE_C // ERR",
                icon: <ArrowDownRight size={12} className="text-lime" />,
              }}
              className="h-75 md:col-span-2 lg:col-span-1"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8">
        <div className="container mx-auto flex items-center justify-between px-4 md:px-8">
          <span className="text-xs text-text-tertiary">
            THE_HUMAN_LABORATORY // DEMO_PAGE
          </span>
          <span className="text-xs text-text-tertiary">
            STATUS: <span className="text-lime">RENDERING</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
