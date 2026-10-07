'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { PRODUCTS, buildRow } = require('../scripts/migrations/run_226_isuzu_rd_governed_products');

function byBase(base) {
  return PRODUCTS.find(p => p.base === base);
}

test('Isuzu RD governed closure contains exactly the three missing Donaldson products', () => {
  assert.deepEqual(
    PRODUCTS.map(p => p.base).sort(),
    ['P502502','P505951','P848204']
  );
  assert.deepEqual(
    PRODUCTS.map(p => p.sku).sort(),
    ['EF92502','EF95951','EF98204']
  );
});

test('fuel technology scope stays governed', () => {
  assert.equal(byBase('P505951').technology, 'SYNTAPORE™');
  assert.equal(byBase('P848204').technology, 'SYNTAPORE™');
  assert.equal(byBase('P502502').technology, 'HYDROCORE™');
  assert.match(byBase('P502502').sub_type, /Water Separator/i);
});

test('NPR71 4HG1 fuel application is scoped to Dominican Republic', () => {
  const app = byBase('P505951').applications[0];
  assert.equal(app.make, 'ISUZU');
  assert.equal(app.model, 'NPR71');
  assert.equal(app.engine, '4HG1');
  assert.equal(app.market, 'DOMINICAN_REPUBLIC');
  assert.equal(app.filter_position, 'FUEL_PRIMARY');
});

test('FTR90SL-PDS gets both missing fuel positions under the 4HK1-TCS identity', () => {
  const primary = byBase('P848204').applications[0];
  const separator = byBase('P502502').applications[0];
  for (const app of [primary, separator]) {
    assert.equal(app.make, 'ISUZU');
    assert.equal(app.model, 'FTR90SL-PDS');
    assert.equal(app.engine, '4HK1-TCS');
    assert.equal(app.market, 'DOMINICAN_REPUBLIC');
    assert.equal(app.year_from, 2021);
    assert.equal(app.year_to, 2021);
  }
  assert.equal(primary.filter_position, 'FUEL_PRIMARY');
  assert.equal(separator.filter_position, 'FUEL_WATER_SEPARATOR');
});

test('all rows use verified Donaldson Heavy Duty governance', () => {
  for (const p of PRODUCTS) {
    const row = buildRow(p);
    assert.equal(row.duty, 'HEAVY_DUTY');
    assert.equal(row.codigo_base, p.base);
    assert.equal(row.canonical_source_brand, 'DONALDSON');
    assert.equal(row.canonical_source_code, p.base);
    assert.equal(row.enrichment_data.codigo_base_governance.approved_manufacturer, 'DONALDSON');
    assert.equal(row.enrichment_data.codigo_base_governance.primary_manufacturer_verified, true);
  }
});
