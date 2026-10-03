'use strict';
const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict');
const f=fs.readFileSync(path.join(__dirname,'..','scripts','migrations','run_152_repair_w66_identity_and_specs.js'),'utf8');

test('run_152 scopes EL30066 to W66',()=>{
  assert.match(f,/SKU='EL30066'/);
  assert.match(f,/MANN='W66'/);
  assert.match(f,/OLD_PARENT='CH6070'/);
  assert.match(f,/EXPECTED_APPS=50/);
});

test('run_152 uses European MANN V3.2 governance',()=>{
  assert.match(f,/'origin_group','EUROPEAN'/);
  assert.match(f,/'approved_manufacturer','MANN-FILTER'/);
  assert.match(f,/2026-08-29-v3\.2-regional/);
  assert.match(f,/MANN_FILTER_REGIONAL_CANONICAL/);
});

test('run_152 corrects only supported W66 dimensions and preserves applications',()=>{
  assert.match(f,/height_mm=60/);
  assert.match(f,/outer_diameter_mm=66/);
  assert.match(f,/thread_size='M20x1\.5 mm'/);
  assert.doesNotMatch(f,/UPDATE ld_catalog\.ld_vehicle_applications/);
});

test('run_152 refuses conflicts and is dry-run guarded',()=>{
  assert.match(f,/W66_CONFLICTS/);
  assert.match(f,/SKU_ALREADY_HAS_CANONICAL_IDENTITY/);
  assert.match(f,/BEGIN ISOLATION LEVEL SERIALIZABLE/);
  assert.match(f,/ROLLBACK/);
  assert.match(f,/u\.port!=='5441'/);
});
