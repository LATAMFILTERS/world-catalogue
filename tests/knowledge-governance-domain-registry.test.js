const test = require('node:test');
const assert = require('node:assert/strict');

const {
  KNOWLEDGE_DOMAINS,
  INDUSTRIES,
  SYSTEMS,
  PLATFORMS,
  TECHNOLOGIES,
  isSystemAllowedForDomain,
  isPlatformAllowedForDomain,
  isIndustryAllowedForDomain
} = require('../lib/knowledge-governance/knowledge-domain-registry');

const {
  createKnowledgeObject,
  validateKnowledgeObject,
  canPublishKnowledgeObject
} = require('../lib/knowledge-governance/knowledge-object-contract');

test('HD and LD remain parallel governed domains', () => {
  assert.equal(INDUSTRIES.HEAVY_DUTY.includes('Truck Fleets'), true);
  assert.deepEqual(INDUSTRIES.LIGHT_DUTY, ['Automotive']);
  assert.equal(isSystemAllowedForDomain(KNOWLEDGE_DOMAINS.HEAVY_DUTY, SYSTEMS.HYDRAULIC), true);
  assert.equal(Object.values(SYSTEMS).length, 6);
  assert.equal(isSystemAllowedForDomain(KNOWLEDGE_DOMAINS.LIGHT_DUTY, SYSTEMS.AIR_INTAKE), true);
  assert.equal(isIndustryAllowedForDomain(KNOWLEDGE_DOMAINS.LIGHT_DUTY, 'Automotive'), true);
  assert.equal(isIndustryAllowedForDomain(KNOWLEDGE_DOMAINS.LIGHT_DUTY, 'Mining'), false);
});

test('valid LD automotive knowledge object can link SYNTRAX after confirmation', () => {
  const record = createKnowledgeObject({
    domain: KNOWLEDGE_DOMAINS.LIGHT_DUTY,
    industries: ['Automotive'],
    systems: [SYSTEMS.LUBE],
    technologies: [TECHNOLOGIES.SYNTRAX],
    technology_relation: 'confirmed',
    components: ['Engine Oil Filter'],
    problems: ['Excessive Restriction'],
    application_relation: 'verified',
    source_evidence: [{ source_url: 'https://example.com/evidence' }],
    publication_status: 'approved',
    public_use_allowed: true
  });

  assert.equal(validateKnowledgeObject(record).valid, true);
  assert.equal(canPublishKnowledgeObject(record), true);
});

test('probable technology and candidate application relationships are blocked from public use', () => {
  const record = createKnowledgeObject({
    domain: KNOWLEDGE_DOMAINS.LIGHT_DUTY,
    industries: ['Automotive'],
    systems: [SYSTEMS.AIR_INTAKE],
    technologies: [TECHNOLOGIES.MACROCORE],
    technology_relation: 'probable',
    components: ['Engine Air Filter'],
    application_relation: 'candidate',
    source_evidence: [{ source_url: 'https://example.com/evidence' }],
    publication_status: 'approved',
    public_use_allowed: true
  });

  const validation = validateKnowledgeObject(record);
  assert.equal(validation.valid, false);
  assert.equal(canPublishKnowledgeObject(record), false);
});


test('Industrial & Process is a governed knowledge domain with a platform layer', () => {
  assert.equal(isSystemAllowedForDomain(KNOWLEDGE_DOMAINS.INDUSTRIAL_PROCESS, SYSTEMS.INDUSTRIAL_PROCESS), true);
  assert.equal(isPlatformAllowedForDomain(KNOWLEDGE_DOMAINS.INDUSTRIAL_PROCESS, PLATFORMS.AEREMIS), true);
  assert.equal(isIndustryAllowedForDomain(KNOWLEDGE_DOMAINS.INDUSTRIAL_PROCESS, 'Manufacturing'), true);
  assert.equal(isIndustryAllowedForDomain(KNOWLEDGE_DOMAINS.INDUSTRIAL_PROCESS, 'Automotive'), false);

  const record = createKnowledgeObject({
    domain: KNOWLEDGE_DOMAINS.INDUSTRIAL_PROCESS,
    industries: ['Manufacturing'],
    systems: [SYSTEMS.INDUSTRIAL_PROCESS],
    platforms: [PLATFORMS.AEREMIS],
    technologies: [TECHNOLOGIES.HE_CRIVA],
    technology_relation: 'confirmed',
    components: ['Final-stage high-efficiency air filtration'],
    application_relation: 'verified',
    source_evidence: [{ source_id: 'INTERNAL-TECHNOLOGY-REGISTRY' }],
    publication_status: 'approved',
    public_use_allowed: true
  });

  assert.equal(validateKnowledgeObject(record).valid, true);
  assert.equal(canPublishKnowledgeObject(record), true);
});
