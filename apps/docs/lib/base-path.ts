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
 * Set by `next.config.js` from `NEXT_PUBLIC_BASE_PATH`; empty in `dev`.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

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
