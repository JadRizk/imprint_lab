import { BentoCard } from '@repo/ui/components/bento-card';
import { BentoGrid } from '@repo/ui/components/bento-grid';
import { Button } from '@repo/ui/components/button';
import { ImageFrame } from '@repo/ui/components/image-frame';
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Menu,
  Plus,
  Search,
  X
} from 'lucide-react';
import Link from 'next/link';

import { HeroSection } from '../sections/hero/hero-section';

const SPACING_STEPS = [1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24] as const;

const CORE_COLORS = [
  { name: 'SAFETY LIME', hex: '#DFFF00', utility: 'bg-lime' },
  { name: 'OBSIDIAN', hex: '#0F0F0F', utility: 'bg-obsidian' },
  { name: 'COLD STEEL', hex: '#333333', utility: 'bg-steel' },
  { name: 'TEXT GREY', hex: '#8E8E93', utility: 'bg-text' },
  { name: 'PURE WHITE', hex: '#FFFFFF', utility: 'bg-white' }
] as const;

const SEMANTIC_COLORS = [
  { name: 'SURFACE', hex: '#0A0A0A', utility: 'bg-surface' },
  { name: 'TEXT SECONDARY', hex: '#A3A3A3', utility: 'bg-text-secondary' },
  { name: 'TEXT TERTIARY', hex: '#555555', utility: 'bg-text-tertiary' }
] as const;

const TOKEN_REFERENCE = [
  {
    property: '--color-obsidian',
    value: '#0F0F0F',
    utility: 'bg-obsidian, text-obsidian, border-obsidian'
  },
  { property: '--color-lime', value: '#DFFF00', utility: 'bg-lime, text-lime, border-lime' },
  { property: '--color-steel', value: '#333333', utility: 'bg-steel, text-steel, border-steel' },
  { property: '--color-text', value: '#8E8E93', utility: 'bg-text, text-text, border-text' },
  { property: '--color-white', value: '#FFFFFF', utility: 'bg-white, text-white, border-white' },
  { property: '--color-surface', value: '#0A0A0A', utility: 'bg-surface, text-surface' },
  { property: '--color-text-secondary', value: '#A3A3A3', utility: 'text-text-secondary' },
  { property: '--color-text-tertiary', value: '#555555', utility: 'text-text-tertiary' },
  { property: '--font-mono', value: 'JetBrains Mono', utility: 'font-mono' },
  {
    property: '--shadow-lime-glow',
    value: '0 0 15px rgba(223,255,0,0.3)',
    utility: 'shadow-lime-glow'
  },
  {
    property: '--shadow-lime-glow-lg',
    value: '0 0 30px rgba(223,255,0,0.4) ...',
    utility: 'shadow-lime-glow-lg'
  },
  { property: '--animate-scan', value: 'scan 4s linear infinite', utility: 'animate-scan' }
] as const;

function SectionHeader({ number, label }: { number: string; label: string }) {
  return (
    <div className="mb-6 flex items-center gap-2 border-b border-steel pb-2">
      <div className="h-2 w-2 bg-lime" />
      <h2 className="text-xs font-bold tracking-[0.2em] text-text-secondary">
        {number}_{label}
      </h2>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen w-full pt-20 pb-20">
      <div className="container mx-auto space-y-24 px-4 md:px-8">
        {/* Header */}
        <header className="border-b border-steel pb-8">
          <div className="mb-4 flex items-center gap-4">
            <Link href="/" className="text-xs text-text-tertiary transition-colors hover:text-lime">
              &lt;- HOME
            </Link>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white">
            {/* biome-ignore lint/suspicious/noCommentText: decorative separator */}
            DESIGN_SYSTEM // <span className="text-lime">v1.0</span>
          </h1>
          <p className="max-w-2xl text-lg">
            The core building blocks of The Human Laboratory. Functional, brutalist, and atomic.
          </p>
        </header>

        {/* 01 TYPOGRAPHY */}
        <section className="space-y-8">
          <SectionHeader number="01" label="TYPOGRAPHY" />
          <div className="grid grid-cols-1 items-center gap-8 border border-steel bg-surface p-8 md:grid-cols-2">
            <div className="space-y-6">
              <div>
                <span className="mb-1 block text-[10px] text-text-tertiary">H1 / 5XL / BOLD</span>
                <h1 className="text-5xl font-bold text-white">Heading 1</h1>
              </div>
              <div>
                <span className="mb-1 block text-[10px] text-text-tertiary">H2 / 3XL / BOLD</span>
                <h2 className="text-3xl font-bold text-white">Heading 2</h2>
              </div>
              <div>
                <span className="mb-1 block text-[10px] text-text-tertiary">H3 / XL / BOLD</span>
                <h3 className="text-xl font-bold text-white">Heading 3</h3>
              </div>
              <div>
                <span className="mb-1 block text-[10px] text-text-tertiary">
                  H4 / LG / BOLD (ACCENT)
                </span>
                <h4 className="text-lg font-bold text-lime">Heading 4</h4>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <span className="mb-1 block text-[10px] text-text-tertiary">BODY / BASE</span>
                <p className="text-base text-white">
                  Body Text (Base) — The quick brown fox jumps over the lazy dog.
                </p>
              </div>
              <div>
                <span className="mb-1 block text-[10px] text-text-tertiary">SECONDARY / SM</span>
                <p className="text-sm text-text-secondary">
                  Secondary Text — Information density is critical for technical interfaces.
                </p>
              </div>
              <div>
                <span className="mb-1 block text-[10px] text-text-tertiary">TERTIARY / XS</span>
                <p className="text-xs text-text-tertiary">
                  Tertiary / Metadata — SYSTEM_ID: 0x8291
                </p>
              </div>
              <div>
                <span className="mb-1 block text-[10px] text-text-tertiary">
                  MONOSPACE / XS / ACCENT
                </span>
                <p className="text-xs text-lime">console.log(&apos;Hello World&apos;);</p>
              </div>
            </div>
          </div>
        </section>

        {/* 02 COLOR PALETTE */}
        <section className="space-y-8">
          <SectionHeader number="02" label="COLOR_PALETTE" />

          {/* Core */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
              CORE
            </p>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
              {CORE_COLORS.map((color) => (
                <div key={color.name} className="group space-y-2">
                  <div
                    className="h-24 w-full border border-steel transition-all group-hover:shadow-lime-glow"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="flex justify-between text-xs">
                    <span>{color.name}</span>
                    <span className="text-white">{color.hex}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Semantic */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
              SEMANTIC
            </p>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              {SEMANTIC_COLORS.map((color) => (
                <div key={color.name} className="group space-y-2">
                  <div
                    className="h-24 w-full border border-steel transition-all group-hover:shadow-lime-glow"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="flex justify-between text-xs">
                    <span>{color.name}</span>
                    <span className="text-white">{color.hex}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 03 SPACING SCALE */}
        <section className="space-y-8">
          <SectionHeader number="03" label="SPACING_SCALE" />
          <div className="space-y-3 border border-steel bg-surface p-8">
            {SPACING_STEPS.map((step) => (
              <div key={step} className="flex items-center gap-4">
                <span className="w-8 text-right text-xs text-text-tertiary">{step}</span>
                <div className="h-4 bg-lime" style={{ width: `${step * 4}px` }} />
                <span className="text-xs text-text-secondary">{step * 4}px</span>
              </div>
            ))}
          </div>
        </section>

        {/* 04 EFFECTS */}
        <section className="space-y-8">
          <SectionHeader number="04" label="EFFECTS" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Lime glow */}
            <div className="space-y-3">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                SHADOW / LIME_GLOW
              </span>
              <div className="flex h-40 items-center justify-center border border-steel bg-surface shadow-lime-glow">
                <span className="text-xs text-lime">shadow-lime-glow</span>
              </div>
            </div>

            {/* Border hover */}
            <div className="space-y-3">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                BORDER / HOVER_TRANSITION
              </span>
              <div className="flex h-40 cursor-pointer items-center justify-center border border-steel bg-surface transition-colors hover:border-lime">
                <span className="text-xs text-text-secondary">hover:border-lime</span>
              </div>
            </div>

            {/* Scan line */}
            <div className="space-y-3">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                ANIMATION / SCAN_LINE
              </span>
              <div className="relative flex h-40 items-center justify-center overflow-hidden border border-steel bg-surface">
                <div className="scan-line absolute" />
                <span className="text-xs text-text-secondary">.scan-line</span>
              </div>
            </div>
          </div>
        </section>

        {/* 05 TOKEN REFERENCE */}
        <section className="space-y-8">
          <SectionHeader number="05" label="TOKEN_REFERENCE" />
          <div className="overflow-x-auto border border-steel">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-steel bg-surface">
                  <th className="px-4 py-3 font-bold text-text-secondary">CSS PROPERTY</th>
                  <th className="px-4 py-3 font-bold text-text-secondary">VALUE</th>
                  <th className="px-4 py-3 font-bold text-text-secondary">TAILWIND UTILITY</th>
                </tr>
              </thead>
              <tbody>
                {TOKEN_REFERENCE.map((token) => (
                  <tr
                    key={token.property}
                    className="border-b border-steel/50 transition-colors hover:bg-surface"
                  >
                    <td className="px-4 py-2.5 text-lime">{token.property}</td>
                    <td className="px-4 py-2.5 text-white">{token.value}</td>
                    <td className="px-4 py-2.5 text-text-secondary">{token.utility}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 06 IMAGE_FRAME */}
        <section className="space-y-8">
          <SectionHeader number="06" label="IMAGE_FRAME" />
          <p className="max-w-lg text-xs text-text-secondary">
            Animated image reveal with grid overlay, scan line pulse, corner markers, and status
            badge. Uses framer-motion for height-reveal and opacity animations.
          </p>
          <div className="h-100">
            <ImageFrame
              src="https://picsum.photos/1200/800"
              alt="Placeholder schematic image"
              badge={{
                label: 'IMG_SRC_LOADED',
                icon: <ArrowDownRight size={12} className="text-lime" />
              }}
              className="h-full"
            />
          </div>
        </section>

        {/* 07 BUTTON */}
        <section className="space-y-8">
          <SectionHeader number="07" label="BUTTON" />
          <p className="max-w-lg text-xs text-text-secondary">
            Variant-based button with CVA + Radix Slot for polymorphism. Supports primary, outline,
            ghost, and tag variants in sm, default, lg, and icon sizes.
          </p>

          {/* Variants */}
          <div className="space-y-3">
            <span className="block text-[10px] text-text-tertiary">VARIANTS</span>
            <div className="flex flex-wrap items-center gap-4 border border-steel bg-surface p-6">
              <Button variant="primary">Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="tag">Tag</Button>
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-3">
            <span className="block text-[10px] text-text-tertiary">SIZES</span>
            <div className="flex flex-wrap items-center gap-4 border border-steel bg-surface p-6">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <ArrowDownRight size={20} />
              </Button>
            </div>
          </div>

          {/* Outline sizes */}
          <div className="space-y-3">
            <span className="block text-[10px] text-text-tertiary">OUTLINE / ALL SIZES</span>
            <div className="flex flex-wrap items-center gap-4 border border-steel bg-surface p-6">
              <Button variant="outline" size="sm">
                Small
              </Button>
              <Button variant="outline" size="default">
                Default
              </Button>
              <Button variant="outline" size="lg">
                Large
              </Button>
            </div>
          </div>

          {/* Tags row */}
          <div className="space-y-3">
            <span className="block text-[10px] text-text-tertiary">TAG / ROW</span>
            <div className="flex flex-wrap items-center gap-2 border border-steel bg-surface p-6">
              <Button variant="tag" size="sm">
                React
              </Button>
              <Button variant="tag" size="sm">
                TypeScript
              </Button>
              <Button variant="tag" size="sm">
                Next.js
              </Button>
              <Button variant="tag" size="sm">
                Tailwind
              </Button>
              <Button variant="tag" size="sm">
                Node
              </Button>
            </div>
          </div>

          {/* Icon only */}
          <div className="space-y-3">
            <span className="block text-[10px] text-text-tertiary">ICON_ONLY</span>
            <div className="space-y-4 border border-steel bg-surface p-6">
              <div className="flex flex-wrap items-center gap-4">
                <span className="w-16 text-[10px] text-text-tertiary">PRIMARY</span>
                <Button variant="primary" size="icon">
                  <Plus size={20} />
                </Button>
                <Button variant="primary" size="icon">
                  <Search size={20} />
                </Button>
                <Button variant="primary" size="icon">
                  <Download size={20} />
                </Button>
                <Button variant="primary" size="icon">
                  <ArrowUpRight size={20} />
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="w-16 text-[10px] text-text-tertiary">OUTLINE</span>
                <Button variant="outline" size="icon">
                  <Menu size={20} />
                </Button>
                <Button variant="outline" size="icon">
                  <X size={20} />
                </Button>
                <Button variant="outline" size="icon">
                  <Copy size={20} />
                </Button>
                <Button variant="outline" size="icon">
                  <ExternalLink size={20} />
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="w-16 text-[10px] text-text-tertiary">GHOST</span>
                <Button variant="ghost" size="icon">
                  <ChevronLeft size={20} />
                </Button>
                <Button variant="ghost" size="icon">
                  <ChevronRight size={20} />
                </Button>
                <Button variant="ghost" size="icon">
                  <X size={20} />
                </Button>
                <Button variant="ghost" size="icon">
                  <Search size={20} />
                </Button>
              </div>
            </div>
          </div>

          {/* Disabled states */}
          <div className="space-y-3">
            <span className="block text-[10px] text-text-tertiary">DISABLED</span>
            <div className="flex flex-wrap items-center gap-4 border border-steel bg-surface p-6">
              <Button variant="primary" disabled>
                Primary
              </Button>
              <Button variant="outline" disabled>
                Outline
              </Button>
              <Button variant="ghost" disabled>
                Ghost
              </Button>
              <Button variant="tag" disabled>
                Tag
              </Button>
            </div>
          </div>

          {/* asChild with Link */}
          <div className="space-y-3">
            <span className="block text-[10px] text-text-tertiary">AS_CHILD / LINK</span>
            <div className="flex flex-wrap items-center gap-4 border border-steel bg-surface p-6">
              <Button asChild variant="primary">
                <Link href="/">Home Link</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Outline Link</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* 08 HERO_SECTION */}
        <section className="space-y-8">
          <SectionHeader number="08" label="HERO_SECTION" />
          <p className="max-w-lg text-xs text-text-secondary">
            Full hero composition — text column with badge, heading, accent, and description on the
            left; ImageFrame on the right.
          </p>
          <div>
            <HeroSection />
          </div>
        </section>

        {/* 09 BENTO_CARD */}
        <section className="space-y-8">
          <SectionHeader number="09" label="BENTO_CARD" />
          <p className="max-w-lg text-xs text-text-secondary">
            Animated card surface with corner bracket decorations. Uses framer-motion for entrance,
            hover, and tap animations with reduced-motion support. Consumers control sizing via
            className grid-span utilities.
          </p>

          {/* Single card */}
          <div className="space-y-3">
            <span className="block text-[10px] text-text-tertiary">SINGLE</span>
            <div className="max-w-sm">
              <BentoCard>
                <div className="p-6">
                  <span className="text-[10px] font-bold tracking-widest text-lime">
                    CARD_LABEL
                  </span>
                  <p className="mt-2 text-sm text-text-secondary">
                    A single BentoCard with placeholder content. Hover to see corner brackets
                    highlight and scale animation.
                  </p>
                </div>
              </BentoCard>
            </div>
          </div>

          {/* Staggered entrance */}
          <div className="space-y-3">
            <span className="block text-[10px] text-text-tertiary">STAGGERED ENTRANCE</span>
            <BentoGrid className="md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <BentoCard key={i}>
                  <div className="p-6">
                    <span className="text-[10px] font-bold tracking-widest text-lime">
                      CARD_{String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="mt-2 text-sm text-text-secondary">Auto-staggered by BentoGrid</p>
                  </div>
                </BentoCard>
              ))}
            </BentoGrid>
          </div>

          {/* Grid span sizing */}
          <div className="space-y-3">
            <span className="block text-[10px] text-text-tertiary">GRID SPAN SIZING</span>
            <BentoGrid>
              <BentoCard className="md:col-span-2">
                <div className="p-6">
                  <span className="text-[10px] font-bold tracking-widest text-lime">
                    COL_SPAN_2
                  </span>
                  <p className="mt-2 text-sm text-text-secondary">md:col-span-2</p>
                </div>
              </BentoCard>
              <BentoCard>
                <div className="p-6">
                  <span className="text-[10px] font-bold tracking-widest text-lime">DEFAULT</span>
                  <p className="mt-2 text-sm text-text-secondary">1 column</p>
                </div>
              </BentoCard>
              <BentoCard>
                <div className="p-6">
                  <span className="text-[10px] font-bold tracking-widest text-lime">DEFAULT</span>
                  <p className="mt-2 text-sm text-text-secondary">1 column</p>
                </div>
              </BentoCard>
            </BentoGrid>
          </div>
        </section>

        {/* 10 BENTO_GRID */}
        <section className="space-y-8">
          <SectionHeader number="10" label="BENTO_GRID" />
          <p className="max-w-lg text-xs text-text-secondary">
            Grid layout primitive that composes BentoCards into a responsive 4-column grid.
            Consumers override columns, gap, and height via className.
          </p>

          <div className="space-y-3">
            <span className="block text-[10px] text-text-tertiary">LAYOUT / 6 CARDS</span>
            <BentoGrid className="md:h-[500px] md:grid-rows-[1fr_1fr_auto]">
              <BentoCard className="md:col-span-2 md:row-span-2">
                <div className="flex h-full items-center justify-center p-6">
                  <div className="text-center">
                    <span className="text-[10px] font-bold tracking-widest text-lime">CARD_01</span>
                    <p className="mt-1 text-sm text-text-secondary">col-span-2 · row-span-2</p>
                  </div>
                </div>
              </BentoCard>
              <BentoCard>
                <div className="flex h-full items-center justify-center p-6">
                  <div className="text-center">
                    <span className="text-[10px] font-bold tracking-widest text-lime">CARD_02</span>
                    <p className="mt-1 text-sm text-text-secondary">1×1</p>
                  </div>
                </div>
              </BentoCard>
              <BentoCard>
                <div className="flex h-full items-center justify-center p-6">
                  <div className="text-center">
                    <span className="text-[10px] font-bold tracking-widest text-lime">CARD_03</span>
                    <p className="mt-1 text-sm text-text-secondary">1×1</p>
                  </div>
                </div>
              </BentoCard>
              <BentoCard>
                <div className="flex h-full items-center justify-center p-6">
                  <div className="text-center">
                    <span className="text-[10px] font-bold tracking-widest text-lime">CARD_04</span>
                    <p className="mt-1 text-sm text-text-secondary">1×1</p>
                  </div>
                </div>
              </BentoCard>
              <BentoCard>
                <div className="flex h-full items-center justify-center p-6">
                  <div className="text-center">
                    <span className="text-[10px] font-bold tracking-widest text-lime">CARD_05</span>
                    <p className="mt-1 text-sm text-text-secondary">1×1</p>
                  </div>
                </div>
              </BentoCard>
              <BentoCard className="md:col-span-2">
                <div className="flex h-full items-center justify-center p-6">
                  <div className="text-center">
                    <span className="text-[10px] font-bold tracking-widest text-lime">CARD_06</span>
                    <p className="mt-1 text-sm text-text-secondary">col-span-2</p>
                  </div>
                </div>
              </BentoCard>
            </BentoGrid>
          </div>
        </section>
      </div>
    </div>
  );
}
