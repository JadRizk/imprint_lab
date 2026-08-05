/**
 * The subpath the site is served from.
 *
 * GitHub Pages serves this project site under `/imprint_lab`, and Next only
 * rewrites what it owns: `<Link href>`, `next/image`, and its own `_next/*`
 * asset URLs. A raw `<a href="/thl-catalog.html">` or `<iframe src="...">`
 * pointing at a file in `public/` is left exactly as written — which resolves
 * against the domain root and 404s on Pages while working perfectly in `dev`.
 *
 * That is the failure mode this module exists to prevent: it only appears once
 * a basePath is set, so local development cannot catch it.
 *
 * Derived by `next.config.js` from `NEXT_PUBLIC_SITE_URL`; empty in `dev`.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/**
 * The absolute URL the site is published at, origin and subpath together.
 *
 * For anything that cannot be root-relative — `metadataBase`, and so every
 * `og:` and `twitter:` URL Next resolves against it. A crawler fetches those
 * from outside the document, so a relative value is simply rejected.
 *
 * Falls back to the dev origin rather than to the production URL. A card that
 * points at localhost while you are on localhost is correct; one that points at
 * the live site from a dev build is a copy of the deployed value pretending to
 * be derived from something.
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

/**
 * Prefixes a root-relative path to a file in `public/` with the basePath.
 *
 * Use for anything Next does not rewrite — plain anchors, iframes, `<link>`,
 * `<script>`. Do NOT use for `<Link href>`: Next prefixes those already, and
 * doing it twice yields `/imprint_lab/imprint_lab/…`.
 *
 * @param path Root-relative and leading-slashed, e.g. `/thl-catalog.html`.
 */
export function asset(path: string): string {
  return `${basePath}${path}`;
}
