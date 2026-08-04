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
  description: 'A house of design systems. Documentation and registry.'
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
