'use strict';

const fs=require('fs');
const path=require('path');
const test=require('node:test');
const assert=require('node:assert/strict');

const ROOT=path.join(__dirname,'..');
const migration=fs.readFileSync(
  path.join(ROOT,'scripts','migrations','run_132_correct_a4_crossref_targets.js'),
  'utf8'
);

test('run_132 is dry-run by default and serializable',()=>{
  assert.match(migration,/const EXECUTE = process\.argv\.includes\('--execute'\)/);
  assert.match(migration,/BEGIN ISOLATION LEVEL SERIALIZABLE/);
  assert.match(migration,/ROLLBACK \(dry-run\)/);
});

test('run_132 corrects FP2141 to EC32141 with guarded dedupe',()=>{
  assert.match(migration,/EC30554/);
  assert.match(migration,/EC32141/);
  assert.match(migration,/FP2141/);
  assert.match(migration,/key_collisions!==155/);
  assert.match(migration,/exact_engine_collisions!==155/);
  assert.match(migration,/FP2141 dedupe .* != 155/);
  assert.match(migration,/FP2141 reown .* != 13/);
});

test('run_132 corrects CF6001 to Donaldson P130776 owner EA10776',()=>{
  assert.match(migration,/EA32521/);
  assert.match(migration,/EA10776/);
  assert.match(migration,/P130776/);
  assert.match(migration,/CF600\/1/);
  assert.match(migration,/CF6001 source rows .* != 106/);
  assert.match(migration,/CF6001 reown .* != 106/);
});

test('run_132 creates EA10776 parent only after verified Donaldson identity',()=>{
  assert.match(migration,/canonical_source_brand/);
  assert.match(migration,/canonical_source_status/);
  assert.match(migration,/DONALDSON/);
  assert.match(migration,/VERIFIED/);
  assert.match(migration,/INSERT INTO ld_catalog\.ld_product_catalog/);
  assert.match(migration,/EA10776','P130776','Air Filter/);
  assert.match(migration,/P130776 parent already owned/);
});

test('run_132 replaces only the two wrong normalized crossrefs',()=>{
  assert.match(migration,/wrong A4 crossref rows .* != 2/);
  assert.match(migration,/EC32141','CU2141','MANN-FILTER','FP2141/);
  assert.match(migration,/EA10776','P130776','MANN-FILTER','CF600\/1/);
  assert.match(migration,/wrong crossref delete .* != 2/);
});

test('run_132 records EA10776 as a safety secondary using existing product fields',()=>{
  assert.match(migration,/is_primary=false/);
  assert.match(migration,/sub_type='Safety Air Filter'/);
  assert.match(migration,/SAFETY_SECONDARY/);
  assert.doesNotMatch(migration,/CREATE TABLE/i);
});

test('run_132 has exact post-write verification',()=>{
  assert.match(migration,/fp_wrong/);
  assert.match(migration,/fp_correct/);
  assert.match(migration,/cf_wrong/);
  assert.match(migration,/cf_correct/);
  assert.match(migration,/post-verify mismatch/);
});
