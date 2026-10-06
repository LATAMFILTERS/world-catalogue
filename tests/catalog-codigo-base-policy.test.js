'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  evaluateCodigoBase,
  POLICY_VERSION,
  planHdSkuFromVerifiedAuthorities,
} = require('../lib/catalog-codigo-base-policy');

function gov(overrides = {}) {
  return { enrichment_data: { codigo_base_governance: overrides } };
}

test('V4.2 policy is active', () => {
  assert.equal(POLICY_VERSION, '2026-10-06-v4.2');
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

test('LD European uses MANN-FILTER as primary and OEM only after verified MANN absence', () => {
  const primary = {
    duty: 'LIGHT_DUTY', sku: 'EL12345', codigo_base: 'HU1234X',
    oem_codes: [], competitor_codes: [],
    ...gov({
      origin_group: 'EUROPEAN',
      primary_manufacturer_verified: true,
      approved_manufacturer: 'MANN-FILTER',
      approved_codigo_base: 'HU1234X',
    }),
  };
  assert.equal(evaluateCodigoBase(primary).authority, 'VERIFIED_MANN_FILTER');

  const fallback = {
    duty: 'LIGHT_DUTY', sku: 'EL54321', codigo_base: 'A123456789',
    oem_codes: [], competitor_codes: [],
    ...gov({
      origin_group: 'EUROPEAN',
      mann_absence_verified: true,
      fallback_manufacturer_verified: true,
      fallback_commercial_code_verified: true,
      approved_manufacturer: 'BMW',
      approved_codigo_base: 'A123456789',
      approved_source_column: 'OEM_CODES',
    }),
  };
  assert.equal(evaluateCodigoBase(fallback).authority, 'VERIFIED_OEM_FALLBACK');
});

test('LD non-European uses FRAM as primary and OEM only after verified FRAM absence', () => {
  const primary = {
    duty: 'LIGHT_DUTY', sku: 'EL24680', codigo_base: 'PH6607',
    oem_codes: [], competitor_codes: [],
    ...gov({
      origin_group: 'NON_EUROPEAN',
      primary_manufacturer_verified: true,
      approved_manufacturer: 'FRAM',
      approved_codigo_base: 'PH6607',
    }),
  };
  assert.equal(evaluateCodigoBase(primary).authority, 'VERIFIED_FRAM');

  const blocked = {
    duty: 'LIGHT_DUTY', sku: 'EL13579', codigo_base: '15208-65F0E',
    oem_codes: [], competitor_codes: [],
    ...gov({
      origin_group: 'NON_EUROPEAN',
      fallback_manufacturer_verified: true,
      fallback_commercial_code_verified: true,
      approved_manufacturer: 'NISSAN',
      approved_codigo_base: '15208-65F0E',
      approved_source_column: 'OEM_CODES',
    }),
  };
  assert.equal(evaluateCodigoBase(blocked).authority, 'VERIFY_FRAM_ABSENCE');

  blocked.enrichment_data.codigo_base_governance.fram_absence_verified = true;
  assert.equal(evaluateCodigoBase(blocked).authority, 'VERIFIED_OEM_FALLBACK');
});


test('HD SKU collision falls from Donaldson to Fleetguard without synthetic discriminator', () => {
  const plan = planHdSkuFromVerifiedAuthorities({
    prefix: 'EA1',
    verifiedDonaldsonCode: 'P821575',
    verifiedFleetguardCode: 'AF25551',
    verifiedOemCode: 'M131802',
    occupiedSkus: {
      EA11575: { codigo_base: 'P541575' },
    },
  });
  assert.equal(plan.status, 'READY');
  assert.equal(plan.sku, 'EA15551');
  assert.equal(plan.selected_manufacturer, 'FLEETGUARD');
  assert.equal(plan.selected_code, 'AF25551');
  assert.equal(plan.attempts[0].status, 'SKU_COLLISION');
  assert.equal(plan.attempts[0].occupied_by_code, 'P541575');
});

test('HD SKU collision falls from Fleetguard to OEM when both preferred slots are occupied', () => {
  const plan = planHdSkuFromVerifiedAuthorities({
    prefix: 'EA1',
    verifiedDonaldsonCode: 'P821575',
    verifiedFleetguardCode: 'AF25551',
    verifiedOemCode: 'M131802',
    occupiedSkus: {
      EA11575: { codigo_base: 'P541575' },
      EA15551: { codigo_base: 'AF15551' },
    },
  });
  assert.equal(plan.status, 'READY');
  assert.equal(plan.sku, 'EA11802');
  assert.equal(plan.selected_manufacturer, 'OEM');
  assert.equal(plan.selected_code, 'M131802');
});

test('HD SKU collision stops review when Donaldson Fleetguard and OEM slots are all occupied', () => {
  const plan = planHdSkuFromVerifiedAuthorities({
    prefix: 'EA1',
    verifiedDonaldsonCode: 'P821575',
    verifiedFleetguardCode: 'AF25551',
    verifiedOemCode: 'M131802',
    occupiedSkus: {
      EA11575: { codigo_base: 'P541575' },
      EA15551: { codigo_base: 'AF15551' },
      EA11802: { codigo_base: 'P181802' },
    },
  });
  assert.equal(plan.status, 'STOP_REVIEW');
  assert.equal(plan.sku, null);
});

test('HD Fleetguard collision fallback is valid only with explicit Donaldson collision governance', () => {
  const row = {
    duty: 'HEAVY_DUTY',
    sku: 'EA15551',
    codigo_base: 'AF25551',
    canonical_source_brand: 'DONALDSON',
    canonical_source_code: 'P821575',
    oem_codes: [{ manufacturer: 'JOHN DEERE', code: 'M131802' }],
    competitor_codes: [{ manufacturer: 'FLEETGUARD', code: 'AF25551' }],
    ...gov({
      primary_manufacturer_verified: true,
      donaldson_sku_collision_verified: true,
      collision_donaldson_code: 'P821575',
      fallback_manufacturer_verified: true,
      fallback_commercial_code_verified: true,
      approved_manufacturer: 'FLEETGUARD',
      approved_codigo_base: 'AF25551',
      approved_source_column: 'COMPETITOR_CODES',
    }),
  };
  assert.equal(evaluateCodigoBase(row).authority, 'VERIFIED_FLEETGUARD_COLLISION_FALLBACK');

  row.enrichment_data.codigo_base_governance.donaldson_sku_collision_verified = false;
  assert.equal(evaluateCodigoBase(row).valid, false);
});

test('HD OEM collision fallback requires both Donaldson and Fleetguard SKU collisions', () => {
  const row = {
    duty: 'HEAVY_DUTY',
    sku: 'EA11802',
    codigo_base: 'M131802',
    canonical_source_brand: 'DONALDSON',
    canonical_source_code: 'P821575',
    oem_codes: [{ manufacturer: 'JOHN DEERE', code: 'M131802' }],
    competitor_codes: [{ manufacturer: 'FLEETGUARD', code: 'AF25551' }],
    ...gov({
      primary_manufacturer_verified: true,
      donaldson_sku_collision_verified: true,
      collision_donaldson_code: 'P821575',
      fleetguard_sku_collision_verified: true,
      collision_fleetguard_code: 'AF25551',
      oem_base_verified: true,
      fallback_manufacturer_verified: true,
      fallback_commercial_code_verified: true,
      approved_manufacturer: 'JOHN DEERE',
      approved_codigo_base: 'M131802',
      approved_source_column: 'OEM_CODES',
    }),
  };
  assert.equal(evaluateCodigoBase(row).authority, 'VERIFIED_OEM_COLLISION_FALLBACK');
});
