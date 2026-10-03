'use strict';

const fs=require('fs');
const path=require('path');
const test=require('node:test');
const assert=require('node:assert/strict');

const migration=fs.readFileSync(
  path.join(__dirname,'..','scripts','migrations','run_132_repair_wp12005_identity.js'),
  'utf8'
);

test('run_132 is dry-run by default and serializable',()=>{
  assert.match(migration,/const EXECUTE = process\.argv\.includes\('--execute'\)/);
  assert.match(migration,/BEGIN ISOLATION LEVEL SERIALIZABLE/);
  assert.match(migration,/ROLLBACK \(dry-run\)/);
});

test('run_132 is scoped only to WP12005 EL32005 to EL83000',()=>{
  assert.match(migration,/WP12005/);
  assert.match(migration,/EL32005/);
  assert.match(migration,/EL83000/);
  assert.match(migration,/P553000/);
  assert.match(migration,/rows\.rowCount!==368/);
});

test('run_132 blocks relational and public collisions',()=>{
  assert.match(migration,/target collisions/);
  assert.match(migration,/public payload overlap/);
  assert.match(migration,/sourcePayload\.length!==450/);
  assert.match(migration,/targetPayload\.length!==1145/);
});

test('run_132 reuses governed public application writer',()=>{
  assert.match(migration,/catalog-application-write-service/);
  assert.match(migration,/applyVerifiedApplications/);
  assert.doesNotMatch(migration,/SET\s+vehicle_applications=/i);
  assert.doesNotMatch(migration,/SET\s+equipment_applications=/i);
});

test('run_132 creates parent and normalized MANN crossref only for canonical target',()=>{
  assert.match(migration,/EL83000','P553000','Oil Filter'/);
  assert.match(migration,/MANN-FILTER','WP12005'/);
  assert.match(migration,/P553000 parent conflict/);
  assert.match(migration,/WP12005 crossref conflict/);
});

test('run_132 preserves source_sku evidence and postchecks 368 rows',()=>{
  assert.doesNotMatch(migration,/SET\s+source_sku=/i);
  assert.match(migration,/source_remaining/);
  assert.match(migration,/target_rows/);
  assert.match(migration,/target_rows!==368/);
});
