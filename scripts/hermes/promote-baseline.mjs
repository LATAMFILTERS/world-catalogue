#!/usr/bin/env node
// HERMES — CLI for promoting hermes/baselines/source-baseline.preview.json
// (produced by a fresh HERMES_BASELINE_MODE=true collection run) onto the
// durable hermes-state branch's state/source-baseline.json.
//
// Requires ALL of, together:
//   HERMES_BASELINE_MODE=true
//   HERMES_BASELINE_PROMOTE=true
//   HERMES_COLLECTION_DRY_RUN=true
//   HERMES_BASELINE_APPROVAL_TOKEN=VICTOR_ABREU_APPROVED (exact match) —
//     in GitHub Actions this env var is sourced ONLY from the
//     HERMES_BASELINE_APPROVAL_TOKEN repository secret, never from a
//     workflow_dispatch input (inputs are visible in run logs/UI; secrets
//     are not).
//
// The approval token value is never printed, in this file or anywhere it
// calls into. The only durable writes this script performs are
// state/source-baseline.json, state/backups/*, and state/promotion-audit.json
// on the hermes-state branch — never a candidate, never a canonical note,
// never PostgreSQL/pgvector/legacy catalogue layer, and never anything under
// elimfilters-vault/. It also writes one local, gitignored, ephemeral file
// (hermes/baselines/promotion-result.local.json) purely so the "Generate
// weekly review report" step later in the same job can render what
// happened — that file is never committed anywhere and does not survive
// past this runner.
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { isAuthorized, promoteBaselineToState, APPROVAL_TOKEN_VALUE } from './promote-baseline-core.mjs';
import { loadRegistry } from './source-registry-core.mjs';
import { DEFAULT_MIN_CONTENT_LENGTH } from './source-baseline-core.mjs';
import { isDryRunActive } from './hermes-core.mjs';

const baselineMode = String(process.env.HERMES_BASELINE_MODE || 'false').toLowerCase() === 'true';
const promote = String(process.env.HERMES_BASELINE_PROMOTE || 'false').toLowerCase() === 'true';
const dryRun = isDryRunActive();
const approvalToken = process.env.HERMES_BASELINE_APPROVAL_TOKEN || '';
const minContentLength = Number(process.env.HERMES_COLLECTION_MIN_CONTENT_LENGTH || DEFAULT_MIN_CONTENT_LENGTH);
const remote = process.env.HERMES_STATE_REMOTE || 'origin';

const previewPath = path.resolve('hermes/baselines/source-baseline.preview.json');
// Local-only, gitignored handoff for the same job's report step. Never the
// source of truth — that is exclusively the hermes-state branch.
const localResultPath = path.resolve('hermes/baselines/promotion-result.local.json');

function writeLocalResult(record) {
  fs.mkdirSync(path.dirname(localResultPath), { recursive: true });
  fs.writeFileSync(localResultPath, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  return localResultPath;
}

if (!isAuthorized({ baselineMode, dryRun, promote, approvalToken })) {
  console.error('[HERMES promote] BASELINE PROMOTION NOT AUTHORIZED');
  console.error('[HERMES promote] requires HERMES_BASELINE_MODE=true, HERMES_BASELINE_PROMOTE=true, HERMES_COLLECTION_DRY_RUN=true, and a matching HERMES_BASELINE_APPROVAL_TOKEN (its value is never printed)');
  writeLocalResult({
    status: 'PROMOTION_NOT_AUTHORIZED',
    timestamp: new Date().toISOString(),
    baseline_mode: baselineMode,
    dry_run: dryRun,
    promote_requested: promote,
    approval_token_present: Boolean(approvalToken),
    // A boolean comparison result only — never the token value itself.
    approval_token_matched: approvalToken === APPROVAL_TOKEN_VALUE,
    sources_promoted: 0,
    state_branch_commit: null,
    database_write: false,
    pgvector_write: false,
    unified_data_write: false,
    vault_write: false
  });
  process.exit(1);
}

const registry = loadRegistry('hermes/config/source-organizations.json', 'hermes/config/source-endpoints.json');
const result = promoteBaselineToState({ remote, previewPath, registry, minContentLength });

const record = {
  status: result.status === 'PROMOTED' ? 'PROMOTED' : 'PROMOTION_FAILED',
  timestamp: result.promoted_at,
  sources_promoted: result.sources_promoted ?? 0,
  baseline_sha256: result.baseline_sha256 ?? null,
  backup_path: result.backup_path ?? null,
  state_branch: result.state_branch ?? null,
  state_branch_commit: result.state_branch_commit ?? null,
  remote_verified: result.remote_verified ?? false,
  reason: result.reason ?? null,
  errors: result.errors ?? [],
  candidates_written: 0,
  writes_outside_baseline: 0,
  database_write: false,
  pgvector_write: false,
  unified_data_write: false,
  vault_write: false
};
writeLocalResult(record);

if (result.status !== 'PROMOTED') {
  console.error(`[HERMES promote] BASELINE PROMOTION FAILED: ${result.reason}`);
  for (const error of result.errors || []) console.error(`  - ${error}`);
  process.exit(1);
}

console.log('[HERMES promote] BASELINE PROMOTED');
console.log(`[HERMES promote] sources_promoted=${result.sources_promoted} baseline_sha256=${result.baseline_sha256}`);
console.log(`[HERMES promote] state_branch=${result.state_branch} commit=${result.state_branch_commit} remote_verified=${result.remote_verified}`);
if (result.backup_path) console.log(`[HERMES promote] backup created: ${result.backup_path} (on ${result.state_branch})`);
console.log('[HERMES promote] database_write=false pgvector_write=false unified_data_write=false vault_write=false writes_outside_baseline=0');
