'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  officialFamilyMatches,classifyLiquid,validateLiquidGeometry,buildLiquidPatch
}=require('../scripts/sanitize_mann_liquid_spec_collisions');

test('oil spin-on keeps gasket and thread semantics',()=>{
  const official={identity:{title:'MANN-FILTER W 940/13 Oil Filter'}};
  assert.equal(officialFamilyMatches(official,'oil'),true);
  const values={outer_diameter_mm:93,gasket_id_mm:62,gasket_od_mm:71,thread_size:'3/4-16UNF',height_mm:155};
  assert.deepEqual(classifyLiquid(values,'oil'),{ok:true,shape:'spin-on'});
  assert.equal(validateLiquidGeometry(values,'spin-on').valid,true);
  const patch=buildLiquidPatch(values,'spin-on','x');
  assert.equal(patch.thread_size,'3/4-16UNF');
  assert.equal(patch.gasket_id_mm,62);
  assert.equal(patch.gasket_od_mm,71);
});

test('fuel inline preserves inlet/outlet only as semantic specs',()=>{
  const official={identity:{title:'MANN-FILTER WK 9022 Fuel Filter'}};
  assert.equal(officialFamilyMatches(official,'fuel'),true);
  const values={outer_diameter_mm:90,inlet_mm:10,outlet_mm:10,height_mm:160};
  assert.deepEqual(classifyLiquid(values,'fuel'),{ok:true,shape:'inline'});
  assert.equal(validateLiquidGeometry(values,'inline').valid,true);
  const patch=buildLiquidPatch(values,'inline','x');
  assert.equal(patch.outer_diameter_mm,90);
  assert.equal(patch.thread_size,null);
  assert.equal(Object.hasOwn(patch,'inlet_mm'),false);
});

test('cartridge does not reinterpret second outer diameter as gasket',()=>{
  const values={outer_diameter_mm:82,outer_diameter_1_mm:22,height_mm:92};
  assert.deepEqual(classifyLiquid(values,'oil'),{ok:true,shape:'cartridge'});
  const patch=buildLiquidPatch(values,'cartridge','x');
  assert.equal(patch.gasket_od_mm,null);
  assert.equal(patch.gasket_id_mm,null);
  assert.equal(patch.thread_size,null);
});
