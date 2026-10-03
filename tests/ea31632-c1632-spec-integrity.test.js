'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const migration=fs.readFileSync(
  path.join(__dirname,'..','scripts','migrations','run_160_repair_ea31632_c1632_specs.js'),
  'utf8'
);
const importer=fs.readFileSync(
  path.join(__dirname,'..','scripts','import_mann_specs.js'),
  'utf8'
);

test('run_160 repairs only the governed C1632 identity',()=>{
  assert.match(migration,/SKU='EA31632'/);
  assert.match(migration,/SOURCE='C1632'/);
  assert.match(migration,/height_mm:72/);
  assert.match(migration,/outer_diameter_mm:152/);
  assert.match(migration,/gasket_od_mm:88/);
  assert.match(migration,/gasket_id_mm:88/);
  assert.match(migration,/canonical_source_brand!=='MANN-FILTER'/);
  assert.match(migration,/REFUSE_NON_CANONICAL_DB/);
  assert.match(migration,/report\.transaction='COMMIT'/);
});

test('MANN spec importer is fail-closed on canonical source mismatch',()=>{
  assert.match(importer,/canonical_source_brand = 'MANN-FILTER'/);
  assert.match(importer,/norm_part\(canonical_source_code\) = ld_catalog\.norm_part\(\$8\)/);
  assert.match(importer,/row\.mann_source \|\| null/);
  assert.match(importer,/canonicalMismatch\+\+/);
});
