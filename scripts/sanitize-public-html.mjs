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

// Remove the legacy hidden SEO paragraph that conflicts with the current
// distributor-first commercial architecture and makes unsupported blanket
// standards / cross-reference claims.
html = html.replace(
  /ELIMFILTERS® is Kleo Technology LLC's global industrial filtration brand\. We do not sell directly to end users; instead, ELIMFILTERS products are available exclusively through authorized distributors across the Americas and other regions\. ELIMFILTERS engineers advanced contamination control systems for air intake, fuel, hydraulic, oil, and cabin filtration across 12 industries including mining, agriculture, marine, and power generation\. Our products comply with ISO 5011, ISO 16889, and ISO 19438 standards and are cross-referenced to 20,000\+ OEM specifications\./g,
  ''
);

const forbidden = [
  'We do not sell directly to end users',
  'available exclusively through authorized distributors',
  'Our products comply with ISO 5011, ISO 16889, and ISO 19438 standards',
  'cross-referenced to 20,000+ OEM specifications',
];

const remaining = forbidden.filter((phrase) => html.includes(phrase));
if (remaining.length) {
  console.error('[sanitize-public-html] Forbidden public claims remain in index.html:');
  for (const phrase of remaining) console.error(` - ${phrase}`);
  process.exit(1);
}

if (html !== before) {
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[sanitize-public-html] Removed legacy hidden Home claims');
} else {
  console.log('[sanitize-public-html] No legacy hidden Home claims found');
}
