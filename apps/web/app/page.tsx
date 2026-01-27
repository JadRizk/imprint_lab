import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="space-y-8 text-center">
        <h1 className="text-5xl font-bold text-white">
          THE_HUMAN
          <span className="text-lime">_LABORATORY</span>
        </h1>
        <p className="text-sm text-text-secondary">
          SYSTEM_STATUS: <span className="text-lime">ONLINE</span>
        </p>
        <div className="flex justify-center gap-6 pt-4">
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
