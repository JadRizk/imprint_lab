import Link from 'next/link';

const TABS = [
  { href: '', label: 'THESIS' },
  { href: '/components', label: 'COMPONENTS' },
  { href: '/example', label: 'EXAMPLE' },
  { href: '/report', label: 'REPORT_KIT' }
] as const;

/**
 * The four faces of a system. Server component — `current` is passed by each
 * page rather than read from a hook, which keeps this off the client boundary.
 */
export function SystemNav({ base, current }: { base: string; current: string }) {
  return (
    <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line pb-3">
      <Link href="/" className="text-micro tracking-label text-ink-subtle hover:text-accent">
        &lt;- SYSTEMS
      </Link>
      {TABS.map((tab) => {
        const active = tab.href === current;
        return (
          <Link
            key={tab.label}
            href={`${base}${tab.href}`}
            aria-current={active ? 'page' : undefined}
            className={
              active
                ? 'text-micro tracking-label text-accent'
                : 'text-micro tracking-label text-ink-subtle transition-colors hover:text-accent'
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
