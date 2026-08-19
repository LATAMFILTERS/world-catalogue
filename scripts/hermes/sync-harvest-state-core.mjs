// HERMES — durable sync for semantic-harvest state.
//
// Reuses the same hermes-state branch and git-state-branch.mjs plumbing as
// the governed baseline (see promote-baseline-core.mjs), but writes a
// completely separate file (STATE_HARVEST_PATH) and is NOT gated behind
// HERMES_BASELINE_APPROVAL_TOKEN — a normal weekly-collection run persists
// this itself. It never reads or writes state/source-baseline.json,
// state/backups/**, or state/promotion-audit.json; every commit this module
// makes carries those three paths through UNCHANGED (byte-for-byte, read
// from the current branch tip) so a normal run can never touch the
// approval-gated baseline, even by accident.
import fs from 'node:fs';
import path from 'node:path';
import {
  resolveRemoteBranchSha,
  fetchStateBranch,
  readFileAtCommit,
  listTreeAtCommit,
  commitFilesAndPush
} from './git-state-branch.mjs';
import { STATE_BRANCH, STATE_BASELINE_PATH, STATE_BACKUPS_DIR, STATE_AUDIT_PATH, isValidBackupName } from './promote-baseline-core.mjs';

export const STATE_HARVEST_PATH = 'state/source-observations.json';

/**
 * Restores the local, gitignored, ephemeral operational copy of the
 * semantic-harvest state from hermes-state. Never fabricates one: if the
 * branch or the file does not exist yet, the local path is left untouched,
 * so the collector's own loadHarvestState() naturally treats every source
 * as never-harvested rather than silently seeding one.
 */
export function restoreHarvestStateFromBranch({ cwd = process.cwd(), remote = 'origin', localHarvestPath }) {
  let sha;
  try {
    sha = fetchStateBranch({ cwd, remote, branch: STATE_BRANCH });
  } catch (error) {
    return { status: 'NOT_FOUND', reason: `could not read '${STATE_BRANCH}' from '${remote}': ${error.message}` };
  }
  if (!sha) return { status: 'NOT_FOUND', reason: `remote branch '${STATE_BRANCH}' does not exist yet` };
  const raw = readFileAtCommit({ cwd, sha, filePath: STATE_HARVEST_PATH });
  if (raw == null) return { status: 'NOT_FOUND', reason: `${STATE_HARVEST_PATH} does not exist on '${STATE_BRANCH}'`, remote_sha: sha };
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return { status: 'NOT_FOUND', reason: `${STATE_HARVEST_PATH} is not valid JSON: ${error.message}`, remote_sha: sha };
  }
  fs.mkdirSync(path.dirname(localHarvestPath), { recursive: true });
  fs.writeFileSync(localHarvestPath, raw.endsWith('\n') ? raw : `${raw}\n`, 'utf8');
  return { status: 'RESTORED', remote_sha: sha, sources: Object.keys(parsed.sources || {}).length };
}

/**
 * Persists the local semantic-harvest state back to hermes-state, carrying
 * the governed baseline/backups/audit through completely untouched. Not
 * approval-gated — this is bookkeeping, never a change-detection or
 * candidate-content signal.
 */
export function persistHarvestStateToBranch({ cwd = process.cwd(), remote = 'origin', localHarvestPath, now = () => new Date() }) {
  if (!fs.existsSync(localHarvestPath)) {
    return { status: 'SKIPPED', reason: `no local harvest state at ${localHarvestPath}` };
  }
  let content;
  try {
    content = fs.readFileSync(localHarvestPath, 'utf8');
    JSON.parse(content); // validate before ever pushing
  } catch (error) {
    return { status: 'FAILED', reason: `local harvest state is not valid JSON: ${error.message}` };
  }

  const parentSha = fetchStateBranch({ cwd, remote, branch: STATE_BRANCH });

  // Carry every governed file through byte-for-byte. If the branch does not
  // exist yet, there is nothing to carry — the harvest file becomes the
  // first commit on an orphan branch (matches promote-baseline-core.mjs's
  // own "branch may not exist yet" handling).
  const files = [{ path: STATE_HARVEST_PATH, content: content.endsWith('\n') ? content : `${content}\n` }];
  if (parentSha) {
    const baseline = readFileAtCommit({ cwd, sha: parentSha, filePath: STATE_BASELINE_PATH });
    if (baseline != null) files.push({ path: STATE_BASELINE_PATH, content: baseline });
    const backupNames = listTreeAtCommit({ cwd, sha: parentSha, dirPath: STATE_BACKUPS_DIR }).filter(isValidBackupName);
    for (const name of backupNames) {
      const backupContent = readFileAtCommit({ cwd, sha: parentSha, filePath: `${STATE_BACKUPS_DIR}/${name}` });
      if (backupContent != null) files.push({ path: `${STATE_BACKUPS_DIR}/${name}`, content: backupContent });
    }
    const audit = readFileAtCommit({ cwd, sha: parentSha, filePath: STATE_AUDIT_PATH });
    if (audit != null) files.push({ path: STATE_AUDIT_PATH, content: audit });
  }

  try {
    const pushResult = commitFilesAndPush({
      cwd, remote, branch: STATE_BRANCH, parentSha, files,
      message: 'chore(hermes-state): update semantic-harvest observations'
    });
    const verifiedSha = resolveRemoteBranchSha({ cwd, remote, branch: STATE_BRANCH });
    if (verifiedSha !== pushResult.commitSha) {
      return { status: 'FAILED', reason: 'harvest-state update was pushed but remote verification did not match' };
    }
    return { status: 'PERSISTED', state_branch_commit: pushResult.commitSha, persisted_at: now().toISOString() };
  } catch (error) {
    if (error.conflict) {
      // Another job (a promotion, or a concurrent weekly run — the
      // workflow's `concurrency: hermes-weekly` group makes this unlikely
      // but not impossible across different workflows) moved hermes-state
      // first. Never force-push; report and let the next run retry from a
      // fresh parentSha.
      return { status: 'FAILED', reason: `concurrent modification detected on '${STATE_BRANCH}'; harvest-state update was not written` };
    }
    return { status: 'FAILED', reason: `git push failed: ${error.message}` };
  }
}
