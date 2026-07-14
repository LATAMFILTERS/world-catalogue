import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd(), '..');
const frontendRoot = process.cwd().endsWith(`${path.sep}frontend`)
  ? process.cwd()
  : path.join(repoRoot, 'frontend');

const layoutPath = path.join(frontendRoot, 'src/app/systems/[slug]/layout.tsx');
const pagePath = path.join(frontendRoot, 'src/app/systems/[slug]/page.tsx');
const dataPath = path.join(frontendRoot, 'src/lib/protection-systems-data.ts');

const layout = fs.readFileSync(layoutPath, 'utf8');
const page = fs.readFileSync(pagePath, 'utf8');
const data = fs.readFileSync(dataPath, 'utf8');

const failures = [];

const protectedSystems = [
  'air-intake',
  'fuel-cleanliness',
  'lubrication',
  'hydraulic',
  'cooling-system',
];

for (const slug of protectedSystems) {
  if (!data.includes(`slug: '${slug}'`) && !data.includes(`slug: "${slug}"`)) {
    failures.push(`Missing protected commercial system slug in protection-systems-data.ts: ${slug}`);
  }
}

if (layout.includes('ServerKnowledgeConnections')) {
  failures.push('systems/[slug]/layout.tsx must not render ServerKnowledgeConnections on commercial /systems pages. Keep GEO through CanonicalEntitySchema only.');
}

if (layout.includes('AIEntityCard')) {
  failures.push('systems/[slug]/layout.tsx must not render AIEntityCard on commercial /systems pages. Canonical context belongs in JSON-LD / Citation API / Knowledge Center.');
}

if (!layout.includes('CanonicalEntitySchema')) {
  failures.push('systems/[slug]/layout.tsx must keep CanonicalEntitySchema for GEO / AI citation support.');
}

const forbiddenVisibleLabels = [
  'CANONICAL ENGINEERING CONTEXT',
  'ENGINEERING KNOWLEDGE CONNECTIONS',
  'NEXT ENGINEERING PATH',
  'Recommended Next',
  'Applicable Standards',
  'Industries Served',
  'Explore Further',
];

for (const label of forbiddenVisibleLabels) {
  if (layout.includes(label) || page.includes(label)) {
    failures.push(`Commercial /systems pages must not visibly render duplicate/reference label: ${label}`);
  }
}

const requiredVisibleLabels = [
  'Primary Technologies',
  'Product Families',
];

for (const label of requiredVisibleLabels) {
  if (!page.includes(label)) {
    failures.push(`Commercial /systems/[slug]/page.tsx must keep visible commercial section: ${label}`);
  }
}

if (!page.includes('getFamiliesByProtectionSystem')) {
  failures.push('Commercial /systems/[slug]/page.tsx must keep product-family mapping through getFamiliesByProtectionSystem.');
}

if (!page.includes('getProtectionSystemBySlug')) {
  failures.push('Commercial /systems/[slug]/page.tsx must keep system lookup through getProtectionSystemBySlug.');
}

if (!page.includes('isAirIntake')) {
  failures.push('Air Intake page-specific branch must remain to preserve the approved hero behavior.');
}

if (failures.length) {
  console.error('\n[validate-core-systems-page-guard] FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`[validate-core-systems-page-guard] PASS: protected clean commercial pattern for ${protectedSystems.join(', ')}.`);
