'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../scripts/candidates/premium_guard_oil_phase3_block2_canonical_20260923.json'),
  'utf8'
));
const mw75 = manifest.find((row) => row.sku === 'EL30075');
const norm = (value) => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

test('MW75 manifest is terminal and ambiguous references remain held', () => {
  assert.ok(mw75);
  assert.equal(mw75.codigo_base, 'MW75');
  assert.equal(mw75.canonical_brand, 'MANN-FILTER');
  assert.equal(mw75.oem_codes.length, 9);
  assert.equal(mw75.competitor_codes.length, 25);
  assert.equal(mw75.reference_governance.status, 'CLOSED_WITH_AMBIGUOUS_REFERENCES_HELD');
  assert.equal(mw75.reference_governance.held_codes.length, 14);

  const held = new Set(mw75.reference_governance.held_codes.map(norm));
  const published = [...mw75.oem_codes, ...mw75.competitor_codes]
    .map((row) => norm(row.code || row.part_number || row.reference));
  assert.deepEqual(published.filter((code) => held.has(code)), []);
});

test('known wrong Wix 57035 cannot be republished by MW75 manifest', () => {
  const published = [...mw75.oem_codes, ...mw75.competitor_codes]
    .map((row) => norm(row.code || row.part_number || row.reference));
  assert.equal(published.includes('57035'), false);
});