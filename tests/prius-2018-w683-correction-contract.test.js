'use strict';
const fs=require('fs');
const path=require('path');
const test=require('node:test');
const assert=require('node:assert/strict');

const FILE=path.join(__dirname,'..','scripts','migrations','run_136_correct_prius_2018_w683_application.js');
const s=fs.readFileSync(FILE,'utf8');
const m=require(FILE);

test('run_133 is scoped to the single run_126 Prius row',()=>{
  assert.equal(m.TARGET_ID,385632);
  assert.equal(m.SOURCE_EVIDENCE_ID,165983);
  assert.equal(m.SKU,'EL34967');
  assert.equal(m.SOURCE,'W68/3');
  assert.equal(m.EXPECTED_YEAR,'2018');
  assert.equal(m.EXPECTED_CCM,'1798');
  assert.match(s,/UPDATE ld_catalog\.ld_vehicle_applications[\s\S]*SET year=\$1, ccm=\$2/);
  assert.doesNotMatch(s,/INSERT INTO ld_catalog\.ld_vehicle_applications/i);
  assert.doesNotMatch(s,/DELETE FROM ld_catalog\.ld_vehicle_applications/i);
});
test('run_133 requires direct DB and raw CSV evidence',()=>{
  assert.match(s,/SOURCE_EVIDENCE_ID/);
  assert.match(s,/RAW_CSV_EVIDENCE_NOT_UNIQUE/);
  assert.match(m.RAW_FRAGMENT,/TOYOTA \(USA\),2018,Prius/);
  assert.match(m.RAW_FRAGMENT,/2ZRFXE,1798/);
});

test('run_133 fails closed on stale target and duplicate corrected row',()=>{
  assert.match(s,/TARGET_ROW_STATE_CHANGED/);
  assert.match(s,/CORRECTED_ROW_WOULD_DUPLICATE_EXISTING_APPLICATION/);
  assert.match(s,/EXACTLY_ONE_ROW_NOT_UPDATED/);
});
test('run_133 is serializable, dry-run by default, and refuses 5432',()=>{
  assert.match(s,/BEGIN ISOLATION LEVEL SERIALIZABLE/);
  assert.match(s,/process\.argv\.includes\('--execute'\)/);
  assert.match(s,/ROLLBACK/);
  assert.match(s,/REFUSE_PORT_5432/);
  assert.match(s,/catalogo_elimfilters/);
});

test('run_133 cannot mutate catalog identity or CH10358',()=>{
  assert.match(s,/CH10358_UNEXPECTEDLY_CHANGED/);
  assert.doesNotMatch(s,/UPDATE public\./i);
  assert.doesNotMatch(s,/UPDATE ld_catalog\.ld_product_catalog/i);
  assert.doesNotMatch(s,/UPDATE ld_catalog\.ld_canonical_product_identity/i);
});
