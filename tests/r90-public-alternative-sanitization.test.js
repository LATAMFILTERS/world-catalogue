'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === 'express') return { application: { get() {} } };
  if (request === 'pg') return { Pool: class Pool {} };
  return originalLoad.call(this, request, parent, isMain);
};
const { exactProductResponse } = require('../lib/part-search-r90-fail-closed');
Module._load = originalLoad;

test('governed exact response strips nested stored alternatives', () => {
  const storedProduct = {
    sku: 'ES91855', duty: 'HEAVY_DUTY', alternatives: ['EF91075'],
    alternative_products: [{ sku: 'EF91075' }], related_products: ['EF91075'],
  };
  const response = exactProductResponse(
    storedProduct, 'R90T', 'ES91855', 'RACOR',
    'racor_reference_exact', 'RACOR_REFERENCE_EXACT'
  );
  assert.deepEqual(response.alternatives, []);
  assert.deepEqual(response.results[0].alternatives, []);
  assert.deepEqual(response.products[0].alternatives, []);
  assert.deepEqual(response.results[0].alternative_products, []);
  assert.deepEqual(response.results[0].related_products, []);
  assert.deepEqual(storedProduct.alternatives, ['EF91075']);
});
