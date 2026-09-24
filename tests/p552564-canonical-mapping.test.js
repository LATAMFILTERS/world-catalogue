'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('P552564 has one canonical ELIMFILTERS owner: EF92564', () => {
  const auth = read('scripts/donaldson_crossref_flat.csv');
  assert.match(auth, /^EF92564,fuel,P552564,/m);
  assert.doesNotMatch(auth, /^EF50953,[^\n]*,P552564,/m);
});

test('legacy LD cross-reference exports do not remap P552564 to EF50953', () => {
  for (const file of ['competitor_cross_references_ld.csv', 'external_cross_reference_master_ld.csv']) {
    const csv = read(file);
    assert.doesNotMatch(csv, /^"EF50953",[^\n]*"DONALDSON","P552564"/m, file);
  }
});

test('EF50953 keeps its separate Donaldson identity P502155', () => {
  const sku = read('sku_competitor_matrix_ld.csv');
  assert.match(sku, /^"EF50953"[^\n]*"P502155"/m);
});
