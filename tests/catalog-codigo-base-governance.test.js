'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  POLICY_VERSION,
  deriveCodigoBaseGovernance,
} = require('../lib/catalog-codigo-base-governance');

test('HD evidenced Donaldson base is canonical', () => {
  const result = deriveCodigoBaseGovernance({
    duty: 'HEAVY_DUTY',
    codigo_base: 'P551313',
    competitor_codes: [
      { manufacturer: 'DONALDSON', code: 'P551313' },
      { manufacturer: 'FLEETGUARD', code: 'FF5320' },
    ],
  });
  assert.equal(result.policy_version, POLICY_VERSION);
  assert.equal(result.state, 'CANONICAL_EVIDENCED');
  assert.equal(result.required_authority, 'DONALDSON');
});

test('HD Donaldson candidate never mutates unknown current base by inference', () => {
  const result = deriveCodigoBaseGovernance({
    duty: 'HEAVY_DUTY',
    codigo_base: 'P500125',
    competitor_codes: [{ manufacturer: 'DONALDSON', code: 'J8570601' }],
  });
  assert.equal(result.state, 'REVIEW_DONALDSON_CANDIDATE');
  assert.equal(result.current_codigo_base, 'P500125');
  assert.deepEqual(result.observed_preferred_candidates, ['J8570601']);
});

test('HD Fleetguard evidence without Donaldson becomes absence review, not canonical fallback', () => {
  const result = deriveCodigoBaseGovernance({
    duty: 'HEAVY_DUTY',
    codigo_base: 'FF5320',
    competitor_codes: [{ manufacturer: 'FLEETGUARD', code: 'FF5320' }],
  });
  assert.equal(result.state, 'REVIEW_DONALDSON_ABSENCE');
  assert.equal(result.required_authority, 'DONALDSON_THEN_FLEETGUARD');
});

test('HD without Donaldson or Fleetguard evidence requires full fallback review', () => {
  const result = deriveCodigoBaseGovernance({
    duty: 'HEAVY_DUTY',
    codigo_base: 'OEM123',
    oem_codes: [{ manufacturer: 'OEM', code: 'OEM123' }],
  });
  assert.equal(result.state, 'REVIEW_DONALDSON_AND_FLEETGUARD_ABSENCE');
  assert.equal(result.required_authority, 'DONALDSON_THEN_FLEETGUARD_THEN_OEM');
});

test('LD evidenced MANN-FILTER base is canonical', () => {
  const result = deriveCodigoBaseGovernance({
    duty: 'LIGHT_DUTY',
    codigo_base: 'WK842',
    competitor_codes: [{ manufacturer: 'MANN-FILTER', code: 'WK842' }],
  });
  assert.equal(result.state, 'CANONICAL_EVIDENCED');
  assert.equal(result.required_authority, 'MANN_FILTER');
});

test('LD MANN candidate is review only when current base differs', () => {
  const result = deriveCodigoBaseGovernance({
    duty: 'LIGHT_DUTY',
    codigo_base: 'OEM456',
    competitor_codes: [{ manufacturer: 'MANN-FILTER', code: 'WK842' }],
  });
  assert.equal(result.state, 'REVIEW_MANN_CANDIDATE');
  assert.equal(result.current_codigo_base, 'OEM456');
});

test('LD without MANN evidence requires MANN absence review', () => {
  const result = deriveCodigoBaseGovernance({
    duty: 'LIGHT_DUTY',
    codigo_base: '23300-0V010',
    oem_codes: [{ manufacturer: 'TOYOTA', code: '23300-0V010' }],
  });
  assert.equal(result.state, 'REVIEW_MANN_ABSENCE');
  assert.equal(result.required_authority, 'MANN_FILTER_THEN_OEM');
});
