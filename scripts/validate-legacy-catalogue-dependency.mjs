import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const scanRoots = [
  path.join(root, 'frontend', 'src'),
  path.join(root, 'scripts'),
];
const rootFiles = [
  'server.js',
  'server-original.js',
  'package.json',
  path.join('frontend', 'package.json'),
];
const sourceExt = new Set(['.js', '.cjs', '.mjs', '.jsx', '.ts', '.tsx', '.json']);
const legacyToken = Buffer.from('756e69666965642d64617461', 'hex').toString('utf8');
const violations = [];

function inspectFile(file) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return;
  if (!sourceExt.has(path.extname(file).toLowerCase())) return;

  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { return; }
  if (!text.toLowerCase().includes(legacyToken)) return;

  const rel = path.relative(root, file).replaceAll('\\', '/');
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(legacyToken)) {
      violations.push(`${rel}:${i + 1}`);
    }
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', 'dist', 'build', 'coverage'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else inspectFile(full);
  }
}

for (const dir of scanRoots) walk(dir);
for (const file of rootFiles) inspectFile(path.join(root, file));

if (violations.length) {
  console.error('Legacy catalogue dependency guard failed:');
  for (const item of [...new Set(violations)].sort()) console.error(`- ${item}`);
  process.exit(1);
}

console.log('Legacy catalogue dependency guard passed.');
