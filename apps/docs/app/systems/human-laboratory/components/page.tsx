import { coreColors, roleColors, semanticColors, textTokens, tokens } from '@thl/tokens/tokens';
import { BentoCard } from '@thl/ui/components/bento-card';
import { BentoGrid } from '@thl/ui/components/bento-grid';
import { Button } from '@thl/ui/components/button';
import { ImageFrame } from '@thl/ui/components/image-frame';
import { PageShell } from '@thl/ui/components/page-shell';
import { SectionHeader } from '@thl/ui/components/section-header';
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
import type { ReactNode } from 'react';
import { SystemPage } from '../system-page';

const SPACING_STEPS = [1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24] as const;

function displayName(tokenName: string) {
  return tokenName.replace(/^--/, '').replace(/-/g, ' ').toUpperCase();
}

/** A color token that carries no `text-*` utility is decoration-only. */
function isDecorationOnly(utility: string) {
  return !utility.includes('text-');
}

function Label({ children }: { children: ReactNode }) {
  return <span className="block text-micro text-text-tertiary">{children}</span>;
}

interface SpecProps {
  number: string;
  label: string;
  description?: ReactNode;
  /**
   * Render children at full page width instead of inside the shell. Used for
   * specimens that are themselves page-level sections and bring their own
   * PageShell — nesting those would double the gutter.
   */
  bleed?: boolean;
  children: ReactNode;
}

function Spec({ number, label, description, bleed = false, children }: SpecProps) {
  return (
    <section className="space-y-8">
      <PageShell className="space-y-8">
        <SectionHeader number={number} label={label} rule />
        {description ? <p className="max-w-lg text-xs">{description}</p> : null}
      </PageShell>
      {bleed ? children : <PageShell className="space-y-8">{children}</PageShell>}
    </section>
  );
}

function Swatch({ name, value, utility }: { name: string; value: string; utility: string }) {
  return (
    <div className="group space-y-2">
      <div
        className="h-24 w-full border border-steel transition-colors group-hover:border-line-strong"
        style={{ backgroundColor: value }}
      />
      <div className="flex justify-between gap-2 text-xs">
        <span>{displayName(name)}</span>
        <span className="text-white">{value}</span>
      </div>
      {isDecorationOnly(utility) ? (
        <span className="block text-micro text-text-tertiary">DECORATION ONLY — NEVER TEXT</span>
      ) : null}
    </div>
  );
}

/**
 * Roles carry an extra column primitives do not: what they currently point at.
 * That indirection IS the contract — the same eleven names exist in every
 * system and resolve to different values — so the table has to show both sides.
 */
function RoleSwatch({
  name,
  aliasOf,
  resolved,
  note
}: {
  name: string;
  aliasOf?: string;
  resolved: string;
  note?: string;
}) {
  return (
    <div className="group space-y-2">
      <div
        className="h-24 w-full border border-line transition-colors group-hover:border-line-strong"
        style={{ backgroundColor: resolved }}
      />
      <div className="flex justify-between gap-2 text-xs">
        <span className="text-ink">{displayName(name)}</span>
        <span className="text-ink">{resolved}</span>
      </div>
      <span className="block text-micro text-ink-subtle">
        {aliasOf ? `-> ${displayName(aliasOf)}` : 'primitive of its own'}
      </span>
      {note ? <span className="block text-micro text-ink-subtle">{note}</span> : null}
    </div>
  );
}

export default function HumanLaboratoryPage() {
  return (
    <SystemPage system="human-laboratory" base="/systems/human-laboratory" current="/components">
      <div className="mt-10 space-y-24">
        {/* Header. The masthead no longer draws a bottom rule of its own: the
            nav's rule sat ~20px above the h1 and this one sat below the
            standfirst, so the title was pinched between two lines and then
            followed by a 100px void. One rule, under the nav, like every other
            page — the space-y-24 below is what separates the masthead from the
            first specimen. */}
        <PageShell>
          <header className="space-y-4">
            {/* Responsive for the same reason as the thesis page: at 4xl the
                title's unbreakable first word spills its box on a phone and
                gives the document a horizontal scroll. */}
            <h1 className="text-2xl font-bold text-white md:text-4xl">
              {/* biome-ignore lint/suspicious/noCommentText: decorative separator */}
              THE_HUMAN_LABORATORY // <span className="text-ink-subtle">@thl</span>
            </h1>
            <p className="max-w-2xl text-lg">
              System 01. Functional, brutalist, atomic. Components below reference roles only — the
              contract that lets them move to another system unchanged.
            </p>
          </header>
        </PageShell>

        {/* 01 TYPOGRAPHY */}
        <Spec
          number="01"
          label="TYPOGRAPHY"
          description="Space Grotesk sets headings; IBM Plex Mono carries everything else. The scale below is closed — theme.css resets Tailwind's --text-* namespace, so these are the only sizes that exist."
        >
          <div className="grid grid-cols-1 items-center gap-8 border border-steel p-8 md:grid-cols-2">
            <div className="space-y-6">
              <div>
                <Label>H1 / 5XL / BOLD</Label>
                <h1 className="text-5xl font-bold text-white">Heading 1</h1>
              </div>
              <div>
                <Label>H2 / 3XL / BOLD</Label>
                <h2 className="text-3xl font-bold text-white">Heading 2</h2>
              </div>
              <div>
                <Label>H3 / XL / BOLD</Label>
                <h3 className="text-xl font-bold text-white">Heading 3</h3>
              </div>
              <div>
                <Label>H4 / LG / BOLD (ACCENT)</Label>
                <h4 className="text-lg font-bold text-lime">Heading 4</h4>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <Label>BODY / BASE</Label>
                <p className="text-base text-white">
                  Body Text (Base) — The quick brown fox jumps over the lazy dog.
                </p>
              </div>
              <div>
                <Label>SECONDARY / SM</Label>
                <p className="text-sm">
                  Secondary Text — Information density is critical for technical interfaces.
                </p>
              </div>
              <div>
                <Label>TERTIARY / XS</Label>
                <p className="text-xs text-text-tertiary">
                  Tertiary / Metadata — SYSTEM_ID: 0x8291
                </p>
              </div>
              <div>
                <Label>MONOSPACE / MICRO / ACCENT</Label>
                <p className="text-micro text-ink">console.log(&apos;Hello World&apos;);</p>
              </div>
            </div>
          </div>

          {/* The scale itself, straight from the tokens */}
          <div className="space-y-3">
            <Label>SCALE / GENERATED FROM THEME.CSS</Label>
            <div className="divide-y divide-steel border border-steel">
              {textTokens.map((token) => {
                const utility = token.utility;
                return (
                  <div
                    key={token.name}
                    className="flex flex-wrap items-baseline gap-x-6 gap-y-1 px-4 py-3"
                  >
                    <span className="w-24 shrink-0 text-xs text-ink">{utility}</span>
                    <span className="w-32 shrink-0 text-xs text-text-tertiary">{token.value}</span>
                    {/* Tracking is a property of the size, so it belongs in the
                        row rather than in a table of its own. */}
                    <span className="w-16 shrink-0 text-xs text-text-tertiary">
                      {token.letterSpacing}
                    </span>
                    <span className={`${utility} text-white`}>The quick brown fox</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Spec>

        {/* 02 COLOR PALETTE */}
        <Spec
          number="02"
          label="COLOR_PALETTE"
          description="Every color used for text clears 4.5:1 against obsidian. Ambient is the one exception — it exists for grid lines and idle brackets, and must never carry text."
        >
          {/* Roles first: they are the contract components compile against.
              Primitives below are this system's private implementation of it. */}
          <div>
            <p className="mb-2 text-micro font-medium uppercase tracking-label text-ink-subtle">
              ROLE — THE CONTRACT
            </p>
            <p className="mb-4 max-w-2xl text-xs text-ink-muted">
              The eleven names every component is allowed to reference. Another system defines the
              same eleven and points them somewhere else, which is what lets a component move
              unchanged. `check-roles` fails the build on a primitive used inside `ui/`.
            </p>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {roleColors.map((color) => (
                <RoleSwatch
                  key={color.name}
                  name={color.name}
                  aliasOf={color.aliasOf}
                  resolved={color.resolved}
                  note={color.note}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-micro font-bold uppercase tracking-label text-text-tertiary">
              CORE — THE IMPLEMENTATION
            </p>
            <p className="mb-4 max-w-2xl text-xs text-ink-muted">
              This system's private vocabulary. Reachable from app code and one-off compositions,
              never from a component.
            </p>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
              {coreColors.map((color) => (
                <Swatch
                  key={color.name}
                  name={color.name}
                  value={color.value}
                  utility={color.utility}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 text-micro font-bold uppercase tracking-label text-text-tertiary">
              SEMANTIC
            </p>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {semanticColors.map((color) => (
                <Swatch
                  key={color.name}
                  name={color.name}
                  value={color.value}
                  utility={color.utility}
                />
              ))}
            </div>
          </div>
        </Spec>

        {/* 03 SPACING SCALE */}
        <Spec number="03" label="SPACING_SCALE">
          <div className="space-y-3 border border-steel p-8">
            {SPACING_STEPS.map((step) => (
              <div key={step} className="flex items-center gap-4">
                <span className="w-8 text-right text-xs text-text-tertiary">{step}</span>
                <div className="h-4 bg-ink-subtle" style={{ width: `${step * 4}px` }} />
                <span className="text-xs">{step * 4}px</span>
              </div>
            ))}
          </div>
        </Spec>

        {/* 04 EFFECTS */}
        <Spec number="04" label="EFFECTS">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <Label>SHADOW / LIME_GLOW</Label>
              <div className="flex h-40 items-center justify-center border border-steel shadow-lime-glow">
                <span className="text-xs text-lime">shadow-lime-glow</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label>BORDER / HOVER_TRANSITION</Label>
              <div className="flex h-40 cursor-pointer items-center justify-center border border-steel transition-colors hover:border-lime">
                <span className="text-xs">hover:border-lime</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label>ANIMATION / SCAN_LINE</Label>
              <div className="relative flex h-40 items-center justify-center overflow-hidden border border-steel">
                <div className="scan-line absolute" />
                <span className="text-xs">.scan-line</span>
              </div>
            </div>
          </div>
        </Spec>

        {/* 05 TOKEN REFERENCE — auto-generated from theme.css */}
        <Spec
          number="05"
          label="TOKEN_REFERENCE"
          description={
            <>
              Generated at build time from{' '}
              <code className="text-ink">systems/human-laboratory/tokens/theme.css</code>. If you
              add a token there, run{' '}
              <code className="text-ink">bun run --filter=@thl/tokens generate:tokens</code>.
            </>
          }
        >
          <div className="overflow-x-auto border border-steel">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-steel">
                  <th className="px-4 py-3 font-bold text-text-secondary">CSS PROPERTY</th>
                  <th className="px-4 py-3 font-bold text-text-secondary">VALUE</th>
                  <th className="px-4 py-3 font-bold text-text-secondary">TAILWIND UTILITY</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token) => (
                  <tr
                    key={token.name}
                    className="border-b border-ambient transition-colors hover:text-ink"
                  >
                    <td className="px-4 py-2.5 text-ink">{token.name}</td>
                    <td className="px-4 py-2.5 text-white">{token.value}</td>
                    <td className="px-4 py-2.5">{token.utility}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Spec>

        {/* 06 IMAGE_FRAME */}
        <Spec
          number="06"
          label="IMAGE_FRAME"
          description="Animated image reveal with grid overlay, scan line pulse, corner markers, and status badge. Uses framer-motion for height-reveal and opacity animations."
        >
          <div className="h-100">
            <ImageFrame
              src="https://picsum.photos/seed/thl-frame/1200/800"
              alt="Placeholder photograph demonstrating the ImageFrame reveal"
              badge={{
                label: 'IMG_SRC_LOADED',
                icon: <ArrowDownRight size={12} className="text-lime" />
              }}
              className="h-full"
            />
          </div>
        </Spec>

        {/* 07 BUTTON */}
        <Spec
          number="07"
          label="BUTTON"
          description="Variant-based button with CVA + Radix Slot for polymorphism. Heights are explicit and land on the spacing grid, so an icon button is exactly as tall as the text button of the same size."
        >
          <div className="space-y-3">
            <Label>VARIANTS</Label>
            <div className="flex flex-wrap items-center gap-4 border border-steel p-6">
              <Button variant="primary">Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="tag">Tag</Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>SIZES / TEXT AND ICON ALIGN</Label>
            <div className="flex flex-wrap items-center gap-4 border border-steel p-6">
              <Button size="sm">Small</Button>
              <Button size="iconSm">
                <ArrowDownRight size={12} />
              </Button>
              <Button size="default">Default</Button>
              <Button size="icon">
                <ArrowDownRight size={16} />
              </Button>
              <Button size="lg">Large</Button>
              <Button size="iconLg">
                <ArrowDownRight size={20} />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>OUTLINE / ALL SIZES</Label>
            <div className="flex flex-wrap items-center gap-4 border border-steel p-6">
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

          <div className="space-y-3">
            <Label>TAG / ROW</Label>
            <div className="flex flex-wrap items-center gap-2 border border-steel p-6">
              {['React', 'TypeScript', 'Next.js', 'Tailwind', 'Node'].map((tag) => (
                <Button key={tag} variant="tag" size="sm">
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>ICON_ONLY</Label>
            <div className="space-y-4 border border-steel p-6">
              <div className="flex flex-wrap items-center gap-4">
                <span className="w-16 text-micro text-text-tertiary">PRIMARY</span>
                <Button variant="primary" size="icon">
                  <Plus size={16} />
                </Button>
                <Button variant="primary" size="icon">
                  <Search size={16} />
                </Button>
                <Button variant="primary" size="icon">
                  <Download size={16} />
                </Button>
                <Button variant="primary" size="icon">
                  <ArrowUpRight size={16} />
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="w-16 text-micro text-text-tertiary">OUTLINE</span>
                <Button variant="outline" size="icon">
                  <Menu size={16} />
                </Button>
                <Button variant="outline" size="icon">
                  <X size={16} />
                </Button>
                <Button variant="outline" size="icon">
                  <Copy size={16} />
                </Button>
                <Button variant="outline" size="icon">
                  <ExternalLink size={16} />
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="w-16 text-micro text-text-tertiary">GHOST</span>
                <Button variant="ghost" size="icon">
                  <ChevronLeft size={16} />
                </Button>
                <Button variant="ghost" size="icon">
                  <ChevronRight size={16} />
                </Button>
                <Button variant="ghost" size="icon">
                  <X size={16} />
                </Button>
                <Button variant="ghost" size="icon">
                  <Search size={16} />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>DISABLED</Label>
            <div className="flex flex-wrap items-center gap-4 border border-steel p-6">
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

          <div className="space-y-3">
            <Label>AS_CHILD / LINK</Label>
            <div className="flex flex-wrap items-center gap-4 border border-steel p-6">
              <Button asChild variant="primary">
                <Link href="/">Home Link</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Outline Link</Link>
              </Button>
            </div>
          </div>
        </Spec>

        {/* 09 BENTO_CARD */}
        <Spec
          number="09"
          label="BENTO_CARD"
          description="Animated card surface with corner brackets matching ImageFrame's geometry. Uses framer-motion for entrance, hover, and tap animations with reduced-motion support. Consumers control sizing via className grid-span utilities."
        >
          <div className="space-y-3">
            <Label>SINGLE</Label>
            <div className="max-w-sm">
              <BentoCard>
                <div className="p-6">
                  <span className="text-micro font-medium tracking-label text-ink-subtle">
                    CARD_LABEL
                  </span>
                  <p className="mt-2 text-sm">
                    A single BentoCard with placeholder content. Hover to see corner brackets
                    highlight and scale animation.
                  </p>
                </div>
              </BentoCard>
            </div>
          </div>

          <div className="space-y-3">
            <Label>STAGGERED ENTRANCE</Label>
            <BentoGrid className="md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <BentoCard key={i}>
                  <div className="p-6">
                    <span className="text-micro font-medium tracking-label text-ink-subtle">
                      CARD_{String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="mt-2 text-sm">Auto-staggered by BentoGrid</p>
                  </div>
                </BentoCard>
              ))}
            </BentoGrid>
          </div>

          <div className="space-y-3">
            <Label>GRID SPAN SIZING</Label>
            <BentoGrid>
              <BentoCard className="md:col-span-2">
                <div className="p-6">
                  <span className="text-micro font-medium tracking-label text-ink-subtle">
                    COL_SPAN_2
                  </span>
                  <p className="mt-2 text-sm">md:col-span-2</p>
                </div>
              </BentoCard>
              <BentoCard>
                <div className="p-6">
                  <span className="text-micro font-medium tracking-label text-ink-subtle">
                    DEFAULT
                  </span>
                  <p className="mt-2 text-sm">1 column</p>
                </div>
              </BentoCard>
              <BentoCard>
                <div className="p-6">
                  <span className="text-micro font-medium tracking-label text-ink-subtle">
                    DEFAULT
                  </span>
                  <p className="mt-2 text-sm">1 column</p>
                </div>
              </BentoCard>
            </BentoGrid>
          </div>
        </Spec>

        {/* 10 BENTO_GRID */}
        <Spec
          number="10"
          label="BENTO_GRID"
          description="Grid layout primitive that composes BentoCards into a responsive 4-column grid. Consumers override columns, gap, and height via className."
        >
          <div className="space-y-3">
            <Label>LAYOUT / 6 CARDS</Label>
            <BentoGrid className="md:h-[500px] md:grid-rows-[1fr_1fr_auto]">
              {[
                {
                  id: 'CARD_01',
                  note: 'col-span-2 · row-span-2',
                  cls: 'md:col-span-2 md:row-span-2'
                },
                { id: 'CARD_02', note: '1×1', cls: '' },
                { id: 'CARD_03', note: '1×1', cls: '' },
                { id: 'CARD_04', note: '1×1', cls: '' },
                { id: 'CARD_05', note: '1×1', cls: '' },
                { id: 'CARD_06', note: 'col-span-2', cls: 'md:col-span-2' }
              ].map((card) => (
                <BentoCard key={card.id} className={card.cls}>
                  <div className="flex h-full items-center justify-center p-6">
                    <div className="text-center">
                      <span className="text-micro font-medium tracking-label text-ink-subtle">
                        {card.id}
                      </span>
                      <p className="mt-1 text-sm">{card.note}</p>
                    </div>
                  </div>
                </BentoCard>
              ))}
            </BentoGrid>
          </div>
        </Spec>
      </div>
    </SystemPage>
  );
}
