import fs from 'node:fs';
import path from 'node:path';

const roots = [
  'frontend/src/components',
  'frontend/src/app',
  'frontend/public/locales',
];

const textExtensions = new Set(['.tsx', '.ts', '.jsx', '.js', '.json', '.md', '.txt']);
const changed = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (textExtensions.has(path.extname(entry.name))) normalize(full);
  }
}

function normalize(file) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;

  // Canonical public scale signal.
  after = after.replace(/500,000\+/g, '600,000+');
  after = after.replace(/500,000 cross-reference/gi, '600,000+ cross-reference');
  after = after.replace(/500,000 cross references/gi, '600,000+ cross-reference relationships');

  // Retire legacy universal marketing claims from public-facing copy.
  after = after.replace(/99\.9% capture efficiency/gi, 'product-specific filtration efficiency validated under the applicable test method');
  after = after.replace(/99\.9% filtration efficiency/gi, 'product-specific filtration efficiency validated under the applicable test method');
  after = after.replace(/\+?45% service interval extension/gi, 'service interval matched to validated application data and operating conditions');
  after = after.replace(/-?60% downtime reduction/gi, 'maintenance impact evaluated by application, duty cycle and operating conditions');

  if (after !== before) {
    fs.writeFileSync(file, after);
    changed.push(file);
  }
}

for (const root of roots) walk(root);

console.log(`Normalized ${changed.length} public-facing files.`);
for (const file of changed) console.log(file);
