import { BentoCard } from '@thl/ui/components/bento-card';
import { BentoGrid } from '@thl/ui/components/bento-grid';
import { Button } from '@thl/ui/components/button';
import { ImageFrame } from '@thl/ui/components/image-frame';
import { Mark } from '@thl/ui/components/mark';
import { PageShell } from '@thl/ui/components/page-shell';
import { SectionHeader } from '@thl/ui/components/section-header';
import { Wordmark } from '@thl/ui/components/wordmark';
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Menu,
  Plus,
  Search,
  X
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { asset } from '../../../../lib/base-path';
import { Contents, Label, Masthead, type SpecDef, SpecList } from '../spec';
import { SystemPage } from '../system-page';

export const metadata: Metadata = {
  title: 'Components — @thl',
  description:
    'The eight components The Human Laboratory ships: PageShell, SectionHeader, Button, ImageFrame, BentoGrid, BentoCard, Mark and Wordmark — with the states a static page cannot show.'
};

/* ────────────────────────────────────────────────────────────────────────────
   01 PAGE_SHELL
   ──────────────────────────────────────────────────────────────────────────── */

const SHELL_WIDTHS = [
  { width: 'default' as const, note: 'max-w-[1280px] — dense, technical layouts' },
  { width: 'prose' as const, note: 'max-w-[64ch] — long-form reading' },
  { width: 'full' as const, note: 'max-w-none — gutters only' }
];

function PageShellSpec() {
  return (
    <>
      {/* Bleeds, because a PageShell demonstrating its own measure cannot sit
          inside another one — that is the nesting the component forbids, and it
          would double the gutter and misreport every width. */}
      <div className="space-y-4">
        {SHELL_WIDTHS.map(({ width, note }) => (
          <div key={width}>
            <PageShell width={width}>
              <div className="border border-line px-4 py-6">
                <span className="text-xs text-ink">width=&quot;{width}&quot;</span>
                <span className="ml-4 text-micro text-ink-subtle">{note}</span>
              </div>
            </PageShell>
          </div>
        ))}
      </div>
      <PageShell>
        <p className="max-w-2xl text-xs">
          Use this instead of Tailwind&apos;s <code className="text-ink">container</code>, whose
          width is a function of the current breakpoint rather than an explicit number.{' '}
          <strong className="font-semibold text-ink">Never nest one inside another</strong> — a
          section already inside a shell should lay out at full width and let the parent own the
          gutter. The <code className="text-ink">prose</code> measure is in{' '}
          <code className="text-ink">ch</code>, not pixels, because this system&apos;s body face is
          monospaced: every glyph is the width of an <em>m</em>, so the comfortable line is 60–72
          characters, not 75–90.
        </p>
      </PageShell>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   02 SECTION_HEADER
   ──────────────────────────────────────────────────────────────────────────── */

function SectionHeaderSpec() {
  return (
    <>
      <div className="space-y-8 border border-line p-8">
        <div className="space-y-2">
          <Label>Default</Label>
          <SectionHeader label="FIELD_SAMPLES" />
        </div>
        <div className="space-y-2">
          <Label>With ordinal and rule</Label>
          <SectionHeader number="03" label="SPACING_SCALE" rule />
        </div>
        <div className="space-y-2">
          <Label>marked — the one section carrying the finding</Label>
          <SectionHeader label="ANOMALY_DETECTED" marked />
        </div>
      </div>
      <p className="max-w-2xl text-xs">
        The marker is <strong className="font-semibold text-ink">neutral by default</strong>, and
        that default is the point. It used to be lime on every section of every page — ten identical
        accent events per view, varying with nothing. A marker that never varies is a bullet, not a
        signal, and it was the largest decorative spend of the accent in the system.{' '}
        <code className="text-ink">marked</code> lights it, plus{' '}
        <code className="text-ink">--shadow-glow</code>, for the one section a view exists to make.
      </p>
      <p className="max-w-2xl text-xs">
        <code className="text-ink">as</code> picks the heading level, so the document outline is a
        separate decision from the visual weight. <code className="text-ink">rule</code> draws{' '}
        <code className="text-ink">border-line-strong</code> at 2px — a section division outranks
        the rules inside it.
      </p>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   03 BUTTON
   ──────────────────────────────────────────────────────────────────────────── */

const BUTTON_STATES = [
  {
    state: 'Rest',
    primary: 'accent fill, accent-ink label',
    outline: 'line edge, ink-muted label'
  },
  {
    state: 'Hover',
    primary: 'fill drops out, label goes accent',
    outline: 'edge and label go accent'
  },
  {
    state: 'Focus-visible',
    primary: 'accent outline at 2px offset, plus shadow-glow-strong',
    outline: 'the same — one focus indicator for the whole system'
  },
  {
    state: 'Active (press)',
    primary: 'snaps back to filled, plus shadow-glow',
    outline: 'accent edge and label, plus shadow-glow'
  }
];

function ButtonSpec() {
  return (
    <>
      <div className="space-y-3">
        <Label>Variants</Label>
        <div className="flex flex-wrap items-center gap-4 border border-line p-6">
          <Button variant="primary">Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="tag">Tag</Button>
        </div>
      </div>

      {/* Sizes are shown in `outline`. The point of these rows is GEOMETRY — that
          an icon button is exactly as tall as the text button beside it — and
          rendering ten of them in `primary` spent ten accent events to say
          nothing about colour. The accent has a budget; a size chart is not
          where it goes. */}
      <div className="space-y-3">
        <Label>Sizes — text and icon align at every step</Label>
        <div className="flex flex-wrap items-center gap-4 border border-line p-6">
          <Button variant="outline" size="sm">
            Small
          </Button>
          <Button variant="outline" size="iconSm">
            <ArrowDownRight size={12} />
          </Button>
          <Button variant="outline" size="default">
            Default
          </Button>
          <Button variant="outline" size="icon">
            <ArrowDownRight size={16} />
          </Button>
          <Button variant="outline" size="lg">
            Large
          </Button>
          <Button variant="outline" size="iconLg">
            <ArrowDownRight size={20} />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Icon only</Label>
        <div className="space-y-4 border border-line p-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="w-16 text-micro text-ink-subtle">PRIMARY</span>
            <Button variant="primary" size="icon">
              <Plus size={16} />
            </Button>
            <Button variant="primary" size="icon">
              <Search size={16} />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="w-16 text-micro text-ink-subtle">OUTLINE</span>
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
            <span className="w-16 text-micro text-ink-subtle">GHOST</span>
            <Button variant="ghost" size="icon">
              <ChevronLeft size={16} />
            </Button>
            <Button variant="ghost" size="icon">
              <ChevronRight size={16} />
            </Button>
            <Button variant="ghost" size="icon">
              <ArrowUpRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Tag row · disabled · asChild</Label>
        <div className="space-y-4 border border-line p-6">
          <div className="flex flex-wrap items-center gap-2">
            {['React', 'TypeScript', 'Next.js', 'Tailwind', 'Node'].map((tag) => (
              <Button key={tag} variant="tag" size="sm">
                {tag}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
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
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild variant="outline">
              <Link href="/systems/human-laboratory">Renders as a Link</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* The states table exists because a screenshot cannot carry it. Focus and
          press are two of this system's most argued contracts and both are
          invisible at rest — so the page has to name them, and you have to tab
          and hold to see them. */}
      <div className="space-y-3">
        <Label>States — tab to it, then press and hold</Label>
        <div className="overflow-x-auto border border-line">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line">
                <th className="px-4 py-3 font-semibold text-ink">STATE</th>
                <th className="px-4 py-3 font-semibold text-ink">PRIMARY</th>
                <th className="px-4 py-3 font-semibold text-ink">OUTLINE</th>
              </tr>
            </thead>
            <tbody>
              {BUTTON_STATES.map((row) => (
                <tr key={row.state} className="border-b border-ambient last:border-b-0">
                  <td className="px-4 py-2.5 text-ink">{row.state}</td>
                  <td className="px-4 py-2.5">{row.primary}</td>
                  <td className="px-4 py-2.5">{row.outline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-xs">
          Every variant converges on the same press: an accent edge plus emission.{' '}
          <code className="text-ink">:active</code> is the one state that is unambiguously{' '}
          <em>live</em>, which is what emission is for — so a press costs no new colour. It has to
          differ from <strong className="font-semibold text-ink">both</strong> rest and hover,
          because touch has no hover: before this, a button on a phone gave no feedback of any kind
          between the tap and the result. Feedback enters at{' '}
          <code className="text-ink">duration-ack</code> and decays at{' '}
          <code className="text-ink">duration-state</code>; symmetric timing reads as the interface
          animating at you, asymmetric reads as it answering you.
        </p>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   04 IMAGE_FRAME
   ──────────────────────────────────────────────────────────────────────────── */

function ImageFrameSpec() {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Label>Loaded</Label>
          <ImageFrame
            src={asset('/samples/specimen-01.jpg')}
            alt="Specimen plate — a dense botanical field, standing in for real artwork"
            badge={{
              label: 'IMG_SRC_LOADED',
              icon: <ArrowDownRight size={12} className="text-accent" />
            }}
            className="h-80"
          />
        </div>
        <div className="space-y-3">
          <Label>Signal lost — a src that cannot resolve</Label>
          <ImageFrame
            // Deliberately broken. The error state is a shipped path through
            // this component and a gallery that only shows the happy one is
            // documenting half of it.
            src={asset('/samples/does-not-exist.jpg')}
            alt="A deliberately broken source, exercising the SIGNAL_LOST state"
            badge={{ label: 'SIGNAL_LOST' }}
            className="h-80"
          />
        </div>
      </div>
      <p className="max-w-2xl text-xs">
        The reveal runs at <code className="text-ink">duration-process</code> — the one rung where
        the duration <em>is</em> the content — and the scan line pulses at the growing edge, which
        is a legitimate spend of the accent: the frame is live while it fills. The badge becomes a{' '}
        <code className="text-ink">&lt;button&gt;</code> when given an{' '}
        <code className="text-ink">onClick</code>, and picks up the system focus ring with it.
      </p>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   05 · 06 BENTO
   ──────────────────────────────────────────────────────────────────────────── */

const BENTO_LAYOUT = [
  { id: 'CARD_01', note: 'col-span-2 · row-span-2', cls: 'md:col-span-2 md:row-span-2' },
  { id: 'CARD_02', note: '1×1', cls: '' },
  { id: 'CARD_03', note: '1×1', cls: '' },
  { id: 'CARD_04', note: '1×1', cls: '' },
  { id: 'CARD_05', note: '1×1', cls: '' },
  { id: 'CARD_06', note: 'col-span-2', cls: 'md:col-span-2' }
];

function BentoGridSpec() {
  return (
    <>
      <div className="space-y-3">
        <Label>Layout — six cards, mixed spans</Label>
        <BentoGrid className="md:grid-rows-[1fr_1fr_auto]">
          {BENTO_LAYOUT.map((card) => (
            <BentoCard key={card.id} className={card.cls}>
              <div className="flex h-full items-center justify-center p-6">
                <div className="space-y-1 text-center">
                  <span className="block text-micro font-medium tracking-label text-ink-subtle">
                    {card.id}
                  </span>
                  <p className="text-sm">{card.note}</p>
                </div>
              </div>
            </BentoCard>
          ))}
        </BentoGrid>
      </div>
      <p className="max-w-2xl text-xs">
        A responsive 4-column grid; consumers override columns, gap and height via{' '}
        <code className="text-ink">className</code>, and size individual cards with grid-span
        utilities. <code className="text-ink">dense</code> turns on{' '}
        <code className="text-ink">grid-flow-dense</code> so later cards backfill the gaps a
        multi-span card leaves. The grid orchestrates its children&apos;s entrance through context —
        a card inside one defers to the parent&apos;s stagger instead of self-triggering.
      </p>
    </>
  );
}

function BentoCardSpec() {
  return (
    <>
      <div className="space-y-3">
        <Label>Standalone — enters on its own</Label>
        <div className="max-w-sm">
          <BentoCard>
            <div className="space-y-2 p-6">
              <span className="block text-micro font-medium tracking-label text-ink-subtle">
                CARD_LABEL
              </span>
              <p className="text-sm">
                Outside a BentoGrid a card triggers its own entrance when it scrolls into view.
              </p>
            </div>
          </BentoCard>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Staggered by the grid</Label>
        <BentoGrid className="md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <BentoCard key={i}>
              <div className="space-y-2 p-6">
                <span className="block text-micro font-medium tracking-label text-ink-subtle">
                  CARD_{String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-sm">Auto-staggered by BentoGrid</p>
              </div>
            </BentoCard>
          ))}
        </BentoGrid>
      </div>

      {/* Rewritten. This description used to promise "hover to see corner
          brackets highlight and scale animation" — the scale was deliberately
          removed, and the component's own comments now argue against it at
          length. A description that outlives its behaviour is worse than none. */}
      <p className="max-w-2xl text-xs">
        The entrance is{' '}
        <strong className="font-semibold text-ink">two beats, and neither is a transform</strong>:
        opacity 0→1 at <code className="text-ink">duration-transit</code>, then the edge climbs{' '}
        <code className="text-ink">ambient → line</code> at{' '}
        <code className="text-ink">duration-state</code> once the fade has landed. The card arrives
        as a dormant outline and only then takes its place in the hierarchy — the line ladder used
        as motion. It spends no accent: six cards each firing lime is the accent becoming texture.
      </p>
      <p className="max-w-2xl text-xs">
        Hover climbs the ladder too — <code className="text-ink">ambient</code> to{' '}
        <code className="text-ink">line-strong</code> on the card and its corner brackets. There is
        no scale on hover and none on entrance: a fractional transform lands a hard 1px border off
        the pixel grid and the edge shimmers for the whole animation. There is no fill change
        either, because there is no surface token to change it to.
      </p>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   07 · 08 BRAND
   ──────────────────────────────────────────────────────────────────────────── */

function MarkSpec() {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Label>tone=&quot;accent&quot; — the default</Label>
          <div className="flex items-end gap-6 border border-line p-6">
            <Mark label="The Human Laboratory" className="size-8" />
            <Mark className="size-6" />
            <Mark className="size-4" />
          </div>
        </div>
        <div className="space-y-3">
          <Label>tone=&quot;mono&quot; — print and single-colour grounds</Label>
          <div className="flex items-end gap-6 border border-line p-6">
            <Mark tone="mono" label="The Human Laboratory, monochrome" className="size-8" />
            <Mark tone="mono" className="size-6" />
            <Mark tone="mono" className="size-4" />
          </div>
        </div>
      </div>
      <p className="max-w-2xl text-xs">
        A frame in <code className="text-ink">line</code> with one corner in{' '}
        <code className="text-ink">accent</code> at{' '}
        <strong className="font-semibold text-ink">twice the weight</strong> — that 1:2 ratio{' '}
        <em>is</em> the line ladder, not a proportion picked by eye. The mark argues the
        system&apos;s central claim rather than decorating with it. The stroke widths are
        load-bearing: they are even, so the mark lands on whole pixels at 16, 24 and 32.
      </p>
      <p className="max-w-2xl text-xs">
        It does not glow — emission follows current, and a brand mark is not live.{' '}
        <code className="text-ink">mono</code> moves rank from hue to luminance without changing the
        geometry.{' '}
        <strong className="font-semibold text-ink">The favicon is a different drawing</strong>, not
        an export of this one: the frame is 1.69:1 and stops rendering below about 24px, and a
        transparent mark vanishes against chrome this system does not control — so it drops the
        frame and carries its own tile.
      </p>
    </>
  );
}

function WordmarkSpec() {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Label>horizontal</Label>
          <div className="border border-line p-6">
            <Wordmark />
          </div>
        </div>
        <div className="space-y-3">
          <Label>stacked — where width is scarce</Label>
          <div className="border border-line p-6">
            <Wordmark orientation="stacked" />
          </div>
        </div>
        <div className="space-y-3">
          <Label>namespace={'{false}'}</Label>
          <div className="border border-line p-6">
            <Wordmark namespace={false} />
          </div>
        </div>
        <div className="space-y-3">
          <Label>tone=&quot;mono&quot;</Label>
          <div className="border border-line p-6">
            <Wordmark tone="mono" />
          </div>
        </div>
      </div>
      <p className="max-w-2xl text-xs">
        <strong className="font-semibold text-ink">There is no wordmark SVG.</strong> This system
        names no font — it resolves <code className="text-ink">--font-mono</code> through a
        consumer-defined face — so outlined letterforms would hard-code a typeface the system
        refuses to specify, and live <code className="text-ink">&lt;text&gt;</code> would fall back
        silently to whatever mono the viewer happens to have. The wordmark is therefore{' '}
        <em>type</em>, set in the system&apos;s own rules. The namespace is neutral, not accent: the
        mark already spends it, and a signal that fires twice in one lockup distinguishes nothing.
      </p>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────────── */

const SPECS: SpecDef[] = [
  {
    label: 'PAGE_SHELL',
    description: (
      <p>The horizontal gutter and page measure. Three widths, one of them a default.</p>
    ),
    bleed: true,
    content: <PageShellSpec />
  },
  {
    label: 'SECTION_HEADER',
    description: (
      <p>The eyebrow that labels every section in the system — and the accent budget.</p>
    ),
    content: <SectionHeaderSpec />
  },
  {
    label: 'BUTTON',
    description: (
      <p>
        Variant-based, on CVA plus a Radix Slot for polymorphism. Heights are explicit and land on
        the 4px spacing grid, so an icon button is exactly as tall as the text button beside it.
      </p>
    ),
    content: <ButtonSpec />
  },
  {
    label: 'IMAGE_FRAME',
    description: (
      <p>
        An image reveal with a grid overlay, a pulsing scan line, corner markers and a status badge
        — plus a failure state for a source that will not resolve.
      </p>
    ),
    content: <ImageFrameSpec />
  },
  {
    label: 'BENTO_GRID',
    description: <p>The layout primitive that composes cards and orchestrates their entrance.</p>,
    content: <BentoGridSpec />
  },
  {
    label: 'BENTO_CARD',
    description: <p>The card surface: corner brackets, a two-beat entrance, and no transform.</p>,
    content: <BentoCardSpec />
  },
  {
    label: 'MARK',
    description: <p>The system&apos;s mark. It belongs to the system, never to the house.</p>,
    content: <MarkSpec />
  },
  {
    label: 'WORDMARK',
    description: <p>The lockup: mark plus name, set as type rather than drawn.</p>,
    content: <WordmarkSpec />
  }
];

export default function ComponentsPage() {
  return (
    <SystemPage system="human-laboratory" base="/systems/human-laboratory" current="/components">
      <Masthead
        title={
          <>
            {/* biome-ignore lint/suspicious/noCommentText: decorative separator */}
            COMPONENTS // <span className="text-ink-subtle">@thl</span>
          </>
        }
        standfirst={
          <>
            The eight components this system ships, in registry order. Every one of them references{' '}
            <strong className="font-semibold text-ink">roles only</strong> — the contract that lets
            a component move to another system unchanged. The token model behind them is on{' '}
            <Link href="/systems/human-laboratory/foundations" className="text-accent">
              Foundations
            </Link>
            .
          </>
        }
      />
      <Contents specs={SPECS} />
      <SpecList specs={SPECS} />
    </SystemPage>
  );
}
