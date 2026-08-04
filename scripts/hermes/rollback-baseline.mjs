#!/usr/bin/env node
// HERMES — CLI for restoring state/source-baseline.json on the hermes-state
// branch from a specific, existing backup already on that branch
// (state/backups/<exact-filename>).
//
// Requires HERMES_BASELINE_APPROVAL_TOKEN=VICTOR_ABREU_APPROVED (exact
// match) — the same approval mechanism as promotion, and in GitHub Actions
// sourced only from the HERMES_BASELINE_APPROVAL_TOKEN repository secret,
// never a workflow input. The token value is never printed.
//
// The backup name is taken literally and must match the exact filename
// pattern used by promote-baseline.mjs/rollback-baseline.mjs
// (source-baseline.<ISO-timestamp>.json) — anything else, including any
// path separator or "..", is rejected before it ever reaches git.
//
// The only durable writes this script performs are on the hermes-state
// branch (state/source-baseline.json, state/backups/*,
// state/promotion-audit.json) — never main, never elimfilters-vault/.
import process from 'node:process';
import { rollbackBaselineInState, isRollbackAuthorized, isValidBackupName, APPROVAL_TOKEN_VALUE } from './promote-baseline-core.mjs';

const backupArg = process.argv[2];
const approvalToken = process.env.HERMES_BASELINE_APPROVAL_TOKEN || '';
const remote = process.env.HERMES_STATE_REMOTE || 'origin';

if (!backupArg) {
  console.error('Usage: HERMES_BASELINE_APPROVAL_TOKEN=<token> node scripts/hermes/rollback-baseline.mjs <backup-filename-on-hermes-state:state/backups/>');
  process.exit(2);
}

if (!isRollbackAuthorized({ approvalToken })) {
  console.error('[HERMES baseline rollback] BASELINE PROMOTION NOT AUTHORIZED — HERMES_BASELINE_APPROVAL_TOKEN missing or incorrect (its value is never printed)');
  console.error(`[HERMES baseline rollback] approval_token_present=${Boolean(approvalToken)} approval_token_matched=${approvalToken === APPROVAL_TOKEN_VALUE}`);
  process.exit(1);
}

if (!isValidBackupName(backupArg)) {
  console.error(`[HERMES baseline rollback] FAILED: '${backupArg}' is not a valid backup filename (expected source-baseline.<ISO-timestamp>.json, no path separators)`);
  process.exit(1);
}

const result = rollbackBaselineInState({ remote, backupName: backupArg });

if (result.status !== 'ROLLED_BACK') {
  console.error(`[HERMES baseline rollback] FAILED: ${result.reason}`);
  process.exit(1);
}

console.log(`[HERMES baseline rollback] ROLLED_BACK from state/backups/${backupArg}`);
console.log(`[HERMES baseline rollback] baseline_sha256=${result.baseline_sha256}`);
console.log(`[HERMES baseline rollback] state_branch=${result.state_branch} commit=${result.state_branch_commit} remote_verified=${result.remote_verified}`);
console.log('[HERMES baseline rollback] database_write=false pgvector_write=false unified_data_write=false vault_write=false');
