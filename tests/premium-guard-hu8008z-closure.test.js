'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const m=JSON.parse(fs.readFileSync(path.join(__dirname,'../scripts/candidates/premium_guard_oil_hu8008z_el38008_strict_20260924.json'),'utf8'));
const n=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
test('HU8008Z strict manifest is terminal and MANN canonical',()=>{
 assert.equal(m.sku,'EL38008');assert.equal(m.codigo_base,'HU8008Z');assert.equal(m.canonical_brand,'MANN-FILTER');
 assert.equal(m.oem_codes.length,5);assert.equal(m.competitor_codes.length,46);assert.equal(m.vehicle_applications.length,300);
 assert.equal(m.specs.height_mm,136);assert.equal(m.specs.outer_diameter_mm,71);assert.equal(m.specs.inner_diameter_mm,26);
 assert.equal(m.reference_governance.status,'COMPLETE_CANONICAL_MANN_WITH_CROSS_CATEGORY_OE_CLEANUP');
});
test('HU8008Z official OE set is cleanly separated from aftermarket',()=>{
 const oe=m.oem_codes.map(x=>n(x.code)).sort();
 assert.deepEqual(oe,['8W936A692AC','AJ812351','C2D3670','LR011279','LR019477'].sort());
 const comp=m.competitor_codes.map(x=>n(x.code));
 for(const code of oe)assert.equal(comp.includes(code),false,code);
 assert.equal(comp.includes('HU8008Z'),false);
 assert.ok(comp.includes('PG6290EX'));
});
