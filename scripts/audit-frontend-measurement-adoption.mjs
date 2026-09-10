import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const src = path.join(root, 'frontend', 'src');

const INCLUDE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx']);
const EXCLUDE = new Set([
  path.normalize('frontend/src/lib/unit-system.ts'),
  path.normalize('frontend/src/lib/__tests__/unit-system.test.ts'),
]);

const patterns = [
  { kind: 'mass', re: /\b\d+(?:\.\d+)?\s?(?:kg|lb|lbs)\b/gi },
  { kind: 'length', re: /\b\d+(?:\.\d+)?\s?(?:mm|cm|in|inch|inches|ft|feet)\b/gi },
  { kind: 'volume', re: /\b\d+(?:\.\d+)?\s?(?:m³|m3|ft³|ft3|L|liters?|litres?)\b/gi },
  { kind: 'pressure', re: /\b\d+(?:\.\d+)?\s?(?:kPa|MPa|bar|psi)\b/gi },
  { kind: 'temperature', re: /-?\b\d+(?:\.\d+)?\s?°?[CF]\b/g },
  { kind: 'flow', re: /\b\d+(?:\.\d+)?\s?(?:L\/min|l\/min|GPM|gpm)\b/g },
  { kind: 'unit-token', re: /['"`]\s*(?:kg|lb|lbs|mm|cm|in|ft|m³|m3|ft³|ft3|kPa|MPa|bar|psi|°C|°F|L\/min|GPM)\s*['"`]/g },
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', 'dist', 'build'].includes(entry.name)) continue;
      walk(full, out);
      continue;
    }
    if (!INCLUDE_EXT.has(path.extname(entry.name))) continue;
    out.push(full);
  }
  return out;
}

const findings = [];

for (const file of walk(src)) {
  const rel = path.relative(root, file);
  if (EXCLUDE.has(path.normalize(rel))) continue;

  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    for (const pattern of patterns) {
      pattern.re.lastIndex = 0;
      const matches = [...line.matchAll(pattern.re)];
      for (const match of matches) {
        findings.push({
          file: rel.replaceAll('\\', '/'),
          line: i + 1,
          kind: pattern.kind,
          match: match[0],
          text: line.trim().slice(0, 240),
        });
      }
    }
  }
}

const byFile = new Map();
for (const item of findings) {
  if (!byFile.has(item.file)) byFile.set(item.file, []);
  byFile.get(item.file).push(item);
}

console.log('\nELIMFILTERS FRONTEND MEASUREMENT ADOPTION AUDIT');
console.log(JSON.stringify({
  files_scanned: walk(src).length,
  files_with_findings: byFile.size,
  findings: findings.length,
}, null, 2));

if (!findings.length) {
  console.log('\nPASS: no hardcoded measurement literals detected outside the governed unit layer.');
  process.exit(0);
}

console.log('\nFILES REQUIRING REVIEW:\n');
for (const [file, items] of [...byFile.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  console.log(`\n${file}`);
  for (const item of items) {
    console.log(`  L${item.line} [${item.kind}] ${item.match} :: ${item.text}`);
  }
}

console.log('\nNOTE: This is an adoption audit, not an automatic failure. Technical standards, historical prose, CSS-like tokens, or source quotations may be valid exceptions and must be reviewed before replacement.');
