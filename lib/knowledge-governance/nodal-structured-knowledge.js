'use strict';

const path = require('path');
const { validateKnowledgeObject } = require('./knowledge-object-contract');
const { scanSourceSignatures } = require('./universal-public-knowledge-gateway');

function slug(value) {
  return String(value || 'unclassified')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unclassified';
}

function yamlString(value) {
  return JSON.stringify(String(value ?? ''));
}

function listLines(values = [], prefix = '- ') {
  if (!Array.isArray(values) || values.length === 0) return ['- None recorded'];
  return values.map((value) => `${prefix}${typeof value === 'string' ? value : JSON.stringify(value)}`);
}

function safeEvidenceIds(object = {}) {
  return [...new Set((object.source_evidence || [])
    .map((item) => item?.evidence_id)
    .filter((id) => /^EVID-[A-Z0-9]+$/.test(String(id))))];
}

function sharedObjectId(concept) {
  return `SHARED-${String(concept).toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`;
}

function targetPathForKnowledgeObject(object = {}) {
  if (object.domain === 'SHARED_ENGINEERING_KNOWLEDGE') {
    return path.posix.join('12-knowledge-candidates', 'shared-engineering', `${object.knowledge_object_id}.md`);
  }
  const system = object.systems?.[0] || 'unclassified-system';
  return path.posix.join('12-knowledge-candidates', 'ld-automotive', slug(system), `${object.knowledge_object_id}.md`);
}

function validateNodalCandidate(object = {}) {
  const errors = [];
  const base = validateKnowledgeObject(object);
  if (!base.valid) errors.push(...base.errors);
  if (object.public_use_allowed !== false) errors.push('Nodal candidate must have public_use_allowed=false');
  if (object.publication_status !== 'awaiting_validation') errors.push('Nodal candidate must remain awaiting_validation');
  if (!object.knowledge_object_id) errors.push('knowledge_object_id is required');
  if (!object.title) errors.push('title is required');

  const signatureLeaks = scanSourceSignatures(object);
  if (signatureLeaks.length) errors.push(...signatureLeaks.map((x) => `source signature leakage: ${x}`));

  for (const item of object.source_evidence || []) {
    const keys = Object.keys(item || {});
    for (const forbidden of ['source_url', 'source_publisher', 'source_id', 'raw_source_text', 'source_text']) {
      if (keys.includes(forbidden)) errors.push(`private provenance key not allowed in Nodal candidate: ${forbidden}`);
    }
  }
  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}

function section(title, lines) {
  return [`## ${title}`, '', ...lines, ''];
}

function renderMetrics(metrics = []) {
  if (!metrics.length) return ['- None recorded'];
  return metrics.map((m) => {
    const value = [m.value, m.unit].filter((x) => x !== undefined && x !== null && x !== '').join(' ');
    const evidence = m.evidence_id ? ` | evidence: ${m.evidence_id}` : '';
    return `- ${m.name || 'Metric'}: ${value || 'value pending'}${evidence} | status: ${m.validation_status || 'awaiting_validation'}`;
  });
}

function renderRelationships(relationships = []) {
  if (!relationships.length) return ['- None recorded'];
  return relationships.map((r) => `- ${r.statement || String(r)} | status: ${r.validation_status || 'awaiting_validation'}`);
}

function renderProcedures(procedures = []) {
  if (!procedures.length) return ['- None recorded'];
  return [...procedures]
    .sort((a, b) => Number(a.step || 0) - Number(b.step || 0))
    .map((p) => `${p.step || '-'}. ${p.instruction || ''} | status: ${p.validation_status || 'awaiting_validation'}`);
}

function renderNodalCandidate(object = {}) {
  const validation = validateNodalCandidate(object);
  if (!validation.valid) {
    const error = new Error(`Nodal candidate blocked: ${validation.errors.join('; ')}`);
    error.code = 'NODAL_CANDIDATE_BLOCKED';
    error.validation = validation;
    throw error;
  }

  const evidenceIds = safeEvidenceIds(object);
  const sharedLinks = (object.shared_engineering_concepts || []).map((concept) => `[[${sharedObjectId(concept)}|${concept}]]`);
  const lines = [
    '---',
    'type: structured_knowledge_candidate',
    'status: candidate',
    `knowledge_object_id: ${yamlString(object.knowledge_object_id)}`,
    `title: ${yamlString(object.title)}`,
    `domain: ${yamlString(object.domain)}`,
    `knowledge_content_type: ${yamlString(object.knowledge_content_type || '')}`,
    `confidence: ${yamlString(object.confidence || 'low')}`,
    'publication_status: awaiting_validation',
    'public_use_allowed: false',
    'hermes_origin: true',
    'nodal_review_required: true',
    'catalog_write_allowed: false',
    'cross_reference_write_allowed: false',
    '---',
    '',
    `# ${object.title}`,
    '',
    '> **NODAL CENTER — REVIEW CANDIDATE.** Structured by HERMES and ELIMFILTERS knowledge governance. This note is not canonical, is not public, and cannot create product, application, SKU or cross-reference authority.',
    '',
    ...section('Knowledge Position', [
      `- Domain: ${object.domain}`,
      `- Industries: ${(object.industries || []).join('; ') || 'Shared / none'}`,
      `- Systems: ${(object.systems || []).join('; ') || 'Shared / none'}`,
      `- Technologies: ${(object.technologies || []).join('; ') || 'None assigned'}`,
      `- Technology relation: ${object.technology_relation || 'none'}`,
      `- Application relation: ${object.application_relation || 'candidate'}`,
    ]),
    ...section('Components', listLines(object.components)),
    ...section('Problems', listLines(object.problems)),
    ...section('Failure Modes', listLines(object.failure_modes)),
    ...section('Symptoms', listLines(object.symptoms)),
    ...section('Root Causes', listLines(object.root_causes)),
    ...section('Diagnostic Methods', listLines(object.diagnostic_methods)),
    ...section('Corrective Actions', listLines(object.corrective_actions)),
    ...section('Maintenance Procedures', listLines(object.maintenance_procedures)),
    ...section('Procedures', renderProcedures(object.procedures)),
    ...section('Metrics — Awaiting Validation', renderMetrics(object.metrics)),
    ...section('Technical Relationships — Awaiting Validation', renderRelationships(object.technical_relationships)),
    ...section('Operating Conditions', listLines(object.operating_conditions)),
    ...section('Standards', listLines(object.standards)),
    ...section('Shared Engineering', sharedLinks.length ? sharedLinks.map((x) => `- ${x}`) : ['- None linked']),
    ...section('Evidence Trace', evidenceIds.length ? evidenceIds.map((id) => `- ${id}`) : ['- No neutral evidence IDs recorded']),
    ...section('Governance', [
      '- HERMES may enrich this candidate with additional evidence.',
      '- Nodal Center review is required before canonical promotion.',
      '- External source identities remain in private provenance only.',
      '- PostgreSQL remains the only SKU authority.',
      '- No application or cross-reference relationship may be promoted automatically.',
      '- Knowledge Center consumption is permitted only after explicit canonical approval.',
    ])
  ];
  return lines.join('\n').replace(/\n{3,}/g, '\n\n') + '\n';
}

module.exports = {
  slug,
  sharedObjectId,
  targetPathForKnowledgeObject,
  validateNodalCandidate,
  renderNodalCandidate
};
