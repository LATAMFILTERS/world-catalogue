'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const migration=fs.readFileSync(
  path.join(__dirname,'..','scripts','migrations','run_161_repair_mann_air_spec_collision_batch1.js'),
  'utf8'
);
const audit=fs.readFileSync(
  path.join(__dirname,'..','scripts','audit_mann_spec_collisions.js'),
  'utf8'
);

test('batch1 is isolated to three verified MANN air identities',()=>{
  for(const [sku,source] of [['EA36005','C16005'],['EA31151','C1151'],['EA39004','C9004']]){
    assert.match(migration,new RegExp(`sku:'${sku}'.*source:'${source}'`,'s'));
  }
  assert.match(migration,/filter_type!=='air'/);
  assert.match(migration,/duty!=='LIGHT_DUTY'/);
  assert.match(migration,/canonical_source_brand!=='MANN-FILTER'/);
  assert.match(migration,/REFUSE_NON_CANONICAL_DB/);
});

test('batch1 writes semantic dimensions and clears legacy gasket misuse',()=>{
  assert.match(migration,/inner_diameter_mm=\$4/);
  assert.match(migration,/gasket_od_mm=NULL/);
  assert.match(migration,/gasket_id_mm=NULL/);
  assert.match(migration,/ld_product_specifications/);
  assert.match(migration,/ON CONFLICT\(elimfilters_sku,spec_key\)/);
  assert.match(migration,/report\.transaction='COMMIT'/);
});

test('collision auditor distinguishes confirmed overwrite from unresolved mismatch',()=>{
  assert.match(audit,/CONFIRMED_OFF_CANONICAL_OVERWRITE/);
  assert.match(audit,/LIVE_DIFFERS_CANONICAL/);
  assert.match(audit,/matching_off_canonical_sources/);
  assert.match(audit,/REFUSE_NON_CANONICAL_DB/);
});
