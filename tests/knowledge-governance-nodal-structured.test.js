const test = require('node:test');
const assert = require('node:assert/strict');

const {
  targetPathForKnowledgeObject,
  validateNodalCandidate,
  renderNodalCandidate
} = require('../lib/knowledge-governance/nodal-structured-knowledge');

function candidate(overrides = {}) {
  return {
    knowledge_object_id: 'LD-LUBE-BYPASS-OPERATION',
    knowledge_content_type: 'Engineering Reference',
    title: 'Oil Filter Bypass Operation and Lubrication Continuity',
    domain: 'LIGHT_DUTY_KNOWLEDGE_DOMAIN',
    industries: ['Automotive'],
    systems: ['Lube/Oil Protection Systems'],
    technologies: ['SYNTRAX™'],
    technology_relation: 'probable',
    components: ['Oil Filter'],
    applications: [],
    application_relation: 'candidate',
    problems: ['Excessive restriction'],
    failure_modes: ['Bypass activation'],
    symptoms: ['Pressure differential increase'],
    root_causes: ['Media loading'],
    diagnostic_methods: ['Inspect restriction trend'],
    corrective_actions: ['Replace the filter after root-cause verification'],
    maintenance_procedures: ['Inspect installation and operating conditions'],
    procedures: [{ step: 1, instruction: 'Verify filter installation.', validation_status: 'awaiting_validation' }],
    metrics: [{ name: 'Differential pressure', value: 20, unit: 'psi', evidence_id: 'EVID-ABC123', validation_status: 'awaiting_validation' }],
    technical_relationships: [{ statement: 'Increasing loading can increase restriction.', validation_status: 'awaiting_validation' }],
    technical_parameters: {},
    operating_conditions: ['Stop-and-go duty'],
    standards: [],
    shared_engineering_concepts: ['Differential Pressure'],
    related_products: [],
    source_evidence: [{ evidence_id: 'EVID-ABC123', source_hash: 'abc', evidence_role: 'private_provenance_only', public_brand_reference: false, evidence_text_retained: false }],
    validation_sources: [],
    confidence: 'medium',
    publication_status: 'awaiting_validation',
    public_use_allowed: false,
    created_at: '2026-09-10T00:00:00.000Z',
    updated_at: '2026-09-10T00:00:00.000Z',
    ...overrides
  };
}

test('LD candidate is routed below system-specific Nodal staging folder', () => {
  assert.equal(
    targetPathForKnowledgeObject(candidate()),
    '12-knowledge-candidates/ld-automotive/lube-oil-protection-systems/LD-LUBE-BYPASS-OPERATION.md'
  );
});

test('Shared Engineering candidate is routed to shared-engineering staging', () => {
  const shared = candidate({
    knowledge_object_id: 'SHARED-DIFFERENTIAL-PRESSURE',
    title: 'Differential Pressure',
    domain: 'SHARED_ENGINEERING_KNOWLEDGE',
    industries: [], systems: [], technologies: [], technology_relation: 'none'
  });
  assert.equal(
    targetPathForKnowledgeObject(shared),
    '12-knowledge-candidates/shared-engineering/SHARED-DIFFERENTIAL-PRESSURE.md'
  );
});

test('rendered Nodal note retains neutral evidence IDs but no external provenance', () => {
  const note = renderNodalCandidate(candidate());
  assert.match(note, /EVID-ABC123/);
  assert.match(note, /NODAL CENTER — REVIEW CANDIDATE/);
  assert.match(note, /\[\[SHARED-DIFFERENTIAL-PRESSURE\|Differential Pressure\]\]/);
  assert.doesNotMatch(note, /FRAM|fram\.com|source_url|source_publisher|fram_ld_/i);
});

test('candidate carrying source identity is blocked', () => {
  const dirty = candidate({
    source_evidence: [{ evidence_id: 'EVID-ABC123', source_url: 'https://www.fram.com/x', source_publisher: 'FRAM' }]
  });
  const result = validateNodalCandidate(dirty);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => /private provenance key|source signature leakage/i.test(error)));
});

test('Nodal candidate cannot already be public or published', () => {
  const publicCandidate = candidate({ public_use_allowed: true, publication_status: 'approved' });
  const result = validateNodalCandidate(publicCandidate);
  assert.equal(result.valid, false);
});
