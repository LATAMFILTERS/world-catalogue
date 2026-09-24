'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../scripts/candidates/premium_guard_oil_phase3_block2_canonical_20260923.json'),
  'utf8'
));
const row = manifest.find((item) => item.sku === 'EL39999');
const norm = (value) => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

test('CH9999 manifest is terminal with resolved 7061 ownership', () => {
  assert.ok(row);
  assert.equal(row.codigo_base, 'CH9999');
  assert.equal(row.canonical_brand, 'FRAM');
  assert.equal(row.oem_codes.length, 2);
  assert.equal(row.competitor_codes.length, 47);
  assert.equal(row.vehicle_applications.length, 10);
  assert.equal(row.reference_governance.status, 'RESOLVED_CROSS_CATEGORY_CONTAMINATION');
  assert.equal(row.reference_governance.resolved_code, '7061');
  assert.equal(row.reference_governance.verified_equivalent, 'MANN-FILTER HU824X');

  const competitorCodes = row.competitor_codes.map((ref) => norm(ref.code));
  for (const code of ['7061', 'TG9999', 'PG5610EX', 'HU824X']) {
    assert.ok(competitorCodes.includes(code), code + ' must remain published for EL39999');
  }

  const allCodes = [...row.oem_codes, ...row.competitor_codes].map((ref) => norm(ref.code));
  assert.equal(allCodes.includes('263202A001'), false);
  assert.ok(allCodes.includes('263203C100'));
});

test('CH9999 closure uses governed correction for hydraulic 7061 contamination', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '../scripts/migrations/run_130_close_ch9999_terminal.js'),
    'utf8'
  );
  assert.ok(source.includes("referenceCorrection:true"));
  assert.ok(source.includes("NAPA_OFFICIAL_PLUS_FRAM_CH9999"));
  assert.ok(source.includes("wrong_sku:WRONG"));
});
