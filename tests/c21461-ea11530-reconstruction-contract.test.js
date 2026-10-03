'use strict';
const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict');
const file=fs.readFileSync(path.join(__dirname,'..','scripts','migrations','run_143_reconstruct_c21461_to_ea11530.js'),'utf8');

test('run_143 derives EA11530 from governed Donaldson AIR SKU rule',()=>{
  assert.match(file,/SOURCE='EA31461'/);
  assert.match(file,/TARGET='EA11530'/);
  assert.match(file,/MANN='C21461'/);
  assert.match(file,/DONALDSON='P781530'/);
  assert.match(file,/const derived='EA1'\+last4\(DONALDSON\)/);
  assert.match(file,/SKU_RULE_MISMATCH/);
});

test('run_143 creates verified HD MACROCORE P781530 with Donaldson dimensions',()=>{
  assert.match(file,/'MACROCORE™',264,170,103/);
  assert.match(file,/'HEAVY_DUTY','Cellulose','Round','DONALDSON'/);
  assert.match(file,/DONALDSON_P781530_PRODUCT_GUIDE/);
});

test('run_143 requires exact C21461 scope and preserves C181461 source identity',()=>{
  assert.match(file,/EXPECTED_ROWS=14/);
  assert.match(file,/canonical_source_code\)!=='C181461'/);
  assert.match(file,/SOURCE_HAS_OTHER_APPLICATIONS/);
  assert.match(file,/C21461_ALREADY_CLAIMED/);
});

test('run_143 creates only target product parent crossref and reowns exact rows',()=>{
  assert.match(file,/INSERT INTO public\.elimfilters_catalog/);
  assert.match(file,/INSERT INTO ld_catalog\.ld_product_catalog/);
  assert.match(file,/INSERT INTO ld_catalog\.ld_competitor_cross_references/);
  assert.match(file,/UPDATE ld_catalog\.ld_vehicle_applications/);
  assert.doesNotMatch(file,/UPDATE public\.elimfilters_catalog/);
});

test('run_143 is serializable dry-run and canonical-db only',()=>{
  assert.match(file,/BEGIN ISOLATION LEVEL SERIALIZABLE/);
  assert.match(file,/process\.argv\.includes\('--execute'\)/);
  assert.match(file,/u\.port!=='5441'/);
  assert.match(file,/ROLLBACK/);
});
