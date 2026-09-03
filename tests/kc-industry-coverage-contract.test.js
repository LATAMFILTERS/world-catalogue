'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8').replace(/^\uFEFF/, '');

test('Knowledge Center publishes the full canonical 12-market industry portfolio', () => {
  const page = read('frontend/src/app/knowledge-center/industries/page.tsx');
  const registry = read('frontend/src/lib/knowledge-center-data/canonical-industries-registry.ts');
  const barrel = read('frontend/src/lib/knowledge-center-data/index.ts');

  assert.match(page, /Twelve industry-specific technical profiles/);
  assert.match(page, /Automotive &amp; Light Duty and Bus &amp; Coach/);
  assert.match(registry, /slug: 'automotive'/);
  assert.match(registry, /slug: 'bus-coach'/);
  assert.ok(barrel.includes("export { KC_INDUSTRIES } from './canonical-industries-registry';"));
  assert.doesNotMatch(page, /8 industrial verticals/);
  assert.doesNotMatch(page, /10 evidence-backed technical industry profiles/);
});

test('Automotive and Bus Coach have dedicated technical Knowledge Center details', () => {
  const details = read('frontend/src/lib/knowledge-center-data/canonical-industry-details.ts');

  assert.match(details, /const AUTOMOTIVE_DETAIL: KCIndustryDetail/);
  assert.match(details, /const BUS_COACH_DETAIL: KCIndustryDetail/);
  assert.match(details, /'bus-coach': BUS_COACH_DETAIL/);
  assert.match(details, /automotive: AUTOMOTIVE_DETAIL/);
  assert.match(details, /Year \+ make \+ model \+ engine/);
  assert.match(details, /Stop-and-go \+ scheduled route service/);
});

test('Knowledge Center industry hub uses canonical trailing-slash URLs and 12-item schema', () => {
  const page = read('frontend/src/app/knowledge-center/industries/page.tsx');

  assert.match(page, /href={`\/knowledge-center\/industries\/\$\{industry\.slug\}\/`}/);
  assert.match(page, /url: 'https:\/\/elimfilters\.com\/knowledge-center\/industries\/'/);
  assert.match(page, /numberOfItems: KC_INDUSTRIES\.length/);
  assert.match(page, /knowledge-center\/industries\/\$\{industry\.slug\}\//);
});
