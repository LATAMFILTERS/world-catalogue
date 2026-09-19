import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCompetitorSku } from '../product-identity/scripts/resolve-competitor-sku.mjs';

function poolWithRows(rows) {
  return () => ({
    query: async () => ({ rows }),
    end: async () => {}
  });
}

test('exact codigo_base has priority over noisy cross-reference payloads', async () => {
  const result = await resolveCompetitorSku({
    sourceCode: 'FF5776',
    sourceBrand: 'FLEETGUARD',
    duty: 'HEAVY_DUTY',
    connectionString: 'postgresql://test',
    poolFactory: poolWithRows([{
      sku: 'EF95776',
      codigo_base: 'FF5776',
      filter_type: 'fuel',
      duty: 'HEAVY_DUTY',
      technology: 'SYNTAPORE™',
      competitor_codes: [],
      brand_crossrefs: {},
      oem_codes: []
    }])
  });

  assert.equal(result.status, 'RESOLVED');
  assert.equal(result.elimfilters_sku, 'EF95776');
  assert.equal(result.match_method, 'CODIGO_BASE_EXACT');
});
test('duplicate codigo_base remains fail-closed', async () => {
  const rows = ['EF95776', 'EF99999'].map((sku) => ({
    sku,
    codigo_base: 'FF5776',
    filter_type: 'fuel',
    duty: 'HEAVY_DUTY',
    technology: 'SYNTAPORE™',
    competitor_codes: [],
    brand_crossrefs: {},
    oem_codes: []
  }));

  const result = await resolveCompetitorSku({
    sourceCode: 'FF5776',
    sourceBrand: 'FLEETGUARD',
    duty: 'HEAVY_DUTY',
    connectionString: 'postgresql://test',
    poolFactory: poolWithRows(rows)
  });

  assert.equal(result.status, 'STOP_REVIEW');
  assert.equal(result.reason, 'AMBIGUOUS_CODIGO_BASE_MATCH');
  assert.equal(result.matches.length, 2);
});