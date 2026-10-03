'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const file=fs.readFileSync(path.join(__dirname,'..','scripts','audits','audit_competing_sku_application_evidence_b3.js'),'utf8');

test('B3 classifies vetted distinct identities separately',()=>{
  assert.match(file,/VALIDATED_DISTINCT_IDENTITY_OVERLAP/);
  assert.match(file,/EA33172\|EA31721\|air/);
  assert.match(file,/EA34436\|EA31287\|air/);
  assert.match(file,/EF39016\|EF30034\|fuel/);
  assert.match(file,/EL34021\|EL39403\|oil/);
  assert.match(file,/EA37200\|EA36752\|air/);
});

test('validated distinct reason is emitted for audit traceability',()=>{
  assert.match(file,/validated_distinct_reason:validatedDistinctReason \|\| null/);
});
