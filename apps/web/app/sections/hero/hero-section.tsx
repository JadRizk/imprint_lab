import { ArrowDownRight } from "lucide-react";

import { ImageFrame } from "@repo/ui/components/image-frame";

import { heroContent } from "./data";

export function HeroSection() {
  return (
    <section className="w-full border-b border-steel pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Typography */}
          <div className="flex h-full flex-col justify-between space-y-12 lg:col-span-5">
            <div>
              <div className="mb-6 flex items-center gap-2">
                <div className="h-2 w-2 bg-lime" />
                <h2 className="text-xs font-bold tracking-[0.2em] text-text-secondary">
                  {heroContent.badge}
                </h2>
              </div>

              <h1 className="mb-8 text-3xl font-bold leading-tight tracking-tighter text-white md:text-5xl lg:text-6xl">
                {heroContent.heading}
                <span className="text-lime">{heroContent.headingAccent}</span>
              </h1>

              <p className="max-w-md border-l-2 border-steel pl-4 text-sm leading-relaxed text-text-secondary md:text-base">
                {heroContent.description}
              </p>
            </div>
          </div>

          {/* Right Column: Technical Schematic */}
          <ImageFrame
            src={heroContent.image.src}
            alt={heroContent.image.alt}
            badge={{ label: heroContent.image.badge.label, icon: <ArrowDownRight size={12} className="text-lime" /> }}
            className="h-[400px] lg:col-span-7 lg:h-[600px]"
          />
        </div>
      </div>
    </section>
  );
}
