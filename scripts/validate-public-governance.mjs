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

for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const before = text;
  text = text.replaceAll('DURATECH™', 'DURACTECH™');
  text = text.replaceAll('DURATECH', 'DURACTECH');
  text = text.replaceAll('TURBOCORE™', 'HYDROCORE™');
  text = text.replaceAll('TURBOCORE', 'HYDROCORE');
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
  /TURBOCORE™/,
];

const violations = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const re of forbidden) {
    if (re.test(text)) violations.push(`${path.relative(out, file)} :: ${re}`);
  }
}

function requireFile(rel) {
  const full = path.join(out, rel);
  if (!fs.existsSync(full)) {
    violations.push(`${rel} missing`);
    return null;
  }
  return fs.readFileSync(full, 'utf8');
}

function requireText(rel, required) {
  const text = requireFile(rel);
  if (text == null) return;
  for (const item of required) {
    if (!text.toLowerCase().includes(item.toLowerCase())) violations.push(`${rel} missing governed concept: ${item}`);
  }
}

requireText('distributors/index.html', [
  'Authorized Commercial Partner Network',
  'application intelligence',
  'inventory strategy',
]);

const aiPolicy = requireFile('legal/ai-policy/index.html');
if (aiPolicy != null) {
  for (const required of ['mathematical and computational engineering tool', 'does not replace physical validation', 'Human Accountability']) {
    if (!aiPolicy.includes(required)) violations.push(`legal/ai-policy/index.html missing policy concept: ${required}`);
  }
  if (!/rel="canonical"[^>]+https:\/\/elimfilters\.com\/legal\/ai-policy\//i.test(aiPolicy)) {
    violations.push('legal/ai-policy/index.html missing self canonical');
  }
}

const canonicalDuractech = requireFile('commercial-lines/duractech/index.html');
if (canonicalDuractech != null) {
  if (!/rel="canonical"[^>]+https:\/\/elimfilters\.com\/commercial-lines\/duractech\//i.test(canonicalDuractech)) {
    violations.push('commercial-lines/duractech/index.html missing self canonical');
  }
}

const legacyDuratech = requireFile('commercial-lines/duratech/index.html');
if (legacyDuratech != null) {
  if (!/noindex/i.test(legacyDuratech)) violations.push('commercial-lines/duratech/index.html must be noindex migration shim');
  if (!legacyDuratech.includes('https://elimfilters.com/commercial-lines/duractech/')) violations.push('commercial-lines/duratech/index.html missing canonical migration destination');
}

const kcIndex = requireFile('knowledge-center/index.html');
if (kcIndex != null) {
  for (const required of ['Engineering knowledge for better asset decisions', 'CONTAMINATION CONTROL LOGIC', 'DECISION PATH']) {
    if (!kcIndex.includes(required)) violations.push(`knowledge-center/index.html missing professional architecture: ${required}`);
  }
  if (!/rel="canonical"[^>]+https:\/\/elimfilters\.com\/knowledge-center\//i.test(kcIndex)) {
    violations.push('knowledge-center/index.html missing self canonical');
  }
}

const rawKeyPattern = /\b(?:knowledgeCenter|standards|problems|technologies|systems|fleet|distributors)\.[A-Za-z][A-Za-z0-9_.-]*\b/g;
for (const file of files.filter((f) => f.includes(`${path.sep}knowledge-center${path.sep}`) || f.endsWith(`${path.sep}distributors${path.sep}index.html`))) {
  const text = fs.readFileSync(file, 'utf8');
  const matches = [...new Set(text.match(rawKeyPattern) || [])];
  if (matches.length) violations.push(`${path.relative(out, file)} raw translation keys: ${matches.slice(0, 6).join(', ')}`);
}

const sitemap = requireFile('sitemap.xml');
if (sitemap != null) {
  if (!sitemap.includes('https://elimfilters.com/commercial-lines/duractech/')) violations.push('sitemap.xml missing DURACTECH canonical URL');
  if (sitemap.includes('https://elimfilters.com/commercial-lines/duratech/')) violations.push('sitemap.xml contains retired DURATECH URL');
}

const sitemapIndex = requireFile('sitemap-index.xml');
if (sitemapIndex != null && !sitemapIndex.includes('https://elimfilters.com/sitemap.xml')) {
  violations.push('sitemap-index.xml missing main sitemap');
}

if (violations.length) {
  console.error('[validate-public-governance] FAILED');
  for (const v of violations) console.error(` - ${v}`);
  process.exit(1);
}

console.log(`[validate-public-governance] PASS — ${files.length} public text files checked`);
