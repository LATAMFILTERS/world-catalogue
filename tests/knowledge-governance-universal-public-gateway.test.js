const test = require('node:test');
const assert = require('node:assert/strict');

const {
  sanitizePublicValue,
  validateUniversalPublicKnowledge,
  buildUniversalPublicKnowledge,
  redactExternalKnowledgeSignatures
} = require('../lib/knowledge-governance/universal-public-knowledge-gateway');

function approved(overrides = {}) {
  return {
    knowledge_object_id: 'LD-LUBE-BYPASS-OPERATION',
    title: 'Oil Filter Bypass Operation and Lubrication Continuity',
    publication_status: 'approved',
    public_use_allowed: true,
    technology_relation: 'confirmed',
    application_relation: 'verified',
    technical_relationships: [{ statement: 'Restriction can increase differential pressure across a loaded filter.' }],
    source_evidence: [{ source_id: 'fram_ld_03', source_url: 'https://www.fram.com/x', source_publisher: 'FRAM' }],
    ...overrides
  };
}

test('recursive sanitizer removes private provenance from mother and child payloads', () => {
  const payload = {
    mother: { title: 'Automotive', source_url: 'https://www.fram.com/mother' },
    children: [{ title: 'Bypass', source_id: 'fram_ld_03', source_hash: 'abc' }]
  };
  const clean = sanitizePublicValue(payload);
  assert.equal(clean.mother.source_url, undefined);
  assert.equal(clean.children[0].source_id, undefined);
  assert.equal(clean.children[0].source_hash, undefined);
});

test('approved canonical knowledge becomes source-neutral public knowledge', () => {
  const publicRecord = buildUniversalPublicKnowledge(approved(), { requireCanonicalApproval: true });
  assert.equal(publicRecord.source_evidence, undefined);
  assert.equal(validateUniversalPublicKnowledge(publicRecord).valid, true);
  assert.doesNotMatch(JSON.stringify(publicRecord), /FRAM|fram\.com|fram_ld_/i);
});

test('probable technologies and candidate applications remain blocked', () => {
  const record = approved({ technology_relation: 'probable', application_relation: 'candidate' });
  assert.throws(() => buildUniversalPublicKnowledge(record, { requireCanonicalApproval: true }), /blocked/i);
});

test('source signatures are redacted from generated backend answers', () => {
  const result = redactExternalKnowledgeSignatures('Según FRAM en https://www.fram.com/x, fram_ld_03 explica el bypass.');
  assert.doesNotMatch(result.text, /FRAM|fram\.com|fram_ld_/i);
  assert.equal(result.violations.length >= 3, true);
});

test('normal ELIMFILTERS technical language is not modified', () => {
  const input = 'A loaded filter can increase restriction and differential pressure.';
  const result = redactExternalKnowledgeSignatures(input);
  assert.equal(result.text, input);
  assert.equal(result.violations.length, 0);
});
