'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { isPartNumberLike, classifyReferenceFamily } = require('../lib/reference-family-audit-policy');

test('part-number classifier accepts catalog references with digits', () => {
  assert.equal(isPartNumberLike('1R1808'), true);
  assert.equal(isPartNumberLike('P551808'), true);
  assert.equal(isPartNumberLike('LF691'), true);
  assert.equal(isPartNumberLike('86528'), true);
});

test('part-number classifier rejects manufacturer and field-label contamination', () => {
  for (const value of ['DONGFENGMOTOR', 'FISPA', 'PERMATIC', 'DIEXA', 'FINDIAMETER']) {
    assert.equal(isPartNumberLike(value), false, value);
  }
});

test('conflicting physical families remain high risk after metadata filtering', () => {
  const result = classifyReferenceFamily({
    sku_count: 8,
    duties: ['HEAVY_DUTY'],
    filter_types: ['oil', 'fuel'],
    thread_sizes: ['1 1/2-16 UN', 'M90X2-7H'],
    governance_states: ['REVIEW_DONALDSON_CANDIDATE'],
    min_height_mm: 244,
    max_height_mm: 308,
    min_outer_diameter_mm: 118,
    max_outer_diameter_mm: 136
  });
  assert.equal(result.severity, 'HIGH');
  assert.ok(result.flags.includes('THREAD_CONFLICT'));
  assert.ok(result.flags.includes('UNVERIFIED_BASE_GOVERNANCE'));
});
