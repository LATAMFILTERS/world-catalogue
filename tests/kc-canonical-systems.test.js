'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8').replace(/^\uFEFF/, '');

test('Knowledge Center consumers receive the canonical five-system registry', () => {
  const barrel = read('frontend/src/lib/knowledge-center-data/index.ts');
  const canonical = read('frontend/src/lib/knowledge-center-data/canonical-systems-registry.ts');

  assert.ok(barrel.includes("export { KC_SYSTEMS } from './canonical-systems-registry';"));
  assert.match(canonical, /system\.slug !== 'cabin-air-protection'/);
  assert.match(canonical, /title: 'Air Intake & Airflow Protection'/);
  assert.match(canonical, /technologies: \['MACROCORE™', 'INTEKCORE™', 'MICROKAPPA™', 'DRYCORE™'\]/);
  assert.match(canonical, /technologies: \['SYNTAPORE™', 'HYDROCORE™', 'TURBOCORE™'\]/);
});

test('legacy cabin and compressed-air system routes consolidate into Air Intake & Airflow', () => {
  const route = read('frontend/src/app/knowledge-center/systems/[slug]/page.tsx');

  assert.match(route, /'cabin-air-protection': 'air-intake-protection'/);
  assert.match(route, /'compressed-air-protection': 'air-intake-protection'/);
  assert.ok(route.includes('robots: isAlias ? { index: false, follow: true } : undefined'));
  assert.ok(route.includes('const url = `https://elimfilters.com/knowledge-center/systems/${resolvedSlug}/`;'));
});
