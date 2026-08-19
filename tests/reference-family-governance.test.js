'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  classifyReferenceFamily,
  singleDuty
} = require('../lib/reference-family-audit-policy');
const {
  applyGovernanceToSearchBody,
  applyGovernanceToCatalogResult
} = require('../lib/part-search-reference-governance-patch');

test('single-duty result sets never require HD/LD clarification', () => {
  const body = applyGovernanceToSearchBody({
    results: [
      { sku: 'EL90001', duty: 'HEAVY_DUTY' },
      { sku: 'EL90002', duty: 'HEAVY_DUTY' }
    ]
  }, 'SOME-REF');

  assert.equal(body.resolved_duty, 'HEAVY_DUTY');
  assert.equal(body.duty_clarification_required, false);
  assert.equal(body.duty_resolution, 'SINGLE_DUTY_RESULT_SET');
});

test('mixed-duty result sets still require clarification', () => {
  const body = applyGovernanceToSearchBody({
    results: [
      { sku: 'EL90001', duty: 'HEAVY_DUTY' },
      { sku: 'EF30001', duty: 'LIGHT_DUTY' }
    ]
  }, 'SOME-REF');

  assert.equal(body.duty_clarification_required, true);
  assert.equal(body.resolved_duty, undefined);
});

test('verified 1R1808 family remains restricted to the approved five HD SKUs', () => {
  const input = {
    products: [
      { sku: 'EL80788', duty: 'HEAVY_DUTY' },
      { sku: 'EL81808', duty: 'HEAVY_DUTY' },
      { sku: 'EL84005', duty: 'HEAVY_DUTY' },
      { sku: 'EL84105', duty: 'HEAVY_DUTY' },
      { sku: 'EL84206', duty: 'HEAVY_DUTY' },
      { sku: 'EL87405', duty: 'HEAVY_DUTY' },
      { sku: 'EL87505', duty: 'HEAVY_DUTY' },
      { sku: 'EL89050', duty: 'HEAVY_DUTY' }
    ]
  };
  const result = applyGovernanceToCatalogResult(input, ['1R1808']);
  assert.deepEqual(result.products.map(p => p.sku), ['EL81808', 'EL84005', 'EL84105', 'EL87405', 'EL87505']);
  assert.equal(result.resolvedDuty, 'HEAVY_DUTY');
  assert.equal(result.dutyClarificationRequired, false);
});

test('reference family audit flags cross-duty and thread conflicts as HIGH risk', () => {
  const result = classifyReferenceFamily({
    sku_count: 4,
    duties: ['HEAVY_DUTY', 'LIGHT_DUTY'],
    filter_types: ['oil'],
    thread_sizes: ['1 1/2-16 UN', 'M90X2-7H'],
    governance_states: ['CANONICAL_EVIDENCED', 'REVIEW_DONALDSON_CANDIDATE'],
    min_height_mm: 244,
    max_height_mm: 308,
    min_outer_diameter_mm: 120,
    max_outer_diameter_mm: 136
  });

  assert.equal(result.severity, 'HIGH');
  assert.ok(result.flags.includes('CROSS_DUTY'));
  assert.ok(result.flags.includes('THREAD_CONFLICT'));
  assert.ok(result.flags.includes('UNVERIFIED_BASE_GOVERNANCE'));
});

test('singleDuty returns a duty only when every visible product agrees', () => {
  assert.equal(singleDuty([{ duty: 'HEAVY_DUTY' }, { duty: 'HEAVY_DUTY' }]), 'HEAVY_DUTY');
  assert.equal(singleDuty([{ duty: 'HEAVY_DUTY' }, { duty: 'LIGHT_DUTY' }]), null);
});
