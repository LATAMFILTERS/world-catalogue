'use strict';
const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict');
const f=fs.readFileSync(path.join(__dirname,'..','scripts','migrations','run_150_reown_wp10003_to_el83852.js'),'utf8');

test('run_150 scopes WP10003 to Fleetguard LF3852 fallback',()=>{
  assert.match(f,/SOURCE='EL30003'/);
  assert.match(f,/TARGET='EL83852'/);
  assert.match(f,/MANN='WP10003'/);
  assert.match(f,/FLEETGUARD='LF3852'/);
  assert.match(f,/OEM='MD086786'/);
  assert.match(f,/EXPECTED_ROWS=2/);
});

test('run_150 requires Donaldson OEM absence and Fleetguard OEM evidence',()=>{
  assert.match(f,/DONALDSON_OEM_MATCH_NOW_EXISTS/);
  assert.match(f,/TARGET_OEM_EVIDENCE_CHANGED/);
  assert.match(f,/donaldson_absence_verified:true/);
  assert.match(f,/fallback_manufacturer_verified:true/);
  assert.match(f,/fallback_commercial_code_verified:true/);
});

test('run_150 verifies fallback target then reowns only exact WP10003 rows',()=>{
  assert.match(f,/canonical_source_brand='FLEETGUARD'/);
  assert.match(f,/CANONICAL_VERIFIED_FALLBACK/);
  assert.match(f,/INSERT INTO ld_catalog\.ld_product_catalog/);
  assert.match(f,/INSERT INTO ld_catalog\.ld_competitor_cross_references/);
  assert.match(f,/UPDATE ld_catalog\.ld_vehicle_applications/);
  assert.match(f,/id=ANY\(\$3::bigint\[\]\)/);
});

test('run_150 preserves source public identity and is dry-run guarded',()=>{
  assert.doesNotMatch(f,/UPDATE public\.elimfilters_catalog[\s\S]*WHERE sku=\$2/);
  assert.match(f,/BEGIN ISOLATION LEVEL SERIALIZABLE/);
  assert.match(f,/process\.argv\.includes\('--execute'\)/);
  assert.match(f,/u\.port!=='5441'/);
  assert.match(f,/ROLLBACK/);
});
