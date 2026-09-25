'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const m=JSON.parse(fs.readFileSync(path.join(__dirname,'../scripts/candidates/premium_guard_oil_hu7012z_el37012_strict_20260924.json'),'utf8'));
const n=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');

test('HU7012Z strict manifest is terminal and MANN canonical',()=>{
  assert.equal(m.sku,'EL37012');
  assert.equal(m.codigo_base,'HU7012Z');
  assert.equal(m.canonical_brand,'MANN-FILTER');
  assert.equal(m.oem_codes.length,3);
  assert.equal(m.competitor_codes.length,16);
  assert.equal(m.vehicle_applications.length,49);
  assert.equal(m.specs.height_mm,123);
  assert.equal(m.specs.outer_diameter_mm,64);
  assert.equal(m.specs.inner_diameter_mm,31);
  assert.equal(m.reference_governance.status,'COMPLETE_CANONICAL_MANN_WITH_CROSS_CATEGORY_CLEANUP');
});

test('HU7012Z official OE and PG references remain cleanly classified',()=>{
  const oem=m.oem_codes.map(x=>n(x.code)).sort();
  assert.deepEqual(oem,['059115561G','059198405B','9A719840520'].sort());
  const comp=m.competitor_codes.map(x=>n(x.code));
  assert.ok(comp.includes('PG99496EX'));
  assert.ok(comp.includes('E219HD330'));
  assert.ok(comp.includes('OX1076D'));
  assert.ok(comp.includes('L1075'));
  assert.equal(comp.includes('HU7012Z'),false);
  assert.equal(m.reference_governance.legacy_numeric_code.not_claimed,true);
});
