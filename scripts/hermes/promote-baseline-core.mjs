// HERMES — governed baseline promotion.
// The ONLY thing this module is allowed to write is
// hermes/baselines/source-baseline.json (and its own timestamped backups
// under hermes/baselines/backups/). It never touches candidates, never
// touches PostgreSQL/pgvector/unified-data, never touches a canonical
// Obsidian note. Every write is preceded by strict, all-or-nothing
// validation and, when replacing an existing file, a backup — and every
// write to the real file itself is atomic (temp file + rename) so a
// mid-write failure can never leave a corrupt or partial baseline.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { isDateTime } from './hermes-core.mjs';
import { EMPTY_STRING_SHA256 } from './source-baseline-core.mjs';

// The one and only value that authorizes a promotion or rollback. Never
// logged in full by any caller — only whether it was present/matched.
export const APPROVAL_TOKEN_VALUE = 'VICTOR_ABREU_APPROVED';
export const MAX_BACKUPS = 5;

export function sha256HexOfFile(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

/**
 * All four conditions are required together — this is intentionally an AND,
 * not an OR: baseline mode, DRY RUN, the promote flag, and an exact token
 * match. Missing or wrong on any one of them means "not authorized", full
 * stop; there is no partial-authorization state.
 */
export function isAuthorized({ baselineMode, dryRun, promote, approvalToken }) {
  return baselineMode === true && dryRun === true && promote === true && approvalToken === APPROVAL_TOKEN_VALUE;
}

/**
 * All-or-nothing: a single failing entry fails the entire promotion. Cross-
 * checks every entry against the CURRENT registry (not whatever was true
 * when the baseline was captured) — an endpoint disabled or reclassified
 * since then blocks promotion until the baseline is refreshed.
 */
export function validateBaselineForPromotion({ baseline, registry, minContentLength }) {
  const errors = [];
  if (!baseline || typeof baseline !== 'object') { errors.push('baseline is not an object'); return errors; }
  if (baseline.schema_version !== '1.0.0') errors.push(`schema_version must be "1.0.0", got "${baseline.schema_version}"`);

  const entries = Object.entries(baseline.sources || {});
  if (entries.length === 0) errors.push('baseline has no sources');

  const endpointsById = new Map((registry?.endpoints || []).map((e) => [e.id, e]));
  const seenKeys = new Set();

  for (const [key, entry] of entries) {
    if (seenKeys.has(key)) errors.push(`${key}: duplicate endpoint_id key in baseline.sources`);
    seenKeys.add(key);

    if (!entry || typeof entry !== 'object') { errors.push(`${key}: entry is not an object`); continue; }
    if (entry.endpoint_id !== key) errors.push(`${key}: entry.endpoint_id "${entry.endpoint_id}" does not match its own key`);
    if (!entry.organization_id) errors.push(`${key}: missing organization_id`);
    if (!entry.source_url || !/^https:\/\//i.test(entry.source_url)) errors.push(`${key}: source_url must be HTTPS`);
    if (!entry.normalized_hash || !/^[a-f0-9]{64}$/.test(entry.normalized_hash)) errors.push(`${key}: normalized_hash must be a SHA-256 hex string`);
    if (entry.normalized_hash === EMPTY_STRING_SHA256) errors.push(`${key}: normalized_hash is the well-known empty-content hash`);
    if (entry.response_status !== 200) errors.push(`${key}: response_status must be 200, got ${entry.response_status}`);
    if (typeof entry.content_length !== 'number' || entry.content_length < minContentLength) errors.push(`${key}: content_length ${entry.content_length} is below the minimum ${minContentLength}`);
    if (!isDateTime(entry.observed_at)) errors.push(`${key}: observed_at is not a valid date-time`);

    const endpoint = endpointsById.get(key);
    if (!endpoint) { errors.push(`${key}: no longer present in the registry (hermes/config/source-endpoints.json)`); continue; }
    if (endpoint.enabled !== true) errors.push(`${key}: endpoint is disabled in the registry`);
    if (endpoint.status !== 'ACTIVE') errors.push(`${key}: endpoint status is "${endpoint.status}" in the registry, not ACTIVE`);
  }
  return errors;
}

function timestampForFilename(date) {
  return date.toISOString().replace(/[:.]/g, '-');
}

/** Deletes the oldest backups beyond maxBackups, keeping the most recent ones. */
export function rotateBackups(backupDir, maxBackups = MAX_BACKUPS) {
  if (!fs.existsSync(backupDir)) return;
  const files = fs.readdirSync(backupDir).filter((f) => /^source-baseline\..*\.bak\.json$/.test(f)).sort();
  while (files.length > maxBackups) {
    const oldest = files.shift();
    fs.unlinkSync(path.join(backupDir, oldest));
  }
}

/**
 * Write-then-rename: the target file is only ever replaced by a single
 * atomic rename, so a crash mid-write leaves either the old file intact or
 * the new one complete — never a half-written baseline.
 */
function atomicWriteFile(targetPath, content) {
  const dir = path.dirname(targetPath);
  fs.mkdirSync(dir, { recursive: true });
  const tempPath = path.join(dir, `.tmp-${path.basename(targetPath)}-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  fs.writeFileSync(tempPath, content, 'utf8');
  fs.renameSync(tempPath, targetPath);
}

/**
 * Promotes hermes/baselines/source-baseline.preview.json to
 * hermes/baselines/source-baseline.json. Caller is responsible for the
 * env-var authorization check (isAuthorized) — this function assumes it has
 * already been granted and focuses purely on validate → backup → atomic
 * write. Never partially writes: if validation fails, the real file (and
 * any existing backup) is left completely untouched.
 */
export function promoteBaseline({ previewPath, realPath, backupDir, registry, minContentLength, now = () => new Date() }) {
  const nowIso = now().toISOString();

  if (!fs.existsSync(previewPath)) {
    return { status: 'FAILED', reason: `preview baseline not found at ${previewPath}`, promoted_at: nowIso, errors: [] };
  }
  let baseline;
  try {
    baseline = JSON.parse(fs.readFileSync(previewPath, 'utf8'));
  } catch (error) {
    return { status: 'FAILED', reason: `preview baseline is not valid JSON: ${error.message}`, promoted_at: nowIso, errors: [] };
  }

  const errors = validateBaselineForPromotion({ baseline, registry, minContentLength });
  if (errors.length) {
    return { status: 'FAILED', reason: 'baseline preview failed validation', errors, promoted_at: nowIso };
  }

  let backupPath = null;
  if (fs.existsSync(realPath)) {
    fs.mkdirSync(backupDir, { recursive: true });
    backupPath = path.join(backupDir, `source-baseline.${timestampForFilename(now())}.bak.json`);
    fs.copyFileSync(realPath, backupPath);
    rotateBackups(backupDir);
  }

  const serialized = JSON.stringify(baseline, null, 2) + '\n';
  try {
    atomicWriteFile(realPath, serialized);
  } catch (error) {
    // Nothing beyond the (already-created) backup was touched — the rename
    // either happens completely or not at all, so realPath still holds
    // whatever it held before this call if the rename itself failed.
    return { status: 'FAILED', reason: `atomic write failed: ${error.message}`, promoted_at: nowIso, backup_path: backupPath, errors: [] };
  }

  return {
    status: 'PROMOTED',
    promoted_at: nowIso,
    sources_promoted: Object.keys(baseline.sources).length,
    baseline_sha256: sha256HexOfFile(realPath),
    backup_path: backupPath,
    real_path: realPath,
    candidates_written: 0,
    writes_outside_baseline: 0
  };
}

/**
 * Restores hermes/baselines/source-baseline.json from a specific, existing
 * backup file. Caller is responsible for the approval-token check.
 */
export function rollbackBaseline({ backupPath, realPath, now = () => new Date() }) {
  const nowIso = now().toISOString();
  if (!fs.existsSync(backupPath)) {
    return { status: 'FAILED', reason: `backup not found at ${backupPath}`, rolled_back_at: nowIso };
  }
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  } catch (error) {
    return { status: 'FAILED', reason: `backup is not valid JSON: ${error.message}`, rolled_back_at: nowIso };
  }
  const content = JSON.stringify(parsed, null, 2) + '\n';
  atomicWriteFile(realPath, content);
  return {
    status: 'ROLLED_BACK',
    rolled_back_at: nowIso,
    restored_from: backupPath,
    baseline_sha256: sha256HexOfFile(realPath)
  };
}
