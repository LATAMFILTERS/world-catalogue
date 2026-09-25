'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const m=JSON.parse(fs.readFileSync(path.join(__dirname,'../scripts/candidates/premium_guard_oil_hu8005z_el38005_strict_20260924.json'),'utf8'));
const n=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');

test('HU8005Z strict manifest is terminal and MANN canonical',()=>{
  assert.equal(m.sku,'EL38005');
  assert.equal(m.codigo_base,'HU8005Z');
  assert.equal(m.canonical_brand,'MANN-FILTER');
  assert.equal(m.oem_codes.length,3);
  assert.equal(m.competitor_codes.length,42);
  assert.equal(m.vehicle_applications.length,63);
  assert.equal(m.specs.height_mm,128);
  assert.equal(m.specs.outer_diameter_mm,71);
  assert.equal(m.specs.inner_diameter_mm,29);
  assert.equal(m.specs.inner_diameter_1_mm,28);
  assert.equal(m.reference_governance.status,'COMPLETE_CANONICAL_MANN_WITH_CROSS_CATEGORY_CLEANUP');
});

test('HU8005Z references are classified and legacy numeric 8005 stays air',()=>{
  const oem=m.oem_codes.map(x=>n(x.code)).sort();
  assert.deepEqual(oem,['95810722220','059198405','059115561D'].sort());
  const comp=m.competitor_codes.map(x=>n(x.code));
  for(const code of ['PG9986EX','CH11490','LF692','OX420D','V102186','2514100']) assert.ok(comp.includes(code),code);
  assert.equal(comp.includes('HU8005Z'),false);
  assert.equal(m.reference_governance.legacy_numeric_code.owner,'EA38005');
  assert.equal(m.reference_governance.legacy_numeric_code.not_claimed,true);
});
