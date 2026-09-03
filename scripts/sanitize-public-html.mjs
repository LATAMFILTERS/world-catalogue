import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve(process.cwd(), 'out');
const indexPath = path.join(outDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.log('[sanitize-public-html] index.html not found; skipping');
  process.exit(0);
}

let html = fs.readFileSync(indexPath, 'utf8');
const before = html;

// Normalize common UTF-8 text that was previously double-decoded before it
// reaches crawlers. This is intentionally limited to known mojibake sequences.
const mojibakeMap = new Map([
  ['Â®', '®'],
  ['Â©', '©'],
  ['Â·', '·'],
  ['â„¢', '™'],
  ['â€”', '—'],
  ['â€“', '–'],
  ['â†’', '→'],
  ['â€™', '’'],
  ['â€˜', '‘'],
  ['â€œ', '“'],
  ['â€', '”'],
  ['â€¦', '…'],
]);

for (const [broken, normalized] of mojibakeMap) {
  html = html.replaceAll(broken, normalized);
}

// Frases prohibidas (cada una se busca y elimina de forma flexible)
const forbiddenPhrases = [
  'We do not sell directly to end users',
  'available exclusively through authorized distributors',
  'Our products comply with ISO 5011, ISO 16889, and ISO 19438 standards',
  'cross-referenced to 20,000+ OEM specifications',
];

// Regex flexible: ignora espacios, saltos de línea, y entidades HTML comunes
function escapeForRegex(phrase) {
  return phrase
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/'/g, "(?:'|&#x27;|&#39;|&apos;)")
    .replace(/"/g, '(?:"|&quot;|&#34;)')
    .replace(/®/g, '(?:®|&reg;|&#174;)')
    .replace(/™/g, '(?:™|&trade;|&#8482;)')
    .replace(/ /g, '\\s+');
}

for (const phrase of forbiddenPhrases) {
  const pattern = new RegExp(escapeForRegex(phrase), 'gi');
  html = html.replace(pattern, '');
}

// También eliminamos el bloque completo del div hidden si queda vacío o residual
// Busca <div style="display:none;visibility:hidden"> que contenga solo espacios/etiquetas vacías
html = html.replace(
  /<div\s+style=["']display:\s*none;?\s*visibility:\s*hidden["']\s*>(?:\s*<p>\s*<\/p>\s*|\s*)<\/div>/gi,
  ''
);

const remaining = [];
for (const phrase of forbiddenPhrases) {
  // Búsqueda simple sin regex para verificar
  const simpleSearch = phrase.replace(/'/g, "'").replace(/®/g, '®');
  if (html.includes(simpleSearch)) remaining.push(phrase);
}

if (remaining.length) {
  console.error('[sanitize-public-html] Forbidden public claims remain in index.html:');
  for (const phrase of remaining) console.error(` - ${phrase}`);
  process.exit(1);
}

if (html !== before) {
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[sanitize-public-html] Sanitized public homepage HTML');
} else {
  console.log('[sanitize-public-html] No public HTML sanitization needed');
}

// The root not-found boundary is embedded while Next.js renders valid static pages,
// so document metadata declared there can leak into every page. Normalize only the
// exported 404 document after the build instead.
const notFoundPath = path.join(outDir, '404.html');
if (fs.existsSync(notFoundPath)) {
  let notFoundHtml = fs.readFileSync(notFoundPath, 'utf8');
  notFoundHtml = notFoundHtml
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/gi, '')
    .replace(
      /<\/head>/i,
      '<title>Page Not Found | ELIMFILTERS</title><meta name="robots" content="noindex, nofollow"></head>'
    );
  fs.writeFileSync(notFoundPath, notFoundHtml, 'utf8');
  console.log('[sanitize-public-html] Normalized 404 title and robots metadata');
}
