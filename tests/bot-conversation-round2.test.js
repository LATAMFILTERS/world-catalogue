'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {applicationPayloadHash}=require('../lib/catalog-application-governance');
const {__setProtocolPoolForTests,__resetProtocolPoolForTests}=require('../lib/bot-protocol-db');
const {runUnifiedBotProtocol}=require('../lib/bot-protocol-unified-orchestrator');
const {runBotProtocol}=require('../lib/bot-conversation-orchestrator');
const {registerWebChatProtocolAdapter}=require('../lib/bot-protocol-web-adapter');
const {saveMemory,memoryKey,createEmptyState}=require('../lib/bot-protocol-memory');
const fetchOriginal=globalThis.fetch;
function row(sku,type,context={brand:'TOYOTA',model:'RAV4',engine:'2AR-FE',year:2018,duty:'LIGHT_DUTY'}){
  const entries=[{make:context.brand,model:context.model,engine:context.engine,year:context.year}];
  const hd=context.duty==='HEAVY_DUTY';
  return{id:sku,sku,name:type,filter_type:type,duty:context.duty,is_primary:true,equipment_applications:hd?entries:[],vehicle_applications:hd?[]:entries,
    protocol_application_evidence:[{application_kind:hd?'EQUIPMENT':'VEHICLE',verified:true,payload_hash:applicationPayloadHash(entries),evidence_authority:'OEM_MANUAL',source_url:'https://example.test/manual',verified_at:'2026-10-01'}]};
}
function install(rows){__setProtocolPoolForTests({async connect(){return{async query(sql){
  const text=String(sql);if(/^\s*(BEGIN|COMMIT|ROLLBACK|SET LOCAL)/i.test(text))return{rows:[]};
  if(/SELECT c\.\*/.test(text))return{rows};
  if(/bot_governance/.test(text))throw new Error('Real case creation is disabled in this fixture');
  return{rows:[]};},release(){}};}});}
let n=0;
function body(){return{channel:'web',conversation_id:'round2-'+(++n),language:'es'};}
const types=[row('EL12345','oil'),row('EF12345','fuel'),row('EA12345','air'),row('EC12345','cabin')];
test.beforeEach(()=>{
  for(const key of ['GROQ_API_KEY','REDIS_URL','KNOWLEDGE_ENGINE_RUNTIME_URL','ENGINE_API_KEY','HERMES_REQUESTS_ENABLED','KNOWLEDGE_CENTER_API_KEY','KNOWLEDGE_CENTER_API_URL'])delete process.env[key];
  globalThis.fetch=async()=>{throw new Error('External calls disabled in round2');};install(types);
});
test.afterEach(()=>{__resetProtocolPoolForTests();globalThis.fetch=fetchOriginal;});

test('oil request survives the engine clarification without adding other systems',async()=>{
  const b=body();await runUnifiedBotProtocol({...b,message:'Qué filtro de aceite usa Toyota RAV4 2018'});
  const r=await runUnifiedBotProtocol({...b,message:'motor 2AR-FE'});
  assert.deepEqual(r.evidence.products.map(p=>p.sku),['EL12345']);
});
test('cabin request survives year and engine clarification',async()=>{
  const b=body();await runUnifiedBotProtocol({...b,message:'Qué filtro de cabina usa Toyota RAV4'});
  await runUnifiedBotProtocol({...b,message:'2018'});
  const r=await runUnifiedBotProtocol({...b,message:'motor 2AR-FE'});
  assert.deepEqual(r.evidence.products.map(p=>p.sku),['EC12345']);
});
test('fuel follow-up reuses the resolved vehicle and changes the filter system',async()=>{
  const b=body();await runUnifiedBotProtocol({...b,message:'Qué filtros usa Toyota RAV4 2018 motor 2AR-FE'});
  const r=await runUnifiedBotProtocol({...b,message:'Y el de combustible?'});
  assert.equal(r.intent,'application_lookup');assert.deepEqual(r.evidence.products.map(p=>p.sku),['EF12345']);
});
test('corrected year cannot reuse approval for the old year',async()=>{
  const b=body();await runUnifiedBotProtocol({...b,message:'Qué filtros usa Toyota RAV4 2018 motor 2AR-FE'});
  const r=await runUnifiedBotProtocol({...b,message:'Corrijo, es año 2020'});
  assert.equal(r.state.equipment.year,2020);assert.equal(r.state.equipment.brand,'TOYOTA');assert.equal(r.state.equipment.model,'RAV4');assert.equal(r.state.equipment.engine,'2AR-FE');assert.deepEqual(r.evidence.products,[]);
});
test('HD oil request survives engine clarification',async()=>{
  const ctx={brand:'MACK',model:'ANTHEM',engine:'MP8',year:2020,duty:'HEAVY_DUTY'};
  install([row('EL77777','oil',ctx),row('EF77777','fuel',ctx)]);
  const b=body();await runUnifiedBotProtocol({...b,message:'Qué filtro de aceite usa Mack Anthem HD 2020'});
  const r=await runUnifiedBotProtocol({...b,message:'motor MP8'});
  assert.deepEqual(r.evidence.products.map(p=>p.sku),['EL77777']);
});
test('new vehicle does not inherit the old requested filter system',async()=>{
  const ctx={brand:'VOLVO',model:'FH',engine:'D13',year:2020,duty:'HEAVY_DUTY'};
  install([...types,row('EL88888','oil',ctx),row('EF88888','fuel',ctx)]);
  const b=body();await runUnifiedBotProtocol({...b,message:'Qué filtro de aceite usa Toyota RAV4 2018 motor 2AR-FE'});
  const r=await runUnifiedBotProtocol({...b,message:'Qué filtros usa Volvo FH HD 2020 motor D13'});
  assert.deepEqual(r.evidence.products.map(p=>p.sku).sort(),['EF88888','EL88888']);
});
test('diagnostic symptoms cannot be swallowed by an application follow-up',async()=>{
  const b=body();await runUnifiedBotProtocol({...b,message:'Qué filtros usa Toyota RAV4 2018 motor 2AR-FE'});
  const r=await runUnifiedBotProtocol({...b,message:'Ahora pierde fuerza y hay agua en combustible'});
  assert.equal(r.intent,'diagnostic');assert.notEqual(r.phase,'catalog_resolution');
});
test('explicit LD request never emits an HD alternative',async()=>{
  const ctx={brand:'TOYOTA',model:'RAV4',engine:'2AR-FE',year:2018,duty:'HEAVY_DUTY'};install([...types,row('EL99999','oil',ctx)]);
  const r=await runUnifiedBotProtocol({...body(),message:'Qué filtros usa Toyota RAV4 LD 2018 motor 2AR-FE'});
  assert.ok(r.evidence.products.length);assert.ok(r.evidence.products.every(p=>p.duty==='LIGHT_DUTY'));
});
test('polite filter follow-up does not invent a new vehicle brand',async()=>{
  const b=body();await runUnifiedBotProtocol({...b,message:'Qué filtro de aceite usa Toyota RAV4 2018 motor 2AR-FE'});
  const r=await runUnifiedBotProtocol({...b,message:'Y el de combustible por favor'});
  assert.equal(r.state.equipment.brand,'TOYOTA');assert.equal(r.state.equipment.model,'RAV4');assert.deepEqual(r.evidence.products.map(p=>p.sku),['EF12345']);
});
test('explicit engine correction remains an application even after previous resolution',async()=>{
  const {preflightReferenceLookup}=require('../lib/bot-protocol-reference-preflight');
  const b=body();await runUnifiedBotProtocol({...b,message:'Qué filtro de aceite usa Toyota RAV4 2018 motor 2AR-FE'});
  assert.equal(await preflightReferenceLookup({...b,message:'Corrijo, el motor es 2GR-FE'}),null);
  const r=await runUnifiedBotProtocol({...b,message:'Corrijo, el motor es 2GR-FE'});
  assert.equal(r.state.equipment.brand,'TOYOTA');assert.equal(r.state.equipment.engine,'2GR-FE');assert.deepEqual(r.evidence.products,[]);
});
async function seedTechnical(b){
  const state=createEmptyState();state.equipment={brand:'FIXTURE',model:'AZULNUBE',engine:'MOTORFICTICIO',year:2020};
  await saveMemory(memoryKey(b),state);
  process.env.KNOWLEDGE_ENGINE_RUNTIME_URL='http://knowledge-fixture.test';process.env.ENGINE_API_KEY='fixture-key';
  globalThis.fetch=async()=>({ok:true,json:async()=>({action:'ANSWER',answer:'La revisión aprobada consiste en inspeccionar el circuito.',confidence:0.95,citations:[{sourceId:'manual-fixture',label:'OEM service manual'}]})});
}
test('approved Knowledge Center answer survives model unavailability',async()=>{
  const b=body();await seedTechnical(b);
  const r=await runBotProtocol({...b,message:'¿Qué intervalo OEM corresponde a este equipo?'});
  assert.equal(r.intelligence.knowledge_status,'validated');assert.match(r.answer,/inspeccionar el circuito/);
});
test('a model application label cannot reroute a question about a technical source',async()=>{
  const b=body();await seedTechnical(b);process.env.GROQ_API_KEY='fixture-key';
  const engineFetch=globalThis.fetch;
  globalThis.fetch=async(url,...args)=>String(url).startsWith('https://api.groq.com')
    ? {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({intent:'application_lookup',entities:{},answer:'La revisión aprobada consiste en inspeccionar el circuito.'})}}]})}
    : engineFetch(url,...args);
  const r=await runBotProtocol({...b,message:'¿Esta nota OEM confirma alguna compatibilidad con un vehículo?'});
  assert.equal(r.intent,'general');assert.equal(r.intelligence.knowledge_status,'validated');assert.equal(r.evidence.validated,false);
});
test('web response distinguishes approved technical evidence from missing catalog evidence',async()=>{
  const b=body();await seedTechnical(b);let handler;
  registerWebChatProtocolAdapter({post(path,...callbacks){if(path==='/api/chat')handler=callbacks.at(-1);}});
  let result;const response={json(value){result=value;return this;},status(value){this.statusCode=value;return this;}};
  await handler({body:{message:'¿Qué intervalo OEM corresponde a este equipo?',sessionId:b.conversation_id,lang:'es'}},response);
  assert.equal(result.outcome,'resolved');assert.equal(result.claim,'NONE');assert.match(result.reply,/inspeccionar el circuito/);
});
