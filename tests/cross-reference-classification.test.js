'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {classifyReference}=require('../lib/cross-reference-classification');
const {validateAlternateClassification,assertCrossReferenceReclassification}=require('../lib/catalog-write-gateway');

test('known aftermarket brands classify as AFTERMARKET',()=>{
  for(const m of ['DONALDSON','FLEETGUARD','CARQUEST','HIFI','NAPA','SAKURA','RACOR']){
    assert.equal(classifyReference({manufacturer:m,code:'X1'}),'AFTERMARKET',m);
  }
});

test('known equipment manufacturers classify as OEM',()=>{
  for(const m of ['CATERPILLAR','FORD','ISUZU','KOMATSU','GENERAL MOTORS','ATLAS COPCO','AGCO']){
    assert.equal(classifyReference({manufacturer:m,code:'X1'}),'OEM',m);
  }
});

test('explicit classification overrides fallback taxonomy',()=>{
  assert.equal(classifyReference({manufacturer:'FORD',classification:'AFTERMARKET'}),'AFTERMARKET');
  assert.equal(classifyReference({manufacturer:'DONALDSON',classification:'OEM'}),'OEM');
});

test('gateway rejects known aftermarket in oem_codes and known OEM in competitor_codes',()=>{
  const v=validateAlternateClassification({codigo_base:'BASE1',oem_codes:[{manufacturer:'CARQUEST',code:'123'}],competitor_codes:[{manufacturer:'ISUZU',code:'456'}]});
  assert.deepEqual(v.map(x=>x.reason).sort(),['AFTERMARKET_IN_OEM_CODES','OEM_IN_COMPETITOR_CODES']);
});

test('reclassification gateway allows moving existing refs but not inventing refs',()=>{
  const current={duty:'HEAVY_DUTY',oem_codes:[{manufacturer:'CARQUEST',code:'123'}],competitor_codes:[{manufacturer:'ISUZU',code:'456'}]};
  assert.doesNotThrow(()=>assertCrossReferenceReclassification(current,{oem_codes:[{manufacturer:'ISUZU',code:'456',classification:'OEM'}],competitor_codes:[{manufacturer:'CARQUEST',code:'123',classification:'AFTERMARKET'}]}));
  assert.throws(()=>assertCrossReferenceReclassification(current,{oem_codes:[],competitor_codes:[{manufacturer:'CARQUEST',code:'999',classification:'AFTERMARKET'}]}));
});
