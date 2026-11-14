'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const {plan,additions,appKey} = require('../scripts/hermes/reconcile-el83771-issue-1300.cjs');
const base = () => ({
 sku:'EL83771',duty:'HEAVY_DUTY',catalog_active:true,
 oem_codes:[{manufacturer:'WEICHAI',code:'61000070005'},{manufacturer:'CATERPILLAR',code:'OLD-OEM'}],
 competitor_codes:[{manufacturer:'MANN',code:'OLD-COMP'}],
 equipment_applications:[{make:'LONKING',model:'LG850',engine:'WEICHAI WD10G220E11'},{make:'CAT',model:'OLD-MACHINE',engine:'C9'}]
});
test('append-only plan never proposes already present references or equipment',()=>{
 const r=plan(base());
 assert.equal(r.status,'NO_GO_REVIEW_ONLY');
 assert.equal(r.before.oem,2);
 assert.equal(r.before.competitor,1);
 assert.equal(r.before.equipment,2);
 assert.equal(r.proposals.oem.some(x=>x.code==='61000070005'),false);
 assert.equal(r.proposals.equipment.some(x=>appKey(x)===appKey(base().equipment_applications[0])),false);
 assert.equal(r.existing_preserved,true);
});
test('collisions are reported as blocked, never silently allowed',()=>{
 const r=plan(base(),[{sku:'EL99999',code:'VG61000070005',field:'oem_codes'}]);
 assert.deepEqual(r.blocked_oem.map(x=>x.code),['VG61000070005']);
});
test('different engine variants are not merged',()=>{
 const old=[{make:'HOWO-7',model:'4X2',engine:'WEICHAI WD615'}];
 const added=[{make:'HOWO-7',model:'4X2',engine:'SINOTRUK D2066'}];
 assert.equal(additions(old,added,appKey).length,1);
});
test('SKU and active duty are enforced',()=>{
 assert.throws(()=>plan({...base(),sku:'EL83772'}),/SKU_MISSING/);
 assert.throws(()=>plan({...base(),catalog_active:false}),/SKU_NOT_ACTIVE/);
});
