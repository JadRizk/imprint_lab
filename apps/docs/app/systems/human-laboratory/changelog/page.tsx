import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PageShell } from '@thl/ui/components/page-shell';
import { released, version } from '@thl/ui/lib/version';
import { marked } from 'marked';
import type { Metadata } from 'next';

import { SystemPage } from '../system-page';

export const metadata: Metadata = {
  title: 'Changelog — @thl',
  description:
    'Every released version of The Human Laboratory, what changed in it, and what a major, minor or patch bump means for a project that has adopted the system.'
};

/**
 * The changelog, rendered from CHANGELOG.md at build time.
 *
 * Same arrangement as the thesis page and for the same reason: the markdown file
 * is the source an agent and a release workflow both read, so the page renders
 * it rather than restating it. The difference is that here the file is also
 * *parsed* — its newest release heading is the system's version — which makes a
 * second copy of the prose not merely drift-prone but capable of disagreeing
 * with the number on this very page.
 */
function changelogHtml() {
  const path = join(process.cwd(), '..', '..', 'systems', 'human-laboratory', 'CHANGELOG.md');
  const md = readFileSync(path, 'utf8');
  // Drop the H1 — the page header already names the system.
  return marked.parse(md.replace(/^#\s.*\n/, ''), { async: false }) as string;
}

export default function ChangelogPage() {
  return (
    <SystemPage system="human-laboratory" base="/systems/human-laboratory" current="/changelog">
      <PageShell className="mt-10">
        <div className="mx-auto max-w-[64ch] space-y-10 text-sm leading-prose md:text-base">
          <header className="space-y-5">
            <h1 className="text-2xl font-bold text-ink md:text-4xl">CHANGELOG</h1>
            {/*
              The current version, stated once at the top so it is answerable
              without reading the file — and read from the generated artifact
              rather than transcribed, so this cannot claim a version the system
              does not carry.

              Deliberately NOT accent. A version is a fact about the system, not
              a live event, and the nav's active tab has already spent the one
              accent this page gets. It takes `line` instead: the edge OF a
              thing, which is exactly what a chip is.
            */}
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
              <span className="border border-line px-2 py-1 text-micro tracking-label-dense text-ink">
                v{version}
              </span>
              <span className="text-micro tracking-label text-ink-subtle">RELEASED {released}</span>
            </div>
          </header>

          <article
            className="thesis"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: build-time render of a repo-local markdown file, no user input
            dangerouslySetInnerHTML={{ __html: changelogHtml() }}
          />
        </div>
      </PageShell>
    </SystemPage>
  );
}
