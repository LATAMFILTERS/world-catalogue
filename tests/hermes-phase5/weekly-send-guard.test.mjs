// HERMES — durable "already sent this ISO week" guard regression suite.
//
// Same approach as baseline-promotion.test.mjs: a real local bare git repo
// stands in for GitHub's origin (real init/fetch/push/ls-remote over the
// file transport), no mocking of git itself, so the same code path that
// talks to the real hermes-state branch on GitHub is what is under test.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { isoWeekKey, hasSentThisWeek, markSentThisWeek, STATE_LAST_SEND_PATH } from '../../scripts/hermes/weekly-send-guard-core.mjs';
import { fetchStateBranch, readFileAtCommit, commitFilesAndPush } from '../../scripts/hermes/git-state-branch.mjs';
import { STATE_BRANCH, STATE_BASELINE_PATH } from '../../scripts/hermes/promote-baseline-core.mjs';

function git(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' });
}

function makeBareOrigin() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-weekly-guard-origin-'));
  const originDir = path.join(base, 'origin.git');
  git(['init', '--bare', '--initial-branch=main', originDir]);
  return originDir;
}

function makeWorkingRepo(originDir) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-weekly-guard-work-'));
  git(['init', '--initial-branch=main', cwd]);
  git(['remote', 'add', 'origin', originDir], cwd);
  git(['config', 'user.email', 'hermes-test@example.test'], cwd);
  git(['config', 'user.name', 'HERMES Test'], cwd);
  return cwd;
}

test('isoWeekKey matches the ISO 8601 week for known reference dates', () => {
  assert.equal(isoWeekKey(new Date('2026-01-01T00:00:00Z')), '2026-W01'); // Thursday, first week of 2026
  assert.equal(isoWeekKey(new Date('2025-12-29T00:00:00Z')), '2026-W01'); // Monday, but rolls into next year's W01
  assert.equal(isoWeekKey(new Date('2020-12-31T00:00:00Z')), '2020-W53'); // known 53-week year
});

test('hasSentThisWeek reports not sent when hermes-state does not exist yet', () => {
  const originDir = makeBareOrigin();
  const cwd = makeWorkingRepo(originDir);
  const result = hasSentThisWeek({ cwd, remote: 'origin', now: () => new Date('2026-09-01T00:00:00Z') });
  assert.equal(result.sent, false);
  assert.match(result.reason, /does not exist yet/);
});

test('markSentThisWeek then hasSentThisWeek (same week) reports sent', () => {
  const originDir = makeBareOrigin();
  const cwd = makeWorkingRepo(originDir);
  const now = () => new Date('2026-09-01T12:00:00Z'); // Tuesday of 2026-W36

  const marked = markSentThisWeek({ cwd, remote: 'origin', now });
  assert.equal(marked.status, 'MARKED');
  assert.equal(marked.iso_week, '2026-W36');

  const result = hasSentThisWeek({ cwd, remote: 'origin', now });
  assert.equal(result.sent, true);
  assert.equal(result.currentWeek, '2026-W36');
});

test('a mark from a previous ISO week does not block the current week', () => {
  const originDir = makeBareOrigin();
  const cwd = makeWorkingRepo(originDir);

  markSentThisWeek({ cwd, remote: 'origin', now: () => new Date('2026-08-24T12:00:00Z') }); // 2026-W35

  const result = hasSentThisWeek({ cwd, remote: 'origin', now: () => new Date('2026-09-01T12:00:00Z') }); // 2026-W36
  assert.equal(result.sent, false);
  assert.equal(result.lastSentWeek, '2026-W35');
});

test('markSentThisWeek carries the governed baseline through untouched', () => {
  const originDir = makeBareOrigin();
  const cwd = makeWorkingRepo(originDir);

  // Seed hermes-state with a governed baseline file first, exactly as
  // promote-baseline-core.mjs would have left it.
  const seedContent = JSON.stringify({ schema_version: '1.0.0', sources: {} }) + '\n';
  commitFilesAndPush({
    cwd, remote: 'origin', branch: STATE_BRANCH, parentSha: null,
    files: [{ path: STATE_BASELINE_PATH, content: seedContent }],
    message: 'seed governed baseline'
  });

  markSentThisWeek({ cwd, remote: 'origin', now: () => new Date('2026-09-01T12:00:00Z') });

  const sha = fetchStateBranch({ cwd, remote: 'origin', branch: STATE_BRANCH });
  const baselineAfter = readFileAtCommit({ cwd, sha, filePath: STATE_BASELINE_PATH });
  const markerAfter = readFileAtCommit({ cwd, sha, filePath: STATE_LAST_SEND_PATH });
  assert.equal(baselineAfter, seedContent);
  assert.ok(markerAfter && JSON.parse(markerAfter).iso_week === '2026-W36');
});
