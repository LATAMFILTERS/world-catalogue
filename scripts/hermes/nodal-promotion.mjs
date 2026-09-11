#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { parseCandidateNote, reviewTemplateForCandidate, evaluatePromotion, renderApprovedCanonicalNote } = require('../../lib/knowledge-governance/nodal-promotion-gate');

const vaultRoot = path.resolve('elimfilters-vault');
const candidateRoot = path.join(vaultRoot, '12-knowledge-candidates');
const reviewRoot = path.join(candidateRoot, '_reviews');
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

function reviewPath(id) { return path.join(reviewRoot, `${id}.review.json`); }
function writeJson(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8'); }
function safeSlug(value) { return String(value || 'unclassified').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'unclassified'; }
function canonicalPath(candidate) {
  if (candidate.domain === 'SHARED_ENGINEERING_KNOWLEDGE') return path.join(canonicalRoot, 'shared-engineering', `${candidate.knowledge_object_id}.md`);
  return path.join(canonicalRoot, 'ld-automotive', safeSlug(candidate.systems[0] || 'unclassified-system'), `${candidate.knowledge_object_id}.md`);
}

const notes = walk(candidateRoot).map((file) => ({ file, markdown: fs.readFileSync(file, 'utf8') })).map((entry) => ({ ...entry, candidate: parseCandidateNote(entry.markdown) })).filter((entry) => entry.candidate.knowledge_object_id);

if (initReviews) {
  let created = 0, existing = 0;
  fs.mkdirSync(reviewRoot, { recursive: true });
  for (const entry of notes) {
    const target = reviewPath(entry.candidate.knowledge_object_id);
    if (fs.existsSync(target)) { existing++; continue; }
    writeJson(target, reviewTemplateForCandidate(entry.candidate));
    created++;
  }
  console.log(`[HERMES Nodal promotion] review templates created=${created} existing=${existing}`);
}

const evaluations = notes.map((entry) => {
  const rp = reviewPath(entry.candidate.knowledge_object_id);
  let review = null;
  if (fs.existsSync(rp)) {
    try { review = JSON.parse(fs.readFileSync(rp, 'utf8')); } catch (error) { review = { parse_error: error.message }; }
  }
  const evaluation = review ? evaluatePromotion(entry.candidate, review) : { ready: false, blockers: ['review file missing'], counts: { metrics: entry.candidate.metrics.length, relationships: entry.candidate.relationships.length, procedures: entry.candidate.procedures.length } };
  return { ...entry, review, review_path: rp, evaluation };
});

const summary = {
  generated_at: new Date().toISOString(),
  candidate_notes: evaluations.length,
  ready_for_promotion: evaluations.filter((x) => x.evaluation.ready).length,
  blocked: evaluations.filter((x) => !x.evaluation.ready).length,
  metrics_total: evaluations.reduce((sum, x) => sum + x.evaluation.counts.metrics, 0),
  relationships_total: evaluations.reduce((sum, x) => sum + x.evaluation.counts.relationships, 0),
  procedures_total: evaluations.reduce((sum, x) => sum + x.evaluation.counts.procedures, 0),
  metrics_approved: evaluations.reduce((sum, x) => sum + ((x.review?.metric_reviews || []).filter((r) => r.decision === 'approved').length), 0),
  relationships_approved: evaluations.reduce((sum, x) => sum + ((x.review?.relationship_reviews || []).filter((r) => r.decision === 'approved').length), 0),
  procedures_approved: evaluations.reduce((sum, x) => sum + ((x.review?.procedure_reviews || []).filter((r) => r.decision === 'approved').length), 0),
  public_write: false,
  catalog_write: false,
  cross_reference_write: false
};

fs.mkdirSync(reportRoot, { recursive: true });
const reportPath = path.join(reportRoot, `promotion-audit-${summary.generated_at.replace(/[:.]/g, '-')}.json`);
writeJson(reportPath, { summary, candidates: evaluations.map((x) => ({ knowledge_object_id: x.candidate.knowledge_object_id, title: x.candidate.title, review_path: path.relative(process.cwd(), x.review_path).replaceAll('\\', '/'), ready: x.evaluation.ready, blockers: x.evaluation.blockers, counts: x.evaluation.counts })) });

console.log(`[HERMES Nodal promotion] candidates=${summary.candidate_notes} ready=${summary.ready_for_promotion} blocked=${summary.blocked}`);
console.log(`[HERMES Nodal promotion] metrics=${summary.metrics_approved}/${summary.metrics_total} relationships=${summary.relationships_approved}/${summary.relationships_total} procedures=${summary.procedures_approved}/${summary.procedures_total}`);
console.log(`[HERMES Nodal promotion] report=${path.relative(process.cwd(), reportPath).replaceAll('\\', '/')}`);

if (!apply) process.exit(0);
if (!live) {
  console.error('[HERMES Nodal promotion] --apply requires HERMES_CANONICAL_PROMOTION_LIVE=true. No canonical write performed.');
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
  review_file: path.relative(process.cwd(), selected.review_path).replaceAll('\\', '/'),
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
