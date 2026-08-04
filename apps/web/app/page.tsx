import { Button } from '@repo/ui/components/button';
import { PageShell } from '@repo/ui/components/page-shell';
import { SectionHeader } from '@repo/ui/components/section-header';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col justify-center py-10">
      <PageShell width="prose" className="space-y-6 md:space-y-10">
        <SectionHeader label="UNDER_CONSTRUCTION" as="p" />

        <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-5xl">
          THE_HUMAN
          <span className="text-lime">_LABORATORY</span>
        </h1>

        <div className="space-y-4 text-sm leading-relaxed md:space-y-5 md:text-base">
          <p>
            Neo Brutalism rejects the polished sameness of modern UI. No soft gradients, no rounded
            corners, no friendly pastels. This design system strips interfaces down to{' '}
            <span className="text-white">raw structure</span> — obsidian backgrounds, monospaced
            type, hard borders, and a single accent that cuts like a{' '}
            <span className="text-lime">signal through noise</span>.
          </p>

          <p>
            Every element earns its place. Borders are structural, not decorative. Color is
            functional, not atmospheric. The crosshair cursor, the scan lines, the grid overlays —
            these aren&apos;t nostalgia. They&apos;re a commitment to treating the interface as what
            it is: <span className="text-white">a machine for communicating information</span>.
            Utility over ornament. Clarity over comfort.
          </p>

          <p>
            <span className="text-lime">The Human Laboratory</span> is the space where this
            philosophy takes form. A design system built on the belief that constraint produces
            coherence, and that the most honest interface is one that doesn&apos;t pretend to be
            anything other than <span className="text-white">code rendered on a screen</span>.
          </p>
        </div>

        <div className="flex flex-wrap gap-6">
          <Button asChild variant="outline">
            <Link href="/design-system">Design_System</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/demo">Demo</Link>
          </Button>
        </div>
      </PageShell>
    </div>
  );
}
