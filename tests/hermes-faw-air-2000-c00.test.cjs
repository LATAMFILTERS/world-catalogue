'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {classify,refs,report}=require('../scripts/hermes/audit-faw-air-2000-c00.cjs');
test('original received is not silently mapped to FAW safety',()=>{
 assert.deepEqual(classify('1090702000C00'),['original_received']);
 assert.deepEqual(classify('11090702000C00'),['safety_faw']);
});
test('FAW variants and MANN pack classify separately',()=>{
 assert.deepEqual(classify('1109060-2000-C00/B'),['primary_faw']);
 assert.deepEqual(classify('1109070-2000-C00/A'),['safety_faw']);
 assert.deepEqual(classify('SP 2652-2'),['kit_mann']);
});
test('ref matching works without altering arrays',()=>{
 const row={sku:'EA17800',oem_codes:[{manufacturer:'FAW',code:'11090602000'}],competitor_codes:[{manufacturer:'MANN',code:'C 27 800'}]};
 const before=JSON.stringify(row);assert.equal(refs(row).length,2);assert.equal(JSON.stringify(row),before);
});
test('reports missing target SKUs and exact matches without claiming a write',()=>{
 const data=report([{sku:'EK50401',catalog_active:true,duty:'HEAVY_DUTY',oem_codes:[],competitor_codes:[],equipment_applications:[]}]);
 assert.equal(data.status,'NO_GO_READ_ONLY');
 assert.equal(data.target_skus.length,3);
 assert.equal(data.operator_code_exact_matches.length,0);
 assert.equal(data.target_skus[1].found,false);
});

test('base code and canonical code appear as collision candidates',()=>{
 const data=report([{sku:'EL90001',codigo_base:'R005061',canonical_source_brand:'DONALDSON',canonical_source_code:'R005061',oem_codes:[],competitor_codes:[]}]);
 assert.ok(data.reference_matches.some(x=>x.field==='codigo_base' && x.groups.includes('primary_donaldson_candidate')));
 assert.ok(data.reference_matches.some(x=>x.field==='canonical_source_code'));
});
