'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateCodigoBase } = require('../lib/catalog-codigo-base-policy');

test('HD uses Donaldson when Donaldson evidence exists', () => {
  const row = {
    duty: 'HEAVY_DUTY',
    codigo_base: 'P551313',
    competitor_codes: [
      { manufacturer: 'DONALDSON', code: 'P551313' },
      { manufacturer: 'FLEETGUARD', code: 'FF5320' },
    ],
  };
  assert.deepEqual(evaluateCodigoBase(row), { valid: true, authority: 'DONALDSON' });
});

test('HD rejects Fleetguard while Donaldson evidence exists', () => {
  const result = evaluateCodigoBase({
    duty: 'HEAVY_DUTY',
    codigo_base: 'FF5320',
    competitor_codes: [
      { manufacturer: 'DONALDSON', code: 'P551313' },
      { manufacturer: 'FLEETGUARD', code: 'FF5320' },
    ],
  });
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'donaldson_reference_must_be_codigo_base');
});

test('HD Fleetguard fallback requires verified Donaldson absence', () => {
  const base = {
    duty: 'HEAVY_DUTY',
    codigo_base: 'FF5320',
    competitor_codes: [{ manufacturer: 'FLEETGUARD', code: 'FF5320' }],
  };
  assert.equal(evaluateCodigoBase(base).valid, false);
  assert.deepEqual(
    evaluateCodigoBase({
      ...base,
      enrichment_data: { codigo_base_governance: { donaldson_absence_verified: true } },
    }),
    { valid: true, authority: 'FLEETGUARD' }
  );
});

test('HD OEM fallback requires complete verified evidence', () => {
  const base = { duty: 'HEAVY_DUTY', codigo_base: 'OEM123' };
  assert.equal(evaluateCodigoBase(base).valid, false);
  assert.deepEqual(
    evaluateCodigoBase({
      ...base,
      enrichment_data: {
        codigo_base_governance: {
          donaldson_absence_verified: true,
          fleetguard_absence_verified: true,
          oem_commercial_code_verified: true,
        },
      },
    }),
    { valid: true, authority: 'OEM' }
  );
});

test('LD uses MANN-FILTER when MANN evidence exists', () => {
  assert.deepEqual(
    evaluateCodigoBase({
      duty: 'LIGHT_DUTY',
      codigo_base: 'WK842',
      competitor_codes: [{ manufacturer: 'MANN-FILTER', code: 'WK842' }],
    }),
    { valid: true, authority: 'MANN_FILTER' }
  );
});

test('LD OEM fallback requires verified MANN absence and commercial OEM code', () => {
  const base = { duty: 'LIGHT_DUTY', codigo_base: 'OEM456' };
  assert.equal(evaluateCodigoBase(base).valid, false);
  assert.deepEqual(
    evaluateCodigoBase({
      ...base,
      enrichment_data: {
        codigo_base_governance: {
          mann_absence_verified: true,
          oem_commercial_code_verified: true,
        },
      },
    }),
    { valid: true, authority: 'OEM' }
  );
});
