'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  loadCanonicalRecords,
  searchCanonicalKnowledge,
  buildCanonicalKnowledgeAnswer
} = require('../lib/knowledge-governance/canonical-knowledge-repository');
const { queryApprovedTechnicalKnowledge } = require('../lib/knowledge-governance/obsidian-knowledge-client');
const generatedCanonicalKnowledge = require('../frontend/src/generated/canonical-knowledge.json');

test('backend canonical repository matches the approved public projection', () => {
  const records = loadCanonicalRecords();
  assert.equal(records.length, generatedCanonicalKnowledge.count);
  assert.equal(/\bFRAM\b|fram\.com|https?:\/\/|EVID-|12-knowledge-candidates/i.test(JSON.stringify(records.map(r => ({ id:r.id, title:r.title, body:r.body })))), false);
});

test('backend canonical search resolves validated bypass engineering knowledge', () => {
  const hits = searchCanonicalKnowledge('oil filter bypass restriction');
  assert.ok(hits.length > 0);
  assert.ok(hits.some(r => /BYPASS/.test(r.id)));
  const answer = buildCanonicalKnowledgeAnswer('oil filter bypass restriction');
  assert.ok(answer);
  assert.match(answer.sourceId, /^CANONICAL-/);
});

test('canonical projection contains governed FUMEVRA process-dust knowledge', () => {
  const record = generatedCanonicalKnowledge.records.find(r => r.id === 'IP-PARTION-FUMEVRA-FINE-DUST-FUME');
  assert.ok(record);
  assert.deepEqual(record.platforms, ['PARTION™']);
  assert.deepEqual(record.technologies, ['FUMEVRA™']);
  assert.ok(record.technicalRelationships.some(x => /pulse-jet cleaning/i.test(x)));
  assert.ok(record.maintenanceProcedures.some(x => /differential pressure/i.test(x)));
});


test('canonical projection contains governed COALERIS gas-coalescence knowledge', () => {
  const record = generatedCanonicalKnowledge.records.find(r => r.id === 'IP-COALVEX-COALERIS-GAS-COALESCENCE');
  assert.ok(record);
  assert.deepEqual(record.platforms, ['COALVEX™']);
  assert.deepEqual(record.technologies, ['COALERIS™']);
  assert.ok(record.technicalRelationships.some(x => /fine liquid aerosols/i.test(x)));
  assert.ok(record.technicalRelationships.some(x => /bulk separation/i.test(x)));
  assert.ok(record.maintenanceProcedures.some(x => /differential pressure/i.test(x)));
  assert.ok(record.maintenanceProcedures.some(x => /drain/i.test(x)));
});

test('canonical projection contains governed FLUREXIS fluid-conditioning knowledge', () => {
  const platform = generatedCanonicalKnowledge.records.find(r => r.id === 'IP-FLUREXIS-FLUID-CONDITIONING-ARCHITECTURE');
  assert.ok(platform);
  assert.deepEqual(platform.platforms, ['FLUREXIS™']);

  const expected = [
    ['IP-FLUREXIS-HYLTRIS-HYDRAULIC-FILTRATION', 'HYLTRIS™'],
    ['IP-FLUREXIS-LUBREVA-LUBRICATION-FILTRATION', 'LUBREVA™'],
    ['IP-FLUREXIS-DEWATIS-OIL-DEHYDRATION', 'DEWATIS™'],
    ['IP-FLUREXIS-OILREVEX-OIL-CONDITION-REMEDIATION', 'OILREVEX™'],
  ];

  for (const [id, technology] of expected) {
    const record = generatedCanonicalKnowledge.records.find(r => r.id === id);
    assert.ok(record);
    assert.deepEqual(record.platforms, ['FLUREXIS™']);
    assert.deepEqual(record.technologies, [technology]);
    assert.ok(record.diagnosticMethods.length > 0);
    assert.ok(record.maintenanceProcedures.length > 0);
  }
});

test('canonical search resolves LUBREVA industrial lubrication knowledge', () => {
  const hits = searchCanonicalKnowledge('LUBREVA industrial lubrication filtration wear debris viscosity');
  assert.ok(hits.length > 0);
  assert.equal(hits[0].id, 'IP-FLUREXIS-LUBREVA-LUBRICATION-FILTRATION');
  assert.match(hits[0].body, /wear debris/i);
  assert.match(hits[0].body, /viscosity/i);
});

test('approved technical knowledge serves LUBREVA canonical knowledge before external retrieval', async () => {
  const result = await queryApprovedTechnicalKnowledge({
    question: 'How does LUBREVA handle wear debris in industrial lubrication filtration?',
    equipment: {},
    system: 'Industrial & Process'
  });
  assert.equal(result.status, 'validated');
  assert.equal(result.canonical_authority, '13-canonical-knowledge');
  assert.equal(result.source_count, 1);
  assert.match(result.evidence[0].source_title, /LUBREVA Industrial Lubrication Filtration/);
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
