#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const ALLOWED_CANDIDATE_TYPES = new Set([
  'equipment_update','oem_update','competitor_product_update','competitor_technology_update',
  'filter_media_development','supplier_development','standard_update','patent_update',
  'technical_bulletin','application_update','oem_reference_update','coverage_gap'
]);
export const ALLOWED_WORKFLOW = new Set(['CAPTURED','NORMALIZED','PENDING_REVIEW','NEEDS_RESEARCH','APPROVED','REJECTED','READY_TO_SYNC','SYNCED','SYNC_FAILED','SUPERSEDED']);
export const ALLOWED_EVIDENCE = new Set(['PRIMARY','SECONDARY_VERIFIED','SECONDARY_UNVERIFIED']);
export const ALLOWED_CLAIMS = new Set(['CONFIRMED_FACT','SOURCE_REPORTED','HERMES_INFERENCE','INTERNAL_RECOMMENDATION']);
export const ALLOWED_SYNC = new Set(['NOT_READY','READY','SYNCED','FAILED']);
export const ALLOWED_TARGETS = /^(12-oems|13-equipment|14-intelligence|15-filter-media|16-suppliers|17-technology-watch|01-technologies|02-industries|03-systems|04-standards|05-contamination|06-components|07-problems|08-product-families|09-products|10-case-studies|11-articles)\/?$/;

export function stableHash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

export function isDateTime(value) {
  return typeof value === 'string' && value.length > 0 && !Number.isNaN(Date.parse(value));
}

export function validateCandidate(c) {
  const errors = [];
  const required = ['entity_type','entity_code','workflow_status','candidate_type','source_type','source_url','source_publisher','captured_at','confidence','evidence_level','claim_scope','affected_entities','proposed_action','proposed_target_folder','deduplication_key','approval_required','sync_status','source_hash'];
  for (const key of required) if (!(key in c)) errors.push(`missing required field: ${key}`);
  if (c.entity_type !== 'intelligence_candidate') errors.push('entity_type must be intelligence_candidate');
  if (!/^HERMES_[A-Z0-9_]+$/.test(c.entity_code || '')) errors.push('entity_code format invalid');
  if (!ALLOWED_WORKFLOW.has(c.workflow_status)) errors.push('workflow_status invalid');
  if (!ALLOWED_CANDIDATE_TYPES.has(c.candidate_type)) errors.push('candidate_type invalid');
  try { new URL(c.source_url); } catch { errors.push('source_url must be an absolute URL'); }
  if (typeof c.source_publisher !== 'string' || c.source_publisher.trim().length < 2) errors.push('source_publisher too short');
  if (!isDateTime(c.captured_at)) errors.push('captured_at must be ISO-compatible date-time');
  if (c.published_at != null && !isDateTime(c.published_at)) errors.push('published_at invalid');
  if (typeof c.confidence !== 'number' || c.confidence < 0 || c.confidence > 1) errors.push('confidence must be between 0 and 1');
  if (!ALLOWED_EVIDENCE.has(c.evidence_level)) errors.push('evidence_level invalid');
  if (!ALLOWED_CLAIMS.has(c.claim_scope)) errors.push('claim_scope invalid');
  if (!Array.isArray(c.affected_entities) || c.affected_entities.length === 0) errors.push('affected_entities must contain at least one item');
  if (typeof c.proposed_action !== 'string' || c.proposed_action.trim().length < 5) errors.push('proposed_action too short');
  if (!ALLOWED_TARGETS.test(c.proposed_target_folder || '')) errors.push('proposed_target_folder invalid');
  if (typeof c.deduplication_key !== 'string' || c.deduplication_key.length < 8) errors.push('deduplication_key too short');
  if (c.approval_required !== true) errors.push('approval_required must remain true');
  if (!ALLOWED_SYNC.has(c.sync_status)) errors.push('sync_status invalid');
  if (!/^[a-f0-9]{64}$/.test(c.source_hash || '')) errors.push('source_hash must be SHA-256');
  if (['APPROVED','READY_TO_SYNC','SYNCED'].includes(c.workflow_status)) {
    if (c.approved_by !== 'Victor Abreu') errors.push('approved_by must be Victor Abreu');
    if (!isDateTime(c.approved_at)) errors.push('approved_at required for approved states');
  }
  if (c.workflow_status === 'REJECTED' && (!c.rejection_reason || c.rejection_reason.length < 3)) errors.push('rejection_reason required');
  if (c.evidence_level === 'SECONDARY_UNVERIFIED' && !['NEEDS_RESEARCH','CAPTURED','NORMALIZED'].includes(c.workflow_status)) errors.push('unverified secondary evidence cannot enter review or approval');
  if (['SOURCE_REPORTED','HERMES_INFERENCE'].includes(c.claim_scope) === false && c.candidate_type.startsWith('competitor_') && c.evidence_level !== 'PRIMARY') errors.push('competitor statements without primary evidence must remain SOURCE_REPORTED or HERMES_INFERENCE');
  return errors;
}

export function loadCandidates(inputPath) {
  const absolute = path.resolve(inputPath);
  const files = fs.statSync(absolute).isDirectory()
    ? fs.readdirSync(absolute).filter((f) => f.endsWith('.json')).map((f) => path.join(absolute, f))
    : [absolute];
  return files.sort().map((file) => ({ file, candidate: JSON.parse(fs.readFileSync(file, 'utf8')) }));
}

export function analyzeCandidates(records) {
  const seen = new Map();
  return records.map(({file, candidate}) => {
    const errors = validateCandidate(candidate);
    const duplicateOf = seen.get(candidate.deduplication_key) || null;
    if (!duplicateOf && candidate.deduplication_key) seen.set(candidate.deduplication_key, candidate.entity_code);
    if (duplicateOf) errors.push(`duplicate deduplication_key; first seen in ${duplicateOf}`);
    return { file, candidate, valid: errors.length === 0, duplicateOf, errors };
  });
}
