import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'frontend', 'out');
const failures = [];

const strategicPages = [
  path.join(out, 'industries', 'mining', 'index.html'),
  path.join(out, 'industries', 'trucks-fleets', 'index.html'),
  path.join(out, 'industries', 'power-generation', 'index.html'),
  path.join(out, 'technologies', 'macrocore', 'index.html'),
];

for (const file of strategicPages) {
  if (!fs.existsSync(file)) {
    failures.push(`strategic conversion page missing: ${path.relative(out, file)}`);
    continue;
  }

  const html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(out, file);
  const isMacrocore = relative === path.join('technologies', 'macrocore', 'index.html');

  const hasProductIntelligence =
    html.includes('data-conversion-action="product-intelligence"') ||
    (isMacrocore && html.includes('Find an OEM Equivalent'));

  const hasApplicationSupport =
    html.includes('data-conversion-action="application-support"') ||
    (isMacrocore && html.includes('Request an Engineering Assessment'));

  if (!hasProductIntelligence) {
    failures.push(`product-intelligence conversion action missing: ${relative}`);
  }
  if (!hasApplicationSupport) {
    failures.push(`application-support conversion action missing: ${relative}`);
  }
  if (!html.includes('https://part-search.elimfilters.com')) {
    failures.push(`Part Search path missing: ${relative}`);
  }
  if (!isMacrocore && !html.includes('/contact/')) {
    failures.push(`application support contact path missing: ${relative}`);
  }
}

if (failures.length) {
  console.error('[validate-conversion-layer] FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('[validate-conversion-layer] PASS — strategic pages expose product-intelligence and application-support conversion paths');
