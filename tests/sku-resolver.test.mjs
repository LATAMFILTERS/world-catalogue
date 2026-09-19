import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCompetitorSku } from '../product-identity/scripts/resolve-competitor-sku.mjs';

function poolWithRows(rows) {
  return () => ({
    query: async () => ({ rows }),
    end: async () => {}
  });
}

test('Fleetguard HD resolves through verified Donaldson before Fleetguard codigo_base', async () => {
  const result = await resolveCompetitorSku({
    sourceCode: 'FF5507',
    sourceBrand: 'FLEETGUARD',
    duty: 'HEAVY_DUTY',
    connectionString: 'postgresql://test',
    homologationResolver: async () => ({
      status: 'RESOLVED',
      source: 'test-matrix',
      donaldson_code: 'P550529'
    }),
    poolFactory: poolWithRows([
      {
        sku: 'EF95507',
        codigo_base: 'FF5507',
        filter_type: 'fuel',
        duty: 'HEAVY_DUTY',
        technology: 'SYNTAPORE™',
        competitor_codes: [],        brand_crossrefs: {},
        oem_codes: [],
        canonical_source_brand: null,
        canonical_source_code: 'FF5507',
        canonical_source_status: 'UNVERIFIED',
        canonical_evidence: {}
      },
      {
        sku: 'EF90529',
        codigo_base: 'P550529',
        filter_type: 'fuel',
        duty: 'HEAVY_DUTY',
        technology: 'SYNTAPORE™',
        competitor_codes: [{ code: 'FF5507', manufacturer: 'FLEETGUARD' }],
        brand_crossrefs: { FLEETGUARD: ['FF5507'] },
        oem_codes: [],
        canonical_source_brand: 'DONALDSON',
        canonical_source_code: 'P550529',
        canonical_source_status: 'VERIFIED',
        canonical_evidence: {}
      }
    ])
  });

  assert.equal(result.status, 'RESOLVED');
  assert.equal(result.elimfilters_sku, 'EF90529');
  assert.equal(result.base_origin, 'DONALDSON');
  assert.equal(result.base_code, 'P550529');
  assert.equal(result.match_method, 'FLEETGUARD_TO_DONALDSON_HOMOLOGATED_VERIFIED');
});
test('Fleetguard HD cannot fall back merely because Donaldson was not found', async () => {
  const result = await resolveCompetitorSku({
    sourceCode: 'FF5507',
    sourceBrand: 'FLEETGUARD',
    duty: 'HEAVY_DUTY',
    connectionString: 'postgresql://test',
    homologationResolver: async () => ({ status: 'NOT_FOUND', source: 'test-matrix' }),
    poolFactory: poolWithRows([{
      sku: 'EF95507',
      codigo_base: 'FF5507',
      filter_type: 'fuel',
      duty: 'HEAVY_DUTY',
      technology: 'SYNTAPORE™',
      competitor_codes: [],
      brand_crossrefs: {},
      oem_codes: [],
      canonical_source_brand: null,
      canonical_source_code: 'FF5507',
      canonical_source_status: 'UNVERIFIED',
      canonical_evidence: {}
    }])
  });

  assert.equal(result.status, 'STOP_REVIEW');
  assert.equal(result.reason, 'DONALDSON_CROSS_REFERENCE_REQUIRED');
});

test('Fleetguard becomes base only with explicit Donaldson not-manufactured evidence', async () => {  const result = await resolveCompetitorSku({
    sourceCode: 'FF9999',
    sourceBrand: 'FLEETGUARD',
    duty: 'HEAVY_DUTY',
    connectionString: 'postgresql://test',
    homologationResolver: async () => ({ status: 'NOT_FOUND', source: 'test-matrix' }),
    poolFactory: poolWithRows([{
      sku: 'EF99999',
      codigo_base: 'FF9999',
      filter_type: 'fuel',
      duty: 'HEAVY_DUTY',
      technology: 'SYNTAPORE™',
      competitor_codes: [],
      brand_crossrefs: {},
      oem_codes: [],
      canonical_source_brand: 'FLEETGUARD',
      canonical_source_code: 'FF9999',
      canonical_source_status: 'VERIFIED',
      canonical_evidence: { donaldson_not_manufactured: true }
    }])
  });

  assert.equal(result.status, 'RESOLVED');
  assert.equal(result.base_origin, 'FLEETGUARD');
  assert.equal(result.donaldson_status, 'NOT_MANUFACTURED');
  assert.equal(result.match_method, 'FLEETGUARD_VERIFIED_FALLBACK_NO_DONALDSON');
});

test('verified Donaldson base must agree with HD prefix plus last four digits', async () => {  const result = await resolveCompetitorSku({
    sourceCode: 'FF5776',
    sourceBrand: 'FLEETGUARD',
    duty: 'HEAVY_DUTY',
    connectionString: 'postgresql://test',
    homologationResolver: async () => ({
      status: 'RESOLVED',
      source: 'test-matrix',
      donaldson_code: 'P555776'
    }),
    poolFactory: poolWithRows([{
      sku: 'EF9555776',
      codigo_base: 'P555776',
      filter_type: 'fuel',
      duty: 'HEAVY_DUTY',
      technology: 'SYNTAPORE™',
      competitor_codes: [{ code: 'FF5776', manufacturer: 'FLEETGUARD' }],
      brand_crossrefs: {},
      oem_codes: [],
      canonical_source_brand: 'DONALDSON',
      canonical_source_code: 'P555776',
      canonical_source_status: 'VERIFIED',
      canonical_evidence: {}
    }])
  });

  assert.equal(result.status, 'STOP_REVIEW');
  assert.equal(result.reason, 'DONALDSON_DERIVED_SKU_CATALOG_MISMATCH');
  assert.equal(result.derived_sku, 'EF95776');
});
test('non-Fleetguard exact codigo_base behavior remains unchanged', async () => {
  const result = await resolveCompetitorSku({
    sourceCode: 'C40001',
    sourceBrand: 'MANN',
    duty: 'HEAVY_DUTY',
    connectionString: 'postgresql://test',
    poolFactory: poolWithRows([{
      sku: 'EA10001',
      codigo_base: 'C40001',
      filter_type: 'air',
      duty: 'HEAVY_DUTY',
      technology: 'MACROCORE™',
      competitor_codes: [],
      brand_crossrefs: {},
      oem_codes: []
    }])
  });

  assert.equal(result.status, 'RESOLVED');
  assert.equal(result.match_method, 'CODIGO_BASE_EXACT');
});
