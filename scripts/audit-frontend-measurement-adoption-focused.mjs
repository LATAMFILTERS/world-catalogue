import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const srcRoot = path.join(root, 'frontend', 'src');

const INCLUDED_DIRS = [
  path.join(srcRoot, 'components'),
  path.join(srcRoot, 'app', 'products'),
  path.join(srcRoot, 'app', 'product'),
  path.join(srcRoot, 'app', 'commercial-lines'),
];

const EXCLUDED_SEGMENTS = [
  `${path.sep}__tests__${path.sep}`,
  `${path.sep}knowledge-center${path.sep}`,
  `${path.sep}diagrams${path.sep}`,
];

const EXTENSIONS = new Set(['.ts', '.tsx']);

const patterns = [
  { kind: 'weight', regex: /(?:^|[^\w])(-?\d+(?:[.,]\d+)?)\s*(kg|lb|lbs|pounds?)\b/gi },
  { kind: 'length-metric', regex: /(?:^|[^\w])(-?\d+(?:[.,]\d+)?)\s*(mm|cm)\b/gi },
  { kind: 'length-imperial', regex: /(?:^|[^\w])(-?\d+(?:[.,]\d+)?)\s*(inches|inch|in\.)\b/gi },
  { kind: 'volume', regex: /(?:^|[^\w])(-?\d+(?:[.,]\d+)?)\s*(m³|m3|ft³|ft3|liters?|litres?|L)\b/g },
  { kind: 'pressure', regex: /(?:^|[^\w])(-?\d+(?:[.,]\d+)?)\s*(psi|PSI|kPa|MPa|bar)\b/g },
  { kind: 'temperature', regex: /(?:^|[^\w])(-?\d+(?:[.,]\d+)?)\s*°\s*([CF])\b/g },
  { kind: 'flow', regex: /(?:^|[^\w])(-?\d+(?:[.,]\d+)?)\s*(L\/min|l\/min|GPM|gpm|US gal\/min)\b/g },
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (EXTENSIONS.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

function stripNoise(line) {
  if (/^\s*\/\//.test(line)) return '';
  if (/data:image\//i.test(line)) return '';
  if (/https?:\/\//i.test(line) && !/["'`]\s*\d/.test(line)) return '';
  return line;
}

const files = [...new Set(INCLUDED_DIRS.flatMap((dir) => walk(dir)))]
  .filter((file) => !EXCLUDED_SEGMENTS.some((segment) => file.includes(segment)));

const findings = [];
for (const file of files) {
  const rel = path.relative(root, file).replaceAll('\\', '/');
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const sourceLine = lines[index];
    const line = stripNoise(sourceLine);
    if (!line) continue;

    for (const { kind, regex } of patterns) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(line)) !== null) {
        findings.push({
          file: rel,
          line: index + 1,
          kind,
          token: match[0].trim(),
          snippet: sourceLine.trim().slice(0, 240),
        });
        if (match.index === regex.lastIndex) regex.lastIndex += 1;
      }
    }
  }
}

const grouped = new Map();
for (const item of findings) {
  if (!grouped.has(item.file)) grouped.set(item.file, []);
  grouped.get(item.file).push(item);
}

console.log('\nELIMFILTERS FOCUSED FRONTEND MEASUREMENT ADOPTION AUDIT');
console.log(JSON.stringify({
  files_scanned: files.length,
  files_with_findings: grouped.size,
  findings: findings.length,
}, null, 2));

if (grouped.size === 0) {
  console.log('\nNo product/UI measurement literals found.');
  process.exit(0);
}

console.log('\nPRODUCT/UI FILES REQUIRING REVIEW:\n');
for (const [file, items] of grouped.entries()) {
  console.log(file);
  for (const item of items) {
    console.log(`  L${item.line} [${item.kind}] ${item.token} :: ${item.snippet}`);
  }
  console.log('');
}

console.log('NOTE: This focused audit intentionally excludes Knowledge Center prose, diagrams, tests, URLs/data URIs, and ambiguous bare "in" tokens.');
