'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const migration=fs.readFileSync(path.join(__dirname,'..','scripts','migrations','run_173_close_mann_governance_exceptions.js'),'utf8');
const audit=fs.readFileSync(path.join(__dirname,'..','scripts','audit_mann_spec_collisions.js'),'utf8');

test('run_173 only handles W1428 and C18146/1 governance exceptions',()=>{
  assert.match(migration,/sku:'EL31428'/);
  assert.match(migration,/source:'W1428'/);
  assert.match(migration,/sku:'EA31461'/);
  assert.match(migration,/source:'C18146\/1'/);
  assert.match(migration,/NANOFORCE™/);
  assert.match(migration,/EXCEPTION_CONFIRMED/);
  assert.match(migration,/HISTORICAL_COLLISION_SIGNATURE_CHANGED/);
});

test('auditor excludes only explicit confirmed governance exceptions',()=>{
  assert.match(audit,/canonical_source_status==='EXCEPTION_CONFIRMED'/);
  assert.match(audit,/GOVERNANCE_EXCEPTION_CONFIRMED/);
  assert.doesNotMatch(audit,/actionable=findings\.filter\(f=>\['GOVERNANCE_EXCEPTION_CONFIRMED'/);
});
