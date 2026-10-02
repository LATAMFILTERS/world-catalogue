'use strict';

const fs=require('fs');
const path=require('path');
const test=require('node:test');
const assert=require('node:assert/strict');

const ROOT=path.join(__dirname,'..');
const migration=fs.readFileSync(
  path.join(ROOT,'scripts','migrations','run_133_govern_b1_equivalent_oil_pair.js'),
  'utf8'
);

test('run_133 is dry-run by default and serializable',()=>{
  assert.match(migration,/const EXECUTE = process\.argv\.includes\('--execute'\)/);
  assert.match(migration,/BEGIN ISOLATION LEVEL SERIALIZABLE/);
  assert.match(migration,/ROLLBACK \(dry-run\)/);
});

test('run_133 locks the exact B1 pair and 791 shared groups',()=>{
  assert.match(migration,/EL30250/);
  assert.match(migration,/EL31033/);
  assert.match(migration,/a_groups!==791/);
  assert.match(migration,/b_groups!==791/);
  assert.match(migration,/shared_groups!==791/);
});

test('run_133 requires identical OE sets and dimensions',()=>{
  assert.match(migration,/shared_oem!==7/);
  assert.match(migration,/a_only!==0/);
  assert.match(migration,/b_only!==0/);
  assert.match(migration,/Number\(a\.height_mm\)!==264/);
  assert.match(migration,/Number\(a\.outer_diameter_mm\)!==108/);
});

test('run_133 writes mutual alternatives only',()=>{
  assert.match(migration,/nextA\.push\(\{sku:B\}\)/);
  assert.match(migration,/nextB\.push\(\{sku:A\}\)/);
  assert.match(migration,/MUTUAL_FUNCTIONAL_ALTERNATIVE/);
  assert.doesNotMatch(migration,/UPDATE\s+ld_catalog\.ld_vehicle_applications/i);
});

test('run_133 records MANN evidence',()=>{
  assert.match(migration,/W11102\/50/);
  assert.match(migration,/W11033/);
  assert.match(migration,/MANN-FILTER/);
});
