'use strict';

const fs=require('fs');
const path=require('path');
const test=require('node:test');
const assert=require('node:assert/strict');

const ROOT=path.join(__dirname,'..');
const migration=fs.readFileSync(
  path.join(ROOT,'scripts','migrations','run_134_split_pu731x_wk731_identity_collision.js'),
  'utf8'
);

test('run_134 is dry-run by default and serializable',()=>{
  assert.match(migration,/const EXECUTE = process\.argv\.includes\('--execute'\)/);
  assert.match(migration,/BEGIN ISOLATION LEVEL SERIALIZABLE/);
  assert.match(migration,/ROLLBACK \(dry-run\)/);
});

test('run_134 locks the historical mixed-row counts',()=>{
  assert.match(migration,/WK731 rows .* != 1493/);
  assert.match(migration,/PU731X rows .* != 58/);
  assert.match(migration,/WK8226 rows .* != 1877/);
  assert.match(migration,/exact_overlap!==1451/);
});

test('run_134 routes WK731 to verified Donaldson P553004 owner',()=>{
  assert.match(migration,/EF9553004/);
  assert.match(migration,/P553004/);
  assert.match(migration,/DONALDSON/);
  assert.match(migration,/canonical_source_status/);
  assert.match(migration,/VALUES \('EF9553004','P553004','Fuel Filter'\)/);
});

test('run_134 preserves PU731X as its own identity and governed public applications',()=>{
  assert.match(migration,/EF30731/);
  assert.match(migration,/PU731X/);
  assert.match(migration,/RESTORE_SEPARATE_PRODUCT_IDENTITY/);
  assert.match(migration,/applyVerifiedApplications/);
  assert.match(migration,/height_mm=93/);
  assert.match(migration,/outer_diameter_mm=65/);
  assert.match(migration,/inner_diameter_mm=19/);
});

test('run_134 removes WK8226 placeholder applications and corrects only unique rows',()=>{
  assert.match(migration,/WK8226 dedupe .* != 1451/);
  assert.match(migration,/WK8226 unique reown .* != 426/);
  assert.match(migration,/source_sku='WK731'/);
  assert.match(migration,/catalog_active=false/);
  assert.match(migration,/INACTIVE_INVALID_PLACEHOLDER/);
});

test('run_134 adds normalized MANN WK731 alias to canonical Donaldson owner',()=>{
  assert.match(migration,/MANN-FILTER','WK731/);
  assert.match(migration,/ld_competitor_cross_references/);
});

test('run_134 has exact post-write verification',()=>{
  assert.match(migration,/pu_rows!==58/);
  assert.match(migration,/pu_wrong_wk_rows!==0/);
  assert.match(migration,/placeholder_rows!==0/);
  assert.match(migration,/canonical_wk731_rows!==1919/);
  assert.match(migration,/placeholder_active!==false/);
});
