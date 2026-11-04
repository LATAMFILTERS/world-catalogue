'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { applicationPayloadHash } = require('../lib/catalog-application-governance');
const policy = require('../lib/bot-application-evidence-policy');
const { __setProtocolPoolForTests, __resetProtocolPoolForTests } = require('../lib/bot-protocol-db');
const { searchByApplication, searchByReferences } = require('../lib/bot-protocol-catalog');
const { runUnifiedBotProtocol } = require('../lib/bot-protocol-unified-orchestrator');
const { technicalReviewText, registerTechnicalReview } = require('../lib/bot-technical-review');
const { loadKnowledgeConnection } = require('../lib/bot-knowledge-connection');
const { queryApprovedTechnicalKnowledge } = require('../lib/knowledge-governance/obsidian-knowledge-client');
const { createEmptyState } = require('../lib/bot-protocol-memory');

const originalFetch = globalThis.fetch;
const context = { brand: 'TOYOTA', model: 'RAV4', engine: '2AR-FE', year: 2018, duty: 'LIGHT_DUTY' };
function product(overrides = {}) {
  const apps = [{ make: 'TOYOTA', model: 'RAV4', engine: '2AR-FE', year_from: 2016, year_to: 2018, service_role: 'full_flow' }];
  return { id: 1, sku: 'EL12345', codigo_base: 'BASE1', duty: 'LIGHT_DUTY', name: 'Oil filter', filter_type: 'oil', is_primary: true,
    vehicle_applications: apps, equipment_applications: [],
    protocol_application_evidence: [{ application_kind: 'VEHICLE', verified: true, payload_hash: applicationPayloadHash(apps), evidence_authority: 'OEM_MANUAL', source_url: 'https://example.test/manual', verified_at: '2026-10-01' }], ...overrides };
}
function pool(rows = [], resolver = []) {
  __setProtocolPoolForTests({ async connect() { return { async query(sql, params = []) {
    const text = String(sql);
    if (/^\s*(BEGIN|COMMIT|ROLLBACK|SET LOCAL)/i.test(text)) return { rows: [] };
    if (/v_api_resolver_v7/.test(text)) return { rows: resolver.filter(r => (params[0] || []).includes(r.code)) };
    if (/bot_governance/.test(text)) throw new Error('Fixture review store unavailable');
    if (/SELECT c\.\*/.test(text)) return { rows };
    if (/FROM elimfilters_catalog/.test(text)) return { rows: rows.filter(r => (params[0] || []).includes(r.sku)) };
    return { rows: [] };
  }, release() {} }; } });
}
test.beforeEach(() => {
  delete process.env.GROQ_API_KEY;
  delete process.env.KNOWLEDGE_ENGINE_RUNTIME_URL;
  delete process.env.ENGINE_API_KEY;
  delete process.env.HERMES_REQUESTS_ENABLED;
  delete process.env.REDIS_URL;
  globalThis.fetch = async () => { throw new Error('Unexpected network request in isolated regression'); };
});
test.afterEach(() => { __resetProtocolPoolForTests(); globalThis.fetch = originalFetch; });

test('approved LD relation confirms the complete application', () => {
  assert.equal(policy.qualifyApplicationProduct(product(), context).protocol_claim, 'APPLICATION_CONFIRMED');
});
test('UNVERIFIED relational row cannot authorize a SKU', () => {
  assert.equal(policy.qualifyApplicationProduct(product({ protocol_application_evidence: [], protocol_relational_applications: [{ ...context, evidence_status: 'UNVERIFIED' }] }), context), null);
});
test('same SKU cannot combine model, engine and year from different entries', () => {
  const apps = [{ make: 'TOYOTA', model: 'RAV4', engine: '2AR-FE', year: 2016 }, { make: 'TOYOTA', model: 'COROLLA', engine: '2AR-FE', year: 2018 }];
  const p = product({ vehicle_applications: apps });
  p.protocol_application_evidence[0].payload_hash = applicationPayloadHash(apps);
  assert.equal(policy.qualifyApplicationProduct(p, context), null);
});
test('LD request cannot publish HD SKU even with evidence', () => {
  assert.equal(policy.qualifyApplicationProduct(product({ duty: 'HEAVY_DUTY' }), context), null);
});
test('approved HD application stays in its own segment', () => {
  const apps=[{make:'MACK',model:'ANTHEM',engine:'MP8',year:2020,service_role:'full_flow'}];
  const p=product({duty:'HEAVY_DUTY',vehicle_applications:[],equipment_applications:apps,
    protocol_application_evidence:[{application_kind:'EQUIPMENT',verified:true,payload_hash:applicationPayloadHash(apps),evidence_authority:'OEM_MANUAL',source_url:'https://example.test/hd',verified_at:'2026-10-01'}]});
  assert.equal(policy.qualifyApplicationProduct(p,{brand:'MACK',model:'ANTHEM',engine:'MP8',year:2020,duty:'HEAVY_DUTY'}).sku,'EL12345');
  assert.equal(policy.qualifyApplicationProduct(p,{brand:'MACK',model:'ANTHEM',engine:'MP8',year:2020,duty:'LIGHT_DUTY'}),null);
});
test('changed payload invalidates historical approval', () => {
  const p = product(); p.vehicle_applications[0].engine = 'OTHER';
  assert.equal(policy.qualifyApplicationProduct(p, context), null);
});
test('explicit service position must match the same application', () => {
  assert.equal(policy.qualifyApplicationProduct(product(), { ...context, position: 'bypass' }), null);
});
test('unapproved database candidates are never returned as confirmed applications', async () => {
  pool([product({ protocol_application_evidence: [] })]);
  const r = await searchByApplication(['TOYOTA','RAV4','2AR-FE'],2018,'oil',context);
  assert.equal(r.lookupStatus,'completed'); assert.equal(r.products.length,0);
});
test('missing engine asks a clarification before querying candidates', async () => {
  pool([product()]);
  const r = await searchByApplication(['TOYOTA','RAV4'],2018);
  assert.equal(r.pendingField,'engine_or_configuration'); assert.equal(r.products.length,0);
});
test('canonical reference resolver rejects multiple SKUs also for diagnostic callers', async () => {
  pool([product(),product({sku:'EL99999'})], [{code:'P123456',sku:'EL12345',status:'RESOLVED_SINGLE'},{code:'P123456',sku:'EL99999',status:'RESOLVED_SINGLE'}]);
  const r = await searchByReferences(['P123456']); assert.equal(r.lookupStatus,'ambiguous'); assert.equal(r.products.length,0);
});
test('internal SKU existence is distinct from approved equivalence', async () => {
  pool([product()]);
  const r = await searchByReferences(['EL12345']); assert.equal(r.claim,'SKU_EXISTS');
});
test('Spanish application-specific maintenance cannot fall back to generic canonical knowledge', async () => {
  const r = await queryApprovedTechnicalKnowledge({ question: '¿Cada cuántos kilómetros cambio el filtro de aceite?', equipment: context });
  assert.equal(r.status,'unavailable');
});
test('review does not claim delivery when durable backend fails', async () => {
  pool(); const r = await registerTechnicalReview({message:'Filtro para RAV4',channel:'web',conversation_id:'review-test'}, {equipment:context});
  assert.equal(r.registered,false); assert.match(technicalReviewText(r),/no pude confirmar la entrega/);
  assert.doesNotMatch(technicalReviewText(r),/quedó registrada/);
});
test('only accepted review gets a tracking ID in customer copy', () => {
  assert.match(technicalReviewText({registered:true,id:'CASE-TEST'}),/Seguimiento: CASE-TEST/);
  assert.doesNotMatch(technicalReviewText({registered:false,id:'FAKE'}),/FAKE/);
});
test('missing knowledge configuration remains unavailable without invented keys', () => {
  const env = { KNOWLEDGE_STACK_SECRETS_PATH:'C:/does-not-exist-for-chatbot-test.json' };
  assert.equal(loadKnowledgeConnection(env).configured,false); assert.equal(env.ENGINE_API_KEY,undefined);
});
test('configured existing knowledge client accepts traceable approved evidence', async () => {
  process.env.KNOWLEDGE_ENGINE_RUNTIME_URL='http://knowledge-fixture.test'; process.env.ENGINE_API_KEY='fixture-key';
  let request;
  globalThis.fetch=async (url,init) => {
    request=JSON.parse(init.body);
    assert.equal(url,'http://knowledge-fixture.test/api/knowledge-engine/v1/reason');
    return {ok:true,json:async()=>({action:'ANSWER',answer:'Procedimiento aprobado para la aplicación solicitada.',confidence:0.95,citations:[{sourceId:'manual-fixture',label:'OEM service manual'}]})};
  };
  const result=await queryApprovedTechnicalKnowledge({question:'¿Cuál es el intervalo de cambio?',equipment:context});
  assert.equal(result.status,'validated');assert.equal(result.source_count,1);
  assert.equal(request.context.state.equipment.engine,'2AR-FE');
});
test('knowledge answer without source cannot become approved evidence', async () => {
  process.env.KNOWLEDGE_ENGINE_RUNTIME_URL='http://knowledge-fixture.test';process.env.ENGINE_API_KEY='fixture-key';
  globalThis.fetch=async()=>({ok:true,json:async()=>({action:'ANSWER',answer:'Unsubstantiated interval',confidence:0.95,citations:[]})});
  const result=await queryApprovedTechnicalKnowledge({question:'¿Cada cuántos kilómetros cambio el filtro?',equipment:context});
  assert.equal(result.status,'not_found');assert.equal(result.answer,null);
});
test('technical review returns a tracking ID only after existing case API accepts it', async () => {
  let row=null;let posts=0;
  __setProtocolPoolForTests({async connect(){return{async query(sql,params=[]){
    const text=String(sql);if(/^\s*(BEGIN|COMMIT|ROLLBACK|SET LOCAL)/i.test(text))return{rows:[]};
    if(/INSERT INTO bot_governance/.test(text))row={request_id:params[0],request_type:params[1],origin:params[2],status:params[3],priority:params[4],equipment:JSON.parse(params[5]),question:params[8],reason:params[9],deduplication_key:params[14],occurrences:1,first_detected_at:params[16],last_detected_at:params[17],audit_history:[]};
    if(/SET status/.test(text)){row.status=params[1];row.hermes_research_id=params[3];}
    return{rows:row?[row]:[]};},release(){}};}});
  process.env.HERMES_REQUESTS_ENABLED='true';process.env.KNOWLEDGE_CENTER_API_URL='http://review-fixture.test';process.env.KNOWLEDGE_CENTER_API_KEY='fixture-key';
  globalThis.fetch=async(url,init)=>{posts++;assert.match(url,/candidate-cases$/);assert.match(JSON.parse(init.body).externalId,/^BOT-GAP-/);return{ok:true,json:async()=>({id:'case-fixture',status:'CAPTURED'})};};
  const body={channel:'web',conversation_id:'review-accepted',message:'Compatibilidad sin evidencia'};
  const first=await registerTechnicalReview(body,{equipment:context});
  const second=await registerTechnicalReview(body,{equipment:context});
  assert.equal(first.registered,true);assert.equal(second.id,'case-fixture');assert.equal(posts,1);
});
test('multi-turn application preserves vehicle while asking year and engine', async () => {
  pool([product()]); const body={channel:'web',conversation_id:'isolated-rav4-dialogue',language:'es'};
  const a=await runUnifiedBotProtocol({...body,message:'Qué filtros usa Toyota RAV4'});
  assert.equal(a.pending_field,'year');
  const b=await runUnifiedBotProtocol({...body,message:'2018'});
  assert.equal(b.state.equipment.model,'RAV4'); assert.equal(b.pending_field,'engine_or_configuration');
  const c=await runUnifiedBotProtocol({...body,message:'motor 2AR-FE'});
  assert.equal(c.evidence.validated,true); assert.equal(c.evidence.products[0].sku,'EL12345');
  console.log(JSON.stringify({scenario:'RAV4 multi-turn fixture',replies:[a.answer,b.answer,c.answer]}));
});
test('new equipment does not inherit approved products from previous vehicle', async () => {
  pool([product()]); const body={channel:'web',conversation_id:'isolated-equipment-change',language:'es'};
  await runUnifiedBotProtocol({...body,message:'Qué filtros usa Toyota RAV4 2018 motor 2AR-FE'});
  const r=await runUnifiedBotProtocol({...body,message:'Qué filtros usa Volvo FH 2020 motor D13'});
  assert.equal(r.evidence.validated,false); assert.equal(r.evidence.products.length,0);
});
test('an engine part-like code does not hijack a pending application conversation', async () => {
  const { preflightReferenceLookup }=require('../lib/bot-protocol-reference-preflight');
  pool([product()]);const body={channel:'web',conversation_id:'engine-code-followup',language:'es'};
  await runUnifiedBotProtocol({...body,message:'Qué filtros usa Toyota RAV4 2018'});
  const preflight=await preflightReferenceLookup({...body,message:'2AR-FE'});
  assert.equal(preflight,null);
  const result=await runUnifiedBotProtocol({...body,message:'2AR-FE'});
  assert.equal(result.evidence.validated,true);
});
test('unknown engine exits clarification loop for technical review', async () => {
  pool();const body={channel:'web',conversation_id:'unknown-engine-followup',language:'es'};
  await runUnifiedBotProtocol({...body,message:'Qué filtros usa Toyota RAV4 2018'});
  const result=await runUnifiedBotProtocol({...body,message:'No conozco el motor'});
  assert.equal(result.pending_field,null); assert.equal(result.evidence.validated,false);
  assert.equal(result.intent,'application_lookup'); assert.match(result.answer,/técnico/);
});
test('deterministic diagnosis preserves yesterday and separates engine from model', () => {
  const { deterministicClassify }=require('../lib/bot-conversation-orchestrator');
  const result=deterministicClassify('Tengo un Mack MP8 2019 y pierde fuerza desde ayer.',createEmptyState());
  assert.equal(result.entities.duration,'ayer');assert.equal(result.entities.engine,'MP8');assert.equal(result.entities.model,null);
});
test('LD and HD markers do not become part of the vehicle model', () => {
  const { extractApplicationEntities }=require('../lib/bot-protocol-unified-orchestrator');
  assert.equal(extractApplicationEntities('Qué filtros usa Toyota RAV4 LD 2018').model,'RAV4');
});
