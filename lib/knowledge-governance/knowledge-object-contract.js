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

const VALID_KNOWLEDGE_CONTENT_TYPES = Object.freeze([
  'Engineering Reference',
  'Failure Analysis Guide',
  'Installation Procedure',
  'Application Note',
  'Service Reference',
  'Shared Engineering Concept'
]);

function list(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function objectList(value) {
  return Array.isArray(value) ? value.filter((item) => item && typeof item === 'object') : [];
}

function createKnowledgeObject(input = {}) {
  return {
    knowledge_object_id: input.knowledge_object_id || crypto.randomUUID(),
    knowledge_content_type: VALID_KNOWLEDGE_CONTENT_TYPES.includes(input.knowledge_content_type)
      ? input.knowledge_content_type
      : 'Engineering Reference',
    title: input.title || null,
    domain: input.domain || null,
    origin_domains: list(input.origin_domains),
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
    procedures: objectList(input.procedures),
    metrics: objectList(input.metrics),
    technical_relationships: objectList(input.technical_relationships),
    source_claims: objectList(input.source_claims),
    technical_parameters: input.technical_parameters && typeof input.technical_parameters === 'object'
      ? input.technical_parameters
      : {},
    operating_conditions: list(input.operating_conditions),
    standards: list(input.standards),
    shared_engineering_concepts: list(input.shared_engineering_concepts),
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
  if (!VALID_KNOWLEDGE_CONTENT_TYPES.includes(record.knowledge_content_type)) errors.push('knowledge_content_type is invalid');
  if (!isValidDomain(record.domain)) errors.push('domain is invalid');

  if (record.domain !== KNOWLEDGE_DOMAINS.SHARED) {
    if (list(record.industries).length === 0) errors.push('at least one industry is required');
    if (list(record.systems).length === 0) errors.push('at least one system is required');
  }

  for (const industry of list(record.industries)) {
    if (!isIndustryAllowedForDomain(record.domain, industry)) errors.push(`industry not allowed for domain: ${industry}`);
  }

  for (const system of list(record.systems)) {
    if (!isSystemAllowedForDomain(record.domain, system)) errors.push(`system not allowed for domain: ${system}`);
  }

  if (!VALID_TECHNOLOGY_RELATIONS.includes(record.technology_relation)) errors.push('technology_relation is invalid');
  if (!VALID_APPLICATION_RELATIONS.includes(record.application_relation)) errors.push('application_relation is invalid');
  if (!VALID_PUBLICATION_STATUS.includes(record.publication_status)) errors.push('publication_status is invalid');

  if (record.public_use_allowed && record.technology_relation === 'probable') errors.push('probable technology relationships cannot be public');
  if (record.public_use_allowed && record.application_relation === 'candidate') errors.push('candidate applications cannot be public');
  if (list(record.related_products).length > 0 && record.application_relation !== 'verified') errors.push('related_products require a verified application relationship');

  for (const metric of objectList(record.metrics)) {
    if (!metric.name || metric.value == null) errors.push('metric requires name and value');
  }
  for (const relationship of objectList(record.technical_relationships)) {
    if (!relationship.statement) errors.push('technical_relationship requires statement');
  }
  for (const claim of objectList(record.source_claims)) {
    if (!claim.statement) errors.push('source_claim requires statement');
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
  VALID_KNOWLEDGE_CONTENT_TYPES,
  createKnowledgeObject,
  validateKnowledgeObject,
  canPublishKnowledgeObject
};
