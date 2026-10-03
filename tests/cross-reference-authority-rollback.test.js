'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const worker=fs.readFileSync(path.join(__dirname,'..','scripts','catalog-historical-sanitation.js'),'utf8');
const migration=fs.readFileSync(path.join(__dirname,'..','scripts','migrations','run_174_revert_cross_reference_authority_promotions.js'),'utf8');

test('historical sanitation does not promote canonical base from literature cross-reference alone',()=>{
  assert.doesNotMatch(worker,/findOfficialLiteratureCrossReference/);
  assert.doesNotMatch(worker,/OFFICIAL_DONALDSON_LITERATURE_CROSS_REFERENCE/);
});

test('run_174 is fixed to the twelve policy-invalid promotions',()=>{
  const skus=['EH68273','EH67072','EH67074','EH67119','EH68074','EH68274','EH68277','EH68318','EH68319','EH68320','EH68936','EH68944'];
  for(const sku of skus) assert.match(migration,new RegExp(sku));
  assert.match(migration,/OFFICIAL_DONALDSON_CROSS_REFERENCE_ONLY/);
  assert.match(migration,/CROSS_REFERENCE_ONLY_NOT_MANUFACTURING_AUTHORITY/);
  assert.match(migration,/REVIEW_PRIMARY_CANDIDATE/);
  assert.match(migration,/BEGIN ISOLATION LEVEL SERIALIZABLE/);
  assert.match(migration,/REFUSE_NON_CANONICAL_DB/);
});
