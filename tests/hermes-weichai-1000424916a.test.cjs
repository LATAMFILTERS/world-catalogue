'use strict';
const test=require('node:test'), assert=require('node:assert/strict');
const {classify,refs,report}=require('../scripts/hermes/audit-weichai-1000424916a.cjs');
test('Weichai 1000424916A is not silently replaced by 1000424916',()=>{
 assert.deepEqual(classify('1000424916A'),['original']);
 assert.deepEqual(classify('1000424916'),['related_oem']);
});
test('direct manufacturer references remain separate from unconfirmed candidates',()=>{
 assert.deepEqual(classify('PL 420 X'),['mann_verified']);
 assert.deepEqual(classify('95102E'),['wix_verified']);
 assert.deepEqual(classify('SK3359'),['sf_verified']);
 assert.deepEqual(classify('P550778'),['donaldson_candidate']);
 assert.deepEqual(classify('FS19769'),['fleetguard_candidate']);
});
test('reference audit is read-only and reports duplicate candidate owners',()=>{
 const rows=[{sku:'ES11111',oem_codes:[{manufacturer:'WEICHAI',code:'1000424916A'}],competitor_codes:[{code:'PL 420 X'}]},
             {sku:'ES22222',oem_codes:[{code:'1000424916A'}],competitor_codes:[]}];
 assert.equal(refs(rows[0]).length,2);
 const r=report(rows);assert.equal(r.status,'NO_GO_READ_ONLY');assert.deepEqual(r.exact_owners,['ES11111','ES22222']);
});
