'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  governanceForReferences,
  filterProductsForGovernance,
  applyGovernanceToCatalogResult,
  applyGovernanceToSearchBody,
  singleDutyFromProducts
} = require('../lib/part-search-reference-governance-patch');

const candidates = [
  { sku: 'EL80788', duty: 'HEAVY_DUTY' },
  { sku: 'EL81808', duty: 'HEAVY_DUTY' },
  { sku: 'EL84005', duty: 'HEAVY_DUTY' },
  { sku: 'EL84105', duty: 'HEAVY_DUTY' },
  { sku: 'EL84206', duty: 'HEAVY_DUTY' },
  { sku: 'EL87405', duty: 'HEAVY_DUTY' },
  { sku: 'EL87505', duty: 'HEAVY_DUTY' },
  { sku: 'EL89050', duty: 'HEAVY_DUTY' }
];

test('1R1808 governance contains the verified five-SKU HD family', () => {
  const policy = governanceForReferences(['1R-1808']);
  assert.ok(policy);
  assert.equal(policy.duty, 'HEAVY_DUTY');
  assert.deepEqual(policy.approvedSkus, ['EL81808', 'EL84005', 'EL84105', 'EL87405', 'EL87505']);
});

test('1R1808 excludes secondary cross-reference contamination', () => {
  const policy = governanceForReferences(['1R1808']);
  const filtered = filterProductsForGovernance(candidates, policy);
  assert.deepEqual(filtered.map(x => x.sku), ['EL81808', 'EL84005', 'EL84105', 'EL87405', 'EL87505']);
  assert.ok(!filtered.some(x => ['EL80788', 'EL84206', 'EL89050'].includes(x.sku)));
});

test('catalog result is resolved as HD without a duty clarification', () => {
  const result = applyGovernanceToCatalogResult({ products: candidates, lookupStatus: 'completed' }, ['1R1808']);
  assert.equal(result.resolvedDuty, 'HEAVY_DUTY');
  assert.equal(result.dutyResolution, 'REFERENCE_GOVERNANCE');
  assert.equal(result.products.length, 5);
  assert.equal(singleDutyFromProducts(result.products), 'HEAVY_DUTY');
});

test('public search response exposes fixed duty and five approved results', () => {
  const body = applyGovernanceToSearchBody({ results: candidates }, '1R1808');
  assert.equal(body.resolved_duty, 'HEAVY_DUTY');
  assert.equal(body.duty_clarification_required, false);
  assert.deepEqual(body.results.map(x => x.sku), ['EL81808', 'EL84005', 'EL84105', 'EL87405', 'EL87505']);
});
