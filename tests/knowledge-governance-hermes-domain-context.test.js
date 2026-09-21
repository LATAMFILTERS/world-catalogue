const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createHermesResearchRequest,
  validateHermesResearchRequest
} = require('../lib/knowledge-governance/hermes-research-contract');

const {
  KNOWLEDGE_DOMAINS,
  SYSTEMS,
  PLATFORMS,
  TECHNOLOGIES
} = require('../lib/knowledge-governance/knowledge-domain-registry');

test('Hermes research request carries governed Light Duty context', () => {
  const request = createHermesResearchRequest({
    knowledge_gap_request_id: 'gap-ld-001',
    research_type: 'technical_knowledge',
    knowledge_domain: KNOWLEDGE_DOMAINS.LIGHT_DUTY,
    industry: 'Automotive',
    system: SYSTEMS.LUBE,
    technology: TECHNOLOGIES.SYNTRAX,
    technology_relation: 'probable',
    component: 'Engine Oil Filter',
    applications: ['Passenger Car'],
    application_relation: 'candidate',
    research_question: 'How does oil filter restriction affect lubrication protection?'
  });

  assert.equal(validateHermesResearchRequest(request).valid, true);
  assert.equal(request.knowledge_domain, KNOWLEDGE_DOMAINS.LIGHT_DUTY);
  assert.equal(request.industry, 'Automotive');
  assert.equal(request.technology_relation, 'probable');
  assert.equal(request.application_relation, 'candidate');
});

test('Hermes rejects an HD industry inside the LD domain', () => {
  const request = createHermesResearchRequest({
    knowledge_gap_request_id: 'gap-invalid-001',
    knowledge_domain: KNOWLEDGE_DOMAINS.LIGHT_DUTY,
    industry: 'Mining',
    system: SYSTEMS.LUBE,
    research_question: 'Invalid mixed-domain request'
  });

  const validation = validateHermesResearchRequest(request);
  assert.equal(validation.valid, false);
  assert.equal(validation.errors.includes('industry is not allowed for knowledge_domain'), true);
});

test('confirmed technology relation requires a named technology', () => {
  const request = createHermesResearchRequest({
    knowledge_gap_request_id: 'gap-invalid-002',
    knowledge_domain: KNOWLEDGE_DOMAINS.LIGHT_DUTY,
    industry: 'Automotive',
    system: SYSTEMS.AIR_INTAKE,
    technology_relation: 'confirmed',
    research_question: 'Invalid confirmed technology relation'
  });

  const validation = validateHermesResearchRequest(request);
  assert.equal(validation.valid, false);
  assert.equal(validation.errors.includes('confirmed technology_relation requires technology'), true);
});


test('Hermes accepts governed Industrial & Process AEREMIS research context', () => {
  const request = createHermesResearchRequest({
    knowledge_gap_request_id: 'gap-ip-air-001',
    research_type: 'technical_knowledge',
    knowledge_domain: KNOWLEDGE_DOMAINS.INDUSTRIAL_PROCESS,
    industry: 'Manufacturing',
    system: SYSTEMS.INDUSTRIAL_PROCESS,
    platform: PLATFORMS.AEREMIS,
    technology: TECHNOLOGIES.HE_CRIVA,
    technology_relation: 'confirmed',
    application_relation: 'verified',
    research_question: 'What system conditions affect high-efficiency critical-air filtration performance?'
  });

  assert.equal(validateHermesResearchRequest(request).valid, true);
  assert.equal(request.platform, PLATFORMS.AEREMIS);
});

test('Hermes rejects an AEREMIS platform inside Light Duty', () => {
  const request = createHermesResearchRequest({
    knowledge_gap_request_id: 'gap-invalid-ip-001',
    knowledge_domain: KNOWLEDGE_DOMAINS.LIGHT_DUTY,
    industry: 'Automotive',
    system: SYSTEMS.AIR_INTAKE,
    platform: PLATFORMS.AEREMIS,
    research_question: 'Invalid mixed-domain platform request'
  });

  const validation = validateHermesResearchRequest(request);
  assert.equal(validation.valid, false);
  assert.equal(validation.errors.includes('platform is not allowed for knowledge_domain'), true);
});


test('Hermes accepts governed Industrial & Process PARTION research context', () => {
  const request = createHermesResearchRequest({
    knowledge_gap_request_id: 'gap-ip-dust-001',
    research_type: 'technical_knowledge',
    knowledge_domain: KNOWLEDGE_DOMAINS.INDUSTRIAL_PROCESS,
    industry: 'Manufacturing',
    system: SYSTEMS.INDUSTRIAL_PROCESS,
    platform: PLATFORMS.PARTION,
    technology: TECHNOLOGIES.FUMEVRA,
    technology_relation: 'confirmed',
    application_relation: 'verified',
    research_question: 'What process conditions affect fine-dust and fume filtration performance?'
  });

  assert.equal(validateHermesResearchRequest(request).valid, true);
  assert.equal(request.platform, PLATFORMS.PARTION);
  assert.equal(request.technology, TECHNOLOGIES.FUMEVRA);
});
