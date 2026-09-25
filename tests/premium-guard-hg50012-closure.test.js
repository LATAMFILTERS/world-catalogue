'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const m=JSON.parse(fs.readFileSync(path.join(__dirname,'../scripts/candidates/premium_guard_oil_hg50012_el85570_strict_20260924.json'),'utf8'));
const n=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');

test('HG50012 closes on canonical Donaldson P555570 / EL85570',()=>{
  assert.equal(m.sku,'EL85570');
  assert.equal(m.superseded_sku,'EL39293');
  assert.equal(m.codigo_base,'P555570');
  assert.equal(m.canonical_brand,'DONALDSON');
  assert.equal(m.duty,'HEAVY_DUTY');
  assert.equal(m.oem_codes.length,6);
  assert.equal(m.competitor_codes.length,5);
  assert.equal(m.vehicle_applications.length,106);
  assert.equal(m.reference_governance.status,'COMPLETE_CANONICAL_DONALDSON_WITH_DUPLICATE_CONSOLIDATION_AND_HELD_ALTERNATES');
});

test('HG50012 publishes safe refs and holds alternate-owner refs',()=>{
  const comp=m.competitor_codes.map(x=>n(x.code));
  for(const code of ['HG50012','PH3519A','BT230','LF3342','L30215']) assert.ok(comp.includes(code),code);
  for(const code of ['1268','1R0713','51268','LFP5570','W9293']) assert.ok(m.reference_governance.held_codes.includes(code),code);
  assert.equal(m.reference_governance.active_base_equivalent_owner.sku,'EL30929');
});
