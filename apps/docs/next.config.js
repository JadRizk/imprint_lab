// The docs site is a static export served by GitHub Pages.
//
// NEXT_PUBLIC_SITE_URL is the ONE place the published location is declared —
// set in .github/workflows/deploy-docs.yml, nowhere else. Everything that needs
// to know where the site lives derives from it:
//
//   basePath            here — the subpath Pages serves a project site from
//   metadataBase        app/layout.tsx, via lib/base-path.ts — the OG card
//   registry homepage   scripts/build-registries.mjs stamps the built registry
//
// That list used to be four independent literals, and the comment that stood
// here claimed otherwise. Moving to a custom domain is now genuinely one edit
// plus a CNAME; before, it was one edit and three silent 404s.
//
// Unset under `bun run dev`, where basePath collapses to '' and the site serves
// at `/` with no subpath to type.
//
// Read the same values in app code via `lib/base-path.ts` — Next rewrites
// `<Link>` and its own asset URLs automatically, but NOT a raw `<a href>` or
// `<iframe src>` pointing into public/. Those need prefixing by hand.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

// `new URL().pathname` is '/' for an origin with no subpath, and the trailing
// slash has to go: Next rejects a basePath that ends in one, and '/' itself
// must normalise to '' rather than staying a lone slash.
const basePath = siteUrl ? new URL(siteUrl).pathname.replace(/\/+$/, '') : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emits `out/` — plain HTML, CSS and JS with no Node server. Rules out API
  // routes, server actions, middleware and ISR; none are used here.
  output: 'export',

  basePath,

  // Emits `foo/index.html` rather than `foo.html`. Pages resolves a directory
  // index reliably at any depth; extensionless-file resolution is the thing
  // that varies, so this removes the question.
  trailingSlash: true,

  // No `next/image` today, and export throws on the default loader the moment
  // someone adds one. Declaring it means that addition fails at review rather
  // than in CI.
  images: { unoptimized: true },

  // Both are normalised to '' when unset, so a client bundle never inlines
  // `undefined` and builds a "/undefined/..." URL. basePath is re-exported
  // rather than re-derived in app code, because `new URL()` on an empty string
  // throws and every consumer would need the same guard.
  env: { NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_SITE_URL: siteUrl }
};

export default nextConfig;
