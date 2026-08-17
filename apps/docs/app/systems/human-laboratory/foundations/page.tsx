import { roleColors, textTokens, tokens } from '@thl/tokens/tokens';
import type { Metadata } from 'next';

import {
  contrastOf,
  durationTokens,
  ratio,
  ratioForValue,
  ratioOf,
  shadowRoles,
  token,
  trackingTokens
} from '../../../../lib/token-lookup';
import { Contents, Label, Masthead, type SpecDef, SpecList } from '../spec';
import { SystemPage } from '../system-page';

export const metadata: Metadata = {
  title: 'Foundations — @thl',
  description:
    'The token model of The Human Laboratory: the closed type scale, the eleven roles, the line ladder, the duration ladder, emission, and how the system answers prefers-contrast and prefers-reduced-motion.'
};

const SPACING_STEPS = [1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24] as const;

function displayName(tokenName: string) {
  return tokenName
    .replace(/^--color-/, '')
    .replace(/^--/, '')
    .replace(/-/g, ' ')
    .toUpperCase();
}

/* ────────────────────────────────────────────────────────────────────────────
   01 TYPOGRAPHY
   ──────────────────────────────────────────────────────────────────────────── */

function Typography() {
  return (
    <>
      <div className="grid grid-cols-1 items-center gap-8 border border-line p-8 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <Label>H1 / 5XL / BOLD</Label>
            <h1 className="text-5xl font-bold text-ink">Heading 1</h1>
          </div>
          <div>
            <Label>H2 / 3XL / BOLD</Label>
            <h2 className="text-3xl font-bold text-ink">Heading 2</h2>
          </div>
          <div>
            <Label>H3 / XL / BOLD</Label>
            <h3 className="text-xl font-bold text-ink">Heading 3</h3>
          </div>
          {/* Neutral, not accent. A type specimen is demonstrating a SIZE; the
              accent is a signal with a budget, and spending it to show that
              18px exists is the definition of decoration. */}
          <div>
            <Label>H4 / LG / SEMIBOLD</Label>
            <h4 className="text-lg font-semibold text-ink">Heading 4</h4>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <Label>BODY / BASE</Label>
            <p className="text-base text-ink">
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
            <p className="text-xs text-ink-subtle">Tertiary / Metadata — SYSTEM_ID: 0x8291</p>
          </div>
          {/* Labelled for what it is. This sample used to be captioned ACCENT
              and rendered in `text-ink` — the caption described a colour the
              specimen did not have. */}
          <div>
            <Label>MONOSPACE / MICRO</Label>
            <p className="text-micro text-ink">console.log(&apos;Hello World&apos;);</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Scale / generated from theme.css</Label>
        <p className="max-w-2xl text-xs">
          Tracking is a property of the size, declared per step through Tailwind&apos;s{' '}
          <code className="text-ink">--text-&lt;n&gt;--letter-spacing</code> companion — so it
          arrives with the size and cannot be picked by eye at a call site.
        </p>
        <div className="divide-y divide-ambient border border-line">
          {textTokens.map((t) => (
            <div key={t.name} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 px-4 py-3">
              <span className="w-24 shrink-0 text-xs text-ink">{t.utility}</span>
              <span className="w-32 shrink-0 text-xs text-ink-subtle">{t.value}</span>
              <span className="w-16 shrink-0 text-xs text-ink-subtle">{t.letterSpacing}</span>
              <span className={`${t.utility} text-ink`}>The quick brown fox</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Tracking / a ladder, like line and like time</Label>
        <div className="divide-y divide-ambient border border-line">
          {trackingTokens.map((t) => (
            <div key={t.name} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 px-4 py-3">
              <span className="w-40 shrink-0 text-xs text-ink">{t.utility}</span>
              <span className="w-16 shrink-0 text-xs text-ink-subtle">{t.resolved}</span>
              <span className={`text-sm uppercase ${t.utility} text-ink`}>Instrument label</span>
            </div>
          ))}
        </div>
        <p className="max-w-2xl text-xs">
          <code className="text-ink">--leading-*</code> is reset too, so the scale carries a line
          height per step and <code className="text-ink">leading-prose</code> (
          {token('--leading-prose')?.resolved}) is the one rung a size cannot imply.
        </p>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   02 COLOUR
   ──────────────────────────────────────────────────────────────────────────── */

function RoleSwatch({ name }: { name: string }) {
  const t = token(name);
  if (!t) return null;
  const measured = ratioOf(t);
  const decorationOnly = !t.utility.includes('text-');

  return (
    <div className="space-y-2 border border-line p-4">
      {/* The value is data, not a token reference — a swatch has to render the
          colour it is documenting, which no utility can express. Everything
          around it is a role. */}
      <div className="h-16 w-full border border-ambient" style={{ backgroundColor: t.resolved }} />
      <div className="flex justify-between gap-2 text-xs">
        <span className="text-ink">{displayName(t.name)}</span>
        <span className="text-ink-subtle">{t.resolved}</span>
      </div>
      <span className="block text-micro text-ink-subtle">
        {t.aliasOf ? `-> ${displayName(t.aliasOf)}` : 'literal — no primitive'}
      </span>
      {measured ? (
        <span className="block text-micro text-ink-subtle">{measured} vs canvas</span>
      ) : null}
      {decorationOnly ? (
        <span className="block text-micro text-warning">Decoration only — never text</span>
      ) : null}
    </div>
  );
}

function Colour() {
  const primitives = tokens.filter(
    (t) => t.category === 'color' && (t.subcategory === 'core' || t.subcategory === 'semantic')
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {roleColors.map((c) => (
          <RoleSwatch key={c.name} name={c.name} />
        ))}
      </div>

      <div className="space-y-3">
        <Label>The private vocabulary</Label>
        <p className="max-w-2xl text-xs">
          Every primitive this system defines. Each one is already named above as the value a role
          points at, so this is a reference strip rather than a second table — app code may reach
          for these, a component may not, and <code className="text-ink">check-roles</code> fails
          the build on the difference.
        </p>
        <div className="flex flex-wrap gap-2">
          {primitives.map((t) => (
            <div key={t.name} className="flex items-center gap-2 border border-line px-3 py-2">
              <span
                className="size-4 shrink-0 border border-ambient"
                style={{ backgroundColor: t.resolved }}
              />
              <span className="text-micro text-ink">{displayName(t.name)}</span>
              <span className="text-micro text-ink-subtle">{t.resolved}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   03 THE LINE LADDER
   ──────────────────────────────────────────────────────────────────────────── */

const LADDER = [
  {
    name: '--color-ambient',
    border: 'border border-ambient',
    weight: '1px',
    job: 'Subdivision inside a panel. Table rules, grid overlays, internal splits. Not meant to be noticed.'
  },
  {
    name: '--color-line',
    border: 'border border-line',
    weight: '1px',
    job: 'The edge of a thing. Card, panel, frame, input, button. The default — when in doubt, this one.'
  },
  {
    name: '--color-line-strong',
    border: 'border-2 border-line-strong',
    weight: '2px',
    job: 'A boundary that outranks its neighbours. Section divisions, a selected edge, sticky chrome once content is beneath it.'
  },
  {
    name: '--color-accent',
    border: 'border-2 border-accent',
    weight: '2px',
    job: 'Live state. Focus, the growing edge, the finding. Never hover.'
  }
] as const;

function LineLadder() {
  return (
    <>
      {/* Drawn as boundaries, not fills. A swatch would be the wrong specimen
          for this system: there is no surface token, a panel is defined by its
          edge, and showing these four as coloured rectangles would document a
          ladder of backgrounds that does not exist. */}
      <div className="space-y-4">
        {LADDER.map((rung) => (
          <div key={rung.name} className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className={`h-16 w-full shrink-0 md:w-64 ${rung.border}`} />
            <div className="space-y-1">
              <div className="flex flex-wrap items-baseline gap-x-4">
                <span className="text-xs text-ink">{displayName(rung.name)}</span>
                <span className="text-micro text-ink-subtle">{rung.weight}</span>
                {/* Rendered only where `theme.css` measured one. The accent has
                    no annotated ratio, and inventing one here would be the
                    transcription this page exists to avoid. */}
                {ratio(rung.name) ? (
                  <span className="text-micro text-ink-subtle">{ratio(rung.name)}</span>
                ) : null}
              </div>
              <p className="max-w-lg text-xs">{rung.job}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Label>Nested — the ladder doing its job</Label>
        {/* The point of four tiers is that a boundary can outrank the boundary
            containing it. Ambient is DARKER than line on purpose: decoration
            that draws brighter than the structure around it is the inversion
            this ladder exists to prevent. */}
        <div className="border-2 border-line-strong p-6">
          <div className="border border-line p-6">
            <div className="grid grid-cols-3 divide-x divide-ambient border border-ambient">
              {['0x00', '0x01', '0x02'].map((cell) => (
                <div key={cell} className="px-4 py-6 text-center text-xs text-ink-subtle">
                  {cell}
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="max-w-2xl text-xs">
          Blur this until you cannot read it. What survives should be what matters — before the
          ladder existed, 392 of this page&apos;s borders were the same 1px at the same ratio, so
          nothing outranked anything and whole sections vanished at squint distance.
        </p>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   04 PREFERENCES
   ──────────────────────────────────────────────────────────────────────────── */

const PROMOTED = ['--color-ambient', '--color-line', '--color-line-strong'] as const;

/** The properties reduced motion still permits. Mirrors the report kit's reset. */
const STILL_TRANSITIONS = [
  'color',
  'background-color',
  'border-color',
  'outline-color',
  'box-shadow',
  'opacity'
] as const;

function Preferences() {
  return (
    <>
      <div className="space-y-3">
        <Label>prefers-contrast: more</Label>
        <div className="overflow-x-auto border border-line">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line">
                <th className="px-4 py-3 font-semibold text-ink">ROLE</th>
                <th className="px-4 py-3 font-semibold text-ink">AT REST</th>
                <th className="px-4 py-3 font-semibold text-ink">PROMOTED</th>
              </tr>
            </thead>
            <tbody>
              {PROMOTED.map((name) => {
                const promoted = contrastOf(name);
                return (
                  <tr key={name} className="border-b border-ambient last:border-b-0">
                    <td className="px-4 py-2.5 text-ink">{name}</td>
                    <td className="px-4 py-2.5">
                      {token(name)?.resolved} · {ratio(name)}
                    </td>
                    <td className="px-4 py-2.5 text-ink">
                      {promoted} · {ratioForValue(promoted)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-xs">
          All three rungs climb, because the tiers are relative to each other — promoting only one
          would collapse the ladder onto a single grey and put ambient back above line.{' '}
          <span className="text-ink">Text is deliberately untouched:</span> it already clears 4.5:1
          by contract, and raising <code className="text-ink">ink-subtle</code> to{' '}
          <code className="text-ink">ink-muted</code>&apos;s ratio would merge two roles and cost
          the hierarchy that carries the meaning.
        </p>
      </div>

      <div className="space-y-3">
        <Label>prefers-reduced-motion: reduce</Label>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 border border-line p-6">
            <span className="block text-xs text-ink">Still transitions, at full duration</span>
            <p className="text-xs">{STILL_TRANSITIONS.join(' · ')}</p>
          </div>
          <div className="space-y-2 border border-line p-6">
            <span className="block text-xs text-ink">Flattened outright</span>
            <p className="text-xs">
              Keyframe <code className="text-ink">animation</code>, and anything positional.
            </p>
          </div>
        </div>
        <p className="max-w-2xl text-xs">
          The preference is about vestibular triggers, and a colour change is not one. The report
          kit&apos;s reset used to flatten <code className="text-ink">transition-duration</code>{' '}
          across <code className="text-ink">*</code>, which took every hover, focus and press
          response with it — removing the one signal that told those users a control had answered.
          It now restricts <em>what may transition</em> rather than how long.
        </p>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   05 MOTION
   ──────────────────────────────────────────────────────────────────────────── */

const RUNG_JOBS: Record<string, string> = {
  'duration-ack':
    'The machine acknowledging input. Zero, because any delay here is the delay the whole system is judged by.',
  'duration-state':
    'A state settling — hover decaying, focus releasing, a press letting go. Short enough to read as a consequence of the input.',
  'duration-transit': 'Something entering or leaving the page.',
  'duration-process':
    'The machine doing something — a reveal, a scan. The one rung where the duration is the content.'
};

function Motion() {
  return (
    <>
      <div className="space-y-3">
        <Label>The four rungs — hover a row to run it</Label>
        <div className="divide-y divide-ambient border border-line">
          {durationTokens.map((t) => (
            <div key={t.name} className="group flex flex-col gap-3 px-4 py-4 md:flex-row md:gap-6">
              <span className="w-40 shrink-0 text-xs text-ink">{t.utility}</span>
              <span className="w-16 shrink-0 text-xs text-ink-subtle">{t.resolved}</span>
              {/* The demo runs at the rung it documents — the width is a
                  transition on a real utility, not a number retyped here. */}
              <div className="h-4 flex-1 border border-ambient">
                <div
                  className={`h-full w-2 bg-line-strong transition-[width,background-color] ${t.utility} group-hover:w-full group-hover:bg-ink-subtle`}
                />
              </div>
              <p className="max-w-sm text-micro text-ink-subtle md:w-72 md:shrink-0">
                {RUNG_JOBS[t.utility]}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>The asymmetry — press and hold</Label>
        <div className="flex flex-wrap items-center gap-6 border border-line p-6">
          {/* Feedback ENTERS at `ack` and DECAYS at `state`. Symmetric timing
              reads as the interface animating at you; asymmetric reads as it
              answering you. This is the same pair Button carries. */}
          <button
            type="button"
            className="h-12 border border-line px-8 text-xs font-semibold uppercase tracking-label text-ink-muted transition-[color,border-color,box-shadow] duration-state active:border-accent active:text-accent active:shadow-glow active:duration-ack focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent focus-visible:shadow-glow-strong"
          >
            Press me
          </button>
          <p className="max-w-lg text-xs">
            In at <code className="text-ink">duration-ack</code> (0ms), out at{' '}
            <code className="text-ink">duration-state</code> (120ms). Every interactive surface
            answers on pointer-down with an accent edge plus emission — the press has to differ from
            both rest and hover, because touch has no hover and a tap otherwise gives nothing
            between the input and the result.
          </p>
        </div>
      </div>

      <p className="max-w-2xl text-xs">
        Springs are deliberately absent: overshoot is a claim about mass, which is the same
        vocabulary a drop shadow makes. Two values also stay literal on purpose —{' '}
        <code className="text-ink">BentoGrid</code>&apos;s stagger interval and{' '}
        <code className="text-ink">ImageFrame</code>&apos;s pulse period answer{' '}
        <em>how far apart things start</em> and <em>how often a loop repeats</em>, which is not what
        this ladder measures.
      </p>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   06 EMISSION
   ──────────────────────────────────────────────────────────────────────────── */

function Emission() {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {shadowRoles.map((t) => (
          <div key={t.name} className="space-y-3">
            <Label>{t.utility}</Label>
            <div
              className={`flex h-40 items-center justify-center border border-accent ${t.utility}`}
            >
              <span className="text-xs text-accent">{t.utility}</span>
            </div>
            <span className="block text-micro text-ink-subtle">-&gt; {t.aliasOf}</span>
          </div>
        ))}

        <div className="space-y-3">
          <Label>Scan line</Label>
          <div className="relative flex h-40 items-center justify-center overflow-hidden border border-line">
            <div className="scan-line absolute" />
            <span className="text-xs">.scan-line</span>
          </div>
          <span className="block text-micro text-ink-subtle">
            The vestibular case — silenced under reduced motion
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* This replaces a `hover:border-lime` specimen that shipped here for
            months — a demonstration of the exact pattern contract 5 forbids,
            on the page that teaches the contract. */}
        <Label>Hover climbs the ladder — it does not fire the accent</Label>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex h-32 cursor-pointer items-center justify-center border border-line transition-colors duration-state hover:border-line-strong">
            <span className="text-xs">hover:border-line-strong</span>
          </div>
          <p className="max-w-lg self-center text-xs">
            Hover is a state of the pointer, not of the machine. Emission follows <em>current</em> —
            focus, an active item, a live readout, a growing edge — and a glow on every card is
            decoration, which is the one thing this token must never become.
          </p>
        </div>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   07 · 08
   ──────────────────────────────────────────────────────────────────────────── */

function Spacing() {
  return (
    <div className="space-y-3 border border-line p-8">
      {SPACING_STEPS.map((step) => (
        <div key={step} className="flex items-center gap-4">
          <span className="w-8 text-right text-xs text-ink-subtle">{step}</span>
          {/* `bg-line-strong`, not `bg-ink-subtle` — a bar is a drawn mark, and
              reaching for a text role to fill one is how role names decay. */}
          <div className="h-4 bg-line-strong" style={{ width: `${step * 4}px` }} />
          <span className="text-xs">{step * 4}px</span>
        </div>
      ))}
    </div>
  );
}

function TokenReference() {
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-line">
            <th className="px-4 py-3 font-semibold text-ink">CSS PROPERTY</th>
            <th className="px-4 py-3 font-semibold text-ink">VALUE</th>
            <th className="px-4 py-3 font-semibold text-ink">TAILWIND UTILITY</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((t) => (
            <tr key={t.name} className="border-b border-ambient transition-colors hover:text-ink">
              <td className="px-4 py-2.5 text-ink">{t.name}</td>
              <td className="px-4 py-2.5 text-ink-muted">{t.value}</td>
              <td className="px-4 py-2.5">{t.utility}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────── */

const SPECS: SpecDef[] = [
  {
    label: 'TYPOGRAPHY',
    description: (
      <p>
        The scale is <strong className="font-semibold text-ink">closed</strong>:{' '}
        <code className="text-ink">--text-*</code>, <code className="text-ink">--tracking-*</code>{' '}
        and <code className="text-ink">--leading-*</code> are all reset in{' '}
        <code className="text-ink">theme.css</code>, so these are the only steps that exist and
        Tailwind&apos;s own rungs generate nothing.
      </p>
    ),
    content: <Typography />
  },
  {
    label: 'COLOUR',
    description: (
      <>
        <p>
          Two tiers. <strong className="font-semibold text-ink">Roles</strong> are named by job and
          carry the same eleven names in every system — they are the contract a component compiles
          against, which is what lets a component move to another system unchanged.{' '}
          <strong className="font-semibold text-ink">Primitives</strong> are named by appearance and
          are this system&apos;s private implementation of it.
        </p>
        <p>
          Anything used for text clears 4.5:1 against the canvas. Ratios below are read from{' '}
          <code className="text-ink">theme.css</code>, where they were measured.
        </p>
      </>
    ),
    content: <Colour />
  },
  {
    label: 'THE_LINE_LADDER',
    description: (
      <p>
        There is no elevation here and no surface fill — a panel is defined by its edge. So line has
        to carry the range elevation would otherwise provide: four tiers, picked by what a boundary{' '}
        <em>means</em>, never by taste.
      </p>
    ),
    content: <LineLadder />
  },
  {
    label: 'PREFERENCES',
    description: (
      <p>
        Two user preferences the system answers deliberately rather than by default. Both are
        invisible unless you set them — this table is what changes when you do.
      </p>
    ),
    content: <Preferences />
  },
  {
    label: 'MOTION',
    description: (
      <p>
        Time is tokenized for the same reason line is: one duration doing every job means motion
        carries no information. Four rungs, picked by what the motion <em>means</em>. The ladder
        reaches JS too — <code className="text-ink">ui/lib/motion.generated.ts</code> emits the same
        values in seconds, because Framer Motion cannot read a custom property.
      </p>
    ),
    content: <Motion />
  },
  {
    label: 'EMISSION',
    description: (
      <p>
        Not drop shadows. A drop shadow claims depth — offset, soft spread, an imaginary sun — and
        that is the vocabulary this system rejects. Glow claims <em>energy</em>: zero offset, a
        bright tight core, a thin falloff. It belongs on focus, the active item, a live readout and
        a growing edge.
      </p>
    ),
    content: <Emission />
  },
  {
    label: 'SPACING',
    content: <Spacing />
  },
  {
    label: 'TOKEN_REFERENCE',
    description: (
      <p>
        Generated at build time from{' '}
        <code className="text-ink">systems/human-laboratory/tokens/theme.css</code>. If you add a
        token there, run{' '}
        <code className="text-ink">bun run --filter=@thl/tokens generate:tokens</code>.
      </p>
    ),
    content: <TokenReference />
  }
];

export default function FoundationsPage() {
  return (
    <SystemPage system="human-laboratory" base="/systems/human-laboratory" current="/foundations">
      <Masthead
        title={
          <>
            {/* biome-ignore lint/suspicious/noCommentText: decorative separator */}
            FOUNDATIONS // <span className="text-ink-subtle">@thl</span>
          </>
        }
        standfirst={
          <>
            The token model, and the arguments behind it. Everything on this page is read from{' '}
            <code className="text-ink">theme.css</code> — no ratio, duration or hex is typed here.
          </>
        }
      />
      <Contents specs={SPECS} />
      <SpecList specs={SPECS} />
    </SystemPage>
  );
}
