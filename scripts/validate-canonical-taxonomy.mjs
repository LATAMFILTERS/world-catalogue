import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const excludedDirs = new Set([
  '.git', 'node_modules', '.next', 'dist', 'build', 'coverage',
  'graphify-out',
]);
const excludedFiles = new Set([
  'frontend/tsconfig.tsbuildinfo',
]);
const binaryExt = new Set(['.png','.jpg','.jpeg','.gif','.webp','.avif','.ico','.pdf','.zip','.gz','.tar','.mp4','.mov','.woff','.woff2','.ttf','.eot','.db','.sqlite','.sqlite3']);

// Hex keeps retired labels out of current repository text while still allowing
// the guard to detect them in active file contents and paths.
const forbidden = [
  '53594e5445504f5245',
  '53594e5445464f52',
  '434f4f4c54454348',
  '445552414354454348',
  '4e414e4f434f5245',
  '49534f4755415244',
  '50554c5345434f5245',
  '454c494d434f5245',
  '44494553454c434f5245',
  '5457454c564520544543484e4f4c4f47494553',
  '31322050524f505249455441525920544543484e4f4c4f47494553',
].map((hex) => Buffer.from(hex, 'hex').toString('utf8'));

const violations = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (excludedDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full).replaceAll('\\', '/');

    if (entry.isDirectory()) {
      walk(full);
      continue;
    }

    if (excludedFiles.has(rel)) continue;

    const upperPath = rel.toUpperCase();
    for (const token of forbidden) {
      if (upperPath.includes(token)) violations.push(`${rel} [path]`);
    }

    if (binaryExt.has(path.extname(entry.name).toLowerCase())) continue;
    let text;
    try { text = fs.readFileSync(full, 'utf8'); } catch { continue; }
    const upper = text.toUpperCase();
    for (const token of forbidden) {
      if (upper.includes(token)) violations.push(`${rel} [content]`);
    }
  }
}

walk(root);

if (violations.length) {
  console.error('Canonical taxonomy guard failed. Retired identifiers remain:');
  for (const item of [...new Set(violations)].sort()) console.error(`- ${item}`);
  process.exit(1);
}

console.log('Canonical taxonomy guard passed.');
