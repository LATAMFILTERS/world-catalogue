#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { isResearchResolved } from './hermes-core.mjs';
import { applyHeadlineDecision, queueRevision } from './headline-research.mjs';

const require = createRequire(import.meta.url);
const { fetchDecisions, markApplied } = require('../../lib/hermes-review-store');

function atomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(tmp, file);
}

function targetFor(decision) {
  if (decision === 'approve') return 'elimfilters-vault/92-approved-updates';
  if (decision === 'reject') return 'elimfilters-vault/93-rejected';
  return 'elimfilters-vault/91-pending-review';
}

export function applyDecision(row) {
  const candidate = { ...(row.candidate || {}) };
  const decision = String(row.decision || '').toLowerCase();
  const reason = String(row.decision_reason || '').trim() || null;
  const now = new Date().toISOString();

  if (!candidate.entity_code || candidate.entity_code !== row.candidate_code) {
    throw new Error(`review snapshot mismatch for ${row.candidate_code}`);
  }
  if (candidate.approval_required !== true) throw new Error(`${row.candidate_code} does not preserve approval_required=true`);

  if (decision === 'approve') {
    if (!isResearchResolved(candidate)) throw new Error(`${row.candidate_code} is not VERIFIED and cannot be accepted`);
    candidate.workflow_status = 'APPROVED';
    candidate.approved_by = 'Victor Abreu';
    candidate.approved_at = now;
    candidate.sync_status = 'NOT_READY';
    delete candidate.rejection_reason;
    delete candidate.research_instruction;
  } else if (decision === 'reject') {
    if (!reason) throw new Error(`ELIMINAR requires a reason for ${row.candidate_code}`);
    candidate.workflow_status = 'REJECTED';
    candidate.rejection_reason = reason;
    delete candidate.research_instruction;
  } else if (decision === 'research') {
    if (!reason) throw new Error(`REVISAR requires an instruction for ${row.candidate_code}`);
    candidate.workflow_status = 'NEEDS_RESEARCH';
    candidate.research_instruction = reason;
    if (candidate.research_resolution) {
      candidate.research_resolution = {
        ...candidate.research_resolution,
        status: 'UNRESOLVED',
        reason: 'HUMAN_REVIEW_REQUESTED',
        human_instruction: reason,
        resolved_at: null,
      };
    }
    delete candidate.rejection_reason;
  } else {
    throw new Error(`unsupported decision ${decision}`);
  }

  const target = path.resolve(targetFor(decision), `${candidate.entity_code}.json`);
  atomic(target, candidate);

  const liveCandidate = path.resolve('hermes/real-candidates', `${candidate.entity_code}.json`);
  if (decision === 'research' || fs.existsSync(liveCandidate)) atomic(liveCandidate, candidate);

  const audit = {
    candidate_entity_code: candidate.entity_code,
    decision,
    actor: row.decided_by || 'Victor Abreu',
    decided_at: row.decided_at || now,
    applied_at: now,
    reason,
    source: 'POSTGRES_REVIEW_QUEUE',
    database_write: false,
    canonical_write: false,
    output_path: path.relative(process.cwd(), target).replaceAll('\\', '/'),
  };
  atomic(path.resolve('elimfilters-vault/94-sync-log', `${candidate.entity_code}-${Date.now()}.decision.json`), audit);
  return { candidate: candidate.entity_code, decision, workflow_status: candidate.workflow_status, approved: decision === 'approve' ? candidate : undefined };
}

const { needsOemResearch, queueApprovedResearch } = require('./approved-intelligence-to-catalogue.js');

// Thursday SKU authorizations: recorded only. Creating the SKU stays in the governed catalogue process.
export function applySkuDecision(row, { stateRoot = process.env.HERMES_STATE_ROOT || 'hermes/state' } = {}) {
  const proposal = row.candidate || {};
  const decision = String(row.decision || '').toLowerCase();
  if (proposal.entity_code !== row.candidate_code || proposal.approval_required !== true) throw new Error(`review snapshot mismatch for ${row.candidate_code}`);
  if (decision === 'approve' && proposal.state !== 'READY_FOR_AUTHORIZATION') throw new Error(`${row.candidate_code} is ${proposal.state}, not authorizable`);
  if (!['approve', 'reject'].includes(decision)) throw new Error(`unsupported SKU decision ${decision}`);
  const record = { ...proposal, decision: decision === 'approve' ? 'AUTHORIZED' : 'REJECTED', decided_by: row.decided_by || 'Victor Abreu',
    decided_at: row.decided_at || new Date().toISOString(), reason: String(row.decision_reason || '').trim() || null, catalogue_write: false };
  atomic(path.resolve(stateRoot, 'sku-decisions', `${row.candidate_code}.json`), record);
  return { candidate: row.candidate_code, decision, sku: proposal.proposed_sku, outcome: 'APPLIED' };
}

// ACEPTAR on an OEM/equipment finding also opens complete OEM research (option B).
// If that request cannot be delivered, the decision stays unapplied and is retried next cycle;
// re-applying is idempotent (same files, deduplicated research key).
export async function processDecisions({ fetch = fetchDecisions, mark = markApplied, research = queueApprovedResearch } = {}) {
  const results = [];
  for (const row of await fetch()) {
    try {
      if (String(row.candidate_code).startsWith('HERMES_SKU_')) { const done = applySkuDecision(row); await mark(row.candidate_code); results.push(done); continue; }
      if (String(row.candidate_code).startsWith('HERMES_HEADLINE_')) { const done = applyHeadlineDecision(row); await mark(row.candidate_code); results.push(done); continue; }
      const result = applyDecision(row);
      // REVISAR on a digest card: Claude re-reads the source following Victor's instruction (next email).
      if (result.decision === 'research' && queueRevision(row)) result.revision = 'QUEUED';
      if (result.decision === 'approve' && needsOemResearch(result.approved)) {
        const out = await research(result.approved);
        result.research = out.status;
        if (!['accepted', 'duplicate'].includes(out.status)) {
          results.push({ candidate: result.candidate, decision: result.decision, outcome: 'RESEARCH_RETRY', research: out.status, error: out.error_code || null });
          continue;
        }
      }
      await mark(row.candidate_code);
      delete result.approved;
      results.push({ ...result, outcome: 'APPLIED' });
    } catch (error) {
      results.push({ candidate: row.candidate_code, decision: row.decision, outcome: 'FAILED', error: error.message });
    }
  }
  return results;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const results = await processDecisions();
  console.log(JSON.stringify({ outcome: 'OK', processed: results.length, results }, null, 2));
  if (results.some((r) => r.outcome !== 'APPLIED')) process.exitCode = 1;
}
