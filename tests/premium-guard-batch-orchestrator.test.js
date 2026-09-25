'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {classifyAudit}=require('../scripts/hermes/premium-guard-batch-orchestrator');

test('authority owner can trigger HD reassignment',()=>{
  assert.equal(classifyAudit({
    target:{sku:'EL31507',duty:'LIGHT_DUTY'},
    authorityCode:'PH4804',
    owners:[{code:'PH4804',sku:'EL80086',filter_type:'oil',duty:'HEAVY_DUTY'}]
  }),'HD_REASSIGN_CANDIDATE');
});

test('multiple oil owners for authority require review',()=>{
  assert.equal(classifyAudit({
    target:{sku:'EL32205',duty:'LIGHT_DUTY'},
    authorityCode:'PH3757',
    owners:[
      {code:'PH3757',sku:'EL32205',filter_type:'oil',duty:'LIGHT_DUTY'},
      {code:'PH3757',sku:'EL81381',filter_type:'oil',duty:'HEAVY_DUTY'}
    ]
  }),'AUTHORITY_MULTI_OWNER_REVIEW');
});

test('single target LD authority is ready for LD preflight',()=>{
  assert.equal(classifyAudit({
    target:{sku:'EL1',duty:'LIGHT_DUTY'},
    authorityCode:'PH1',
    owners:[{code:'PH1',sku:'EL1',filter_type:'oil',duty:'LIGHT_DUTY'}]
  }),'READY_LD_PREFLIGHT');
});