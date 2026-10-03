'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {validateCanonicalWrite}=require('../lib/catalog-write-gateway');

const migration=fs.readFileSync(
  path.join(__dirname,'..','scripts','migrations','run_158_create_c21632_oem_collision_identity.js'),
  'utf8'
);

test('LD OEM collision exception keeps MANN canonical identity',()=>{
  const row={
    sku:'EA31512',codigo_base:'4191512',duty:'LIGHT_DUTY',
    canonical_source_brand:'MANN-FILTER',canonical_source_code:'C2163/2',
    oem_codes:[],competitor_codes:[],
    enrichment_data:{codigo_base_governance:{
      origin_group:'EUROPEAN',
      mann_code_collision_verified:true,oem_base_verified:true,
      primary_manufacturer_verified:true,collision_canonical_code:'C2163/2',
      approved_manufacturer:'DEUTZ',approved_codigo_base:'4191512',
      approved_source_column:'OEM_CODES'
    }}
  };
  assert.equal(validateCanonicalWrite(row).valid,true);
});
test('LD OEM collision exception rejects wrong SKU suffix',()=>{
  const row={
    sku:'EA39999',codigo_base:'4191512',duty:'LIGHT_DUTY',
    canonical_source_brand:'MANN-FILTER',canonical_source_code:'C2163/2',
    oem_codes:[],competitor_codes:[],
    enrichment_data:{codigo_base_governance:{
      origin_group:'EUROPEAN',
      mann_code_collision_verified:true,oem_base_verified:true,
      primary_manufacturer_verified:true,collision_canonical_code:'C2163/2',
      approved_manufacturer:'DEUTZ',approved_codigo_base:'4191512',
      approved_source_column:'OEM_CODES'
    }}
  };
  assert.equal(validateCanonicalWrite(row).valid,false);
});

test('run_158 is isolated to C2163/2 and preserves C38163/2',()=>{
  assert.match(migration,/TARGET='EA31512'/);
  assert.match(migration,/MANN='C2163\/2'/);
  assert.match(migration,/OEM='4191512'/);
  assert.match(migration,/EXPECTED_ROWS=5/);
  assert.match(migration,/untouched_c381632/);
  assert.match(migration,/C1632/);
  assert.match(migration,/C2163/);
});
