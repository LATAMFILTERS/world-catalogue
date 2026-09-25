'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');

const m=JSON.parse(fs.readFileSync(
  path.join(__dirname,'../scripts/candidates/premium_guard_oil_ch10246_el36122_strict_20260924.json'),
  'utf8'
));
const n=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');

test('CH10246 strict manifest is terminal',()=>{
  assert.equal(m.sku,'EL36122');
  assert.equal(m.codigo_base,'CH10246');
  assert.equal(m.canonical_brand,'FRAM');
  assert.equal(m.oem_codes.length,8);
  assert.equal(m.competitor_codes.length,35);
  assert.equal(m.vehicle_applications.length,12);
  assert.equal(m.reference_governance.status,'COMPLETE_CANONICAL_FRAM_WITH_DUPLICATE_CONSOLIDATION');
  assert.equal(m.reference_governance.duplicate_sku,'EL36019');
});

test('CH10246 retains verified PG/MANN family and clean OEM classification',()=>{
  const comp=m.competitor_codes.map(x=>n(x.code));
  for(const code of ['PG99494','HU6019Z','E650H01D233','V401532']) assert.ok(comp.includes(code),code);
  const oem=m.oem_codes.map(x=>n(x.code));
  for(const code of ['93185674','55594651','55588497','55485671','650163','95526687']) assert.ok(oem.includes(code),code);
  assert.equal(comp.includes('CH10246'),false);
});
