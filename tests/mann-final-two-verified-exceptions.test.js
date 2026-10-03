'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const migration=fs.readFileSync(path.join(__dirname,'..','scripts','migrations','run_164_close_c118_pu1060x_verified_exceptions.js'),'utf8');

test('run_164 only touches C118 and PU1060X',()=>{
  assert.match(migration,/sku:'EA30118'.*source:'C118'/s);
  assert.match(migration,/sku:'EF31060'.*source:'PU1060X'/s);
  assert.doesNotMatch(migration,/W1428/);
  assert.doesNotMatch(migration,/C18146\/1/);
});

test('run_164 is fail-closed and semantic',()=>{
  assert.match(migration,/assertGovernedCatalogPatch/);
  assert.match(migration,/v_api_resolver_v7/);
  assert.match(migration,/REFUSE_NON_CANONICAL_DB/);
  assert.match(migration,/Product type','Ventilator/);
  assert.match(migration,/Outer diameter 1','79 mm/);
  assert.match(migration,/transaction='ROLLBACK'/);
  assert.match(migration,/transaction='COMMIT'/);
});
