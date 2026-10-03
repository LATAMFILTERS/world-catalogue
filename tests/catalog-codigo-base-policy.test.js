'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateCodigoBase, POLICY_VERSION } = require('../lib/catalog-codigo-base-policy');

function gov(overrides = {}) {
  return { enrichment_data: { codigo_base_governance: overrides } };
}

test('V3.2 policy is active', () => {
  assert.equal(POLICY_VERSION, '2026-10-02-v3.2');
});

test('HD verified Donaldson is primary authority', () => {
  const row = {
    duty: 'HEAVY_DUTY', sku: 'EF91234', codigo_base: 'P551234',
    oem_codes: [], competitor_codes: [],
    ...gov({ primary_manufacturer_verified: true, approved_manufacturer: 'DONALDSON', approved_codigo_base: 'P551234' }),
  };
  assert.equal(evaluateCodigoBase(row).authority, 'VERIFIED_DONALDSON');
});
test('HD Fleetguard requires verified Donaldson absence and explicit Fleetguard authority', () => {
  const row = {
    duty: 'HEAVY_DUTY', sku: 'ED47754', codigo_base: 'AD27754',
    oem_codes: [], competitor_codes: [{ manufacturer: 'FLEETGUARD', code: 'AD27754' }],
    ...gov({
      donaldson_absence_verified: true,
      fallback_manufacturer_verified: true,
      fallback_commercial_code_verified: true,
      approved_manufacturer: 'FLEETGUARD',
      approved_codigo_base: 'AD27754',
      approved_source_column: 'COMPETITOR_CODES',
    }),
  };
  assert.equal(evaluateCodigoBase(row).authority, 'VERIFIED_FLEETGUARD_FALLBACK');
});

test('HD OEM cannot be used until Donaldson and Fleetguard absence are both verified', () => {
  const base = {
    duty: 'HEAVY_DUTY', sku: 'ED45295', codigo_base: '0004295295',
    oem_codes: [], competitor_codes: [],
    ...gov({
      donaldson_absence_verified: true,
      fallback_manufacturer_verified: true,
      fallback_commercial_code_verified: true,
      approved_manufacturer: 'MERCEDES-BENZ',
      approved_codigo_base: '0004295295',
      approved_source_column: 'OEM_CODES',
    }),
  };
  const blocked = evaluateCodigoBase(base);
  assert.equal(blocked.valid, false);
  assert.equal(blocked.authority, 'VERIFY_FLEETGUARD_ABSENCE');
  const allowed = evaluateCodigoBase({
    ...base,
    ...gov({
      donaldson_absence_verified: true,
      fleetguard_absence_verified: true,
      fallback_manufacturer_verified: true,
      fallback_commercial_code_verified: true,
      approved_manufacturer: 'MERCEDES-BENZ',
      approved_codigo_base: '0004295295',
      approved_source_column: 'OEM_CODES',
    }),
  });
  assert.equal(allowed.authority, 'VERIFIED_OEM_FALLBACK');
});

test('generic HD aftermarket fallback is rejected', () => {
  const row = {
    duty: 'HEAVY_DUTY', sku: 'EF99999', codigo_base: 'BF9999',
    oem_codes: [], competitor_codes: [{ manufacturer: 'BALDWIN', code: 'BF9999' }],
    ...gov({
      donaldson_absence_verified: true,
      fallback_manufacturer_verified: true,
      fallback_commercial_code_verified: true,
      approved_manufacturer: 'BALDWIN',
      approved_codigo_base: 'BF9999',
      approved_source_column: 'COMPETITOR_CODES',
    }),
  };
  assert.equal(evaluateCodigoBase(row).valid, false);
});
