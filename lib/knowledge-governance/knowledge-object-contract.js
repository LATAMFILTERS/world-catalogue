'use strict';

const crypto = require('crypto');
const {
  KNOWLEDGE_DOMAINS,
  VALID_TECHNOLOGY_RELATIONS,
  VALID_APPLICATION_RELATIONS,
  isValidDomain,
  isSystemAllowedForDomain,
  isIndustryAllowedForDomain
} = require('./knowledge-domain-registry');

const VALID_PUBLICATION_STATUS = Object.freeze([
  'internal_only',
  'awaiting_validation',
  'awaiting_review',
  'approved',
  'rejected',
  'published'
]);

function list(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function createKnowledgeObject(input = {}) {
  return {
    knowledge_object_id: input.knowledge_object_id || crypto.randomUUID(),
    domain: input.domain || null,
    industries: list(input.industries),
    systems: list(input.systems),
    technologies: list(input.technologies),
    technology_relation: VALID_TECHNOLOGY_RELATIONS.includes(input.technology_relation)
      ? input.technology_relation
      : 'none',
    components: list(input.components),
    applications: list(input.applications),
    application_relation: VALID_APPLICATION_RELATIONS.includes(input.application_relation)
      ? input.application_relation
      : 'candidate',
    problems: list(input.problems),
    failure_modes: list(input.failure_modes),
    symptoms: list(input.symptoms),
    root_causes: list(input.root_causes),
    diagnostic_methods: list(input.diagnostic_methods),
    corrective_actions: list(input.corrective_actions),
    maintenance_procedures: list(input.maintenance_procedures),
    technical_parameters: input.technical_parameters && typeof input.technical_parameters === 'object'
      ? input.technical_parameters
      : {},
    operating_conditions: list(input.operating_conditions),
    standards: list(input.standards),
    related_products: list(input.related_products),
    source_evidence: list(input.source_evidence),
    validation_sources: list(input.validation_sources),
    confidence: input.confidence || 'low',
    publication_status: VALID_PUBLICATION_STATUS.includes(input.publication_status)
      ? input.publication_status
      : 'internal_only',
    public_use_allowed: input.public_use_allowed === true,
    created_at: input.created_at || new Date().toISOString(),
    updated_at: input.updated_at || new Date().toISOString()
  };
}

function validateKnowledgeObject(record = {}) {
  const errors = [];

  if (!record.knowledge_object_id) errors.push('knowledge_object_id is required');
  if (!isValidDomain(record.domain)) errors.push('domain is invalid');

  if (record.domain !== KNOWLEDGE_DOMAINS.SHARED) {
    if (list(record.industries).length === 0) errors.push('at least one industry is required');
    if (list(record.systems).length === 0) errors.push('at least one system is required');
  }

  for (const industry of list(record.industries)) {
    if (!isIndustryAllowedForDomain(record.domain, industry)) {
      errors.push(`industry not allowed for domain: ${industry}`);
    }
  }

  for (const system of list(record.systems)) {
    if (!isSystemAllowedForDomain(record.domain, system)) {
      errors.push(`system not allowed for domain: ${system}`);
    }
  }

  if (!VALID_TECHNOLOGY_RELATIONS.includes(record.technology_relation)) {
    errors.push('technology_relation is invalid');
  }

  if (!VALID_APPLICATION_RELATIONS.includes(record.application_relation)) {
    errors.push('application_relation is invalid');
  }

  if (!VALID_PUBLICATION_STATUS.includes(record.publication_status)) {
    errors.push('publication_status is invalid');
  }

  if (record.public_use_allowed && record.technology_relation === 'probable') {
    errors.push('probable technology relationships cannot be public');
  }

  if (record.public_use_allowed && record.application_relation === 'candidate') {
    errors.push('candidate applications cannot be public');
  }

  if (list(record.related_products).length > 0 && record.application_relation !== 'verified') {
    errors.push('related_products require a verified application relationship');
  }

  return { valid: errors.length === 0, errors };
}

function canPublishKnowledgeObject(record = {}) {
  const validation = validateKnowledgeObject(record);
  return validation.valid &&
    record.public_use_allowed === true &&
    record.publication_status === 'approved' &&
    record.technology_relation !== 'probable' &&
    record.application_relation !== 'candidate' &&
    list(record.source_evidence).length > 0;
}

module.exports = {
  VALID_PUBLICATION_STATUS,
  createKnowledgeObject,
  validateKnowledgeObject,
  canPublishKnowledgeObject
};
