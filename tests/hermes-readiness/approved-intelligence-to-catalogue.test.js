'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildOrder, ALL_SYSTEMS } = require('../../scripts/hermes/approved-intelligence-to-catalogue');

const approved = {
  entity_code:'HERMES_REAL_VOLVO_VNX_20261019', workflow_status:'APPROVED',
  approved_by:'Victor Abreu', approved_at:'2026-10-19T18:00:00Z',
  source_url:'https://www.volvotrucks.com/'
};
test('approval generates complete filtration coverage research without publication',()=>{
  const order=buildOrder(approved,{brand:'Volvo',model:'VNX'});
  assert.equal(order.publication_authorized,false);
  assert.equal(order.gap.request_type,'filter_application');
  assert.equal(order.gap.system,'all_oem_filtration_systems');
  assert.equal(order.research.knowledge_gap_request_id,order.gap.request_id);
  assert.match(order.research.research_question,/transmission and gearbox/);
  assert.match(order.research.research_question,/hydraulic pressure/);
  assert.match(order.research.research_question,/cab and HVAC/);
  assert.match(order.research.research_question,/PENDING_RESEARCH/);
  assert.match(order.research.research_question,/Donaldson first, Fleetguard second/);
  assert.ok(ALL_SYSTEMS.length>=10);
});
test('same approval and model are idempotent',()=>{
  const a=buildOrder(approved,{brand:'Volvo',model:'VNX'});
  const b=buildOrder(approved,{brand:'Volvo',model:'VNX'});
  assert.equal(a.gap.request_id,b.gap.request_id);
  assert.equal(a.gap.deduplication_key,b.gap.deduplication_key);
});
test('unapproved or underspecified signals cannot create work',()=>{
  assert.throws(()=>buildOrder({...approved,workflow_status:'PENDING_REVIEW'},{brand:'Volvo',model:'VNX'}),/approval/i);
  assert.throws(()=>buildOrder(approved,{brand:'Volvo'}),/Exact equipment/i);
  assert.throws(()=>buildOrder({...approved,entity_code:'FAKE'}, {brand:'Volvo',model:'VNX'}),/real HERMES/);
});
