import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve(process.cwd(), 'out');
if (!fs.existsSync(out)) {
  console.log('[validate-public-governance] out not found; skipping');
  process.exit(0);
}

const textExt = new Set(['.html', '.json', '.xml', '.txt']);
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (textExt.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
}
walk(out);

// Canonicalize generated public text. Historical/internal source records are not
// published by this step; every public textual surface must use DURACTECH.
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const before = text;
  text = text.replaceAll('DURATECH™', 'DURACTECH™');
  text = text.replaceAll('DURATECH', 'DURACTECH');
  text = text.replaceAll('/commercial-lines/duratech/', '/commercial-lines/duractech/');
  if (text !== before) fs.writeFileSync(file, text, 'utf8');
}

const forbidden = [
  /AI-assisted simulation/i,
  /AI-formulated/i,
  /available exclusively through authorized distributors/i,
  /we do not sell directly to end users/i,
  /Our products comply with ISO 5011, ISO 16889, and ISO 19438 standards/i,
  /cross-referenced to 20,000\+ OEM specifications/i,
  /zero bypass architecture on every system/i,
  /100% guaranteed safety/i,
  /absolute protection of critical equipment/i,
  /DURATECH™/,
  /\/commercial-lines\/duratech\//,
];

const violations = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const re of forbidden) {
    if (re.test(text)) violations.push(`${path.relative(out, file)} :: ${re}`);
  }
}

const distributors = path.join(out, 'distributors', 'index.html');
if (!fs.existsSync(distributors)) violations.push('distributors/index.html missing');
else {
  const text = fs.readFileSync(distributors, 'utf8');
  for (const required of ['Authorized Commercial Partner Network', 'application intelligence', 'inventory strategy']) {
    if (!text.toLowerCase().includes(required.toLowerCase())) violations.push(`distributors/index.html missing governed concept: ${required}`);
  }
}

const aiPolicy = path.join(out, 'legal', 'ai-policy', 'index.html');
if (!fs.existsSync(aiPolicy)) violations.push('legal/ai-policy/index.html missing');
else {
  const text = fs.readFileSync(aiPolicy, 'utf8');
  for (const required of ['mathematical and computational engineering tool', 'does not replace physical validation', 'Human Accountability']) {
    if (!text.includes(required)) violations.push(`legal/ai-policy/index.html missing policy concept: ${required}`);
  }
}

const canonicalDuractech = path.join(out, 'commercial-lines', 'duractech', 'index.html');
if (!fs.existsSync(canonicalDuractech)) violations.push('commercial-lines/duractech/index.html missing');

if (violations.length) {
  console.error('[validate-public-governance] FAILED');
  for (const v of violations) console.error(` - ${v}`);
  process.exit(1);
}

console.log(`[validate-public-governance] PASS — ${files.length} public text files checked`);
