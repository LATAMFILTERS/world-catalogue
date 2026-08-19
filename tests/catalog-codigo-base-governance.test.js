'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  POLICY_VERSION,
  deriveCodigoBaseGovernance,
} = require('../lib/catalog-codigo-base-governance');
const {
  evaluateCodigoBase,
  lastFourNumericDigits,
  skuUsesCommercialSuffix,
} = require('../lib/catalog-codigo-base-policy');

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

test('HD without Donaldson becomes verified manufacturer fallback review regardless of OEM or aftermarket', () => {
  const result = deriveCodigoBaseGovernance({
    duty: 'HEAVY_DUTY',
    codigo_base: 'FF5320',
    competitor_codes: [{ manufacturer: 'FLEETGUARD', code: 'FF5320' }],
    oem_codes: [{ manufacturer: 'OEM-MAKER', code: 'ABC1234' }],
  });
  assert.equal(result.state, 'REVIEW_DONALDSON_ABSENCE_AND_FALLBACK_SELECTION');
  assert.equal(result.required_authority, 'DONALDSON_THEN_VERIFIED_MANUFACTURER');
  assert.ok(result.observed_fallback_sources.some(x => x.source_column === 'COMPETITOR_CODES' && x.code === 'FF5320'));
  assert.ok(result.observed_fallback_sources.some(x => x.source_column === 'OEM_CODES' && x.code === 'ABC1234'));
});

test('HD verified aftermarket manufacturer can become codigo_base after verified Donaldson absence', () => {
  const row = {
    sku: 'EF95320',
    duty: 'HEAVY_DUTY',
    codigo_base: 'FF5320',
    competitor_codes: [{ manufacturer: 'FLEETGUARD', code: 'FF5320' }],
    oem_codes: [],
    enrichment_data: {
      codigo_base_governance: {
        donaldson_absence_verified: true,
        fallback_manufacturer_verified: true,
        fallback_commercial_code_verified: true,
        approved_codigo_base: 'FF5320',
        approved_manufacturer: 'FLEETGUARD',
        approved_source_column: 'COMPETITOR_CODES',
      },
    },
  };
  const result = evaluateCodigoBase(row);
  assert.equal(result.valid, true);
  assert.equal(result.authority, 'VERIFIED_AFTERMARKET_MANUFACTURER');
  assert.equal(result.expectedSkuSuffix, '5320');
});

test('HD verified OEM manufacturer can become codigo_base and stays in OEM_CODES', () => {
  const row = {
    sku: 'EF91234',
    duty: 'HEAVY_DUTY',
    codigo_base: 'OEM-881234',
    competitor_codes: [],
    oem_codes: [{ manufacturer: 'OEM-MAKER', code: 'OEM-881234' }],
    enrichment_data: {
      codigo_base_governance: {
        donaldson_absence_verified: true,
        fallback_manufacturer_verified: true,
        fallback_commercial_code_verified: true,
        approved_codigo_base: 'OEM-881234',
        approved_manufacturer: 'OEM-MAKER',
        approved_source_column: 'OEM_CODES',
      },
    },
  };
  const result = evaluateCodigoBase(row);
  assert.equal(result.valid, true);
  assert.equal(result.authority, 'VERIFIED_OEM_MANUFACTURER');
});

test('fallback codigo_base cannot be declared as OEM while stored only in competitor_codes', () => {
  const row = {
    sku: 'EF95320',
    duty: 'HEAVY_DUTY',
    codigo_base: 'FF5320',
    competitor_codes: [{ manufacturer: 'FLEETGUARD', code: 'FF5320' }],
    oem_codes: [],
    enrichment_data: {
      codigo_base_governance: {
        donaldson_absence_verified: true,
        fallback_manufacturer_verified: true,
        fallback_commercial_code_verified: true,
        approved_codigo_base: 'FF5320',
        approved_manufacturer: 'FLEETGUARD',
        approved_source_column: 'OEM_CODES',
      },
    },
  };
  const result = evaluateCodigoBase(row);
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'approved_codigo_base_must_exist_in_declared_source_column');
});

test('fallback SKU uses the final four numeric digits of the approved commercial code', () => {
  assert.equal(lastFourNumericDigits('ABC-98-7654-X'), '7654');
  assert.equal(skuUsesCommercialSuffix('EH67654', 'ABC-98-7654-X'), true);
  assert.equal(skuUsesCommercialSuffix('EH61234', 'ABC-98-7654-X'), false);
});

test('HD fallback is blocked when Donaldson absence is not verified', () => {
  const result = evaluateCodigoBase({
    sku: 'EF95320',
    duty: 'HEAVY_DUTY',
    codigo_base: 'FF5320',
    competitor_codes: [{ manufacturer: 'FLEETGUARD', code: 'FF5320' }],
    enrichment_data: { codigo_base_governance: {} },
  });
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'donaldson_absence_verified_requires_verified_evidence');
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

test('LD without MANN evidence requires verified OEM selection', () => {
  const result = deriveCodigoBaseGovernance({
    duty: 'LIGHT_DUTY',
    codigo_base: '23300-0V010',
    oem_codes: [{ manufacturer: 'TOYOTA', code: '23300-0V010' }],
  });
  assert.equal(result.state, 'REVIEW_MANN_ABSENCE_AND_OEM_SELECTION');
  assert.equal(result.required_authority, 'MANN_FILTER_THEN_VERIFIED_OEM');
});
