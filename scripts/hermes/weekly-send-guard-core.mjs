// HERMES — durable "already sent this week" guard.
//
// The old guard compared the runner's current America/Chicago hour against
// a hardcoded "08" before letting the weekly-collection job do any real
// work. That assumes GitHub Actions fires the schedule trigger at (or very
// near) its declared cron time, which it does not reliably do — delays of
// several hours between a declared cron time and the actual run are normal
// GitHub Actions behavior, not an error condition. When a delay pushed both
// of the workflow's DST-alternate cron firings outside the 08:xx window on
// the same Monday, the job "succeeded" in under a minute without collecting
// anything, running Groq, or sending the email — silently, for weeks.
//
// This guard instead asks a question that does not depend on wall-clock
// timing at all: has a real send already completed for the current ISO
// week? It reuses the same hermes-state branch and git-state-branch.mjs
// plumbing as the governed baseline and the semantic-harvest state (see
// promote-baseline-core.mjs / sync-harvest-state-core.mjs), writes a
// separate marker file, and carries every other governed/harvest file
// through unchanged — never touching state/source-baseline.json,
// state/backups/**, state/promotion-audit.json, or
// state/source-observations.json.
import {
  fetchStateBranch,
  readFileAtCommit,
  listTreeAtCommit,
  commitFilesAndPush,
  resolveRemoteBranchSha
} from './git-state-branch.mjs';
import { STATE_BRANCH, STATE_BASELINE_PATH, STATE_BACKUPS_DIR, STATE_AUDIT_PATH, isValidBackupName } from './promote-baseline-core.mjs';
import { STATE_HARVEST_PATH } from './sync-harvest-state-core.mjs';

export const STATE_LAST_SEND_PATH = 'state/last-weekly-send.json';

/** ISO-8601 week key (e.g. "2026-W36"), Thursday-based per the ISO 8601 definition. */
export function isoWeekKey(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = (d.getUTCDay() + 6) % 7; // Monday=0 .. Sunday=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstThursdayDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayDayNum + 3);
  const week = 1 + Math.round((d - firstThursday) / (7 * 86400000));
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** True if a real weekly send has already completed for the current ISO week. */
export function hasSentThisWeek({ cwd = process.cwd(), remote = 'origin', now = () => new Date() } = {}) {
  const currentWeek = isoWeekKey(now());
  let sha;
  try {
    sha = fetchStateBranch({ cwd, remote, branch: STATE_BRANCH });
  } catch (error) {
    // Cannot confirm either way — fail open (proceed) rather than silently
    // blocking a real week's send because of a transient fetch problem.
    return { sent: false, currentWeek, reason: `could not read '${STATE_BRANCH}' from '${remote}': ${error.message}` };
  }
  if (!sha) return { sent: false, currentWeek, reason: `remote branch '${STATE_BRANCH}' does not exist yet` };
  const raw = readFileAtCommit({ cwd, sha, filePath: STATE_LAST_SEND_PATH });
  if (raw == null) return { sent: false, currentWeek, reason: `${STATE_LAST_SEND_PATH} does not exist yet` };
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return { sent: false, currentWeek, reason: `${STATE_LAST_SEND_PATH} is not valid JSON: ${error.message}` };
  }
  return {
    sent: parsed.iso_week === currentWeek,
    currentWeek,
    lastSentWeek: parsed.iso_week,
    lastSentAt: parsed.sent_at,
    reason: `last recorded send was for week ${parsed.iso_week}`
  };
}

/** Records that a real weekly send has completed for the current ISO week. */
export function markSentThisWeek({ cwd = process.cwd(), remote = 'origin', now = () => new Date() } = {}) {
  const currentWeek = isoWeekKey(now());
  const parentSha = fetchStateBranch({ cwd, remote, branch: STATE_BRANCH });
  const marker = JSON.stringify({ iso_week: currentWeek, sent_at: now().toISOString() }, null, 2) + '\n';
  const files = [{ path: STATE_LAST_SEND_PATH, content: marker }];

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
    const harvest = readFileAtCommit({ cwd, sha: parentSha, filePath: STATE_HARVEST_PATH });
    if (harvest != null) files.push({ path: STATE_HARVEST_PATH, content: harvest });
  }

  try {
    const pushResult = commitFilesAndPush({
      cwd, remote, branch: STATE_BRANCH, parentSha, files,
      message: `chore(hermes-state): mark weekly send complete for ${currentWeek}`
    });
    const verifiedSha = resolveRemoteBranchSha({ cwd, remote, branch: STATE_BRANCH });
    if (verifiedSha !== pushResult.commitSha) {
      return { status: 'FAILED', reason: 'send marker was pushed but remote verification did not match' };
    }
    return { status: 'MARKED', commitSha: pushResult.commitSha, iso_week: currentWeek };
  } catch (error) {
    if (error.conflict) {
      return { status: 'FAILED', reason: `concurrent modification detected on '${STATE_BRANCH}'; send marker was not written` };
    }
    return { status: 'FAILED', reason: `git push failed: ${error.message}` };
  }
}
