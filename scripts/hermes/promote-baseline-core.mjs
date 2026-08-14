// HERMES — governed baseline promotion, persisted durably.
//
// GitHub Actions runners are ephemeral: a baseline written only to
// hermes/baselines/source-baseline.json inside the runner's filesystem
// disappears the moment the job ends, so the following week's run would
// have nothing to compare against. The durable copy lives on a dedicated
// git branch — hermes-state — as state/source-baseline.json,
// state/backups/source-baseline.<timestamp>.json (max 5 kept), and
// state/promotion-audit.json. See git-state-branch.mjs for the plumbing
// that reads/writes that branch without ever touching the checked-out
// working tree.
//
// The ONLY durable writes this module ever performs are the three paths
// above, all under refs/heads/hermes-state — never candidates, never
// PostgreSQL/pgvector/legacy catalogue layer, never a canonical Obsidian note, never
// elimfilters-vault/94-sync-log. Every promotion/rollback is preceded by
// strict, all-or-nothing validation and a backup of whatever it replaces,
// and every write is a single git commit pushed non-force (so a concurrent
// modification is rejected by git itself, never silently overwritten) and
// then verified by re-reading the remote ref.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { isDateTime } from './hermes-core.mjs';
import { EMPTY_STRING_SHA256 } from './source-baseline-core.mjs';
import {
  resolveRemoteBranchSha,
  fetchStateBranch,
  readFileAtCommit,
  listTreeAtCommit,
  commitFilesAndPush
} from './git-state-branch.mjs';

// The one and only value that authorizes a promotion or rollback. Never
// logged in full by any caller — only whether it was present/matched.
export const APPROVAL_TOKEN_VALUE = 'VICTOR_ABREU_APPROVED';
export const MAX_BACKUPS = 5;
export const MAX_AUDIT_EVENTS = 20;
export const STATE_BRANCH = 'hermes-state';
export const STATE_BASELINE_PATH = 'state/source-baseline.json';
export const STATE_BACKUPS_DIR = 'state/backups';
export const STATE_AUDIT_PATH = 'state/promotion-audit.json';

export function sha256HexOfString(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
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

export function isRollbackAuthorized({ approvalToken }) {
  return approvalToken === APPROVAL_TOKEN_VALUE;
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

/** A backup filename must be exactly this shape — never taken as a free-form path. */
export function isValidBackupName(name) {
  return typeof name === 'string' && /^source-baseline\.\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.json$/.test(name);
}

function readCurrentState({ cwd, remote }) {
  const sha = fetchStateBranch({ cwd, remote, branch: STATE_BRANCH });
  if (!sha) return { sha: null, baseline: null, backups: [], audit: [] };

  const baselineRaw = readFileAtCommit({ cwd, sha, filePath: STATE_BASELINE_PATH });
  const baseline = baselineRaw != null ? JSON.parse(baselineRaw) : null;

  const backupNames = listTreeAtCommit({ cwd, sha, dirPath: STATE_BACKUPS_DIR })
    .filter(isValidBackupName)
    .sort();
  const backups = backupNames
    .map((name) => ({ name, content: readFileAtCommit({ cwd, sha, filePath: `${STATE_BACKUPS_DIR}/${name}` }) }))
    .filter((b) => b.content != null);

  const auditRaw = readFileAtCommit({ cwd, sha, filePath: STATE_AUDIT_PATH });
  let audit = [];
  if (auditRaw != null) {
    try {
      const parsed = JSON.parse(auditRaw);
      if (Array.isArray(parsed)) audit = parsed;
    } catch {
      audit = [];
    }
  }
  return { sha, baseline, backups, audit };
}

function buildFileSet({ baselineContent, backups, auditEvents }) {
  const files = [{ path: STATE_BASELINE_PATH, content: baselineContent }];
  for (const backup of backups) files.push({ path: `${STATE_BACKUPS_DIR}/${backup.name}`, content: backup.content });
  files.push({ path: STATE_AUDIT_PATH, content: JSON.stringify(auditEvents, null, 2) + '\n' });
  return files;
}

/**
 * Restores hermes/baselines/source-baseline.json — the local, gitignored,
 * ephemeral operational copy the collector reads — from the durable
 * hermes-state branch. Never fabricates a baseline: if the branch or the
 * file inside it does not exist, the local path is left untouched, so the
 * collector's own loadBaseline() naturally treats every source as
 * BASELINE_REQUIRED rather than silently seeding one.
 */
export function restoreBaselineFromState({ cwd = process.cwd(), remote = 'origin', localBaselinePath }) {
  let sha;
  try {
    sha = fetchStateBranch({ cwd, remote, branch: STATE_BRANCH });
  } catch (error) {
    // Never fabricate a baseline because the remote could not even be
    // reached — fail closed into BASELINE_REQUIRED, same as "branch does
    // not exist yet", and leave the local path untouched.
    return { status: 'BASELINE_REQUIRED', reason: `could not read '${STATE_BRANCH}' from '${remote}': ${error.message}`, remote_sha: null };
  }
  if (!sha) {
    return { status: 'BASELINE_REQUIRED', reason: `remote branch '${STATE_BRANCH}' does not exist yet`, remote_sha: null };
  }
  const raw = readFileAtCommit({ cwd, sha, filePath: STATE_BASELINE_PATH });
  if (raw == null) {
    return { status: 'BASELINE_REQUIRED', reason: `${STATE_BASELINE_PATH} does not exist on '${STATE_BRANCH}'`, remote_sha: sha };
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return { status: 'BASELINE_REQUIRED', reason: `${STATE_BASELINE_PATH} is not valid JSON: ${error.message}`, remote_sha: sha };
  }
  fs.mkdirSync(path.dirname(localBaselinePath), { recursive: true });
  fs.writeFileSync(localBaselinePath, raw.endsWith('\n') ? raw : `${raw}\n`, 'utf8');
  return { status: 'RESTORED', remote_sha: sha, sources: Object.keys(parsed.sources || {}).length };
}

/**
 * Promotes a freshly generated, already-validated preview baseline
 * (hermes/baselines/source-baseline.preview.json, produced by a
 * HERMES_BASELINE_MODE=true collection run) onto the hermes-state branch.
 * Caller is responsible for the env-var authorization check (isAuthorized).
 *
 * Sequence: load + validate preview -> read current state from
 * hermes-state -> back up the baseline being replaced (if any) -> build the
 * new commit (new baseline + pruned backups [max 5] + appended audit event)
 * -> push non-force -> verify by re-reading the remote ref. A promotion is
 * only ever reported PROMOTED after that final remote verification
 * succeeds; any failure at any step leaves hermes-state completely
 * untouched (git only moves the ref after the object graph is fully built,
 * and a rejected push moves nothing at all).
 */
export function promoteBaselineToState({ cwd = process.cwd(), remote = 'origin', previewPath, registry, minContentLength, now = () => new Date() }) {
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

  // A local write is never treated as persistence — if the hermes-state
  // branch cannot even be read (remote misconfigured, unreachable, no
  // network), promotion must fail closed rather than silently proceed as
  // if it had a valid current state.
  let current;
  try {
    current = readCurrentState({ cwd, remote });
  } catch (error) {
    return { status: 'FAILED', reason: `could not read current hermes-state from '${remote}': ${error.message}`, promoted_at: nowIso, errors: [] };
  }
  const newBaselineContent = `${JSON.stringify(baseline, null, 2)}\n`;

  let backups = current.backups;
  let backupName = null;
  if (current.baseline) {
    backupName = `source-baseline.${timestampForFilename(now())}.json`;
    const backupContent = `${JSON.stringify(current.baseline, null, 2)}\n`;
    backups = [...backups, { name: backupName, content: backupContent }].sort((a, b) => a.name.localeCompare(b.name));
  }
  while (backups.length > MAX_BACKUPS) backups.shift();

  const auditEvent = {
    event: 'PROMOTED',
    timestamp: nowIso,
    sources_promoted: Object.keys(baseline.sources).length,
    baseline_sha256: sha256HexOfString(newBaselineContent),
    backup_created: backupName ? `${STATE_BACKUPS_DIR}/${backupName}` : null,
    previous_state_commit: current.sha
  };
  const auditEvents = [...current.audit, auditEvent].slice(-MAX_AUDIT_EVENTS);
  const files = buildFileSet({ baselineContent: newBaselineContent, backups, auditEvents });

  let pushResult;
  try {
    pushResult = commitFilesAndPush({
      cwd, remote, branch: STATE_BRANCH, parentSha: current.sha, files,
      message: `chore(hermes-state): promote baseline (${auditEvent.sources_promoted} sources)`
    });
  } catch (error) {
    if (error.conflict) {
      return { status: 'FAILED', reason: `concurrent modification detected — '${STATE_BRANCH}' changed during promotion; nothing was written`, promoted_at: nowIso, errors: [] };
    }
    return { status: 'FAILED', reason: `git push failed: ${error.message}`, promoted_at: nowIso, errors: [] };
  }

  const verifiedSha = resolveRemoteBranchSha({ cwd, remote, branch: STATE_BRANCH });
  if (verifiedSha !== pushResult.commitSha) {
    return { status: 'FAILED', reason: 'promotion was pushed but remote verification did not match — treating as failed out of caution', promoted_at: nowIso, errors: [] };
  }

  return {
    status: 'PROMOTED',
    promoted_at: nowIso,
    sources_promoted: auditEvent.sources_promoted,
    baseline_sha256: auditEvent.baseline_sha256,
    backup_path: backupName ? `${STATE_BACKUPS_DIR}/${backupName}` : null,
    state_branch: STATE_BRANCH,
    state_branch_commit: pushResult.commitSha,
    remote_verified: true,
    candidates_written: 0,
    writes_outside_baseline: 0
  };
}

/**
 * Restores state/source-baseline.json on hermes-state from a specific,
 * existing backup already on that branch. Caller is responsible for the
 * approval-token check. The baseline being replaced is itself backed up
 * first, same as a promotion.
 */
export function rollbackBaselineInState({ cwd = process.cwd(), remote = 'origin', backupName, now = () => new Date() }) {
  const nowIso = now().toISOString();
  if (!isValidBackupName(backupName)) {
    return { status: 'FAILED', reason: `invalid backup name: ${backupName}`, rolled_back_at: nowIso };
  }

  let current;
  try {
    current = readCurrentState({ cwd, remote });
  } catch (error) {
    return { status: 'FAILED', reason: `could not read current hermes-state from '${remote}': ${error.message}`, rolled_back_at: nowIso };
  }
  if (!current.sha) {
    return { status: 'FAILED', reason: `remote branch '${STATE_BRANCH}' does not exist`, rolled_back_at: nowIso };
  }
  const target = current.backups.find((b) => b.name === backupName);
  if (!target) {
    return { status: 'FAILED', reason: `backup '${backupName}' not found on '${STATE_BRANCH}'`, rolled_back_at: nowIso };
  }

  let backups = current.backups.filter((b) => b.name !== backupName);
  let replacedBackupName = null;
  if (current.baseline) {
    replacedBackupName = `source-baseline.${timestampForFilename(now())}.json`;
    backups = [...backups, { name: replacedBackupName, content: `${JSON.stringify(current.baseline, null, 2)}\n` }]
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  while (backups.length > MAX_BACKUPS) backups.shift();

  const restoredContent = target.content;
  const auditEvent = {
    event: 'ROLLED_BACK',
    timestamp: nowIso,
    restored_from: `${STATE_BACKUPS_DIR}/${backupName}`,
    baseline_sha256: sha256HexOfString(restoredContent),
    backup_created: replacedBackupName ? `${STATE_BACKUPS_DIR}/${replacedBackupName}` : null,
    previous_state_commit: current.sha
  };
  const auditEvents = [...current.audit, auditEvent].slice(-MAX_AUDIT_EVENTS);
  const files = buildFileSet({ baselineContent: restoredContent, backups, auditEvents });

  let pushResult;
  try {
    pushResult = commitFilesAndPush({
      cwd, remote, branch: STATE_BRANCH, parentSha: current.sha, files,
      message: `chore(hermes-state): rollback baseline to ${backupName}`
    });
  } catch (error) {
    if (error.conflict) {
      return { status: 'FAILED', reason: `concurrent modification detected — '${STATE_BRANCH}' changed during rollback; nothing was written`, rolled_back_at: nowIso };
    }
    return { status: 'FAILED', reason: `git push failed: ${error.message}`, rolled_back_at: nowIso };
  }

  const verifiedSha = resolveRemoteBranchSha({ cwd, remote, branch: STATE_BRANCH });
  if (verifiedSha !== pushResult.commitSha) {
    return { status: 'FAILED', reason: 'rollback was pushed but remote verification did not match — treating as failed out of caution', rolled_back_at: nowIso };
  }

  return {
    status: 'ROLLED_BACK',
    rolled_back_at: nowIso,
    restored_from: `${STATE_BACKUPS_DIR}/${backupName}`,
    baseline_sha256: auditEvent.baseline_sha256,
    state_branch: STATE_BRANCH,
    state_branch_commit: pushResult.commitSha,
    remote_verified: true
  };
}
