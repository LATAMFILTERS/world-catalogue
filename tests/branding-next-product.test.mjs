import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveNextSequenceProduct,
  sourceCodeFromMaster,
  approvalStateFromMaster
} from '../product-identity/scripts/resolve-next-branding-product.mjs';

const products = [
  { code: 'FF5776', description: 'Fuel Filter, Spin-On, Stratapore', catalog_page: 1, catalog_position: 1 },
  { code: 'FF2200', description: 'Fuel Filter, Spin-On, Stratapore', catalog_page: 1, catalog_position: 2 },
  { code: 'FF5507', description: 'Fuel Filter, Spin-On', catalog_page: 1, catalog_position: 3 },
  { code: 'FF5319', description: 'Fuel Filter, Spin-On', catalog_page: 1, catalog_position: 4 },
  { code: 'FF5421', description: 'Fuel Filter, Spin-On', catalog_page: 1, catalog_position: 6 },
  { code: 'FF213', description: 'Fuel Filter, Spin-On', catalog_page: 1, catalog_position: 7 },
  { code: 'FF2203', description: 'Fuel Filter, Spin-On', catalog_page: 1, catalog_position: 8 },
  { code: 'FF5206', description: 'Fuel Filter, Spin-On', catalog_page: 1, catalog_position: 9 },
  { code: 'FF42000', description: 'Fuel Filter, Spin-On', catalog_page: 1, catalog_position: 10 },
  { code: 'FF5018', description: 'Fuel Filter, Spin-On', catalog_page: 1, catalog_position: 11 }
];

const master = (code, sku = 'EF90000') => ({
  sku,
  sourceCrossReference: { manufacturer: 'FLEETGUARD', partNumber: code },
  visualMaster: { status: 'FINAL_APPROVED' }
});
test('normalizes legacy production-master shapes', () => {
  const value = {
    sku: 'EF90000',
    technical_source: { cross_reference: { code: 'FF5776' } },
    media: { approval_state: 'FINAL_APPROVED' }
  };
  assert.equal(sourceCodeFromMaster(value), 'FF5776');
  assert.equal(approvalStateFromMaster(value), 'FINAL_APPROVED');
});

test('selects first visible eligible Fuel Spin-On when none are approved', () => {
  const result = deriveNextSequenceProduct({
    orderedProducts: products,
    masters: [],
    targetCount: 10
  });

  assert.equal(result.status, 'REFERENCE_SELECTED');
  assert.equal(result.completed_prefix, 0);
  assert.equal(result.next.position, 1);
  assert.equal(result.next.catalog_position, 1);
  assert.equal(result.next.competitor_code, 'FF5776');
  assert.equal(result.next.product_url, 'https://www.fleetguard.com/product/FF5776');
});
test('advances only across approved visible Fuel products', () => {
  const result = deriveNextSequenceProduct({
    orderedProducts: products,
    masters: [master('FF5776'), master('FF2200')],
    targetCount: 10
  });

  assert.equal(result.completed_prefix, 2);
  assert.equal(result.next.position, 3);
  assert.equal(result.next.catalog_position, 3);
  assert.equal(result.next.competitor_code, 'FF5507');
});

test('fails closed when official eligible sequence is shorter than pilot target', () => {
  assert.throws(
    () => deriveNextSequenceProduct({
      orderedProducts: products.slice(0, 4),
      masters: [],
      targetCount: 10
    }),
    /STOP_OFFICIAL_SEQUENCE_INCOMPLETE/
  );
});

test('reports completed pilot when all target products are approved', () => {
  const result = deriveNextSequenceProduct({
    orderedProducts: products,
    masters: products.map((product, index) => master(product.code, `EF9${index}`)),
    targetCount: 10
  });
  assert.equal(result.status, 'PILOT_SEQUENCE_COMPLETE');
  assert.equal(result.next, null);
});