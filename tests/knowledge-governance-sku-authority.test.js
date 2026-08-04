const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createSkuAuthorityRecord,
  isValidatedSku,
  canRecommendCategoryOnly,
  buildSkuAuthorityFromCatalogResult,
  buildSkuAuthorityFromUserClaim
} = require('../lib/knowledge-governance/sku-authority-contract');

// Case 5: PostgreSQL valida SKU -> publicable.
test('a PostgreSQL catalog match validates the SKU', () => {
  const record = buildSkuAuthorityFromCatalogResult(
    { products: [{ sku: 'EL82100', codigo_base: 'EL82100', filter_type: 'Oil Filter' }], lookupStatus: 'completed' },
    { queryType: 'exact_reference', inputReference: 'P552100', equipment: { brand: 'FREIGHTLINER' } }
  );
  assert.equal(isValidatedSku(record), true);
  assert.equal(record.validated_skus[0].sku, 'EL82100');
});

// Case 9: PostgreSQL no disponible -> categoría permitida, SKU bloqueado.
test('a PostgreSQL outage blocks the SKU but still allows a category-only recommendation', () => {
  const record = buildSkuAuthorityFromCatalogResult({ products: [], lookupStatus: 'error', error: 'ECONNREFUSED' }, {});
  assert.equal(record.lookup_status, 'database_unavailable');
  assert.equal(isValidatedSku(record), false);
  assert.equal(canRecommendCategoryOnly(record), true);
});

// Case 10: Referencia ambigua -> SKU bloqueado.
test('an ambiguous match blocks SKU authorization', () => {
  const record = createSkuAuthorityRecord({
    lookup_status: 'ambiguous',
    ambiguous_candidates: [{ sku: 'EL82100' }, { sku: 'EL82101' }]
  });
  assert.equal(isValidatedSku(record), false);
  assert.equal(canRecommendCategoryOnly(record), true);
});

test('a reference the user typed is never validated on its own', () => {
  const record = buildSkuAuthorityFromUserClaim('EL82100', { brand: 'FREIGHTLINER' });
  assert.equal(isValidatedSku(record), false);
  assert.equal(record.sku_validated_in_postgresql, false);
});

test('no products found is a clean not_found, not an error', () => {
  const record = buildSkuAuthorityFromCatalogResult({ products: [], lookupStatus: 'completed' }, {});
  assert.equal(record.lookup_status, 'not_found');
  assert.equal(isValidatedSku(record), false);
});
