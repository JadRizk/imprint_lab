// The docs site is a static export served by GitHub Pages.
//
// Pages serves a project site from a subpath — https://jadrizk.github.io/imprint_lab/
// — so the whole app has to know it lives under one. `basePath` comes from the
// environment rather than a literal, for two reasons: `bun run dev` keeps
// serving at `/` with no subpath to type, and moving the site to a custom
// domain (or a renamed repo) becomes one edit in the workflow instead of a
// search across the tree.
//
// Read the same value in app code via `lib/base-path.ts` — Next rewrites
// `<Link>` and its own asset URLs automatically, but NOT a raw `<a href>` or
// `<iframe src>` pointing into public/. Those need prefixing by hand.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

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

  // Normalises the value to '' when unset, so client bundles never inline
  // `undefined` and build a "/undefined/..." URL.
  env: { NEXT_PUBLIC_BASE_PATH: basePath }
};

export default nextConfig;
