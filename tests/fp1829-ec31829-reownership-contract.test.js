'use strict';
const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict');
const file=fs.readFileSync(path.join(__dirname,'..','scripts','migrations','run_139_reown_fp1829_to_ec31829.js'),'utf8');

test('run_139 is scoped only to FP1829 EA31829 -> EC31829',()=>{
  assert.match(file,/SOURCE='EA31829'/);
  assert.match(file,/TARGET='EC31829'/);
  assert.match(file,/CODE='FP1829'/);
  assert.match(file,/EXPECTED_SOURCE_ROWS=160/);
  assert.match(file,/EXPECTED_OVERLAP=154/);
  assert.match(file,/EXPECTED_UNIQUE=6/);
});

test('run_139 requires cabin target CU1829 and preserves AIR source identity',()=>{
  assert.match(file,/source\.filter_type!=='air'/);
  assert.match(file,/target\.filter_type!=='cabin'/);
  assert.match(file,/SOURCE_PARENT_CHANGED/);
  assert.match(file,/TARGET_PARENT_CHANGED/);
  assert.match(file,/CU1829/);
  assert.match(file,/C1829/);
});

test('run_139 deletes only exact target duplicates and reowns only remaining FP1829 rows',()=>{
  assert.match(file,/DELETE FROM ld_catalog\.ld_vehicle_applications s/);
  assert.match(file,/UPDATE ld_catalog\.ld_vehicle_applications\s*SET elimfilters_sku=\$1/);
  assert.match(file,/source_sku\)=ld_catalog\.norm_part\(\$3\)/);
  assert.match(file,/UNIQUE_FP1829_CABIN_COLLISIONS/);
});

test('run_139 does not mutate catalog identity evidence layers',()=>{
  assert.doesNotMatch(file,/UPDATE public\.elimfilters_catalog/);
  assert.doesNotMatch(file,/INSERT INTO public\.elimfilters_catalog/);
  assert.doesNotMatch(file,/ld_canonical_product_identity\s+SET/i);
  assert.doesNotMatch(file,/INSERT INTO ld_catalog\.ld_competitor_cross_references/);
  assert.doesNotMatch(file,/INSERT INTO ld_catalog\.ld_oem_cross_references/);
  assert.doesNotMatch(file,/UPDATE ld_catalog\.ld_production_readiness/);
});

test('run_139 is serializable, dry-run by default, and canonical-db only',()=>{
  assert.match(file,/process\.argv\.includes\('--execute'\)/);
  assert.match(file,/BEGIN ISOLATION LEVEL SERIALIZABLE/);
  assert.match(file,/u\.port!=='5441'/);
  assert.match(file,/ROLLBACK/);
});
