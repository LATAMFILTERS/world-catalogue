'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../scripts/candidates/ch10295_pg5702ex_canonical_20260924.json'),
  'utf8'
));
const norm = (value) => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

test('CH10295 manifest is terminal with base collisions held', () => {
  assert.equal(manifest.sku, 'EL30295');
  assert.equal(manifest.codigo_base, 'CH10295');
  assert.equal(manifest.canonical_brand, 'FRAM');
  assert.equal(manifest.oem_codes.length, 5);
  assert.equal(manifest.competitor_codes.length, 45);
  assert.equal(manifest.vehicle_applications.length, 13);
  assert.equal(manifest.reference_governance.status, 'CLOSED_WITH_ACTIVE_BASE_COLLISIONS_HELD');
  assert.deepEqual(manifest.reference_governance.held_codes, ['7041', '7310']);
  assert.equal(manifest.reference_governance.verified_equivalent, 'MANN-FILTER HU7062Z');

  const published = manifest.competitor_codes.map((ref) => norm(ref.code));
  assert.equal(published.includes('7041'), false);
  assert.equal(published.includes('7310'), false);
  assert.ok(published.includes('HU7062Z'));
  assert.ok(published.includes('PG5702EX'));
});

test('CH10295 terminal migration records canonical verified governance', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '../scripts/migrations/run_133_close_ch10295_terminal.js'),
    'utf8'
  );
  assert.ok(source.includes("state:'CANONICAL_VERIFIED'"));
  assert.ok(source.includes("verified_equivalents:['MANN-FILTER HU7062Z']"));
  assert.ok(source.includes("HELD_ACTIVE_BASE_COLLISION"));
});
