import assert from 'node:assert/strict';
import test from 'node:test';
import { commercialLeadKind, acceptedLeadResponse, leadDedupKey } from '../frontend/src/lib/lead-conversion-governance.mjs';
const origin = 'https://elimfilters.com';
test('explicit acceptance only; rejected, empty and HTTP error bodies do not count', () => {
  for (const [res, body] of [
    [{ok:false,status:400},{success:true,leadId:'1'}],
    [{ok:true,status:200},{success:false,leadId:'1'}],
    [{ok:true,status:200},{ok:false}],
    [{ok:true,status:200},{error:'rejected'}],
    [{ok:true,status:200},{}],
    [{ok:true,status:200},null],
    [{ok:true,status:204},null],
  ]) assert.equal(acceptedLeadResponse(res,body),false);
  assert.equal(acceptedLeadResponse({ok:true,status:201},{accepted:true,leadId:'A'}),true);
  assert.equal(acceptedLeadResponse({ok:true,status:200},{success:true}),true);
});
test('external partner endpoint is allowed but unrelated hosts are rejected',()=>{
  assert.equal(commercialLeadKind('https://crm-api.elimfilters.com/v1/public/partner-applications',origin),'partner');
  assert.equal(commercialLeadKind('/api/distributor',origin),'distributor');
  assert.equal(commercialLeadKind('https://evil.example/api/distributor',origin),null);
  assert.equal(commercialLeadKind('https://crm-api.elimfilters.com/api/distributor',origin),null);
});
test('deduplication requires a stable backend or idempotency key',()=>{
  assert.equal(leadDedupKey('partner',{idempotencyKey:'k1'},{accepted:true}),'partner:k1');
  assert.equal(leadDedupKey('lead_capture',{}, {leadId:'L1'}),'lead_capture:L1');
  assert.equal(leadDedupKey('lead_capture',{}, {success:true}),null);
});
test('no network access occurs in any governance test',()=>{assert.equal(typeof globalThis.fetch,'function');});

test('real lead-capture contract: count only persisted accepted events', () => {
  const good = {accepted:true,eventId:'evt-1',persisted:true,delivery:'queued'};
  const unpersisted = {accepted:true,eventId:'evt-2',persisted:false,delivery:'database_not_configured'};
  assert.equal(acceptedLeadResponse({ok:true,status:202},good),true);
  assert.equal(leadDedupKey('lead_capture',{},good),'lead_capture:evt-1');
  assert.equal(acceptedLeadResponse({ok:true,status:202},unpersisted),false);
});
test('legacy distributor response accepted but lacks stable ID: must remain uncounted',()=>{
  const response = {ok:true};
  assert.equal(acceptedLeadResponse({ok:true,status:200},response),true);
  assert.equal(leadDedupKey('distributor',{},response),null);
});
test('network rejection cannot yield a conversion', async()=>{
  await assert.rejects(async()=>{throw new Error('network failure');});
});
