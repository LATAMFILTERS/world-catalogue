'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  FUNCTIONAL_FAMILIES,
  functionalFamily,
  isSameFunctionalFamily,
  filterAlternativesByFunctionalFamily,
} = require('../lib/alternative-functional-family');

test('keeps separator alternatives inside the separator family', () => {
  const primary = { elimfilters_sku: 'ES91855', filter_type: 'fuel', technology: 'HYDROCORE' };
  const validAlternative = { sku: 'ES91856', filter_type: 'fuel', technology: 'HYDROCORE' };
  assert.equal(isSameFunctionalFamily(primary, validAlternative), true);
});

test('rejects EF91075 as an alternative for separator ES91855', () => {
  const primary = { elimfilters_sku: 'ES91855', filter_type: 'fuel', technology: 'HYDROCORE' };
  const invalidAlternative = { sku: 'EF91075', filter_type: 'fuel', technology: 'SYNTAPORE' };
  assert.equal(functionalFamily(primary), FUNCTIONAL_FAMILIES.FUEL_WATER_SEPARATOR);
  assert.equal(functionalFamily(invalidAlternative), FUNCTIONAL_FAMILIES.FUEL_FILTER);
  assert.equal(isSameFunctionalFamily(primary, invalidAlternative), false);
});

test('classifies semantic families without depending on SKU prefixes', () => {
  assert.equal(functionalFamily({ filter_type: 'air', technology: 'MACROCORE' }), FUNCTIONAL_FAMILIES.AIR_FILTER);
  assert.equal(functionalFamily({ filter_type: 'cabin', technology: 'MICROKAPPA' }), FUNCTIONAL_FAMILIES.CABIN_FILTER);
  assert.equal(functionalFamily({ description: 'air dryer cartridge', technology: 'DRYCORE' }), FUNCTIONAL_FAMILIES.AIR_DRYER);
  assert.equal(functionalFamily({ description: 'air intake housing', technology: 'INTEKCORE' }), FUNCTIONAL_FAMILIES.AIR_INTAKE_HOUSING);
  assert.equal(functionalFamily({ filter_type: 'fuel', technology: 'SYNTAPORE' }), FUNCTIONAL_FAMILIES.FUEL_FILTER);
  assert.equal(functionalFamily({ filter_type: 'oil', technology: 'SYNTRAX' }), FUNCTIONAL_FAMILIES.LUBE_OIL_FILTER);
  assert.equal(functionalFamily({ filter_type: 'hydraulic', technology: 'NANOFORCE' }), FUNCTIONAL_FAMILIES.HYDRAULIC_FILTER);
  assert.equal(functionalFamily({ filter_type: 'coolant', technology: 'THERMACORE' }), FUNCTIONAL_FAMILIES.COOLANT_FILTER);
});

test('does not mix distinct families inside the same protection system', () => {
  assert.equal(isSameFunctionalFamily({ technology: 'MACROCORE' }, { technology: 'MICROKAPPA' }), false);
  assert.equal(isSameFunctionalFamily({ technology: 'MACROCORE' }, { technology: 'DRYCORE' }), false);
  assert.equal(isSameFunctionalFamily({ technology: 'SYNTAPORE' }, { technology: 'HYDROCORE' }), false);
});

test('does not collapse unrelated heavy-duty products into a duty bucket', () => {
  const oil = { duty: 'HEAVY_DUTY', filter_type: 'oil' };
  const hydraulic = { duty: 'HEAVY_DUTY', filter_type: 'hydraulic' };
  assert.equal(isSameFunctionalFamily(oil, hydraulic), false);
});

test('fails closed when either family is unknown', () => {
  assert.equal(functionalFamily({}), null);
  assert.equal(isSameFunctionalFamily({}, {}), false);
  assert.equal(isSameFunctionalFamily({ technology: 'HYDROCORE' }, {}), false);
  assert.equal(isSameFunctionalFamily({}, { technology: 'HYDROCORE' }), false);
});

test('preserves reachable same-family alternatives and filters cross-family candidates', () => {
  const primary = { elimfilters_sku: 'ES91855', technology: 'HYDROCORE', filter_type: 'fuel' };
  const candidates = [
    { sku: 'ES91856', description: 'fuel water separator' },
    { sku: 'EF91075', technology: 'SYNTAPORE', filter_type: 'fuel' },
    { sku: 'UNKNOWN1' },
  ];
  assert.deepEqual(filterAlternativesByFunctionalFamily(primary, candidates), [candidates[0]]);
});

test('returns an empty list for non-array alternative containers', () => {
  const primary = { technology: 'HYDROCORE' };
  assert.deepEqual(filterAlternativesByFunctionalFamily(primary, null), []);
});
