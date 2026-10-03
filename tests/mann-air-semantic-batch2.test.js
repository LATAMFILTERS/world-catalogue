'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const migration=fs.readFileSync(
  path.join(__dirname,'..','scripts','migrations','run_162_repair_mann_air_semantic_batch2.js'),
  'utf8'
);

test('batch2 keeps canonical MANN identities and uses existing semantic fields',()=>{
  for(const [sku,source] of [
    ['EA31632','C1632'],['EA37125','C17125'],['EA33540','C33540'],['EA31104','C21104']
  ]){
    assert.match(migration,new RegExp(`sku:'${sku}'.*source:'${source}'`,'s'));
  }
  assert.match(migration,/product_length_mm=\$3/);
  assert.match(migration,/outer_diameter_mm=\$4/);
  assert.match(migration,/inner_diameter_mm=\$5/);
  assert.match(migration,/gasket_od_mm=NULL/);
  assert.match(migration,/gasket_id_mm=NULL/);
  assert.match(migration,/ld_product_specifications/);
});

test('batch2 is fail-closed and does not touch identity/application ownership',()=>{
  assert.match(migration,/REFUSE_NON_CANONICAL_DB/);
  assert.match(migration,/canonical_source_brand!=='MANN-FILTER'/);
  assert.match(migration,/canonical_source_code!==t\.source/);
  assert.doesNotMatch(migration,/UPDATE ld_catalog\.ld_vehicle_applications/);
  assert.doesNotMatch(migration,/UPDATE ld_catalog\.ld_product_catalog/);
  assert.doesNotMatch(migration,/UPDATE ld_catalog\.ld_canonical_product_identity/);
  assert.match(migration,/report\.transaction='COMMIT'/);
});
