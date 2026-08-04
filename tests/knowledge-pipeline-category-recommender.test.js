'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { recommendCategories } = require('../lib/bot-product-category-recommender');

// Case 14: Agua en combustible -> categoría separador/filtro combustible.
test('water in fuel recommends fuel_water_separator as primary and fuel_filter as secondary', () => {
  const result = recommendCategories({
    intent: 'diagnostic',
    equipment: { brand: 'MACK' },
    symptoms: [{ code: 'water_in_fuel', system: 'fuel' }]
  });
  assert.equal(result.status, 'recommended');
  const separator = result.categories.find(c => c.category === 'fuel_water_separator');
  const filter = result.categories.find(c => c.category === 'fuel_filter');
  assert.ok(separator, 'must recommend fuel_water_separator');
  assert.equal(separator.priority, 'primary');
  assert.ok(filter, 'must also recommend fuel_filter');
  assert.equal(filter.priority, 'secondary');
});

// Case 15: Agua en aceite -> reparación primero, filtro de aceite después (nunca como reparación).
test('water in oil recommends oil_filter only as a conditional post-repair step, never as the fix', () => {
  const result = recommendCategories({
    intent: 'diagnostic',
    equipment: { brand: 'FREIGHTLINER' },
    symptoms: [{ code: 'water_in_oil', system: 'oil' }]
  });
  assert.equal(result.status, 'recommended');
  const oilFilter = result.categories.find(c => c.category === 'oil_filter');
  assert.ok(oilFilter);
  assert.equal(oilFilter.conditional, true);
  assert.match(oilFilter.reason, /despu[eé]s de corregir la causa mec[aá]nica/i);
  assert.match(oilFilter.reason, /no corresponde reemplazar el filtro como reparaci[oó]n/i);
});

// Case 16: Restricción de aire -> filtro de aire correcto.
test('an air restriction recommends air_filter_primary', () => {
  const result = recommendCategories({
    intent: 'diagnostic',
    equipment: { brand: 'VOLVO' },
    symptoms: [{ code: 'restriction', system: null }],
    installedFilter: { status: 'reference_provided' }
  });
  assert.equal(result.status, 'recommended');
  const primary = result.categories.find(c => c.category === 'air_filter_primary');
  assert.ok(primary);
  assert.equal(primary.system, 'air_intake');
  assert.equal(primary.priority, 'primary');
});

test('air_filter_secondary is never recommended when the installed filter is entirely unknown', () => {
  const result = recommendCategories({
    intent: 'diagnostic',
    equipment: { brand: 'VOLVO' },
    symptoms: [{ code: 'restriction', system: null }],
    installedFilter: { status: 'unknown' }
  });
  assert.ok(!result.categories.some(c => c.category === 'air_filter_secondary'));
});

// Case 17: Contaminación hidráulica -> filtro hidráulico condicionado.
test('hydraulic water contamination recommends hydraulic_filter, conditioned on cleanup/repair', () => {
  const result = recommendCategories({
    intent: 'diagnostic',
    equipment: { brand: 'CATERPILLAR' },
    symptoms: [{ code: 'water_in_hydraulic', system: 'hydraulic' }]
  });
  assert.equal(result.status, 'recommended');
  const hydraulic = result.categories.find(c => c.category === 'hydraulic_filter');
  assert.ok(hydraulic);
  assert.equal(hydraulic.conditional, true);
  assert.match(hydraulic.reason, /limpieza o reparaci[oó]n del circuito/i);
});

test('a non-diagnostic, non-application intent is not_applicable', () => {
  const result = recommendCategories({ intent: 'commercial_inquiry', symptoms: [{ code: 'water_in_fuel', system: 'fuel' }] });
  assert.equal(result.status, 'not_applicable');
  assert.deepEqual(result.categories, []);
});

test('no symptoms and no system yields insufficient_data, never a guess', () => {
  const result = recommendCategories({ intent: 'diagnostic', equipment: { brand: 'MACK' }, symptoms: [] });
  assert.equal(result.status, 'insufficient_data');
  assert.deepEqual(result.categories, []);
});

test('a category is never a SKU — no SKU-shaped token ever appears in the reasons', () => {
  const result = recommendCategories({ intent: 'diagnostic', symptoms: [{ code: 'water_in_fuel', system: 'fuel' }] });
  for (const entry of result.categories) {
    assert.doesNotMatch(entry.reason, /\bE[A-Z]\d{4,7}\b/);
  }
});
