'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {__setProtocolPoolForTests,__resetProtocolPoolForTests}=require('../lib/bot-protocol-db');
const {searchByApplication}=require('../lib/bot-protocol-catalog');
test.afterEach(()=>__resetProtocolPoolForTests());
test('a supplied engine without year cannot authorize a compatibility',async()=>{
  let queries=0;
  __setProtocolPoolForTests({async connect(){queries++;throw new Error('No lookup allowed before identity is complete');}});
  const result=await searchByApplication(['FREIGHTLINER','COLUMBIA CL120','DETROIT DIESEL'],null);
  assert.equal(result.pendingField,'year');assert.deepEqual(result.products,[]);assert.equal(queries,0);
});
test('structured verified application with a different engine is rejected',async()=>{
  __setProtocolPoolForTests({async connect(){return{async query(sql){
    if(/^\s*(BEGIN|COMMIT|ROLLBACK|SET LOCAL)/i.test(String(sql)))return{rows:[]};
    return{rows:[{sku:'EL12345',duty:'LIGHT_DUTY',filter_type:'oil',protocol_application_evidence:[],
      protocol_relational_applications:[{make:'TOYOTA',model_family:'RAV4',engine_code:'OTHER',year:'2018',evidence_status:'VERIFIED',evidence_authority:'OEM',evidence_source_url:'https://example.test/manual',evidence_payload_hash:'fixture-hash',evidence_checked_at:'2026-10-01',ledger_verified:true}]}]};},release(){}};}});
  const result=await searchByApplication(['TOYOTA','RAV4','2AR-FE'],2018,'oil');
  assert.equal(result.lookupStatus,'completed');assert.deepEqual(result.products,[]);
});
