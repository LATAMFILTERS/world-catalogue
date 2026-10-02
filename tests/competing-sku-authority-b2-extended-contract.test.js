'use strict';

const fs=require('fs');
const path=require('path');
const test=require('node:test');
const assert=require('node:assert/strict');

const ROOT=path.join(__dirname,'..');
const audit=fs.readFileSync(
  path.join(ROOT,'scripts','audits','audit_competing_sku_authority_b2_extended.js'),
  'utf8'
);

test('extended B2 audit is read-only',()=>{
  assert.doesNotMatch(audit,/\b(?:INSERT|UPDATE|DELETE|TRUNCATE|ALTER|DROP|CREATE TABLE)\b/i);
  assert.match(audit,/readonly:true/);
});

test('extended B2 partitions only complete competing application keys',()=>{
  assert.match(audit,/group\.members\.size < 2/);
  assert.match(audit,/!group\.make \|\| !group\.model_family \|\| !group\.model_type/);
  assert.match(audit,/!group\.year \|\| !group\.engine_code/);
});

test('extended B2 requires at least one unique resolver owner inside the group',()=>{
  assert.match(audit,/owners && owners\.size === 1/);
  assert.match(audit,/skus\.includes\(owner\)/);
  assert.match(audit,/if \(!uniqueOwnerCodes\.length\) continue/);
});

test('extended B2 holds groups with more than two SKUs',()=>{
  assert.match(audit,/GT2_SKUS/);
  assert.match(audit,/if \(skus\.length > 2\)/);
});

test('extended B2 distinguishes owner-side signal from peer-to-owner evidence',()=>{
  assert.match(audit,/OWNER_SIGNAL_COMES_FROM_OWNER_SIDE/);
  assert.match(audit,/peerToOwner\.length === 0/);
  assert.match(audit,/owner_self_codes/);
});

test('extended B2 detects primary identity conflicts',()=>{
  assert.match(audit,/PRIMARY_IDENTITY_CONFLICT/);
  assert.match(audit,/PARENT_SOURCE/);
  assert.match(audit,/PUBLIC_BASE/);
  assert.match(audit,/PUBLIC_CANONICAL/);
  assert.match(audit,/CANONICAL/);
  assert.match(audit,/VERIFIED_EVIDENCE/);
});

test('extended B2 never calls multi-source peers safe',()=>{
  assert.match(audit,/MULTI_SOURCE_PEER/);
  assert.match(audit,/if \(peerSources\.size > 1\)/);
});

test('extended B2 exposes strict safe candidates separately',()=>{
  assert.match(audit,/STRICT_SAFE_CANDIDATE/);
  assert.match(audit,/peerToOwner\.length === peerSources\.size/);
});

test('extended B2 supports summary-only output',()=>{
  assert.match(audit,/--summary-only/);
  assert.match(audit,/b1_unique_resolver_groups/);
  assert.match(audit,/top_pairs/);
});
