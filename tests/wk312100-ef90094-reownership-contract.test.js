'use strict';
const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict');
const file=fs.readFileSync(path.join(__dirname,'..','scripts','migrations','run_144_reown_wk312100_to_ef90094.js'),'utf8');

test('run_144 maps WK31/2(100) to Donaldson P550094 / EF90094',()=>{
  assert.match(file,/SOURCE='EF32100'/); assert.match(file,/TARGET='EF90094'/);
  assert.match(file,/MANN='WK31\/2\(100\)'/); assert.match(file,/DONALDSON='P550094'/);
  assert.match(file,/EXPECTED_ROWS=543/);
});
test('run_144 requires verified HD Donaldson target and exact legacy source',()=>{
  assert.match(file,/target\.filter_type!=='fuel'/); assert.match(file,/target\.duty!=='HEAVY_DUTY'/);
  assert.match(file,/canonical_source_brand/); assert.match(file,/SOURCE_PARENT_CHANGED/); assert.match(file,/G7144/);
});
test('run_144 creates only parent and direct MANN crossref then reowns exact rows',()=>{
  assert.match(file,/INSERT INTO ld_catalog\.ld_product_catalog/);
  assert.match(file,/INSERT INTO ld_catalog\.ld_competitor_cross_references/);
  assert.match(file,/UPDATE ld_catalog\.ld_vehicle_applications/);
  assert.doesNotMatch(file,/UPDATE public\.elimfilters_catalog/);
});
test('run_144 is serializable dry-run and canonical-db only',()=>{
  assert.match(file,/BEGIN ISOLATION LEVEL SERIALIZABLE/); assert.match(file,/process\.argv\.includes\('--execute'\)/);
  assert.match(file,/u\.port!=='5441'/); assert.match(file,/ROLLBACK/);
});
