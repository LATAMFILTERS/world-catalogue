'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
let dispatch={persisted:false,emailed:false},calls=0,reviews=0;
const lead=require('../lib/bot-protocol-support-lead');
lead.dispatchTicket=async()=>{calls++;return dispatch;};
const review=require('../lib/bot-technical-review');
review.registerTechnicalReview=async()=>{reviews++;throw Error('No real review allowed');};
const {runBotProtocol}=require('../lib/bot-conversation-orchestrator');
const {runUnifiedBotProtocol}=require('../lib/bot-protocol-unified-orchestrator');
const {preflightReferenceLookup}=require('../lib/bot-protocol-reference-preflight');
const {registerWebChatProtocolAdapter}=require('../lib/bot-protocol-web-adapter');
const {saveMemory,memoryKey,createEmptyState}=require('../lib/bot-protocol-memory');
let n=0;
async function seed(){const b={channel:'web',conversation_id:'round3-'+(++n),language:'es'};
 const s=createEmptyState();s.phase='AWAITING_SUPPORT_EMAIL';s.intent='exact_reference_lookup';
 await saveMemory(memoryKey(b),s);return b;}
test.beforeEach(()=>{calls=0;reviews=0;dispatch={persisted:false,emailed:false};
 globalThis.fetch=async()=>{throw Error('Network disabled');};});
test('failed storage and email never acknowledge registration, and allow retry',async()=>{
 const b=await seed();const r=await runBotProtocol({...b,message:'cliente@example.test'});
 assert.equal(r.state.supportLead.created,false);assert.equal(r.state.phase,'AWAITING_SUPPORT_EMAIL');
 assert.match(r.answer,/No pude registrar ni enviar/);assert.equal(r.support_contact_handled,true);
 dispatch={persisted:false,emailed:true};const retry=await runBotProtocol({...b,message:'cliente@example.test'});
 assert.equal(retry.state.supportLead.created,true);assert.equal(calls,2);
});
test('stored request with failed notification explicitly reports pending delivery',async()=>{
 dispatch={persisted:true,emailed:false};const b=await seed();const r=await runBotProtocol({...b,message:'cliente@example.test'});
 assert.equal(r.state.supportLead.created,true);assert.match(r.answer,/pendiente/);
});
test('successful internal delivery is accepted without Redis',async()=>{
 dispatch={persisted:false,emailed:true};const b=await seed();const r=await runBotProtocol({...b,message:'cliente@example.test'});
 assert.equal(r.state.supportLead.status,'SENT');assert.equal(r.state.phase,'conversation_start');
});
test('invalid contact does not send, create or acknowledge anything',async()=>{
 const b=await seed();const r=await runBotProtocol({...b,message:'correo invalido'});
 assert.equal(calls,0);assert.equal(r.state.supportLead.created,false);assert.equal(r.support_contact_handled,true);
});
test('numeric email bypasses catalogue reference preflight',async()=>{
 const b=await seed();assert.equal(await preflightReferenceLookup({...b,message:'EL12345@example.test'}),null);
 const r=await runUnifiedBotProtocol({...b,message:'EL12345@example.test'});
 assert.equal(r.support_contact_handled,true);assert.equal(calls,1);
});
test('web contact response preserves delivery failure and opens no technical case',async()=>{
 const b=await seed();let route;registerWebChatProtocolAdapter({post(path,...handlers){route=handlers.at(-1);}});
 let output;await route({body:{message:'EL12345@example.test',sessionId:b.conversation_id,lang:'es'}},{json(v){output=v;return this;},status(){return this;}});
 assert.match(output.reply,/No pude registrar ni enviar/);assert.equal(output.technical_review,null);
 assert.equal(output.claim,'NONE');assert.equal(reviews,0);assert.equal(calls,1);
});
test('previously captured contact is not dispatched twice within the contact phase',async()=>{
 const b=await seed();const s=createEmptyState();s.phase='AWAITING_SUPPORT_EMAIL';s.supportLead={created:true,email:'cliente@example.test',status:'CREATED'};
 await saveMemory(memoryKey(b),s);const r=await runBotProtocol({...b,message:'cliente@example.test'});
 assert.equal(calls,0);assert.equal(r.state.supportLead.created,true);
});
