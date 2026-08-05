import { ImageFrame } from '@thl/ui/components/image-frame';
import { PageShell } from '@thl/ui/components/page-shell';
import { SectionHeader } from '@thl/ui/components/section-header';
import { ArrowDownRight } from 'lucide-react';

import { heroContent } from './data';

export function HeroSection() {
  return (
    <section className="w-full border-b border-steel py-12">
      <PageShell>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Typography */}
          <div className="flex h-full flex-col justify-between space-y-12 lg:col-span-5">
            <div>
              <SectionHeader label={heroContent.badge} className="mb-6" />

              {/* No tracking or leading of its own. This heading crosses three
                  steps of the scale — 3xl to 6xl — so one fixed pair could not
                  be right at all of them, which is exactly what it carried:
                  Tailwind's tracking-tighter (-0.05em) and leading-tight, both
                  from outside the token model. Each step now brings its own. */}
              <h1 className="mb-8 text-3xl font-bold text-white md:text-5xl lg:text-6xl">
                {heroContent.heading}
                <span className="text-lime">{heroContent.headingAccent}</span>
              </h1>

              <p className="max-w-md border-l-2 border-steel pl-4 text-sm leading-prose text-text-secondary md:text-base">
                {heroContent.description}
              </p>
            </div>
          </div>

          {/* Right Column: Technical Schematic */}
          <ImageFrame
            src={heroContent.image.src}
            alt={heroContent.image.alt}
            badge={{
              label: heroContent.image.badge.label,
              icon: <ArrowDownRight size={12} className="text-lime" />
            }}
            className="h-[400px] lg:col-span-7 lg:h-[600px]"
          />
        </div>
      </PageShell>
    </section>
  );
}
