'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../scripts/candidates/premium_guard_oil_phase3_block2_canonical_20260923.json'),
  'utf8'
));
const row = manifest.find((item) => item.sku === 'EL30158');
const norm = (value) => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

test('CH10158 manifest is terminal with 12 OEM references', () => {
  assert.ok(row);
  assert.equal(row.codigo_base, 'CH10158');
  assert.equal(row.canonical_brand, 'FRAM');
  assert.equal(row.oem_codes.length, 12);
  assert.equal(row.competitor_codes.length, 45);
  assert.equal(row.vehicle_applications.length, 18);
  assert.equal(row.reference_governance.status, 'RESOLVED_NO_ACTIVE_COLLISIONS');

  const oemCodes = row.oem_codes.map((ref) => norm(ref.code));
  for (const code of ['041520R010', '0415226010', '15613YZZA2']) {
    assert.ok(oemCodes.includes(code), code + ' must remain published for EL30158');
  }
});

test('CH10158 closure preserves verified MANN HU7009Z equivalence', () => {
  assert.equal(row.reference_governance.verified_equivalent, 'MANN-FILTER HU7009Z');
  const source = fs.readFileSync(
    path.join(__dirname, '../scripts/migrations/run_128_normalize_ch10158_governance.js'),
    'utf8'
  );
  assert.match(source, /state:'CANONICAL_VERIFIED'/);
  assert.ok(source.includes("verified_equivalents:['MANN-FILTER HU7009Z']"));
});