'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  rowsForYear,
  resolveIsuzuNSeriesCustomerQuery,
  aftermarketResearchAllowed,
} = require('../lib/isuzu-n-series-oem-resolver');

test('2022 diesel OEM matrix preserves all four Isuzu models independently', () => {
  const rows = rowsForYear(2022).filter(r => r.fuel === 'DIESEL');
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0].models, ['NPR-HD','NPR-XD','NQR','NRR']);
});

test('2025 OEM matrix reflects NRR Derate replacing NQR in diesel lineup', () => {
  const row = rowsForYear(2025).find(r => r.fuel === 'DIESEL');
  assert.deepEqual(row.models, ['NPR-HD','NPR-XD','NRR DERATE','NRR']);
  assert.equal(row.models.includes('NQR'), false);
});

test('customer query NPR 2022 5.2 diesel does not guess between NPR-HD and NPR-XD', () => {
  const result = resolveIsuzuNSeriesCustomerQuery({
    year: 2022,
    model: 'NPR',
    engine: '5.2L',
    fuel: 'diesel',
  });
  assert.equal(result.status, 'NEEDS_MODEL_VARIANT');
  assert.deepEqual(result.candidates.map(x => x.model), ['NPR-HD','NPR-XD']);
  assert.equal(aftermarketResearchAllowed(result), false);
});

test('customer query exact NPR-HD 2022 5.2 closes OEM identity and can proceed downstream', () => {
  const result = resolveIsuzuNSeriesCustomerQuery({
    year: 2022,
    model: 'NPR-HD',
    engine: '5.2L',
    fuel: 'diesel',
  });
  assert.equal(result.status, 'OEM_IDENTITY_CLOSED');
  assert.equal(result.candidates[0].model, 'NPR-HD');
  assert.equal(result.candidates[0].fuel, 'DIESEL');
  assert.equal(aftermarketResearchAllowed(result), true);
});

test('plain NPR 2023 gas is preserved as a different OEM configuration', () => {
  const result = resolveIsuzuNSeriesCustomerQuery({
    year: 2023,
    model: 'NPR',
    engine: '6.6L',
    fuel: 'gas',
  });
  assert.equal(result.status, 'OEM_IDENTITY_CLOSED');
  assert.equal(result.candidates[0].model, 'NPR');
  assert.equal(result.candidates[0].fuel, 'GASOLINE');
});

test('same displacement across models never collapses model identities', () => {
  const hd = resolveIsuzuNSeriesCustomerQuery({ year: 2024, model: 'NPR-HD', engine: '5.2L' });
  const xd = resolveIsuzuNSeriesCustomerQuery({ year: 2024, model: 'NPR-XD', engine: '5.2L' });
  assert.equal(hd.candidates[0].engine_displacement, xd.candidates[0].engine_displacement);
  assert.notEqual(hd.candidates[0].model, xd.candidates[0].model);
});
