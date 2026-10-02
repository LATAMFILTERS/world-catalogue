'use strict';

const fs = require('fs');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');

const ROOT = path.join(__dirname, '..');
const cabinCrossrefs = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'scripts', 'donaldson_cabin_crossref_progress.json'), 'utf8')
);
const dims = fs.readFileSync(path.join(ROOT, 'data', 'dims.csv'), 'utf8');
const migration = fs.readFileSync(
  path.join(ROOT, 'scripts', 'migrations', 'run_122_repair_cl120_series60_cabin_identity.js'),
  'utf8'
);

test('Donaldson scraper captured P614226 with the expected CL120 cabin cross references', () => {
  const row = cabinCrossrefs.P614226;
  assert.ok(row, 'P614226 must exist in Donaldson cabin scraper output');
  assert.deepEqual(row.FLEETGUARD, ['AF26428']);
  assert.deepEqual(row.FREIGHTLINER, ['91595', 'BOA91595']);
  assert.deepEqual(row.BALDWIN, ['PA5494']);
  assert.deepEqual(row.WIX, ['24595']);
});

test('canonical HD cabin SKU EC14226 exists in dimension data as cabin panel', () => {
  const line = dims.split(/\r?\n/).find(value => value.startsWith('EC14226,'));
  assert.ok(line, 'EC14226 must exist in data/dims.csv');
  assert.match(line, /Panel,cabin/i);
});

test('run_122 repairs the existing canonical identity instead of creating a parallel SKU', () => {
  assert.match(migration, /const TARGET_SKU = 'EC14226';/);
  assert.match(migration, /const DONALDSON = 'P614226';/);
  assert.match(migration, /const SOURCE_APPLICATION_SKU = 'EA17682';/);
  assert.match(migration, /DUPLICATE_DONALDSON_IDENTITY/);
  assert.match(migration, /TARGET_BASE_CONFLICT/);
});

test('run_122 binds the cabin filter to CL120 applications and the existing maintenance kit', () => {
  assert.match(migration, /ld_catalog\.ld_vehicle_applications/);
  assert.match(migration, /COLUMBIA CL120/);
  assert.match(migration, /SERIES 60/);
  assert.match(migration, /kit_components/);
  assert.match(migration, /CL120_SERIES60_MAINTENANCE_KIT_MISSING/);
});

test('run_122 requires all governed cross references to converge on EC14226', () => {
  for (const code of ['P614226', 'AF26428', '91595', 'BOA91595']) {
    assert.match(migration, new RegExp(code));
  }
  assert.match(migration, /CROSS_REFERENCE_MISSING/);
});
