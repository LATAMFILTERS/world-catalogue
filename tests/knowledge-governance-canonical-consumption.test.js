'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  loadCanonicalRecords,
  searchCanonicalKnowledge,
  buildCanonicalKnowledgeAnswer
} = require('../lib/knowledge-governance/canonical-knowledge-repository');
const { queryApprovedTechnicalKnowledge } = require('../lib/knowledge-governance/obsidian-knowledge-client');

test('backend canonical repository loads only the 34 approved records', () => {
  const records = loadCanonicalRecords();
  assert.equal(records.length, 34);
  assert.equal(/FRAM|fram\.com|https?:\/\/|EVID-|12-knowledge-candidates/i.test(JSON.stringify(records.map(r => ({ id:r.id, title:r.title, body:r.body })))), false);
});

test('backend canonical search resolves validated bypass engineering knowledge', () => {
  const hits = searchCanonicalKnowledge('oil filter bypass restriction');
  assert.ok(hits.length > 0);
  assert.ok(hits.some(r => /BYPASS/.test(r.id)));
  const answer = buildCanonicalKnowledgeAnswer('oil filter bypass restriction');
  assert.ok(answer);
  assert.match(answer.sourceId, /^CANONICAL-/);
});

test('AI governance client consumes canonical Nodal knowledge before external retrieval for generic questions', async () => {
  const result = await queryApprovedTechnicalKnowledge({ question: 'How does oil filter bypass restriction work?', equipment: {}, system: 'Lube/Oil Protection Systems' });
  assert.equal(result.status, 'validated');
  assert.equal(result.canonical_authority, '13-canonical-knowledge');
  assert.equal(result.source_count, 1);
  assert.equal(result.evidence[0].source_authority, 'obsidian');
  assert.match(result.evidence[0].source_title, /^ELIMFILTERS Canonical Knowledge/);
  assert.equal(/FRAM|fram\.com|EVID-|12-knowledge-candidates/i.test(JSON.stringify(result)), false);
});
