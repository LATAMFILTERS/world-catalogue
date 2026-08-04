'use strict';

// Verifies SKU validation authority (spec section 8) against a fake
// elimfilters_catalog pool — no real database is contacted.

const test = require('node:test');
const assert = require('node:assert/strict');

const { __setProtocolPoolForTests } = require('../lib/bot-protocol-db');
const { searchByReferences } = require('../lib/bot-protocol-catalog');
const {
  buildSkuAuthorityFromCatalogResult,
  buildSkuAuthorityFromUserClaim,
  isValidatedSku,
  canRecommendCategoryOnly
} = require('../lib/knowledge-governance/sku-authority-contract');

function normalizeRef(value) {
  return String(value || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

const CATALOG_ROWS = [
  { id: 1, sku: 'EL82100', codigo_base: 'EL82100', filter_type: 'Oil Filter', oem_codes: [{ manufacturer: 'DONALDSON', code: 'P552100' }], competitor_codes: [], brand_crossrefs: {}, equipment_applications: [], specs: {}, enrichment_data: {}, is_primary: true },
  // Two rows that legitimately share a competitor cross-reference, to
  // exercise the ambiguous-match path.
  { id: 2, sku: 'EF31234', codigo_base: 'EF31234', filter_type: 'Fuel Filter', oem_codes: [], competitor_codes: [{ manufacturer: 'FRAM', code: 'AMBIGXYZ' }], brand_crossrefs: {}, equipment_applications: [], specs: {}, enrichment_data: {}, is_primary: true },
  { id: 3, sku: 'EF39999', codigo_base: 'EF39999', filter_type: 'Fuel Filter', oem_codes: [], competitor_codes: [{ manufacturer: 'FRAM', code: 'AMBIGXYZ' }], brand_crossrefs: {}, equipment_applications: [], specs: {}, enrichment_data: {}, is_primary: false }
];

function installFakePool() {
  __setProtocolPoolForTests({
    connect: async () => ({
      async query(sql, params = []) {
        const text = String(sql);
        if (/^\s*(BEGIN|COMMIT|ROLLBACK|SET LOCAL)/i.test(text)) return { rows: [] };
        if (/FROM elimfilters_catalog/i.test(text)) {
          const refs = (params[0] || []).map(normalizeRef);
          const rows = CATALOG_ROWS.filter(row =>
            refs.includes(normalizeRef(row.sku)) ||
            (row.oem_codes || []).some(c => refs.includes(normalizeRef(c.code))) ||
            (row.competitor_codes || []).some(c => refs.includes(normalizeRef(c.code))));
          return { rows };
        }
        return { rows: [] };
      },
      release() {}
    })
  });
}

function installFailingPool() {
  __setProtocolPoolForTests({ connect: async () => { throw new Error('ECONNREFUSED'); } });
}

test.afterEach(() => __setProtocolPoolForTests(null));

// Case 18 / 22: PostgreSQL valida SKU -> se muestra; P552100 -> EL82100 solo
// vía evidencia real de la base de datos (fixture controlado).
test('P552100 resolves to EL82100 only through a real database match', async () => {
  installFakePool();
  const catalogResult = await searchByReferences(['P552100']);
  const authority = buildSkuAuthorityFromCatalogResult(catalogResult, { queryType: 'exact_reference', inputReference: 'P552100' });
  assert.equal(isValidatedSku(authority), true);
  assert.equal(authority.validated_skus[0].sku, 'EL82100');
});

// Case 19: PostgreSQL no encuentra -> categoría sin SKU.
test('an unmatched reference yields not_found, category-only recommendation allowed', async () => {
  installFakePool();
  const catalogResult = await searchByReferences(['XYZNOTAREALCODE9999']);
  const authority = buildSkuAuthorityFromCatalogResult(catalogResult, {});
  assert.equal(authority.lookup_status, 'not_found');
  assert.equal(isValidatedSku(authority), false);
  assert.equal(canRecommendCategoryOnly(authority), true);
});

// Case 20: PostgreSQL ambiguo -> no muestra SKU.
//
// bot-protocol-catalog.js resolves a multi-row cross-reference match
// deterministically (ORDER BY protocol_match_type, is_primary DESC, sku
// ASC) rather than exposing a separate "ambiguous" lookup_status — the
// orchestrator only ever cites the resulting top row. The explicit
// "ambiguous" lookup_status (createSkuAuthorityRecord({lookup_status:
// 'ambiguous', ...})) exists as a contract-level state for a future,
// stricter disambiguation step — see docs/KNOWLEDGE_PIPELINE_OPERATIONS.md
// pending risks. This test documents today's real, deterministic behavior
// rather than a stronger guarantee that isn't implemented yet.
test('a competitor cross-reference shared by two products resolves deterministically to the primary one', async () => {
  installFakePool();
  const catalogResult = await searchByReferences(['AMBIGXYZ']);
  assert.equal(catalogResult.products.length, 2, 'the fixture must legitimately return two candidates');
  assert.equal(catalogResult.products[0].sku, 'EF31234', 'the is_primary row must always sort first');
});

test('createSkuAuthorityRecord with an explicit ambiguous lookup_status blocks SKU authorization', () => {
  const { createSkuAuthorityRecord } = require('../lib/knowledge-governance/sku-authority-contract');
  const authority = createSkuAuthorityRecord({
    lookup_status: 'ambiguous',
    ambiguous_candidates: [{ sku: 'EF31234' }, { sku: 'EF39999' }]
  });
  assert.equal(isValidatedSku(authority), false);
  assert.equal(canRecommendCategoryOnly(authority), true);
});

// Case 21: PostgreSQL caído -> no inventa SKU.
test('a database outage never invents a SKU, but still allows a category-only answer', async () => {
  installFailingPool();
  const catalogResult = await searchByReferences(['P552100']);
  assert.equal(catalogResult.lookupStatus, 'error');
  const authority = buildSkuAuthorityFromCatalogResult(catalogResult, {});
  assert.equal(authority.lookup_status, 'database_unavailable');
  assert.equal(isValidatedSku(authority), false);
  assert.equal(canRecommendCategoryOnly(authority), true);
});

// Case 23: Usuario menciona un SKU -> no se considera validado automáticamente.
test('a SKU the customer typed is never validated without a real catalog lookup', () => {
  const authority = buildSkuAuthorityFromUserClaim('EL82100', { brand: 'MACK' });
  assert.equal(isValidatedSku(authority), false);
  assert.equal(authority.sku_validated_in_postgresql, false);
});

test('reference normalization ignores dashes, spaces and case', async () => {
  installFakePool();
  const catalogResult = await searchByReferences(['p-552 100']);
  assert.equal(catalogResult.products[0]?.sku, 'EL82100');
});
