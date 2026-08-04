#!/usr/bin/env node
// Emits every derived token artifact for one system.
//
// Shared across imprint_lab, so paths resolve against the token directory
// passed as argv[2] (default: cwd), not against this file.
//
//   token-tools [tokenDir]
//   bun run --filter=@thl/tokens generate:tokens

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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

const aliases = tokens.filter((t) => t.aliasOf).length;
console.log(
  `token-tools: ${system} — ${tokens.length} tokens (${aliases} aliased) → ${Object.keys(artifacts).length} artifacts in ${outDir}`
);
