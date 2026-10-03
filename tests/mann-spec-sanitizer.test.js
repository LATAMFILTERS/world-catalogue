'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  mannProductUrl,
  parseMannSummary,
  verifyProductIdentity,
}=require('../lib/mann-official-spec-verifier');
const {
  classifyOfficial,
  validateOfficialGeometry,
  buildPatch,
  patchDiffers,
}=require('../scripts/sanitize_mann_air_spec_collisions');

test('official MANN parser preserves semantic dimension labels',()=>{
  const html='<title>MANN-FILTER C 16 005 Air Filter</title><div class="cmp-product__summary"><div><li>Outer diameter (A) = 154 mm; Inner diameter (B) = 30 mm; Inner diameter 1 (C) = 90 mm; Height (H) = 188 mm</li></div></div>';
  const parsed=parseMannSummary(html);
  assert.equal(parsed.values.outer_diameter_mm,154);
  assert.equal(parsed.values.inner_diameter_mm,30);
  assert.equal(parsed.values.inner_diameter_1_mm,90);
  assert.equal(parsed.values.height_mm,188);
  assert.equal(verifyProductIdentity(html,'C16005').valid,true);
});

test('MANN product URL preserves slash variants used by official catalogue',()=>{
  assert.equal(
    mannProductUrl('C 22 033/1'),
    'https://www.mann-filter.com/en/catalog/search-results/product.html/c22033/1_mann-filter.html'
  );
});

test('oil and fuel semantics remain distinct',()=>{
  const oil='<title>MANN-FILTER W 940/13 Oil Filter</title><div class="cmp-product__summary"><div><li>Outer diameter (A) = 93 mm; Inner diameter of gasket (B) = 62 mm; Outer diameter of gasket (C) = 71 mm; Thread Size (G) = 3/4-16UNF; Height (H) = 155 mm</li></div></div>';
  const fuel='<title>MANN-FILTER WK 9022 Fuel Filter</title><div class="cmp-product__summary"><div><li>Outer diameter (A) = 90 mm; Inlet (F) = 10 mm; Outlet (G) = 10 mm; Height (H) = 160 mm</li></div></div>';
  const o=parseMannSummary(oil).values;
  const f=parseMannSummary(fuel).values;
  assert.equal(o.gasket_id_mm,62);
  assert.equal(o.gasket_od_mm,71);
  assert.equal(o.thread_size,'3/4-16UNF');
  assert.equal(f.inlet_mm,10);
  assert.equal(f.outlet_mm,10);
  assert.equal(f.gasket_od_mm,undefined);
});

test('panel geometry maps to product length without inventing width column',()=>{
  const values={product_length_mm:207,product_width_mm:169,height_mm:69};
  assert.deepEqual(classifyOfficial(values),{ok:true,shape:'panel'});
  assert.equal(validateOfficialGeometry(values,'panel').valid,true);
  const patch=buildPatch(values,'panel','https://www.mann-filter.com/x');
  assert.equal(patch.product_length_mm,207);
  assert.equal(patch.height_mm,69);
  assert.equal(patch.outer_diameter_mm,null);
  assert.equal(patch.inner_diameter_mm,null);
  assert.equal(Object.hasOwn(patch,'product_width_mm'),false);
});

test('round geometry uses inner diameter and clears legacy gasket misuse',()=>{
  const values={outer_diameter_mm:152,inner_diameter_mm:88,inner_diameter_1_mm:88,height_mm:72};
  assert.deepEqual(classifyOfficial(values),{ok:true,shape:'round'});
  assert.equal(validateOfficialGeometry(values,'round').valid,true);
  const patch=buildPatch(values,'round','https://www.mann-filter.com/x');
  assert.equal(patch.outer_diameter_mm,152);
  assert.equal(patch.inner_diameter_mm,88);
  assert.equal(patch.gasket_od_mm,null);
  assert.equal(patch.gasket_id_mm,null);
});

test('implausible official geometry fails closed',()=>{
  assert.equal(validateOfficialGeometry({outer_diameter_mm:3000,height_mm:10},'round').valid,false);
  assert.equal(validateOfficialGeometry({outer_diameter_mm:100,inner_diameter_mm:100,height_mm:50},'round').valid,false);
  assert.equal(validateOfficialGeometry({product_length_mm:1000,product_width_mm:10,height_mm:20},'panel').valid,false);
});

test('patchDiffers compares only governed spec fields',()=>{
  const row={height_mm:'72.00',outer_diameter_mm:'152.00',inner_diameter_mm:null,gasket_od_mm:'88.00',gasket_id_mm:'88.00'};
  const patch={height_mm:72,outer_diameter_mm:152,inner_diameter_mm:88,gasket_od_mm:null,gasket_id_mm:null};
  assert.equal(patchDiffers(row,patch),true);
});
