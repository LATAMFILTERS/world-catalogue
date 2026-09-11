#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { parseCandidateNote, reviewTemplateForCandidate, evaluatePromotion, renderApprovedCanonicalNote, hashReviewItem } = require('../../lib/knowledge-governance/nodal-promotion-gate');

const vaultRoot = path.resolve('elimfilters-vault');
const candidateRoot = path.join(vaultRoot, '12-knowledge-candidates');
const reviewRoot = path.join(candidateRoot, '_reviews');
const baselinePath = path.join(candidateRoot, '_promotion-baseline.json');
const ledgerPath = path.join(reviewRoot, 'TECHNICAL_VALIDATION_LEDGER.json');
const canonicalRoot = path.join(vaultRoot, '13-canonical-knowledge');
const reportRoot = path.resolve('hermes/nodal-promotion-reports');
const auditRoot = path.join(vaultRoot, '94-sync-log');

const args = process.argv.slice(2);
const initReviews = args.includes('--init-reviews');
const apply = args.includes('--apply');
const idIndex = args.indexOf('--id');
const requestedId = idIndex >= 0 ? args[idIndex + 1] : null;
const live = apply && String(process.env.HERMES_CANONICAL_PROMOTION_LIVE || 'false').toLowerCase() === 'true';

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '_reviews') walk(full, files);
    } else if (entry.name.endsWith('.md')) files.push(full);
  }
  return files;
}

function scopeReviewPath(id) { return path.join(reviewRoot, `${id}.scope-review.json`); }
function writeJson(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8'); }
function readJson(file, fallback = null) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } }
function safeSlug(value) { return String(value || 'unclassified').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'unclassified'; }
function canonicalPath(candidate) {
  if (candidate.domain === 'SHARED_ENGINEERING_KNOWLEDGE') return path.join(canonicalRoot, 'shared-engineering', `${candidate.knowledge_object_id}.md`);
  return path.join(canonicalRoot, 'ld-automotive', safeSlug(candidate.systems[0] || 'unclassified-system'), `${candidate.knowledge_object_id}.md`);
}

const notes = walk(candidateRoot)
  .map((file) => ({ file, markdown: fs.readFileSync(file, 'utf8') }))
  .map((entry) => ({ ...entry, candidate: parseCandidateNote(entry.markdown) }))
  .filter((entry) => entry.candidate.knowledge_object_id);

const baseline = readJson(baselinePath, {});

function buildLedger() {
  const metricMap = new Map();
  const relationshipMap = new Map();
  const procedureMap = new Map();
  const add = (map, prefix, line) => {
    const item_id = `${prefix}-${hashReviewItem(line)}`;
    if (!map.has(item_id)) map.set(item_id, { item_id, source_line: line, decision: 'needs_evidence', validation_method: null, supporting_evidence_ids: [], reviewer: null, reviewed_at: null, notes: null });
    return item_id;
  };
  const candidate_refs = {};
  for (const entry of notes) {
    candidate_refs[entry.candidate.knowledge_object_id] = {
      metric_item_ids: entry.candidate.metrics.map((line) => add(metricMap, 'METRIC', line)),
      relationship_item_ids: entry.candidate.relationships.map((line) => add(relationshipMap, 'REL', line)),
      procedure_item_ids: entry.candidate.procedures.map((line) => add(procedureMap, 'PROC', line))
    };
  }
  return {
    schema_version: '1.0.0',
    metric_occurrences_captured: Number(baseline.metric_occurrences_captured || 0),
    unique_source_metric_claims_expected: Number(baseline.unique_source_metric_claims || metricMap.size),
    unique_technical_metric_values_expected: Number(baseline.unique_technical_metric_values || 0),
    technical_relationships_expected: Number(baseline.technical_relationships || relationshipMap.size),
    procedures_expected: Number(baseline.procedures || procedureMap.size),
    metric_reviews: [...metricMap.values()],
    relationship_reviews: [...relationshipMap.values()],
    procedure_reviews: [...procedureMap.values()],
    candidate_refs
  };
}

function buildScopeReview(candidate, refs) {
  const base = reviewTemplateForCandidate(candidate);
  return {
    schema_version: '1.0.0',
    knowledge_object_id: candidate.knowledge_object_id,
    review_status: 'pending',
    reviewer: null,
    reviewed_at: null,
    scope_review: base.scope_review,
    metric_item_ids: refs.metric_item_ids,
    relationship_item_ids: refs.relationship_item_ids,
    procedure_item_ids: refs.procedure_item_ids,
    final_notes: null
  };
}

if (initReviews) {
  fs.mkdirSync(reviewRoot, { recursive: true });
  const proposedLedger = buildLedger();
  let ledger = readJson(ledgerPath, null);
  if (!ledger) {
    ledger = proposedLedger;
    writeJson(ledgerPath, ledger);
    console.log(`[HERMES Nodal promotion] technical ledger created metrics=${ledger.metric_reviews.length} relationships=${ledger.relationship_reviews.length} procedures=${ledger.procedure_reviews.length}`);
  } else {
    const currentIds = (items) => new Set((items || []).map((x) => x.item_id));
    const mergeNew = (existing, proposed) => {
      const ids = currentIds(existing);
      return [...existing, ...proposed.filter((x) => !ids.has(x.item_id))];
    };
    ledger.metric_reviews = mergeNew(ledger.metric_reviews || [], proposedLedger.metric_reviews);
    ledger.relationship_reviews = mergeNew(ledger.relationship_reviews || [], proposedLedger.relationship_reviews);
    ledger.procedure_reviews = mergeNew(ledger.procedure_reviews || [], proposedLedger.procedure_reviews);
    ledger.candidate_refs = proposedLedger.candidate_refs;
    ledger.metric_occurrences_captured = proposedLedger.metric_occurrences_captured;
    ledger.unique_source_metric_claims_expected = proposedLedger.unique_source_metric_claims_expected;
    ledger.unique_technical_metric_values_expected = proposedLedger.unique_technical_metric_values_expected;
    ledger.technical_relationships_expected = proposedLedger.technical_relationships_expected;
    ledger.procedures_expected = proposedLedger.procedures_expected;
    writeJson(ledgerPath, ledger);
  }

  let created = 0, existing = 0;
  for (const entry of notes) {
    const target = scopeReviewPath(entry.candidate.knowledge_object_id);
    if (fs.existsSync(target)) { existing++; continue; }
    writeJson(target, buildScopeReview(entry.candidate, ledger.candidate_refs[entry.candidate.knowledge_object_id]));
    created++;
  }
  console.log(`[HERMES Nodal promotion] scope review templates created=${created} existing=${existing}`);
}

const ledger = readJson(ledgerPath, null);
const metricById = new Map((ledger?.metric_reviews || []).map((x) => [x.item_id, x]));
const relationshipById = new Map((ledger?.relationship_reviews || []).map((x) => [x.item_id, x]));
const procedureById = new Map((ledger?.procedure_reviews || []).map((x) => [x.item_id, x]));

function materializeReview(candidate, scopeReview) {
  if (!ledger || !scopeReview) return null;
  const refs = ledger.candidate_refs?.[candidate.knowledge_object_id] || {};
  return {
    ...scopeReview,
    metric_reviews: (refs.metric_item_ids || []).map((id) => metricById.get(id)).filter(Boolean),
    relationship_reviews: (refs.relationship_item_ids || []).map((id) => relationshipById.get(id)).filter(Boolean),
    procedure_reviews: (refs.procedure_item_ids || []).map((id) => procedureById.get(id)).filter(Boolean)
  };
}

const evaluations = notes.map((entry) => {
  const rp = scopeReviewPath(entry.candidate.knowledge_object_id);
  const scopeReview = readJson(rp, null);
  const review = materializeReview(entry.candidate, scopeReview);
  const evaluation = review ? evaluatePromotion(entry.candidate, review) : { ready: false, blockers: [ledger ? 'scope review file missing' : 'technical validation ledger missing'], counts: { metrics: entry.candidate.metrics.length, relationships: entry.candidate.relationships.length, procedures: entry.candidate.procedures.length } };
  return { ...entry, review, scope_review_path: rp, evaluation };
});

const ledgerMetrics = ledger?.metric_reviews || [];
const ledgerRelationships = ledger?.relationship_reviews || [];
const ledgerProcedures = ledger?.procedure_reviews || [];
const summary = {
  generated_at: new Date().toISOString(),
  candidate_notes: evaluations.length,
  ready_for_promotion: evaluations.filter((x) => x.evaluation.ready).length,
  blocked: evaluations.filter((x) => !x.evaluation.ready).length,
  metric_occurrences_captured: Number(ledger?.metric_occurrences_captured || baseline.metric_occurrences_captured || 0),
  metric_review_items_total: ledgerMetrics.length,
  unique_technical_metric_values: Number(ledger?.unique_technical_metric_values_expected || baseline.unique_technical_metric_values || 0),
  relationships_total: ledgerRelationships.length,
  procedures_total: ledgerProcedures.length,
  metrics_approved: ledgerMetrics.filter((r) => r.decision === 'approved').length,
  relationships_approved: ledgerRelationships.filter((r) => r.decision === 'approved').length,
  procedures_approved: ledgerProcedures.filter((r) => r.decision === 'approved').length,
  baseline_consistent: Boolean(ledger) && Number(ledger.unique_source_metric_claims_expected) === ledgerMetrics.length && Number(ledger.technical_relationships_expected) === ledgerRelationships.length && Number(ledger.procedures_expected) === ledgerProcedures.length,
  public_write: false,
  catalog_write: false,
  cross_reference_write: false
};

fs.mkdirSync(reportRoot, { recursive: true });
const reportPath = path.join(reportRoot, `promotion-audit-${summary.generated_at.replace(/[:.]/g, '-')}.json`);
writeJson(reportPath, { summary, candidates: evaluations.map((x) => ({ knowledge_object_id: x.candidate.knowledge_object_id, title: x.candidate.title, scope_review_path: path.relative(process.cwd(), x.scope_review_path).replaceAll('\\', '/'), ready: x.evaluation.ready, blockers: x.evaluation.blockers, counts: x.evaluation.counts })) });

console.log(`[HERMES Nodal promotion] candidates=${summary.candidate_notes} ready=${summary.ready_for_promotion} blocked=${summary.blocked}`);
console.log(`[HERMES Nodal promotion] metric_occurrences=${summary.metric_occurrences_captured} unique_metric_claims=${summary.metrics_approved}/${summary.metric_review_items_total} unique_technical_values=${summary.unique_technical_metric_values}`);
console.log(`[HERMES Nodal promotion] relationships=${summary.relationships_approved}/${summary.relationships_total} procedures=${summary.procedures_approved}/${summary.procedures_total} baseline_consistent=${summary.baseline_consistent}`);
console.log(`[HERMES Nodal promotion] report=${path.relative(process.cwd(), reportPath).replaceAll('\\', '/')}`);

if (!apply) process.exit(0);
if (!live) {
  console.error('[HERMES Nodal promotion] --apply requires HERMES_CANONICAL_PROMOTION_LIVE=true. No canonical write performed.');
  process.exit(1);
}
if (!summary.baseline_consistent) {
  console.error('[HERMES Nodal promotion] baseline mismatch blocks all canonical promotion.');
  process.exit(1);
}
if (!requestedId) {
  console.error('[HERMES Nodal promotion] --apply requires --id <knowledge_object_id>; bulk promotion is intentionally disabled.');
  process.exit(1);
}
const selected = evaluations.find((x) => x.candidate.knowledge_object_id === requestedId);
if (!selected) {
  console.error(`[HERMES Nodal promotion] candidate not found: ${requestedId}`);
  process.exit(1);
}
if (!selected.evaluation.ready) {
  console.error(`[HERMES Nodal promotion] BLOCKED ${requestedId}: ${selected.evaluation.blockers.join('; ')}`);
  process.exit(1);
}

const target = canonicalPath(selected.candidate);
if (fs.existsSync(target)) {
  console.error(`[HERMES Nodal promotion] canonical target already exists; refusing overwrite: ${target}`);
  process.exit(1);
}
const approved = renderApprovedCanonicalNote(selected.markdown, selected.review);
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, approved, { encoding: 'utf8', flag: 'wx' });
fs.mkdirSync(auditRoot, { recursive: true });
const auditPath = path.join(auditRoot, `canonical-promotion-${requestedId}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
writeJson(auditPath, {
  knowledge_object_id: requestedId,
  promoted_at: new Date().toISOString(),
  reviewer: selected.review.reviewer,
  scope_review_file: path.relative(process.cwd(), selected.scope_review_path).replaceAll('\\', '/'),
  validation_ledger: path.relative(process.cwd(), ledgerPath).replaceAll('\\', '/'),
  canonical_path: path.relative(process.cwd(), target).replaceAll('\\', '/'),
  metrics_approved: selected.evaluation.counts.metrics,
  relationships_approved: selected.evaluation.counts.relationships,
  procedures_approved: selected.evaluation.counts.procedures,
  knowledge_center_auto_publish: false,
  database_write: false,
  pgvector_write: false,
  catalog_write: false,
  cross_reference_write: false
});
console.log(`[HERMES Nodal promotion] PROMOTED ${requestedId} -> ${path.relative(process.cwd(), target).replaceAll('\\', '/')}`);
console.log('[HERMES Nodal promotion] Knowledge Center auto-publication remains disabled.');
