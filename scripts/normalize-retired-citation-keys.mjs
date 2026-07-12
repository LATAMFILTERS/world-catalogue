import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const compilerPath = resolve(process.cwd(), '..', 'scripts', 'build-citation-index.js');
let content = readFileSync(compilerPath, 'utf8');

const replacement = `const RETIRED_ENTITY_KEYS = new Set([\n  'AIRFILTER',\n  'AQUAGUARD',\n  'COOLTECH',\n]);`;

content = content.replace(
  /const RETIRED_ENTITY_KEYS = new Set\(\[[\s\S]*?\]\);/,
  replacement,
);

writeFileSync(compilerPath, content, 'utf8');
console.log('[normalize-retired-citation-keys] Active: HYDROCORE, THERMACORE | Retired: AIRFILTER, AQUAGUARD, COOLTECH');
