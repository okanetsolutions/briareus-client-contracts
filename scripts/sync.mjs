// Copies dist/ into the client checkouts beside this one, or with --check says which copies are out of date.
//   node scripts/sync.mjs                  copies into ../briareus-quest, ../briareus-swift and ../briareus-windows
//   node scripts/sync.mjs --check          exits 1 if any client's copy differs from dist/
//   node scripts/sync.mjs --root ~/src     looks for the clients under ~/src instead
// Clients vendor the generated file rather than fetching it, so they build offline and review token changes as diffs.
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { existsSync } from 'node:fs';

export const TARGETS = [
  { client: 'briareus-quest', from: 'dist/kotlin/BriareusTokens.kt', to: 'app/src/main/kotlin/com/okanetsolutions/briareus/tokens/BriareusTokens.kt' },
  { client: 'briareus-swift', from: 'dist/swift/BriareusTokens.swift', to: 'Mac/Core/BriareusTokens.swift' },
  { client: 'briareus-windows', from: 'dist/c/briareus_tokens.h', to: 'app/briareus_tokens.h' },
];

const args = process.argv.slice(2);
const check = args.includes('--check');
const rootIndex = args.indexOf('--root');
const root = resolve(rootIndex >= 0 ? args[rootIndex + 1] : join(import.meta.dirname, '..', '..'));
const here = resolve(import.meta.dirname, '..');

let stale = 0;
for (const { client, from, to } of TARGETS) {
  const repo = join(root, client);
  if (!existsSync(repo)) {
    console.log(`- ${client}: not found under ${root}, skipped`);
    continue;
  }
  const source = join(here, from);
  const dest = join(repo, to);
  const same = existsSync(dest) && (await readFile(dest, 'utf8')) === (await readFile(source, 'utf8'));
  if (same) {
    console.log(`✓ ${client}: ${to} is current`);
  } else if (check) {
    console.log(`✗ ${client}: ${to} ${existsSync(dest) ? 'differs from' : 'is missing;'} ${from}`);
    stale++;
  } else {
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(source, dest);
    console.log(`→ ${client}: wrote ${to}`);
  }
}
process.exit(stale ? 1 : 0);
