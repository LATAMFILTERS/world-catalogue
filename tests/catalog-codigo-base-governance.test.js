'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { POLICY_VERSION, deriveCodigoBaseGovernance } = require('../lib/catalog-codigo-base-governance');
const { evaluateCodigoBase } = require('../lib/catalog-codigo-base-policy');

test('V3.1 policy version is active', () => {
  assert.equal(POLICY_VERSION, '2026-08-19-v3.1');
});

test('HD observed Donaldson base is evidenced but not called verified without explicit authority', () => {
  const row = {
    duty: 'HEAVY_DUTY', sku: 'EF91313', codigo_base: 'P551313',
    competitor_codes: [{ manufacturer: 'DONALDSON', code: 'P551313' }],
  };
  const result = deriveCodigoBaseGovernance(row);
  assert.equal(result.state, 'CANONICAL_EVIDENCED_NOT_VERIFIED');
  assert.equal(result.required_authority, 'VERIFY_DONALDSON_MANUFACTURING_AUTHORITY');
  assert.equal(evaluateCodigoBase(row).valid, false);
});

test('HD explicitly verified Donaldson authority is canonical verified without duplicating codigo_base', () => {
  const row = {
    duty: 'HEAVY_DUTY', sku: 'EF91313', codigo_base: 'P551313', competitor_codes: [], oem_codes: [],
    enrichment_data: { codigo_base_governance: {
      primary_manufacturer_verified: true,
      approved_manufacturer: 'DONALDSON',
      approved_codigo_base: 'P551313',
    } },
  };
  assert.equal(deriveCodigoBaseGovernance(row).state, 'CANONICAL_VERIFIED');
  assert.equal(evaluateCodigoBase(row).authority, 'VERIFIED_DONALDSON');
});

test('HD Donaldson candidate cannot silently preserve a different base', () => {
  const result = deriveCodigoBaseGovernance({
    duty: 'HEAVY_DUTY', sku: 'EF90001', codigo_base: 'FF1234',
    competitor_codes: [{ manufacturer: 'DONALDSON', code: 'P551234' }],
  });
  assert.equal(result.state, 'REVIEW_PRIMARY_CANDIDATE');
  assert.deepEqual(result.observed_primary_candidates, ['P551234']);
});

test('absence of Donaldson in JSONB is not manufacturing absence evidence', () => {
  const row = {
    duty: 'HEAVY_DUTY', sku: 'EF91234', codigo_base: 'FF1234',
    competitor_codes: [{ manufacturer: 'FLEETGUARD', code: 'FF1234' }],
  };
  assert.equal(deriveCodigoBaseGovernance(row).state, 'VERIFY_PRIMARY_ABSENCE');
  assert.equal(evaluateCodigoBase(row).reason, 'donaldson_manufacturing_absence_requires_verified_evidence');
});

test('HD verified aftermarket fallback is canonical without duplicating codigo_base in competitor_codes', () => {
  const row = {
    duty: 'HEAVY_DUTY', sku: 'EF91234', codigo_base: 'FF1234',
    competitor_codes: [{ manufacturer: 'BALDWIN', code: 'BF9999' }],
    oem_codes: [{ manufacturer: 'OEM', code: 'OEM7777' }],
    enrichment_data: { codigo_base_governance: {
      donaldson_absence_verified: true,
      fallback_manufacturer_verified: true,
      fallback_commercial_code_verified: true,
      approved_manufacturer: 'FLEETGUARD',
      approved_codigo_base: 'FF1234',
      approved_source_column: 'COMPETITOR_CODES',
    } },
  };
  const result = deriveCodigoBaseGovernance(row);
  assert.equal(result.state, 'CANONICAL_VERIFIED');
  assert.equal(result.required_authority, 'VERIFIED_AFTERMARKET_FALLBACK');
  assert.equal(evaluateCodigoBase(row).valid, true);
});

test('HD verified OEM fallback is canonical while alternate columns remain independent', () => {
  const row = {
    duty: 'HEAVY_DUTY', sku: 'EH67890', codigo_base: 'OEM7890',
    competitor_codes: [{ manufacturer: 'AFTERMARKET', code: 'AF1111' }],
    oem_codes: [{ manufacturer: 'OEM', code: 'OEM2222' }],
    enrichment_data: { codigo_base_governance: {
      donaldson_absence_verified: true,
      fallback_manufacturer_verified: true,
      fallback_commercial_code_verified: true,
      approved_manufacturer: 'OEM',
      approved_codigo_base: 'OEM7890',
      approved_source_column: 'OEM_CODES',
    } },
  };
  assert.equal(deriveCodigoBaseGovernance(row).state, 'CANONICAL_VERIFIED');
  assert.equal(evaluateCodigoBase(row).authority, 'VERIFIED_OEM_FALLBACK');
});

test('HD fallback detects last-four SKU suffix mismatch', () => {
  const row = {
    duty: 'HEAVY_DUTY', sku: 'EF90001', codigo_base: 'FF1234',
    enrichment_data: { codigo_base_governance: {
      donaldson_absence_verified: true,
      fallback_manufacturer_verified: true,
      fallback_commercial_code_verified: true,
      approved_manufacturer: 'FLEETGUARD',
      approved_codigo_base: 'FF1234',
      approved_source_column: 'COMPETITOR_CODES',
    } },
  };
  assert.equal(deriveCodigoBaseGovernance(row).state, 'SKU_SUFFIX_REVIEW');
  assert.equal(evaluateCodigoBase(row).valid, false);
});

test('LD observed MANN-FILTER base is evidenced but not verified without explicit authority', () => {
  const row = {
    duty: 'LIGHT_DUTY', sku: 'EF30842', codigo_base: 'WK842',
    competitor_codes: [{ manufacturer: 'MANN-FILTER', code: 'WK842' }],
  };
  assert.equal(deriveCodigoBaseGovernance(row).state, 'CANONICAL_EVIDENCED_NOT_VERIFIED');
  assert.equal(evaluateCodigoBase(row).valid, false);
});

test('LD explicitly verified MANN-FILTER authority is canonical verified', () => {
  const row = {
    duty: 'LIGHT_DUTY', sku: 'EF30842', codigo_base: 'WK842', competitor_codes: [], oem_codes: [],
    enrichment_data: { codigo_base_governance: {
      primary_manufacturer_verified: true,
      approved_manufacturer: 'MANN-FILTER',
      approved_codigo_base: 'WK842',
    } },
  };
  assert.equal(deriveCodigoBaseGovernance(row).state, 'CANONICAL_VERIFIED');
  assert.equal(evaluateCodigoBase(row).authority, 'VERIFIED_MANN_FILTER');
});

test('LD missing MANN reference remains an absence-verification case', () => {
  const result = deriveCodigoBaseGovernance({
    duty: 'LIGHT_DUTY', sku: 'EF34421', codigo_base: '77024-42110',
    oem_codes: [{ manufacturer: 'TOYOTA', code: '23300-0V010' }],
  });
  assert.equal(result.state, 'VERIFY_PRIMARY_ABSENCE');
});

test('high-cardinality alternate columns are flagged without inventing equivalence', () => {
  const oem = Array.from({ length: 101 }, (_, i) => ({ manufacturer: 'OEM', code: `OEM${1000 + i}` }));
  const result = deriveCodigoBaseGovernance({ duty: 'HEAVY_DUTY', sku: 'EF91234', codigo_base: 'FF1234', oem_codes: oem });
  assert.ok(result.contamination_flags.includes('OEM_CODES_HIGH_CARDINALITY'));
});
