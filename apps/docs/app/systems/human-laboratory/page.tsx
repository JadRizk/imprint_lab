import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PageShell } from '@thl/ui/components/page-shell';
import { marked } from 'marked';

import { SystemNav } from './system-nav';

/**
 * The thesis, rendered from BRAND.md at build time.
 *
 * BRAND.md is the single source: an agent reads the markdown, a human reads this
 * page. Keeping a second copy of the prose in JSX is exactly the drift the rest
 * of this repo is built to prevent — so the file is read, never transcribed.
 */
function brandHtml() {
  const path = join(process.cwd(), '..', '..', 'systems', 'human-laboratory', 'BRAND.md');
  const md = readFileSync(path, 'utf8');
  // Drop the H1 — the page header already states the system's name.
  return marked.parse(md.replace(/^#\s.*\n/, ''), { async: false }) as string;
}

export default function ThesisPage() {
  return (
    <div data-system="human-laboratory" className="min-h-screen w-full pt-10 pb-20">
      <PageShell width="prose" className="space-y-10">
        <SystemNav base="/systems/human-laboratory" current="" />

        <header>
          <h1 className="text-4xl font-bold text-ink">
            {/* biome-ignore lint/suspicious/noCommentText: decorative separator */}
            THE_HUMAN_LABORATORY // <span className="text-accent">@thl</span>
          </h1>
        </header>

        <article
          className="thesis space-y-4 text-sm leading-relaxed md:text-base"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: build-time render of a repo-local markdown file, no user input
          dangerouslySetInnerHTML={{ __html: brandHtml() }}
        />
      </PageShell>
    </div>
  );
}
