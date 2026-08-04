import { PageShell } from '@thl/ui/components/page-shell';

import { SystemPage } from '../system-page';

/**
 * The report kit, shown in an iframe rather than re-implemented.
 *
 * catalog.html carries its own reset and token block. Embedding it directly
 * would put two resets in one document and let the app's cascade fight it. The
 * iframe gives complete CSS isolation — and it means what renders here is the
 * standalone bundle exactly as a consumer receives it, so the page tests the
 * artifact while displaying it.
 */
export default function ReportPage() {
  return (
    <SystemPage system="human-laboratory" base="/systems/human-laboratory" current="/report">
      <PageShell className="mt-10 space-y-8">
        <header className="space-y-3">
          <h1 className="text-2xl font-bold text-ink">Report kit</h1>
          <p className="max-w-2xl text-sm">
            The pure HTML/CSS tier — no React, no build step, no network request. Inline{' '}
            <code className="text-accent">thl.css</code> into a{' '}
            <code className="text-accent">&lt;style&gt;</code> block and a document is on-brand by
            construction. Below is the live catalogue, loaded as a standalone page so it renders
            exactly as a consumer would receive it.
          </p>
          <p className="max-w-2xl text-sm">
            The catalogue shows every form the kit can draw — tabs, meters, timelines, the eight
            chart forms, the four diagram forms and the interactive table — with each modifier
            beside its neighbours. That makes it a reference, not a model: it spends the accent far
            past the budget a real document keeps to. The worked specimen is the honest ratio.
          </p>
          <p className="flex flex-wrap gap-x-6 gap-y-2 text-micro tracking-label text-ink-subtle">
            <a
              href="/thl-catalog.html"
              target="_blank"
              rel="noreferrer"
              className="hover:text-accent"
            >
              OPEN_CATALOG -&gt;
            </a>
            <a
              href="/example-report.html"
              target="_blank"
              rel="noreferrer"
              className="hover:text-accent"
            >
              WORKED_SPECIMEN -&gt;
            </a>
            <a href="/report.html" target="_blank" rel="noreferrer" className="hover:text-accent">
              STARTER_SKELETON -&gt;
            </a>
          </p>
        </header>

        <div className="border border-line">
          <iframe
            src="/thl-catalog.html"
            title="The Human Laboratory report kit catalogue"
            className="block h-[80vh] w-full"
          />
        </div>
      </PageShell>
    </SystemPage>
  );
}
