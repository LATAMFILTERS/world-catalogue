const test = require('node:test');
const assert = require('node:assert/strict');

const {
  validateSourceNeutralPublicKnowledge,
  buildSourceNeutralPublicKnowledge
} = require('../lib/knowledge-governance/public-knowledge-sanitizer');
const {
  buildSynthesisInput,
  buildSynthesisInstructions,
  validateSynthesisOutput
} = require('../lib/knowledge-governance/elimfilters-ai-knowledge-synthesis-contract');

function approvedRecord(overrides = {}) {
  return {
    knowledge_object_id: 'LD-LUBE-BYPASS-OPERATION',
    title: 'Oil Filter Bypass Operation and Lubrication Continuity',
    publication_status: 'approved',
    public_use_allowed: true,
    technology_relation: 'confirmed',
    application_relation: 'verified',
    technical_relationships: [{ statement: 'Excessive differential pressure can activate an application-specific bypass mechanism.' }],
    source_evidence: [{ source_publisher: 'FRAM', source_url: 'https://www.fram.com/x', source_hash: 'abc' }],
    validation_sources: [{ publisher: 'OEM', url: 'https://example.com/validation' }],
    ...overrides
  };
}

test('private provenance is stripped from a valid public knowledge object', () => {
  const record = approvedRecord();
  assert.equal(validateSourceNeutralPublicKnowledge(record).valid, true);
  const publicRecord = buildSourceNeutralPublicKnowledge(record);
  assert.equal(Object.prototype.hasOwnProperty.call(publicRecord, 'source_evidence'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(publicRecord, 'validation_sources'), false);
  assert.equal(publicRecord.source_evidence_count, 1);
});

test('public wording containing FRAM or an external URL is blocked', () => {
  const brandLeak = approvedRecord({ title: 'FRAM-style bypass explanation' });
  assert.equal(validateSourceNeutralPublicKnowledge(brandLeak).valid, false);
  const urlLeak = approvedRecord({ technical_relationships: [{ statement: 'See https://www.fram.com/x for details.' }] });
  assert.equal(validateSourceNeutralPublicKnowledge(urlLeak).valid, false);
});

test('ELIMFILTERS AI synthesis contract cannot promote probable technology or candidate application relations', () => {
  const input = buildSynthesisInput({ knowledge_object: {
    knowledge_object_id: 'x', title: 'x', domain: 'LIGHT_DUTY_KNOWLEDGE_DOMAIN',
    industries: ['Automotive'], systems: ['Lube/Oil Protection Systems'], technologies: ['SYNTRAX™'],
    technology_relation: 'probable', application_relation: 'candidate', source_evidence: [{}]
  }});
  const output = {
    status: 'ready_for_nodal_review', title: 'Technical synthesis', engineering_principles: [], causal_relations: [],
    diagnostic_guidance: [], service_guidance: [], technology_relation: 'confirmed', application_relation: 'verified'
  };
  const validation = validateSynthesisOutput(output, input);
  assert.equal(validation.valid, false);
  assert.equal(validation.errors.length >= 2, true);
});

test('AI synthesis instructions explicitly forbid source paraphrase and brand leakage', () => {
  const instructions = buildSynthesisInstructions();
  assert.match(instructions, /do not paraphrase external articles/i);
  assert.match(instructions, /Never mention, cite, imitate or allude/i);
});
