#!/usr/bin/env node
// HERMES — CLI for promoting hermes/baselines/source-baseline.preview.json
// to hermes/baselines/source-baseline.json.
//
// Requires ALL of, together:
//   HERMES_BASELINE_MODE=true
//   HERMES_BASELINE_PROMOTE=true
//   HERMES_COLLECTION_DRY_RUN=true
//   HERMES_BASELINE_APPROVAL_TOKEN=VICTOR_ABREU_APPROVED (exact match)
//
// The approval token value is never printed, in this file or anywhere it
// calls into. The only file this script can write is
// hermes/baselines/source-baseline.json (plus a timestamped backup under
// hermes/baselines/backups/ when one already exists) and an audit record
// under elimfilters-vault/94-sync-log/ — never a candidate, never a
// canonical note, never PostgreSQL/pgvector/unified-data.
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { isAuthorized, promoteBaseline, APPROVAL_TOKEN_VALUE } from './promote-baseline-core.mjs';
import { loadRegistry } from './source-registry-core.mjs';
import { DEFAULT_MIN_CONTENT_LENGTH } from './source-baseline-core.mjs';
import { isDryRunActive } from './hermes-core.mjs';

const baselineMode = String(process.env.HERMES_BASELINE_MODE || 'false').toLowerCase() === 'true';
const promote = String(process.env.HERMES_BASELINE_PROMOTE || 'false').toLowerCase() === 'true';
const dryRun = isDryRunActive();
const approvalToken = process.env.HERMES_BASELINE_APPROVAL_TOKEN || '';
const minContentLength = Number(process.env.HERMES_COLLECTION_MIN_CONTENT_LENGTH || DEFAULT_MIN_CONTENT_LENGTH);

const previewPath = path.resolve('hermes/baselines/source-baseline.preview.json');
const realPath = path.resolve('hermes/baselines/source-baseline.json');
const backupDir = path.resolve('hermes/baselines/backups');
const auditDir = path.resolve('elimfilters-vault/94-sync-log');

function writeAudit(record) {
  fs.mkdirSync(auditDir, { recursive: true });
  const auditPath = path.join(auditDir, `promotion-${Date.now()}.promotion.json`);
  fs.writeFileSync(auditPath, JSON.stringify(record, null, 2) + '\n', 'utf8');
  return auditPath;
}

if (!isAuthorized({ baselineMode, dryRun, promote, approvalToken })) {
  console.error('[HERMES promote] BASELINE PROMOTION NOT AUTHORIZED');
  console.error('[HERMES promote] requires HERMES_BASELINE_MODE=true, HERMES_BASELINE_PROMOTE=true, HERMES_COLLECTION_DRY_RUN=true, and a matching HERMES_BASELINE_APPROVAL_TOKEN (its value is never printed)');
  const auditPath = writeAudit({
    status: 'PROMOTION_NOT_AUTHORIZED',
    timestamp: new Date().toISOString(),
    baseline_mode: baselineMode,
    dry_run: dryRun,
    promote_requested: promote,
    approval_token_present: Boolean(approvalToken),
    // A boolean comparison result only — never the token value itself.
    approval_token_matched: approvalToken === APPROVAL_TOKEN_VALUE,
    sources_promoted: 0,
    database_write: false,
    pgvector_write: false,
    unified_data_write: false
  });
  console.error(`[HERMES promote] audit ${auditPath}`);
  process.exit(1);
}

const registry = loadRegistry('hermes/config/source-organizations.json', 'hermes/config/source-endpoints.json');
const result = promoteBaseline({ previewPath, realPath, backupDir, registry, minContentLength });

const auditRecord = {
  status: result.status === 'PROMOTED' ? 'PROMOTED' : 'PROMOTION_FAILED',
  timestamp: result.promoted_at,
  sources_promoted: result.sources_promoted ?? 0,
  baseline_sha256: result.baseline_sha256 ?? null,
  backup_path: result.backup_path ? path.relative(process.cwd(), result.backup_path).replaceAll('\\', '/') : null,
  reason: result.reason ?? null,
  errors: result.errors ?? [],
  candidates_written: 0,
  writes_outside_baseline: 0,
  database_write: false,
  pgvector_write: false,
  unified_data_write: false
};
const auditPath = writeAudit(auditRecord);

if (result.status !== 'PROMOTED') {
  console.error(`[HERMES promote] BASELINE PROMOTION FAILED: ${result.reason}`);
  for (const error of result.errors || []) console.error(`  - ${error}`);
  console.error(`[HERMES promote] audit ${auditPath}`);
  process.exit(1);
}

console.log('[HERMES promote] BASELINE PROMOTED');
console.log(`[HERMES promote] sources_promoted=${result.sources_promoted} baseline_sha256=${result.baseline_sha256}`);
if (result.backup_path) console.log(`[HERMES promote] backup created: ${path.relative(process.cwd(), result.backup_path)}`);
console.log('[HERMES promote] database_write=false pgvector_write=false unified_data_write=false writes_outside_baseline=0');
console.log(`[HERMES promote] audit ${auditPath}`);
