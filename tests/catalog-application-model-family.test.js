'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {normalizedApplication,validateApplicationWrite,applicationPayloadHash}=require('../lib/catalog-application-governance');
function ld(app){return {duty:'LIGHT_DUTY',equipment_applications:[],vehicle_applications:[app],enrichment_data:{}};}
test('explicit relational model family supplies the same model identity as model',()=>{
  const old={make:'BMW',model_family:'R 45',year:'1980'};
  assert.equal(normalizedApplication(old).model,'R 45');
  assert.equal(validateApplicationWrite(ld(old)).valid,true);
  assert.equal(applicationPayloadHash([old]),applicationPayloadHash([{make:'BMW',model:'R 45',year:'1980'}]));
  assert.deepEqual(old,{make:'BMW',model_family:'R 45',year:'1980'});
});
test('a year or date range is never inferred to be a model',()=>{
  for(const family of ['2017','1998','1998-2006','07/98 → 08/05',''])assert.ok(validateApplicationWrite(ld({make:'TOYOTA',model_family:family})).reasons.includes('VEHICLE_IDENTITY_MISSING'));
});
test('explicit model wins over legacy model family and existing payload hash stays stable',()=>{
  const a={make:'BMW',model:'R 45',model_family:'2017',engine:'123',year:'1980'};
  const b={make:'BMW',model:'R 45',engine:'123',year:'1980'};
  assert.equal(applicationPayloadHash([a]),applicationPayloadHash([b]));
});
test('legacy family does not infer engine codes or an absent make',()=>{
  assert.equal(normalizedApplication({make:'BMW',model_family:'R 45'}).engine,'');
  assert.ok(validateApplicationWrite(ld({model_family:'R 45'})).reasons.includes('VEHICLE_IDENTITY_MISSING'));
});
test('model_type is not used to guess missing model identity',()=>{
  assert.ok(validateApplicationWrite(ld({make:'TOYOTA',model_family:'2017',model_type:'Corolla'})).reasons.includes('VEHICLE_IDENTITY_MISSING'));
});
test('explicit family never substitutes for verified evidence on application writes',()=>{
  const result=validateApplicationWrite(ld({make:'BMW',model_family:'R 45',year:'1980'}),{requireEvidence:true});
  assert.equal(result.valid,false);
  assert.ok(result.reasons.includes('APPLICATION_EVIDENCE_NOT_RECORDED'));
});
test('Heavy Duty domain protection still rejects vehicle payloads',()=>{
  assert.ok(validateApplicationWrite({...ld({make:'BMW',model_family:'R 45'}),duty:'HEAVY_DUTY'}).reasons.includes('HD_VEHICLE_APPLICATIONS_MUST_USE_EQUIPMENT_MODEL'));
});
test('existing explicit vehicle or equipment identity retains its original payload hash',()=>{
  const old={make:'BMW',vehicle:'BMW R 45',model_family:'R 45',year:'1980'};
  const canonical={make:'BMW',vehicle:'BMW R 45',year:'1980'};
  assert.equal(applicationPayloadHash([old]),applicationPayloadHash([canonical]));
  assert.equal(normalizedApplication(old).model,'');
});
