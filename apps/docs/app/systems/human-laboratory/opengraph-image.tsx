import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tokens } from '@thl/tokens/tokens';
import { ImageResponse } from 'next/og';

export const alt = 'The Human Laboratory — system 01 of imprint_lab';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/*
  Required by `output: 'export'`. Without it the build fails outright rather
  than degrading, which is the good outcome — an OG route that silently became
  runtime-only would produce a card nothing can fetch off GitHub Pages. The card
  has no dynamic input, so baking it at build time costs nothing.
*/
export const dynamic = 'force-static';

/**
 * The OG card is generated, not exported.
 *
 * A hand-made PNG is the same drift a hand-kept safelist is: it carries copied
 * colour values that nothing regenerates. Every value here comes from the token
 * pipeline, so the card cannot disagree with the system it advertises.
 *
 * The card IS the mark: a bounded field with one corner promoted a tier, at the
 * same 1:2 line-to-accent ratio. Drawn as positioned edges rather than a CSS
 * border, because the accent has to overlay the frame's outer edge exactly and
 * a border box cannot be overdrawn from inside.
 */
const value = (name: string): string => {
  const token = tokens.find((t) => t.name === name);
  if (!token) throw new Error(`opengraph-image: unknown token ${name}`);
  return token.resolved;
};

const CANVAS = value('--color-canvas');
const LINE = value('--color-line');
const ACCENT = value('--color-accent');
const INK = value('--color-ink');
const INK_MUTED = value('--color-ink-muted');
const INK_SUBTLE = value('--color-ink-subtle');

const FRAME_W = 1072;
const FRAME_H = 502;
const EDGE = 3;
const ACCENT_W = EDGE * 2; // the ladder's 1:2, held here too
const ARM = 200;

/**
 * The display face, decoded out of the report kit's own bundle.
 *
 * Read from `public/` rather than from `systems/` because sync-static already
 * puts it there and `process.cwd()` is the app root in every Next environment —
 * reaching up into the monorepo from a bundled route is not.
 *
 * Only Space Grotesk 700 is embedded, so the card has no mono face and
 * therefore does not attempt the wordmark lockup, which is specified as mono.
 * It uses the display voice instead. Embedding the mono face upstream would let
 * the lockup appear here; until then, rendering it in the wrong face would be
 * worse than not rendering it.
 */
function displayFont(): ArrayBuffer {
  const css = readFileSync(join(process.cwd(), 'public', 'thl.fonts.css'), 'utf8');
  // Indexed access is checked here, so read the group through `?.` rather than
  // narrowing on the match object — `match[1]` stays `string | undefined`.
  const encoded = css.match(/data:font\/ttf;base64,([A-Za-z0-9+/=]+)/)?.[1];
  if (!encoded) throw new Error('opengraph-image: no embedded ttf found in thl.fonts.css');
  const bytes = Buffer.from(encoded, 'base64');
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: size.width,
        height: size.height,
        background: CANVAS,
        display: 'flex',
        padding: 64
      }}
    >
      <div
        style={{
          position: 'relative',
          width: FRAME_W,
          height: FRAME_H,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 68px'
        }}
      >
        {/* The frame — four edges, so the accent can overlay the corner exactly. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: FRAME_W,
            height: EDGE,
            background: LINE
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: FRAME_W,
            height: EDGE,
            background: LINE
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: EDGE,
            height: FRAME_H,
            background: LINE
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: EDGE,
            height: FRAME_H,
            background: LINE
          }}
        />

        {/* The live corner. Top-left: read first, and it leads into the name. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: ACCENT_W,
            height: ARM,
            background: ACCENT
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: ARM,
            height: ACCENT_W,
            background: ACCENT
          }}
        />

        {/* Written as a string, not as JSX text: a bare `//` is parsed as a
            comment by the linter, and the separator is part of the voice. */}
        <div style={{ display: 'flex', fontSize: 22, letterSpacing: 6, color: INK_SUBTLE }}>
          {'SYSTEM_01 // @THL'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 92, color: INK, lineHeight: 1.05 }}>
            The Human Laboratory
          </div>
          <div style={{ display: 'flex', fontSize: 27, color: INK_MUTED, marginTop: 22 }}>
            Obsidian ground, a single lime signal, hard borders.
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 21, letterSpacing: 4, color: INK_SUBTLE }}>
          {'IMPRINT_LAB // DESIGN_SYSTEM'}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: 'Space Grotesk', data: displayFont(), weight: 700, style: 'normal' }]
    }
  );
}
