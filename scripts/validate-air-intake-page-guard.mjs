import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const layoutPath = path.join(root, 'frontend/src/app/systems/[slug]/layout.tsx');
const pagePath = path.join(root, 'frontend/src/app/systems/[slug]/page.tsx');

const layout = fs.readFileSync(layoutPath, 'utf8');
const page = fs.readFileSync(pagePath, 'utf8');

const failures = [];

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

if (!page.includes('isAirIntake')) {
  failures.push('Air Intake page-specific guard expects isAirIntake branch to preserve the approved hero behavior.');
}

if (failures.length) {
  console.error('\n[validate-air-intake-page-guard] FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[validate-air-intake-page-guard] PASS: /systems/air-intake commercial page is protected.');
