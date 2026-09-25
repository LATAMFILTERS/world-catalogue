'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const m=JSON.parse(fs.readFileSync(path.join(__dirname,'../scripts/candidates/premium_guard_oil_ph8936_el38936_strict_20260924.json'),'utf8'));
const n=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');

test('PH8936 strict manifest is terminal and FRAM canonical',()=>{
  assert.equal(m.sku,'EL38936');
  assert.equal(m.codigo_base,'PH8936');
  assert.equal(m.canonical_brand,'FRAM');
  assert.equal(m.oem_codes.length,12);
  assert.equal(m.competitor_codes.length,12);
  assert.equal(m.vehicle_applications.length,11);
  assert.equal(m.reference_governance.status,'COMPLETE_CANONICAL_FRAM_WITH_ACTIVE_BASE_COLLISION_HELD');
  assert.deepEqual(m.reference_governance.held_codes,['P502008']);
  assert.equal(m.reference_governance.resolved_collision_codes.length,18);
});

test('PH8936 publishes reviewed references but not held direct base P502008',()=>{
  const comp=m.competitor_codes.map(x=>n(x.code));
  for(const code of ['HG50040','BD7028','1675','L45262','51675','W9069']) assert.ok(comp.includes(code),code);
  assert.equal(comp.includes('P502008'),false);
  assert.equal(m.reference_governance.held_code_owner.sku,'EL82008');
});
