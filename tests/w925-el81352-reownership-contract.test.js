'use strict';
const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict');
const file=fs.readFileSync(path.join(__dirname,'..','scripts','migrations','run_142_reown_w925_to_el81352.js'),'utf8');

test('run_142 maps W925 to existing Donaldson P551352 / EL81352',()=>{
  assert.match(file,/SOURCE='EL30925'/);
  assert.match(file,/TARGET='EL81352'/);
  assert.match(file,/MANN='W925'/);
  assert.match(file,/DONALDSON='P551352'/);
  assert.match(file,/EXPECTED_ROWS=220/);
});

test('run_142 requires verified HD Donaldson target and exact source identity',()=>{
  assert.match(file,/target\.filter_type!=='oil'/);
  assert.match(file,/target\.duty!=='HEAVY_DUTY'/);
  assert.match(file,/canonical_source_brand/);
  assert.match(file,/canonical_source_status/);
  assert.match(file,/SOURCE_PARENT_CHANGED/);
});

test('run_142 creates only relational parent plus MANN crossref and reowns exact W925 rows',()=>{
  assert.match(file,/INSERT INTO ld_catalog\.ld_product_catalog/);
  assert.match(file,/INSERT INTO ld_catalog\.ld_competitor_cross_references/);
  assert.match(file,/'MANN-FILTER'/);
  assert.match(file,/UPDATE ld_catalog\.ld_vehicle_applications/);
  assert.match(file,/id=ANY\(\$3::bigint\[\]\)/);
});

test('run_142 leaves public product identity untouched and requires empty target apps',()=>{
  assert.doesNotMatch(file,/UPDATE public\.elimfilters_catalog/);
  assert.doesNotMatch(file,/INSERT INTO public\.elimfilters_catalog/);
  assert.match(file,/TARGET_APPLICATIONS_CHANGED/);
  assert.match(file,/W925_ALREADY_CLAIMED/);
});

test('run_142 is serializable dry-run and canonical-db only',()=>{
  assert.match(file,/BEGIN ISOLATION LEVEL SERIALIZABLE/);
  assert.match(file,/process\.argv\.includes\('--execute'\)/);
  assert.match(file,/u\.port!=='5441'/);
  assert.match(file,/ROLLBACK/);
});
