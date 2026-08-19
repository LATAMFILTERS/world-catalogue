'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { validateCanonicalWrite } = require('../lib/catalog-write-gateway');

function baseRow(overrides = {}) {
  return {
    sku: 'EF91234',
    codigo_base: 'P551234',
    duty: 'HEAVY_DUTY',
    oem_codes: [],
    competitor_codes: [],
    enrichment_data: { codigo_base_governance: {
      primary_manufacturer_verified: true,
      approved_manufacturer: 'DONALDSON',
      approved_codigo_base: 'P551234',
    } },
    ...overrides,
  };
}

test('HD verified Donaldson authority passes gateway', () => {
  assert.equal(validateCanonicalWrite(baseRow()).valid, true);
});

test('HD fallback cannot pass without verified Donaldson absence', () => {
  const row = baseRow({
    sku: 'EF91234', codigo_base: 'FF1234',
    enrichment_data: { codigo_base_governance: {
      primary_manufacturer_verified: false,
      approved_manufacturer: 'FLEETGUARD',
      approved_codigo_base: 'FF1234',
      approved_source_column: 'COMPETITOR_CODES',
      fallback_manufacturer_verified: true,
      fallback_commercial_code_verified: true,
    } },
  });
  const result = validateCanonicalWrite(row);
  assert.equal(result.valid, false);
  assert.ok(result.reasons.includes('DONALDSON_ABSENCE_NOT_VERIFIED'));
});

test('HD verified aftermarket fallback passes and codigo_base need not be duplicated', () => {
  const row = baseRow({
    sku: 'EF91234', codigo_base: 'FF1234',
    competitor_codes: [{ manufacturer: 'BALDWIN', code: 'BF9999', classification: 'AFTERMARKET' }],
    enrichment_data: { codigo_base_governance: {
      donaldson_absence_verified: true,
      fallback_manufacturer_verified: true,
      fallback_commercial_code_verified: true,
      approved_manufacturer: 'FLEETGUARD',
      approved_codigo_base: 'FF1234',
      approved_source_column: 'COMPETITOR_CODES',
    } },
  });
  assert.equal(validateCanonicalWrite(row).valid, true);
});

test('OEM reference in competitor_codes is blocked', () => {
  const row = baseRow({ competitor_codes: [{ manufacturer: 'OEM', code: 'ABC123', classification: 'OEM' }] });
  const result = validateCanonicalWrite(row);
  assert.equal(result.valid, false);
  assert.ok(result.reasons.includes('OEM_IN_COMPETITOR_CODES'));
});

test('aftermarket reference in oem_codes is blocked', () => {
  const row = baseRow({ oem_codes: [{ manufacturer: 'BRAND', code: 'ABC123', classification: 'AFTERMARKET' }] });
  const result = validateCanonicalWrite(row);
  assert.equal(result.valid, false);
  assert.ok(result.reasons.includes('AFTERMARKET_IN_OEM_CODES'));
});

test('LD fallback requires verified MANN absence and OEM classification', () => {
  const row = {
    sku: 'EF31234', codigo_base: 'OEM1234', duty: 'LIGHT_DUTY', oem_codes: [], competitor_codes: [],
    enrichment_data: { codigo_base_governance: {
      mann_absence_verified: true,
      fallback_manufacturer_verified: true,
      fallback_commercial_code_verified: true,
      approved_manufacturer: 'OEM',
      approved_codigo_base: 'OEM1234',
      approved_source_column: 'OEM_CODES',
    } },
  };
  assert.equal(validateCanonicalWrite(row).valid, true);
});
