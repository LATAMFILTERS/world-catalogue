import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const projectRoot = resolve(process.cwd(), '..');
const compilerPath = resolve(projectRoot, 'scripts', 'build-citation-index.js');
const vaultRoot = resolve(projectRoot, 'elimfilters-vault');

let compiler = readFileSync(compilerPath, 'utf8');

const retiredKeysReplacement = `const RETIRED_ENTITY_KEYS = new Set([\n  'AIRFILTER',\n  'AQUAGUARD',\n  'COOLTECH',\n]);`;

compiler = compiler.replace(
  /const RETIRED_ENTITY_KEYS = new Set\(\[[\s\S]*?\]\);/,
  retiredKeysReplacement,
);

writeFileSync(compilerPath, compiler, 'utf8');

function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === '00-meta' || entry.startsWith('.')) continue;
      out.push(...walk(full));
    } else if (st.isFile() && extname(full) === '.md') {
      out.push(full);
    }
  }
  return out;
}

let linkFilesChanged = 0;
let replacements = 0;

for (const file of walk(vaultRoot)) {
  let content = readFileSync(file, 'utf8');
  const before = content;
  const matches = content.match(/\[\[AIRFILTER(?=\]|\|)/g);
  if (matches) replacements += matches.length;
  content = content.replace(/\[\[AIRFILTER(?=\]|\|)/g, '[[AIR_INTAKE_PROTECTION');
  if (content !== before) {
    writeFileSync(file, content, 'utf8');
    linkFilesChanged += 1;
  }
}

console.log('[normalize-retired-citation-keys] Active: HYDROCORE, THERMACORE | Retired: AIRFILTER, AQUAGUARD, COOLTECH');
console.log(`[normalize-retired-citation-keys] AIRFILTER links normalized: ${replacements} across ${linkFilesChanged} files`);
