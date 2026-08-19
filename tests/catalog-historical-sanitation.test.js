'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { pageSupportsOfficialProduct } = require('../lib/donaldson-official-evidence');

test('official product evidence requires Donaldson context and exact normalized code', () => {
  assert.equal(pageSupportsOfficialProduct('<html><body>Donaldson P551313 Filter</body></html>', 'P551313'), true);
  assert.equal(pageSupportsOfficialProduct('<html><body>Generic P551313 Filter</body></html>', 'P551313'), false);
  assert.equal(pageSupportsOfficialProduct('<html><body>Donaldson P551999 Filter</body></html>', 'P551313'), false);
});

test('historical sanitation worker does not infer manufacturer absence or mutate alternate arrays/SKU', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'catalog-historical-sanitation.js'), 'utf8');
  assert.match(source, /absence_inferred:\s*0/);
  assert.match(source, /alternate_columns_mutated:\s*0/);
  assert.match(source, /sku_mutations:\s*0/);
  assert.doesNotMatch(source, /SET\s+oem_codes\s*=/i);
  assert.doesNotMatch(source, /SET\s+competitor_codes\s*=/i);
  assert.doesNotMatch(source, /SET\s+sku\s*=/i);
});

test('sanitation queue migration never updates protected catalog fields', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'migrations', 'run_074_catalog_historical_sanitation_queue.js'), 'utf8');
  assert.doesNotMatch(source, /UPDATE\s+elimfilters_catalog/i);
  assert.match(source, /protected_catalog_fields_mutated:\s*0/);
});
