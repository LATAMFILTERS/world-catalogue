'use strict';

const fs=require('fs');
const path=require('path');
const test=require('node:test');
const assert=require('node:assert/strict');

const ROOT=path.join(__dirname,'..');
const audit=fs.readFileSync(
  path.join(ROOT,'scripts','audits','audit_competing_sku_authority_b2.js'),
  'utf8'
);

test('B2 audit is strictly read-only',()=>{
  assert.doesNotMatch(audit,/\b(?:INSERT|UPDATE|DELETE|TRUNCATE|ALTER|DROP|CREATE TABLE)\b/i);
  assert.match(audit,/readonly:true/);
});

test('B2 requires exactly two SKUs and a complete application key',()=>{
  assert.match(audit,/group\.members\.size !== 2/);
  assert.match(audit,/!group\.make \|\| !group\.model_family \|\| !group\.model_type/);
  assert.match(audit,/!group\.year \|\| !group\.engine_code/);
});

test('B2 requires the peer source itself to resolve uniquely to the owner',()=>{
  assert.match(audit,/owners\.size === 1/);
  assert.match(audit,/owner !== sku/);
  assert.match(audit,/peerEdges\.length/);
  assert.match(audit,/allPeerCodesResolveToOwner/);
});

test('B2 treats primary product identity as direct evidence',()=>{
  assert.match(audit,/PARENT_SOURCE/);
  assert.match(audit,/PUBLIC_BASE/);
  assert.match(audit,/PUBLIC_CANONICAL/);
  assert.match(audit,/CANONICAL/);
  assert.match(audit,/VERIFIED_EVIDENCE/);
});

test('B2 classifies peer direct evidence as HOLD_DUAL_EVIDENCE',()=>{
  assert.match(audit,/HOLD_DUAL_EVIDENCE/);
  assert.match(audit,/if \(peerDirect\)/);
});

test('B2 holds source variants instead of partially re-owning them',()=>{
  assert.match(audit,/HOLD_PLATFORM_VARIANT/);
  assert.match(audit,/peerSources\.size !== 1/);
});

test('B2 supports summary-only output',()=>{
  assert.match(audit,/--summary-only/);
  assert.match(audit,/top_pairs/);
});
