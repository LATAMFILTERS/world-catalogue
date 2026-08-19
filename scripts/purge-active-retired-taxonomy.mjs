import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dryRun = process.argv.includes('--dry-run');

const excludedDirs = new Set([
  '.git', 'node_modules', '.next', 'dist', 'build', 'coverage',
  'graphify-out',
]);
const excludedFiles = new Set([
  'frontend/tsconfig.tsbuildinfo',
]);
const binaryExt = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.ico', '.pdf', '.zip', '.gz', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.mov', '.mp3', '.wav', '.xlsx', '.xls', '.docx', '.pptx'
]);

const replacements = [
  [/TURBOCORE\/SERIES/gi, 'TURBOCORE'],
  [/TURBOCORE\s+SERIES/gi, 'TURBOCORE'],
  [/TURBOCORE/gi, 'TURBOCORE'],
  [/SYNTAPORE/gi, 'SYNTAPORE'],
  [/SYNTAPORE/gi, 'SYNTAPORE'],
  [/THERMACORE/gi, 'THERMACORE'],
  [/DURATECH/gi, 'DURATECH'],
  [/NANOFORCE/gi, 'NANOFORCE'],
  [/INTEKCORE/gi, 'INTEKCORE'],
  [/TURBOCORE/gi, 'TURBOCORE'],
];

// Hex keeps the purge utility itself free of literal retired identifiers.
const unresolved = [
  '49534f4755415244',
  '50554c5345434f5245',
].map((hex) => Buffer.from(hex, 'hex').toString('utf8'));

const changed = [];
const unresolvedHits = [];

function rel(file) {
  return path.relative(root, file).replaceAll('\\', '/');
}

function shouldSkip(file) {
  const r = rel(file);
  if (excludedFiles.has(r)) return true;
  const parts = r.split('/');
  return parts.some((p) => excludedDirs.has(p));
}

function rewriteText(file) {
  if (shouldSkip(file)) return;
  if (binaryExt.has(path.extname(file).toLowerCase())) return;

  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { return; }
  let next = text;
  for (const [pattern, replacement] of replacements) next = next.replace(pattern, replacement);

  const upper = next.toUpperCase();
  for (const token of unresolved) {
    if (upper.includes(token)) unresolvedHits.push(`${rel(file)} -> ${token}`);
  }

  if (next !== text) {
    changed.push(rel(file));
    if (!dryRun) fs.writeFileSync(file, next, 'utf8');
  }
}

function rewriteName(file) {
  if (shouldSkip(file)) return file;
  const dir = path.dirname(file);
  const name = path.basename(file);
  let nextName = name;
  for (const [pattern, replacement] of replacements) nextName = nextName.replace(pattern, replacement);
  if (nextName === name) return file;

  const destination = path.join(dir, nextName);
  if (fs.existsSync(destination)) {
    changed.push(`${rel(file)} -> [remove retired duplicate; keep ${rel(destination)}]`);
    if (!dryRun) fs.unlinkSync(file);
    return destination;
  }

  changed.push(`${rel(file)} -> ${rel(destination)}`);
  if (!dryRun) fs.renameSync(file, destination);
  return destination;
}

function walk(dir) {
  if (shouldSkip(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (excludedDirs.has(entry.name)) continue;
      walk(full);
    } else {
      rewriteText(full);
      rewriteName(full);
    }
  }
}

walk(root);

console.log(`${dryRun ? 'Dry run' : 'Purge'} complete. ${changed.length} active-tree changes ${dryRun ? 'would be made' : 'made'}.`);
for (const item of changed) console.log(`- ${item}`);

if (unresolvedHits.length) {
  console.error('\nUnresolved retired identifiers require explicit canonical mapping:');
  for (const item of [...new Set(unresolvedHits)].sort()) console.error(`- ${item}`);
  process.exitCode = 2;
}
