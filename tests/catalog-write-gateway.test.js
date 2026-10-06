'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  validateCanonicalWrite,
  validateGovernedCatalogPatch,
  assertGovernedCatalogPatch,
  validateIndustrialCanonicalWrite,
  INDUSTRIAL_SKU_POLICY_VERSION,
} = require('../lib/catalog-write-gateway');

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

function industrialRow(overrides = {}) {
  return {
    sku: 'IG13713',
    codigo_base: 'CC3LGA7H13',
    duty: 'INDUSTRIAL_PROCESS',
    filter_type: 'process_gas',
    sub_type: 'liquid_gas_coalescer',
    technology: 'COALERIS™',
    oem_codes: [],
    competitor_codes: [],
    equipment_applications: [],
    vehicle_applications: [],
    canonical_source_brand: 'PALL',
    canonical_source_code: 'CC3LGA7H13',
    canonical_source_status: 'VERIFIED',
    canonical_source_url: 'https://shop.pall.com/us/en/products/coalescers/liquid-gas/seprasol',
    enrichment_data: {
      industrial_base_governance: {
        authority_status: 'FAMILY_ANCHOR_BASE',
        base_eligible: true,
        technology_core: 'TC-NG-01',
        approved_anchor_brand: 'PALL',
        approved_source_brand: 'PALL',
        approved_base_code: 'CC3LGA7H13',
        primary_evidence_complete: true,
        original_confirmed: false,
        source_urls: ['https://shop.pall.com/us/en/products/coalescers/liquid-gas/seprasol'],
      },
      industrial_sku_governance: {
        policy_version: INDUSTRIAL_SKU_POLICY_VERSION,
        technology_core: 'TC-NG-01',
        planned_sku: 'IG13713',
        publication_order_locked: true,
        publication_order: 1,
      },
    },
    ...overrides,
  };
}

test('HD verified Donaldson authority passes gateway', () => {
  assert.equal(validateCanonicalWrite(baseRow()).valid, true);
});

test('Industrial Process family-anchor row passes the canonical gateway only with frozen source and SKU governance', () => {
  const row = industrialRow();
  assert.equal(validateIndustrialCanonicalWrite(row).valid, true);
  const result = validateCanonicalWrite(row);
  assert.equal(result.valid, true);
  assert.equal(result.industrial_validation.authority_status, 'FAMILY_ANCHOR_BASE');
  assert.equal(result.industrial_validation.technology_core, 'TC-NG-01');
});

test('Industrial Process row fails closed when canonical source, base authority, or planned SKU drifts', () => {
  const row = industrialRow({
    sku: 'IG19999',
    canonical_source_status: 'OBSERVED',
    enrichment_data: {
      industrial_base_governance: {
        authority_status: 'COMPETITOR_CROSS',
        base_eligible: false,
        technology_core: 'TC-NG-01',
        approved_anchor_brand: 'PALL',
        approved_source_brand: 'PALL',
        approved_base_code: 'WRONG',
        primary_evidence_complete: false,
        original_confirmed: false,
        source_urls: [],
      },
      industrial_sku_governance: {
        policy_version: 'WRONG',
        technology_core: 'TC-NG-01',
        planned_sku: 'IG13713',
        publication_order_locked: false,
        publication_order: 0,
      },
    },
  });
  const result = validateCanonicalWrite(row);
  assert.equal(result.valid, false);
  for (const reason of [
    'INDUSTRIAL_BASE_AUTHORITY_NOT_ELIGIBLE',
    'INDUSTRIAL_BASE_NOT_ELIGIBLE',
    'INDUSTRIAL_PRIMARY_EVIDENCE_INCOMPLETE',
    'INDUSTRIAL_APPROVED_BASE_MISMATCH',
    'INDUSTRIAL_CANONICAL_SOURCE_NOT_VERIFIED',
    'INDUSTRIAL_SOURCE_EVIDENCE_MISSING',
    'INDUSTRIAL_SKU_POLICY_VERSION_MISMATCH',
    'INDUSTRIAL_PLANNED_SKU_MISMATCH',
    'INDUSTRIAL_PUBLICATION_ORDER_NOT_LOCKED',
    'INDUSTRIAL_PUBLICATION_ORDER_INVALID',
  ]) assert.ok(result.reasons.includes(reason), reason);
});

test('Industrial Process ORIGINAL_BASE requires explicit original confirmation', () => {
  const row = industrialRow({
    enrichment_data: {
      ...industrialRow().enrichment_data,
      industrial_base_governance: {
        ...industrialRow().enrichment_data.industrial_base_governance,
        authority_status: 'ORIGINAL_BASE',
        original_confirmed: false,
      },
    },
  });
  const result = validateCanonicalWrite(row);
  assert.equal(result.valid, false);
  assert.ok(result.reasons.includes('INDUSTRIAL_ORIGINAL_BASE_NOT_CONFIRMED'));
});

test('retired LD prefix-5 SKU families are blocked permanently', () => {
  for (const sku of ['EA51234', 'EC51234', 'EF51234', 'EL51234']) {
    const result = validateCanonicalWrite(baseRow({ sku }));
    assert.equal(result.valid, false, `${sku} must be rejected`);
    assert.ok(result.reasons.includes('RETIRED_LD_PREFIX'));
  }
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

test('HD verified Fleetguard fallback passes and codigo_base need not be duplicated', () => {
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

test('legacy machine field requires an explicit gateway option', () => {
  const row = baseRow({ equipment_applications: [{ machine: 'CATERPILLAR 307D', engine: 'MITSUBISHI 4M40', year: '-' }] });
  const blocked = validateCanonicalWrite(row);
  assert.equal(blocked.valid, false);
  assert.ok(blocked.reasons.includes('EQUIPMENT_IDENTITY_MISSING'));
  const allowed = validateCanonicalWrite(row, { allowMachineAsEquipment: true });
  assert.equal(allowed.valid, true);
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

test('LD non-European regional authority accepts verified FRAM canonical source', () => {
  const row = baseRow({
    sku: 'EL36350',
    codigo_base: 'CH12811',
    duty: 'LIGHT_DUTY',
    enrichment_data: { codigo_base_governance: {
      origin_group: 'NON_EUROPEAN',
      approved_manufacturer: 'FRAM',
      approved_codigo_base: 'CH12811',
      approved_source_column: 'CANONICAL_POLICY',
      primary_manufacturer_verified: true,
    } },
  });
  assert.equal(validateCanonicalWrite(row).valid, true);
});

test('LD non-European regional fallback accepts verified OEM only after FRAM absence is documented', () => {
  const row = {
    sku: 'EA33603',
    codigo_base: 'OK6B0-23-603',
    duty: 'LIGHT_DUTY',
    oem_codes: [],
    competitor_codes: [],
    enrichment_data: { codigo_base_governance: {
      origin_group: 'NON_EUROPEAN',
      fram_absence_verified: true,
      fallback_manufacturer_verified: true,
      fallback_commercial_code_verified: true,
      approved_manufacturer: 'KIA',
      approved_codigo_base: 'OK6B0-23-603',
      approved_source_column: 'OEM_CODES',
      primary_manufacturer_verified: false,
    } },
  };
  assert.equal(validateCanonicalWrite(row).valid, true);
});

test('LD non-European OEM fallback is blocked when FRAM absence is not documented', () => {
  const row = {
    sku: 'EA33603',
    codigo_base: 'OK6B0-23-603',
    duty: 'LIGHT_DUTY',
    oem_codes: [],
    competitor_codes: [],
    enrichment_data: { codigo_base_governance: {
      origin_group: 'NON_EUROPEAN',
      fallback_manufacturer_verified: true,
      fallback_commercial_code_verified: true,
      approved_manufacturer: 'KIA',
      approved_codigo_base: 'OK6B0-23-603',
      approved_source_column: 'OEM_CODES',
      primary_manufacturer_verified: false,
    } },
  };
  const result = validateCanonicalWrite(row);
  assert.equal(result.valid, false);
  assert.ok(result.reasons.includes('FRAM_ABSENCE_NOT_VERIFIED'));
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


test('non-canonical patches can pass without forcing unrelated legacy governance', () => {
  const result = validateGovernedCatalogPatch(
    { sku: 'EA10001', description: 'legacy row' },
    { packaging_source: 'OFFICIAL_SOURCE_SCRAPE', units_per_case: 6 }
  );
  assert.equal(result.valid, true);
  assert.equal(result.scope, 'NON_CANONICAL_PATCH');
  assert.deepEqual(result.canonical_fields_touched, []);
});

test('rejection cleanup may only remove existing OEM or competitor references', () => {
  const current = {
    sku: 'EH68318',
    competitor_codes: [
      { manufacturer: 'DONALDSON', code: 'P166135' },
      { manufacturer: 'WIX', code: '51698' },
    ],
    oem_codes: [],
  };
  const removal = validateGovernedCatalogPatch(
    current,
    { competitor_codes: [{ manufacturer: 'WIX', code: '51698' }] },
    { rejectionCleanup: true }
  );
  assert.equal(removal.valid, true);
  assert.equal(removal.scope, 'REJECTION_CLEANUP');
  assert.equal(removal.removed_count, 1);

  const addition = validateGovernedCatalogPatch(
    current,
    { competitor_codes: [{ manufacturer: 'WIX', code: '51698' }, { manufacturer: 'DONALDSON', code: 'P999999' }] },
    { rejectionCleanup: true }
  );
  assert.equal(addition.valid, false);
  assert.ok(addition.reasons.includes('REJECTION_CLEANUP_MUST_REMOVE_ONLY'));

  const baseChange = validateGovernedCatalogPatch(
    current,
    { codigo_base: 'P166135' },
    { rejectionCleanup: true }
  );
  assert.equal(baseChange.valid, false);
  assert.ok(baseChange.reasons.includes('REJECTION_CLEANUP_FIELDS_NOT_ALLOWED'));
});

test('canonical patches are evaluated against the complete post-write row', () => {
  const result = validateGovernedCatalogPatch(baseRow(), { duty: 'LIGHT_DUTY' });
  assert.equal(result.valid, false);
  assert.equal(result.scope, 'CANONICAL_PATCH');
  assert.ok(result.reasons.includes('MANN_ABSENCE_NOT_VERIFIED'));
  assert.throws(() => assertGovernedCatalogPatch(baseRow(), { duty: 'LIGHT_DUTY' }), /CATALOG_PATCH_GATEWAY_BLOCKED/);
});

test('active HERMES catalogue writers invoke the patch gateway before direct SQL', () => {
  const files = [
    'scripts/hermes/publish-catalogue-plan.mjs',
    'scripts/hermes/rollback-catalogue-publication.mjs',
    'scripts/hermes/hd-packaging-enrichment-engine.mjs',
  ];
  for (const relative of files) {
    const source = fs.readFileSync(path.join(__dirname, '..', relative), 'utf8');
    const gate = source.indexOf('assertGovernedCatalogPatch');
    const write = source.indexOf('UPDATE elimfilters_catalog');
    assert.ok(gate >= 0, `${relative} must import/use the gateway`);
    assert.ok(write >= 0, `${relative} is expected to contain a catalogue writer`);
    assert.ok(source.indexOf('assertGovernedCatalogPatch', gate + 1) >= 0, `${relative} must call the gateway`);
  }
});

test('DRYCORE air dryer cannot remain LIGHT_DUTY', () => {
  const row = {
    ...baseRow(),
    sku: 'ED40719',
    duty: 'LIGHT_DUTY',
    filter_type: 'air_dryer',
    technology: 'DRYCORE™',
  };
  const result = validateCanonicalWrite(row);
  assert.equal(result.valid, false);
  assert.ok(result.reasons.includes('AIR_DRYER_REQUIRES_HEAVY_DUTY'));
});

test('HD OEM fallback is blocked until Fleetguard absence is verified', () => {
  const row = baseRow({
    sku: 'ED45295',
    codigo_base: '0004295295',
    enrichment_data: { codigo_base_governance: {
      donaldson_absence_verified: true,
      fallback_manufacturer_verified: true,
      fallback_commercial_code_verified: true,
      approved_manufacturer: 'MERCEDES-BENZ',
      approved_codigo_base: '0004295295',
      approved_source_column: 'OEM_CODES',
    } },
  });
  const result = validateCanonicalWrite(row);
  assert.equal(result.valid, false);
  assert.ok(result.reasons.includes('FLEETGUARD_ABSENCE_NOT_VERIFIED'));
});


test('gateway accepts Fleetguard codigo_base when verified Donaldson SKU collides', () => {
  const row = {
    sku: 'EA15551',
    codigo_base: 'AF25551',
    duty: 'HEAVY_DUTY',
    filter_type: 'air',
    technology: 'MACROCORE™',
    canonical_source_brand: 'DONALDSON',
    canonical_source_code: 'P821575',
    oem_codes: [{ manufacturer: 'JOHN DEERE', code: 'M131802' }],
    competitor_codes: [],
    enrichment_data: { codigo_base_governance: {
      policy_version: '2026-10-06-v4.2',
      primary_manufacturer_verified: true,
      donaldson_sku_collision_verified: true,
      collision_donaldson_code: 'P821575',
      fallback_manufacturer_verified: true,
      fallback_commercial_code_verified: true,
      approved_manufacturer: 'FLEETGUARD',
      approved_codigo_base: 'AF25551',
      approved_source_column: 'COMPETITOR_CODES',
    } },
    equipment_applications: [],
    vehicle_applications: [],
  };
  const result = validateCanonicalWrite(row, { validateApplications: false });
  assert.equal(result.valid, true, result.reasons.join(','));
});
