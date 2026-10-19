'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {parseApproval,executeApproval}=require('../../scripts/hermes/poll-outlook-approvals');
const candidate={entity_code:'HERMES_REAL_VOLVO_VNX',workflow_status:'PENDING_REVIEW',research_resolution:{status:'VERIFIED'},equipment:{brand:'Volvo',model:'VNX'}};
const email=(subject,body='APROBADO',from='vabreu@elimfilters.com')=>({id:'msg1',receivedDateTime:'2026-10-19T18:00:00Z',subject,from:{emailAddress:{address:from}},body:{content:body}});
test('exact sender, explicit candidate and first-line APROBADO required',()=>{
 assert.deepEqual(parseApproval(email('Re: [HERMES_REAL_VOLVO_VNX]','APROBADO'),'vabreu@elimfilters.com'),{code:'HERMES_REAL_VOLVO_VNX',messageId:'msg1'});
 assert.equal(parseApproval(email('Re: Reporte general'),'vabreu@elimfilters.com'),null);
 assert.equal(parseApproval(email('Re: [HERMES_REAL_VOLVO_VNX]','APROBADO','attacker@example.com'),'vabreu@elimfilters.com'),null);
 assert.equal(parseApproval(email('Re: [HERMES_REAL_VOLVO_VNX]','NO APROBADO'),'vabreu@elimfilters.com'),null);
});
test('approval submits complete research then records decision, never publication',async()=>{
 const calls=[];
 const result=await executeApproval({candidate,code:candidate.entity_code,decisionRow:{},submit:async order=>{calls.push(['submitted',order.publication_authorized,order.systems.length]);return {status:'accepted',research_id:'RQ1'};},record:async()=>{calls.push(['recorded']);}});
 assert.equal(result.status,'RESEARCH_QUEUED');
 assert.deepEqual(calls,[['submitted',false,11],['recorded']]);
});
test('unverified and incomplete equipment are fail-closed',async()=>{
 assert.equal((await executeApproval({candidate:{...candidate,equipment:{}},code:candidate.entity_code,decisionRow:{}})).status,'NEEDS_EQUIPMENT_IDENTIFICATION');
 assert.equal((await executeApproval({candidate:{...candidate,research_resolution:{status:'UNRESOLVED'}},code:candidate.entity_code,decisionRow:{}})).status,'NOT_VERIFIED');
});
