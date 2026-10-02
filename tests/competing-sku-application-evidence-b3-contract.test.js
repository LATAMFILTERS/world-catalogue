'use strict';

const fs=require('fs');
const path=require('path');
const test=require('node:test');
const assert=require('node:assert/strict');

const ROOT=path.join(__dirname,'..');
const audit=fs.readFileSync(
  path.join(ROOT,'scripts','audits','audit_competing_sku_application_evidence_b3.js'),
  'utf8'
);

test('B3 audit is strictly read-only',()=>{
  assert.doesNotMatch(audit,/\b(?:INSERT|UPDATE|DELETE|TRUNCATE|ALTER|DROP|CREATE TABLE)\b/i);
  assert.match(audit,/readonly:true/);
});

test('B3 starts only from two-SKU complete application groups',()=>{
  assert.match(audit,/group\.members\.size !== 2/);
  assert.match(audit,/!txt\(sample\.make\)/);
  assert.match(audit,/!txt\(sample\.model_family\)/);
  assert.match(audit,/!txt\(sample\.model_type\)/);
  assert.match(audit,/!String\(sample\.year \|\| ''\)/);
  assert.match(audit,/!txt\(sample\.engine_code\)/);
});

test('B3 includes only owner-signal-from-owner-side groups',()=>{
  assert.match(audit,/ownerSet\.size !== 1/);
  assert.match(audit,/peerToOwner\.length !== 0/);
  assert.match(audit,/b3Groups\.push/);
});

test('B3 measures full peer application overlap, not only competing rows',()=>{
  assert.match(audit,/ownerKeys/);
  assert.match(audit,/peerKeys/);
  assert.match(audit,/peerOnly/);
  assert.match(audit,/ownerOnly/);
  assert.match(audit,/overlap_ratio/);
});

test('B3 recognizes direct peer identity evidence across governed sources',()=>{
  assert.match(audit,/PARENT_SOURCE/);
  assert.match(audit,/PUBLIC_BASE/);
  assert.match(audit,/PUBLIC_CANONICAL/);
  assert.match(audit,/CANONICAL/);
  assert.match(audit,/VERIFIED_EVIDENCE/);
  assert.match(audit,/COMPETITOR/);
  assert.match(audit,/OEM/);
});

test('B3 does not call peers with unique applications clones',()=>{
  assert.match(audit,/PEER_IDENTITY_WITH_UNIQUE_APPLICATIONS/);
  assert.match(audit,/PEER_NO_IDENTITY_WITH_UNIQUE_APPLICATIONS/);
  assert.match(audit,/peerOnly > 0/);
});

test('B3 exposes strong clone candidates only when overlap is total and public evidence absent',()=>{
  assert.match(audit,/CLONE_CANDIDATE_STRONG/);
  assert.match(audit,/peerOnly === 0/);
  assert.match(audit,/overlapRatio === 1/);
  assert.match(audit,/publicApplicationCount === 0/);
});

test('B3 separates total overlap with public evidence from strong clones',()=>{
  assert.match(audit,/CLONE_CANDIDATE_WITH_PUBLIC_EVIDENCE/);
  assert.match(audit,/PEER_IDENTITY_FULLY_OVERLAPS_OWNER/);
});

test('B3 supports summary-only output',()=>{
  assert.match(audit,/--summary-only/);
  assert.match(audit,/pair_summary/);
  assert.match(audit,/competing_groups_by_bucket/);
  assert.match(audit,/unique_peers_by_bucket/);
});
