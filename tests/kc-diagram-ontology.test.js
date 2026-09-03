'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8').replace(/^\uFEFF/, '');

test('public diagram layer normalizes legacy system slugs', () => {
  const canonical = read('frontend/src/lib/knowledge-center-data/canonical-diagram-registry.ts');
  const barrel = read('frontend/src/lib/knowledge-center-data/index.ts');

  assert.match(canonical, /'fuel-cleanliness': 'fuel-cleanliness-protection'/);
  assert.match(canonical, /'cabin-air-protection': 'air-intake-protection'/);
  assert.match(canonical, /'compressed-air-protection': 'air-intake-protection'/);
  assert.ok(barrel.includes("from './canonical-diagram-registry';"));
});

test('cabin diagram does not expose ungoverned DIN 71220 entity', () => {
  const canonical = read('frontend/src/lib/knowledge-center-data/canonical-diagram-registry.ts');
  assert.match(canonical, /diagram\.slug === 'cabin-air-system'/);
  assert.match(canonical, /id !== 'STD-DIN-71220'/);
});
