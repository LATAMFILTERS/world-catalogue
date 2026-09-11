const test = require('node:test');
const assert = require('node:assert/strict');

const {
  validateSourceNeutralPublicKnowledge,
  buildSourceNeutralPublicKnowledge
} = require('../lib/knowledge-governance/public-knowledge-sanitizer');
const {
  buildSynthesisInput,
  buildSynthesisInstructions,
  detectExternalPhraseResemblance,
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
  assert.match(instructions, /Do not preserve source sentence structure/i);
});

test('long source-text resemblance is blocked even without source brand or URL', () => {
  const sourceText = 'As contaminant loading increases across the filter media restriction rises and differential pressure can eventually activate the bypass mechanism to preserve lubrication flow.';
  const copiedDraft = 'As contaminant loading increases across the filter media restriction rises and differential pressure can eventually activate the bypass mechanism to preserve lubrication flow.';
  const result = detectExternalPhraseResemblance(copiedDraft, [sourceText], { shingleSize: 8, maxMatchingShingles: 1 });
  assert.equal(result.blocked, true);
});

test('independently reconstructed ELIMFILTERS engineering wording is allowed by resemblance guard', () => {
  const sourceText = 'As contaminant loading increases across the filter media restriction rises and differential pressure can eventually activate the bypass mechanism to preserve lubrication flow.';
  const elimfiltersDraft = 'A loaded lubrication filter can create a larger pressure drop. If the application-specific threshold is reached, bypass operation may maintain oil delivery while reducing filtration exposure control.';
  const result = detectExternalPhraseResemblance(elimfiltersDraft, [sourceText], { shingleSize: 8, maxMatchingShingles: 1 });
  assert.equal(result.blocked, false);
});
