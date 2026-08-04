#!/usr/bin/env node
// Emits every derived token artifact for one system.
//
// Shared across imprint_lab, so paths resolve against the token directory
// passed as argv[2] (default: cwd), not against this file.
//
//   token-tools [tokenDir]
//   bun run --filter=@thl/tokens generate:tokens

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve as resolvePath } from 'node:path';

import {
  buildTokens,
  emitThemeScopedCss,
  emitTokensCss,
  emitTokensJson,
  emitTokensTs,
  emitTwMerge
} from './lib/emit.mjs';
import { parseTheme } from './lib/parse.mjs';

const tokenDir = resolvePath(process.argv[2] ?? process.cwd());
const outDir = join(tokenDir, 'generated');

// systems/<name>/tokens -> <name>
const system = basename(dirname(tokenDir));

const css = readFileSync(join(tokenDir, 'theme.css'), 'utf8');
const parsed = parseTheme(css);
const tokens = buildTokens(parsed);

mkdirSync(outDir, { recursive: true });

const artifacts = {
  'tokens.ts': emitTokensTs(tokens),
  'tokens.css': emitTokensCss(parsed.declarations),
  'theme.scoped.css': emitThemeScopedCss(parsed.declarations, system),
  'tokens.json': emitTokensJson(tokens, system),
  'tw-merge.ts': emitTwMerge(tokens)
};

for (const [file, contents] of Object.entries(artifacts)) {
  writeFileSync(join(outDir, file), contents);
}

// ── Static tier ────────────────────────────────────────────────────────────
// One self-contained stylesheet a standalone HTML report can inline: tokens,
// reset, and the report primitives. Assembled here rather than hand-kept, so
// the tokens have exactly one source. Hand-authored parts live in
// static/parts/; the bundles below are generated and must not be edited.
const staticDir = join(dirname(tokenDir), 'static');
const partsDir = join(staticDir, 'parts');
// Bundle filename comes from the package scope — @thl/tokens -> thl.css — so it
// matches the registry namespace consumers actually type, rather than initials
// derived from the directory name.
const short =
  JSON.parse(readFileSync(join(tokenDir, 'package.json'), 'utf8')).name.match(/^@([^/]+)\//)?.[1] ??
  system;

const part = (name) => readFileSync(join(partsDir, name), 'utf8').trimEnd();
const bundleHeader = (what) =>
  `/* ${system} — ${what}\n * AUTO-GENERATED. Edit static/parts/ and re-run:\n *   bun run --filter=@thl/tokens generate:tokens\n */\n\n`;

let staticCount = 0;
if (existsSync(partsDir)) {
  writeFileSync(
    join(staticDir, `${short}.css`),
    `${bundleHeader('report kit: tokens + reset + primitives')}${emitTokensCss(parsed.declarations)}\n${part('reset.css')}\n\n${part('components.css')}\n`
  );
  writeFileSync(
    join(staticDir, `${short}.chart.css`),
    `${bundleHeader('report kit: chart layer (opt-in, load after the base bundle)')}${part('chart.css')}\n`
  );
  staticCount = 2;
}

const aliases = tokens.filter((t) => t.aliasOf).length;
console.log(
  `token-tools: ${system} — ${tokens.length} tokens (${aliases} aliased) → ${Object.keys(artifacts).length} artifacts in generated/, ${staticCount} bundles in static/`
);
