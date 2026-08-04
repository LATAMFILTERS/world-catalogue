#!/usr/bin/env node
// HERMES — CLI for restoring hermes/baselines/source-baseline.json from a
// specific, previously-created backup under hermes/baselines/backups/.
//
// Requires HERMES_BASELINE_APPROVAL_TOKEN=VICTOR_ABREU_APPROVED (exact
// match) — the same approval mechanism as promotion. The token value is
// never printed. The only file this script can write is
// hermes/baselines/source-baseline.json.
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { rollbackBaseline, APPROVAL_TOKEN_VALUE } from './promote-baseline-core.mjs';

const backupArg = process.argv[2];
const approvalToken = process.env.HERMES_BASELINE_APPROVAL_TOKEN || '';

const backupDir = path.resolve('hermes/baselines/backups');
const auditDir = path.resolve('elimfilters-vault/94-sync-log');

if (!backupArg) {
  console.error('Usage: HERMES_BASELINE_APPROVAL_TOKEN=<token> node scripts/hermes/rollback-baseline.mjs <backup-filename-under-hermes/baselines/backups/>');
  process.exit(2);
}

function writeAudit(record) {
  fs.mkdirSync(auditDir, { recursive: true });
  const auditPath = path.join(auditDir, `baseline-rollback-${Date.now()}.rollback.json`);
  fs.writeFileSync(auditPath, JSON.stringify(record, null, 2) + '\n', 'utf8');
  return auditPath;
}

if (approvalToken !== APPROVAL_TOKEN_VALUE) {
  console.error('[HERMES baseline rollback] BASELINE PROMOTION NOT AUTHORIZED — HERMES_BASELINE_APPROVAL_TOKEN missing or incorrect (its value is never printed)');
  const auditPath = writeAudit({
    status: 'PROMOTION_NOT_AUTHORIZED',
    timestamp: new Date().toISOString(),
    requested_backup: backupArg,
    approval_token_present: Boolean(approvalToken),
    approval_token_matched: false,
    database_write: false, pgvector_write: false, unified_data_write: false
  });
  console.error(`[HERMES baseline rollback] audit ${auditPath}`);
  process.exit(1);
}

// The backup filename is taken literally (basename only) and confined to
// hermes/baselines/backups/ — no path traversal outside that directory.
const backupPath = path.resolve(backupDir, path.basename(backupArg));
if (!backupPath.startsWith(backupDir + path.sep)) {
  throw new Error('backup path escapes hermes/baselines/backups');
}

const realPath = path.resolve('hermes/baselines/source-baseline.json');
const result = rollbackBaseline({ backupPath, realPath });

const auditRecord = {
  status: result.status === 'ROLLED_BACK' ? 'ROLLED_BACK' : 'ROLLBACK_FAILED',
  timestamp: result.rolled_back_at,
  restored_from: result.restored_from ? path.relative(process.cwd(), result.restored_from).replaceAll('\\', '/') : null,
  baseline_sha256: result.baseline_sha256 ?? null,
  reason: result.reason ?? null,
  database_write: false, pgvector_write: false, unified_data_write: false
};
const auditPath = writeAudit(auditRecord);

if (result.status !== 'ROLLED_BACK') {
  console.error(`[HERMES baseline rollback] FAILED: ${result.reason}`);
  console.error(`[HERMES baseline rollback] audit ${auditPath}`);
  process.exit(1);
}

console.log(`[HERMES baseline rollback] ROLLED_BACK from ${path.relative(process.cwd(), backupPath)}`);
console.log(`[HERMES baseline rollback] baseline_sha256=${result.baseline_sha256}`);
console.log(`[HERMES baseline rollback] audit ${auditPath}`);
