'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8').replace(/^\uFEFF/, '');

test('public industry details consolidate cabin and compressed air into Air Intake & Airflow', () => {
  const barrel = read('frontend/src/lib/knowledge-center-data/index.ts');
  const canonical = read('frontend/src/lib/knowledge-center-data/canonical-industry-details.ts');

  assert.ok(barrel.includes("export { KC_INDUSTRY_DETAILS } from './canonical-industry-details';"));
  assert.match(canonical, /'Cabin Air Protection': 'Air Intake & Airflow Protection'/);
  assert.match(canonical, /'Compressed Air Protection': 'Air Intake & Airflow Protection'/);
  assert.ok(canonical.includes('[...new Set('));
});

test('marine public output does not make unsupported certification claims', () => {
  const canonical = read('frontend/src/lib/knowledge-center-data/canonical-industry-details.ts');

  assert.doesNotMatch(canonical, /IMO-certified/);
  assert.match(canonical, /Any certification or compliance claim requires verified product- and application-specific evidence before public use/);
  assert.match(canonical, /Specialized marine solution/);
});

test('Knowledge Center industry detail canonicals follow trailing-slash policy', () => {
  const route = read('frontend/src/app/knowledge-center/industries/[slug]/page.tsx');
  assert.ok(route.includes('const url = `https://elimfilters.com/knowledge-center/industries/${slug}/`;'));
});
