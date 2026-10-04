'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {governApplicationPresentation}=require('../lib/application-presentation-guard');
const fixture=()=>({results:[{elimfilters_sku:'EH68277',equipment_applications:[{equipment:'Toyota Corolla'}],vehicle_applications:[],oem_codes:[{code:'A',manufacturer:'M'}]}],reference_safety_status:'SAFE_SINGLE_RESULT'});
test('unverified blocked applications are withheld without changing identity or source data',async()=>{
 const input=fixture();const result=await governApplicationPresentation(input,{query:async()=>({rows:[{sku:'EH68277',certification_state:'BLOCKED'}]})});
 assert.equal(result.results[0].elimfilters_sku,'EH68277');assert.equal(result.results[0].catalog_validation.state,'BLOCKED');
 assert.equal(result.results[0].application_validation.equipment_applications.withheld_count,1);assert.deepEqual(result.results[0].equipment_applications,[]);
 assert.deepEqual(result.results[0].oem_codes,input.results[0].oem_codes);assert.equal(input.results[0].equipment_applications.length,1);
 assert.equal(result.reference_safety_status,'SEARCH_RESULT_ONLY');
});
test('only the exact verified payload can be published',async()=>{
 const input=fixture(),row={sku:'EH68277',equipment_verified:true,equipment_applications:input.results[0].equipment_applications};
 const pool={query:async()=>({rows:[row]})};assert.equal((await governApplicationPresentation(input,pool)).results[0].equipment_applications.length,1);
 row.equipment_applications=[{equipment:'different'}];assert.equal((await governApplicationPresentation(input,pool)).results[0].equipment_applications.length,0);
});
test('failed lookup and missing SKU withhold fitment, including nested alternatives',async()=>{
 const input=fixture();input.results[0].alternatives=[{equipment_applications:[{equipment:'unchecked'}]}];
 const result=await governApplicationPresentation(input,{query:async()=>{throw Error('offline')}});
 assert.equal(result.results[0].equipment_applications.length,0);assert.equal(result.results[0].alternatives[0].equipment_applications.length,0);
});
test('vehicle payload requires its own verified evidence',async()=>{
 const input=fixture();input.results[0].vehicle_applications=[{make:'Toyota',model:'Corolla'}];
 const row={sku:'EH68277',vehicle_verified:true,vehicle_applications:input.results[0].vehicle_applications};
 const result=await governApplicationPresentation(input,{query:async()=>({rows:[row]})});
 assert.equal(result.results[0].vehicle_applications.length,1);assert.equal(result.results[0].equipment_applications.length,0);
});
