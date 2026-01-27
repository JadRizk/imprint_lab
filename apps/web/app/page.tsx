import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-10 md:px-16">
      <div className="mx-auto w-full max-w-3xl space-y-6 md:space-y-10">
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-text-secondary">
          <span className="inline-block size-2 bg-lime" />
          UNDER_CONSTRUCTION
        </div>

        <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-5xl">
          THE_HUMAN
          <span className="text-lime">_LABORATORY</span>
        </h1>

        <div className="space-y-4 text-sm leading-relaxed text-text-secondary md:space-y-5 md:text-base">
          <p>
            Neo Brutalism rejects the polished sameness of modern UI. No soft
            gradients, no rounded corners, no friendly pastels. This design
            system strips interfaces down to{" "}
            <span className="text-white">raw structure</span> — obsidian
            backgrounds, monospaced type, hard borders, and a single accent that
            cuts like a{" "}
            <span className="text-lime">signal through noise</span>.
          </p>

          <p>
            Every element earns its place. Borders are structural, not
            decorative. Color is functional, not atmospheric. The crosshair
            cursor, the CRT scan lines, the grid overlays — these aren&apos;t
            nostalgia. They&apos;re a commitment to treating the interface as
            what it is:{" "}
            <span className="text-white">
              a machine for communicating information
            </span>
            . Utility over ornament. Clarity over comfort.
          </p>

          <p>
            <span className="text-lime">The Human Laboratory</span> is the
            space where this philosophy takes form. A design system built on the
            belief that constraint produces coherence, and that the most honest
            interface is one that doesn&apos;t pretend to be anything other
            than{" "}
            <span className="text-white">code rendered on a screen</span>.
          </p>
        </div>

        <div className="flex gap-6">
          <Link
            href="/design-system"
            className="border border-steel px-6 py-2 text-xs font-bold tracking-widest text-text-secondary transition-colors hover:border-lime hover:text-lime"
          >
            DESIGN_SYSTEM
          </Link>
          <Link
            href="/demo"
            className="border border-steel px-6 py-2 text-xs font-bold tracking-widest text-text-secondary transition-colors hover:border-lime hover:text-lime"
          >
            DEMO
          </Link>
        </div>
      </div>
    </div>
  );
}
