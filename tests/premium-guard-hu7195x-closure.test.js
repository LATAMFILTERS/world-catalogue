'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../scripts/candidates/premium_guard_oil_phase3_block2_canonical_20260923.json'),
  'utf8'
));
const row = manifest.find((item) => item.sku === 'EL37195');
const norm = (value) => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

test('HU719/5X manifest is terminal with resolved reference ownership', () => {
  assert.ok(row);
  assert.equal(row.codigo_base, 'HU719/5X');
  assert.equal(row.canonical_brand, 'MANN-FILTER');
  assert.equal(row.oem_codes.length, 12);
  assert.equal(row.competitor_codes.length, 59);
  assert.equal(row.vehicle_applications.length, 14);
  assert.equal(row.reference_governance.status, 'RESOLVED_CONTAMINATION_CLEANUP');
  assert.deepEqual(row.reference_governance.resolved_codes, ['725', 'L448', 'LF519']);

  const codes = row.competitor_codes.map((ref) => norm(ref.code));
  for (const code of ['725', 'L448', 'LF519', 'PF1708', 'PG5316']) {
    assert.ok(codes.includes(code), code + ' must remain published for EL37195');
  }
});

test('Part Search governance approves resolved HU719/5X references only for EL37195 LD', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '../lib/part-search-reference-governance-patch.js'),
    'utf8'
  );
  for (const code of ['725', 'L448', 'LF519']) {
    const pattern = new RegExp("'" + code.replace('/', '\\/') + "'[\\s\\S]{0,240}approvedSkus: Object\\.freeze\\(\\['EL37195'\\]\\)");
    assert.match(source, pattern);
  }
});