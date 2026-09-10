'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { functionalFamily, isSameFunctionalFamily } = require('../lib/alternative-functional-family');

test('keeps separator alternatives inside the separator family', () => {
  const primary = { elimfilters_sku: 'ES91855', filter_type: 'fuel', technology: 'HYDROCORE' };
  const validAlternative = { sku: 'ES91856', filter_type: 'fuel', technology: 'HYDROCORE' };
  assert.equal(isSameFunctionalFamily(primary, validAlternative), true);
});

test('rejects EF91075 as an alternative for separator ES91855', () => {
  const primary = { elimfilters_sku: 'ES91855', filter_type: 'fuel', technology: 'HYDROCORE' };
  const invalidAlternative = { sku: 'EF91075', filter_type: 'fuel', technology: 'SYNTAPORE' };
  assert.equal(functionalFamily(primary), 'FUEL_WATER_SEPARATOR');
  assert.equal(functionalFamily(invalidAlternative), 'FUEL_FILTER');
  assert.equal(isSameFunctionalFamily(primary, invalidAlternative), false);
});

test('does not collapse unrelated functional families into a generic duty bucket', () => {
  const oil = { sku: 'EO10000', duty: 'HEAVY_DUTY', filter_type: 'oil' };
  const hydraulic = { sku: 'EH10000', duty: 'HEAVY_DUTY', filter_type: 'hydraulic' };
  assert.equal(isSameFunctionalFamily(oil, hydraulic), false);
});
