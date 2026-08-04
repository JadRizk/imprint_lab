import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PageShell } from '@thl/ui/components/page-shell';
import { marked } from 'marked';

import { SystemPage } from './system-page';

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
    <SystemPage system="human-laboratory" base="/systems/human-laboratory" current="">
      <PageShell className="mt-10">
        {/*
          The reading column, centred under a full-width nav.

          The measure belongs to the running text, not to the page: this was
          `PageShell width="prose"` around everything, which put the nav in a
          64ch column too and ran its rule 550px of a 1440px viewport. It is set
          here rather than by nesting a second PageShell, which would double the
          gutter.

          `ch` resolves against this element's own font-size, which is why the
          type scale sits here and not on the article. At `md` and up that is
          16px of IBM Plex Mono — a 0.6em advance, so 64ch is ~614px and the h1
          clears it on one line. Below `md` the column is ~537px and the title
          wraps, which is the correct outcome on a phone.
        */}
        <div className="mx-auto max-w-[64ch] space-y-10 text-sm leading-relaxed md:text-base">
          <header>
            {/* THE_HUMAN_LABORATORY is one unbreakable word — the underscores
                offer no wrap opportunity — and at 4xl it measures ~420px. On a
                384px viewport the box stays clamped but the glyphs spill out of
                it, taking the document's scrollWidth to 474 and giving the page
                a horizontal scroll. Measured, not guessed: a headless
                screenshot at --window-size=390 crops rather than reflows, so it
                shows the same clipping whether or not the bug is there.
                Both sizes are steps on the closed scale. */}
            <h1 className="text-2xl font-bold text-ink md:text-4xl">
              {/* biome-ignore lint/suspicious/noCommentText: decorative separator */}
              THE_HUMAN_LABORATORY // <span className="text-accent">@thl</span>
            </h1>
          </header>

          <article
            className="thesis space-y-4"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: build-time render of a repo-local markdown file, no user input
            dangerouslySetInnerHTML={{ __html: brandHtml() }}
          />
        </div>
      </PageShell>
    </SystemPage>
  );
}
