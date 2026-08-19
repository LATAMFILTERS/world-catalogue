'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8').replace(/^\uFEFF/, '');

const identityConsumers = [
  'frontend/src/lib/canonical-entity-schema.ts',
  'frontend/src/lib/ai-citation-layer.ts',
  'frontend/src/lib/enterprise-seo-geo.ts',
  'frontend/src/lib/rich-results-schema.ts',
  'frontend/src/lib/knowledge-graph-expansion.ts',
];

test('enterprise identity is centralized and technology identity remains #technology', () => {
  const canonical = read('frontend/src/lib/canonical-entity-schema.ts');
  assert.match(canonical, /export function canonicalEntityId/);
  assert.match(canonical, /kind === 'technology'.*#technology/s);
});

test('all enterprise schema layers consume canonical entity identity', () => {
  for (const file of identityConsumers.slice(1)) {
    const source = read(file);
    assert.match(source, /canonicalEntityId/, `${file} must use canonicalEntityId`);
  }
});

test('active enterprise identity layers never manufacture generic #entity IDs', () => {
  for (const file of identityConsumers) {
    const source = read(file);
    assert.doesNotMatch(source, /\$\{[^}]+\}#entity/, `${file} still manufactures a generic #entity ID`);
  }
});
