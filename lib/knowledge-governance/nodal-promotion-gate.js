'use strict';

const crypto = require('crypto');
const { SYSTEMS } = require('./knowledge-domain-registry');
const { scanSourceSignatures } = require('./universal-public-knowledge-gateway');

const OFFICIAL_SYSTEMS = new Set([
  SYSTEMS.AIR_INTAKE,
  SYSTEMS.FUEL,
  SYSTEMS.LUBE,
  SYSTEMS.HYDRAULIC,
  SYSTEMS.COMPRESSED_AIR
]);

const REVIEW_DECISIONS = new Set(['approved', 'rejected', 'needs_evidence']);
const VALIDATION_METHODS = new Set([
  'cross_source_validation',
  'standard_reference',
  'internal_engineering_calculation',
  'controlled_test',
  'registry_validation',
  'engineering_review'
]);

function hashReviewItem(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 16).toUpperCase();
}

function parseSection(markdown, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(markdown || '').match(new RegExp(`## ${escaped}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`));
  if (!match) return [];
  return match[1].split(/\r?\n/).map((line) => line.trim()).filter((line) => /^(- |\d+\. )/.test(line) && !/None recorded|No neutral evidence/.test(line));
}

function parseCandidateNote(markdown = '') {
  const text = String(markdown || '');
  const frontmatter = {};
  const fm = text.match(/^---\s*\n([\s\S]*?)\n---/);
  if (fm) {
    for (const line of fm[1].split(/\r?\n/)) {
      const idx = line.indexOf(':');
      if (idx < 0) continue;
      frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^"|"$/g, '');
    }
  }
  const position = parseSection(text, 'Knowledge Position');
  const systemsLine = position.find((line) => line.startsWith('- Systems:')) || '';
  const technologiesLine = position.find((line) => line.startsWith('- Technologies:')) || '';
  const technologyRelationLine = position.find((line) => line.startsWith('- Technology relation:')) || '';
  const applicationRelationLine = position.find((line) => line.startsWith('- Application relation:')) || '';
  const values = (line) => line.split(':').slice(1).join(':').trim().split(';').map((v) => v.trim()).filter((v) => v && !/^(None assigned|Shared \/ none)$/i.test(v));
  return {
    knowledge_object_id: frontmatter.knowledge_object_id || null,
    title: frontmatter.title || null,
    domain: frontmatter.domain || null,
    status: frontmatter.status || null,
    publication_status: frontmatter.publication_status || null,
    public_use_allowed: frontmatter.public_use_allowed === 'true',
    systems: values(systemsLine),
    technologies: values(technologiesLine),
    technology_relation: values(technologyRelationLine)[0] || 'none',
    application_relation: values(applicationRelationLine)[0] || 'candidate',
    metrics: parseSection(text, 'Metrics — Awaiting Validation'),
    relationships: parseSection(text, 'Technical Relationships — Awaiting Validation'),
    procedures: parseSection(text, 'Procedures'),
    evidence_ids: parseSection(text, 'Evidence Trace').map((line) => line.replace(/^- /, '').trim()).filter((id) => /^EVID-[A-Z0-9]+$/.test(id)),
    source_leaks: scanSourceSignatures(text)
  };
}

function reviewTemplateForCandidate(candidate) {
  const metric_reviews = candidate.metrics.map((line) => ({ item_id: `METRIC-${hashReviewItem(line)}`, source_line: line, decision: 'needs_evidence', validation_method: null, supporting_evidence_ids: [], reviewer: null, reviewed_at: null, notes: null }));
  const relationship_reviews = candidate.relationships.map((line) => ({ item_id: `REL-${hashReviewItem(line)}`, source_line: line, decision: 'needs_evidence', validation_method: null, supporting_evidence_ids: [], reviewer: null, reviewed_at: null, notes: null }));
  const procedure_reviews = candidate.procedures.map((line) => ({ item_id: `PROC-${hashReviewItem(line)}`, source_line: line, decision: 'needs_evidence', validation_method: null, reviewer: null, reviewed_at: null, notes: null }));
  return {
    schema_version: '1.0.0',
    knowledge_object_id: candidate.knowledge_object_id,
    review_status: 'pending',
    reviewer: null,
    reviewed_at: null,
    scope_review: {
      official_system_registry_verified: false,
      technical_scope_verified: false,
      source_neutrality_verified: false,
      no_proprietary_external_claims_verified: false,
      public_language_reviewed: false,
      technology_relation_resolution: candidate.technologies.length ? 'pending' : 'not_applicable',
      application_relation_resolution: 'pending'
    },
    metric_reviews,
    relationship_reviews,
    procedure_reviews,
    final_notes: null
  };
}

function validateReviewItem(item, kind) {
  const errors = [];
  if (!item || !REVIEW_DECISIONS.has(item.decision)) return [`${kind} review decision is invalid`];
  if (item.decision !== 'approved') return [`${kind} is not approved: ${item.item_id || 'unknown'}`];
  if (!VALIDATION_METHODS.has(item.validation_method)) errors.push(`${kind} requires an approved validation_method: ${item.item_id || 'unknown'}`);
  if (!item.reviewer) errors.push(`${kind} requires reviewer: ${item.item_id || 'unknown'}`);
  if (!item.reviewed_at || Number.isNaN(Date.parse(item.reviewed_at))) errors.push(`${kind} requires reviewed_at: ${item.item_id || 'unknown'}`);
  if ((kind === 'metric' || kind === 'relationship') && !Array.isArray(item.supporting_evidence_ids)) errors.push(`${kind} requires supporting_evidence_ids: ${item.item_id || 'unknown'}`);
  if (kind === 'metric' && item.validation_method === 'cross_source_validation' && item.supporting_evidence_ids.length < 2) errors.push(`cross-source metric validation requires at least two evidence IDs: ${item.item_id || 'unknown'}`);
  return errors;
}

function evaluatePromotion(candidate, review = {}) {
  const blockers = [];
  if (!candidate.knowledge_object_id || candidate.knowledge_object_id !== review.knowledge_object_id) blockers.push('review knowledge_object_id does not match candidate');
  if (candidate.status !== 'candidate' || candidate.publication_status !== 'awaiting_validation' || candidate.public_use_allowed) blockers.push('note is not in candidate/awaiting_validation/non-public state');
  if (candidate.source_leaks.length) blockers.push(...candidate.source_leaks.map((x) => `source leakage: ${x}`));
  if (candidate.domain !== 'SHARED_ENGINEERING_KNOWLEDGE') {
    if (!candidate.systems.length) blockers.push('non-shared candidate requires a system');
    for (const system of candidate.systems) if (!OFFICIAL_SYSTEMS.has(system)) blockers.push(`system is not in official five-system registry: ${system}`);
  }
  if (!candidate.evidence_ids.length) blockers.push('at least one neutral evidence ID is required');
  if (review.review_status !== 'approved') blockers.push('review_status must be approved');
  if (!review.reviewer) blockers.push('final reviewer is required');
  if (!review.reviewed_at || Number.isNaN(Date.parse(review.reviewed_at))) blockers.push('final reviewed_at is required');
  const scope = review.scope_review || {};
  for (const flag of ['official_system_registry_verified','technical_scope_verified','source_neutrality_verified','no_proprietary_external_claims_verified','public_language_reviewed']) {
    if (scope[flag] !== true) blockers.push(`scope review flag must be true: ${flag}`);
  }
  if (candidate.technologies.length && scope.technology_relation_resolution !== 'confirmed') blockers.push('technology relationship must be explicitly confirmed before canonical approval');
  if (candidate.application_relation === 'candidate' && !['verified','not_applicable','rejected'].includes(scope.application_relation_resolution)) blockers.push('candidate application relationship must be resolved before canonical approval');
  if ((review.metric_reviews || []).length !== candidate.metrics.length) blockers.push('metric review count does not match candidate metrics');
  if ((review.relationship_reviews || []).length !== candidate.relationships.length) blockers.push('relationship review count does not match candidate relationships');
  if ((review.procedure_reviews || []).length !== candidate.procedures.length) blockers.push('procedure review count does not match candidate procedures');
  for (const item of review.metric_reviews || []) blockers.push(...validateReviewItem(item, 'metric'));
  for (const item of review.relationship_reviews || []) blockers.push(...validateReviewItem(item, 'relationship'));
  for (const item of review.procedure_reviews || []) blockers.push(...validateReviewItem(item, 'procedure'));
  return { ready: blockers.length === 0, blockers: [...new Set(blockers)], counts: { metrics: candidate.metrics.length, relationships: candidate.relationships.length, procedures: candidate.procedures.length } };
}

function renderApprovedCanonicalNote(markdown, review) {
  const candidate = parseCandidateNote(markdown);
  const evaluation = evaluatePromotion(candidate, review);
  if (!evaluation.ready) {
    const error = new Error(`Canonical promotion blocked: ${evaluation.blockers.join('; ')}`);
    error.code = 'CANONICAL_PROMOTION_BLOCKED';
    error.evaluation = evaluation;
    throw error;
  }
  let text = String(markdown);
  text = text.replace('type: structured_knowledge_candidate', 'type: canonical_knowledge');
  text = text.replace('status: candidate', 'status: approved');
  text = text.replace('publication_status: awaiting_validation', 'publication_status: approved');
  text = text.replace('public_use_allowed: false', 'public_use_allowed: true');
  text = text.replace('nodal_review_required: true', 'nodal_review_required: false');
  text = text.replace(/> \*\*NODAL CENTER — REVIEW CANDIDATE\.\*\*[\s\S]*?authority\./, '> **ELIMFILTERS CANONICAL KNOWLEDGE.** Approved through Nodal Center promotion governance. Public use is permitted subject to the universal public knowledge gateway and Knowledge Center publication controls.');
  text += `\n## Canonical Approval\n\n- Reviewer: ${review.reviewer}\n- Reviewed at: ${review.reviewed_at}\n- Metrics approved: ${evaluation.counts.metrics}\n- Technical relationships approved: ${evaluation.counts.relationships}\n- Procedures approved: ${evaluation.counts.procedures}\n- Promotion gate: PASS\n`;
  return text;
}

module.exports = { OFFICIAL_SYSTEMS, REVIEW_DECISIONS, VALIDATION_METHODS, hashReviewItem, parseCandidateNote, reviewTemplateForCandidate, evaluatePromotion, renderApprovedCanonicalNote };
