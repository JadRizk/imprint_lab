import type { Metadata } from 'next';
import { IBM_Plex_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk'
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-mono'
});

export const metadata: Metadata = {
  title: 'imprint_lab',
  description: 'A house of design systems. Documentation and registry.',
  /*
    Required for the OG card. Without it Next emits a RELATIVE og:image URL,
    which every crawler rejects — the card renders correctly, is served
    correctly, and still never appears. It matches the registry homepage
    because that is the origin the registry already advertises.

    It must include the basePath, not just the origin. Next does NOT apply
    basePath to metadata URLs — with `https://jadrizk.github.io` alone the card
    resolves to /systems/… instead of /imprint_lab/systems/… and 404s. Same
    silent class as a raw <a href> into public/ (see lib/base-path.ts), and
    worse to catch: nothing renders wrong, the card is simply never shown.

    There is deliberately no `icons` entry here. The house has no mark: a
    neutral mark for a collection with one inhabitant would be system 01
    wearing a generic name. `@thl`'s icon is scoped to its own route segment
    via app/systems/human-laboratory/icon.svg, so `/` stays unbranded until
    imprint_lab has more than one system to be neutral between.
  */
  metadataBase: new URL('https://jadrizk.github.io/imprint_lab')
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/*
        The docs chrome is rendered IN system 01 — base.css scopes its opinions
        to [data-system] rather than styling `body` directly, so something has to
        name the host system. Choosing it here is the app's decision to make; a
        page for another system overrides it in its own subtree, because colour,
        font and cursor all inherit from the nearest data-system ancestor.
      */}
      <body
        data-system="human-laboratory"
        className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
