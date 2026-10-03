'use strict';
const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict');
const file=fs.readFileSync(path.join(__dirname,'..','scripts','migrations','run_141_reconstruct_c271397_to_ea17797.js'),'utf8');

test('run_141 reconstructs C271397 as Donaldson P117797 / EA17797',()=>{
  assert.match(file,/SOURCE='EA31397'/);
  assert.match(file,/TARGET='EA17797'/);
  assert.match(file,/MANN='C271397'/);
  assert.match(file,/DONALDSON='P117797'/);
  assert.match(file,/EXPECTED_ROWS=107/);
});

test('run_141 creates a verified HD MACROCORE air target with governed geometry',()=>{
  assert.match(file,/'MACROCORE™'/);
  assert.match(file,/579\.4,263\.5,153\.2/);
  assert.match(file,/'HEAVY_DUTY','Cellulose','Round','DONALDSON'/);
  assert.match(file,/'VERIFIED'/);
});

test('run_141 creates only parent and direct MANN crossref then reowns exact source rows',()=>{
  assert.match(file,/INSERT INTO ld_catalog\.ld_product_catalog/);
  assert.match(file,/INSERT INTO ld_catalog\.ld_competitor_cross_references/);
  assert.match(file,/'MANN-FILTER'/);
  assert.match(file,/UPDATE ld_catalog\.ld_vehicle_applications/);
  assert.match(file,/id=ANY\(\$3::bigint\[\]\)/);
});

test('run_141 refuses existing target or P117797 ownership and leaves unrelated source applications untouched',()=>{
  assert.match(file,/TARGET_OR_DONALDSON_ALREADY_EXISTS/);
  assert.match(file,/TARGET_PARENT_CONFLICT/);
  assert.match(file,/source_other_application_groups/);
  assert.doesNotMatch(file,/DELETE FROM ld_catalog\.ld_vehicle_applications/);
});

test('run_141 types reused SQL parameters explicitly',()=>{assert.match(file,/\$1::text,\$2::text/);assert.match(file,/approved_codigo_base',\$2::text/)});

test('run_141 is serializable dry-run and canonical-db only',()=>{
  assert.match(file,/BEGIN ISOLATION LEVEL SERIALIZABLE/);
  assert.match(file,/process\.argv\.includes\('--execute'\)/);
  assert.match(file,/u\.port!=='5441'/);
  assert.match(file,/ROLLBACK/);
});
