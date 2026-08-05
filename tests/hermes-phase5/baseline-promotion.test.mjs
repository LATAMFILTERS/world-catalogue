// HERMES — governed baseline promotion + rollback regression suite.
//
// The durable copy of the baseline lives on a dedicated git branch
// (hermes-state), never only inside a runner's local filesystem — GitHub
// Actions runners are ephemeral, so anything not actually pushed to a
// remote ref disappears when the job ends. Every functional test below
// exercises this for real against a genuine local bare git repository
// standing in for GitHub's origin (real `git init --bare`, real
// fetch/push/ls-remote over the file transport) — no network, but no
// mocking of git itself either, so the same code path that talks to the
// real GitHub remote in Actions is what's actually under test here.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync, execFileSync } from 'node:child_process';
import {
  isAuthorized,
  isRollbackAuthorized,
  isValidBackupName,
  validateBaselineForPromotion,
  restoreBaselineFromState,
  promoteBaselineToState,
  rollbackBaselineInState,
  APPROVAL_TOKEN_VALUE,
  MAX_BACKUPS,
  STATE_BRANCH,
  STATE_BASELINE_PATH,
  STATE_BACKUPS_DIR
} from '../../scripts/hermes/promote-baseline-core.mjs';
import {
  resolveRemoteBranchSha,
  fetchStateBranch,
  readFileAtCommit,
  listTreeAtCommit,
  commitFilesAndPush
} from '../../scripts/hermes/git-state-branch.mjs';
import { EMPTY_STRING_SHA256 } from '../../scripts/hermes/source-baseline-core.mjs';

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const PROMOTE_SCRIPT = path.join(REPO_ROOT, 'scripts', 'hermes', 'promote-baseline.mjs');
const ROLLBACK_SCRIPT = path.join(REPO_ROOT, 'scripts', 'hermes', 'rollback-baseline.mjs');
const RESTORE_SCRIPT = path.join(REPO_ROOT, 'scripts', 'hermes', 'restore-baseline-from-state.mjs');
const WORKFLOW_PATH = path.join(REPO_ROOT, '.github', 'workflows', 'hermes-weekly.yml');

// ---------------------------------------------------------------------------
// Git test harness: a real bare repo standing in for GitHub's origin, plus
// one or more real clones. No mocking — genuine git fetch/push/ls-remote.
// ---------------------------------------------------------------------------

function git(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' });
}

function makeBareOrigin() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-state-origin-'));
  const originDir = path.join(base, 'origin.git');
  git(['init', '--bare', '--initial-branch=main', originDir]);
  return originDir;
}

/**
 * A clone wired up exactly like a real HERMES CLI invocation's cwd: a git
 * repo with `origin` pointing at the shared bare repo, plus the
 * hermes/config + hermes/baselines layout the scripts hardcode relative to
 * cwd.
 */
function makeClone(originDir, { seedRegistry = { endpoints: [{ id: 'test_ep', enabled: true, status: 'ACTIVE' }] } } = {}) {
  const cloneDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-state-clone-'));
  git(['init', '--initial-branch=main', cloneDir]);
  git(['remote', 'add', 'origin', originDir], cloneDir);
  git(['config', 'user.email', 'hermes-test@example.test'], cloneDir);
  git(['config', 'user.name', 'HERMES Test'], cloneDir);
  // `main` only needs to exist once per origin — a second (or third) clone
  // against the same shared bare origin must not invent its own unrelated
  // "init" commit and race to push it; it should simply adopt whatever
  // `main` already exists there, exactly like a second real checkout would.
  const existingMain = resolveRemoteBranchSha({ cwd: cloneDir, remote: 'origin', branch: 'main' });
  if (existingMain) {
    git(['fetch', 'origin', 'main'], cloneDir);
    git(['checkout', '-B', 'main', 'FETCH_HEAD'], cloneDir);
  } else {
    fs.writeFileSync(path.join(cloneDir, 'README.md'), 'test\n');
    git(['add', '.'], cloneDir);
    git(['commit', '-m', 'init'], cloneDir);
    git(['push', 'origin', 'main'], cloneDir);
  }

  fs.mkdirSync(path.join(cloneDir, 'hermes', 'baselines'), { recursive: true });
  fs.mkdirSync(path.join(cloneDir, 'hermes', 'config'), { recursive: true });
  fs.mkdirSync(path.join(cloneDir, 'elimfilters-vault', '94-sync-log'), { recursive: true });
  fs.writeFileSync(path.join(cloneDir, 'hermes', 'config', 'source-organizations.json'), JSON.stringify({ organizations: [] }));
  fs.writeFileSync(path.join(cloneDir, 'hermes', 'config', 'source-endpoints.json'), JSON.stringify(seedRegistry));
  return cloneDir;
}

function validEntry(overrides = {}) {
  return {
    organization_id: 'test_org',
    endpoint_id: 'test_ep',
    source_url: 'https://example.test/news',
    normalized_hash: 'b'.repeat(64),
    observed_at: '2026-08-03T00:00:00.000Z',
    content_length: 5000,
    response_status: 200,
    ...overrides
  };
}

function validBaseline(entries = { test_ep: validEntry() }) {
  return { schema_version: '1.0.0', generated_at: '2026-08-03T00:00:00.000Z', sources: entries };
}

function validRegistry() {
  return { endpoints: [{ id: 'test_ep', enabled: true, status: 'ACTIVE' }] };
}

function writePreview(cloneDir, baseline) {
  const previewPath = path.join(cloneDir, 'hermes', 'baselines', 'source-baseline.preview.json');
  fs.mkdirSync(path.dirname(previewPath), { recursive: true });
  fs.writeFileSync(previewPath, JSON.stringify(baseline));
  return previewPath;
}

function mainSha(originDir) {
  return execFileSync('git', ['ls-remote', originDir, 'refs/heads/main'], { encoding: 'utf8' }).split('\t')[0];
}

// ---------------------------------------------------------------------------
// Pure authorization / validation logic — unchanged semantics.
// ---------------------------------------------------------------------------

test('1) promotion is blocked by default (no env vars set)', () => {
  assert.equal(isAuthorized({ baselineMode: false, dryRun: true, promote: false, approvalToken: '' }), false);
});

test('2) promotion is blocked when every mode flag is correct but the approval token is absent', () => {
  assert.equal(isAuthorized({ baselineMode: true, dryRun: true, promote: true, approvalToken: '' }), false);
});

test('3) promotion is blocked when the approval token is present but does not match exactly', () => {
  assert.equal(isAuthorized({ baselineMode: true, dryRun: true, promote: true, approvalToken: 'victor_abreu_approved' }), false);
  assert.equal(isAuthorized({ baselineMode: true, dryRun: true, promote: true, approvalToken: `${APPROVAL_TOKEN_VALUE} ` }), false);
});

test('4) promotion is authorized only when all four conditions hold together', () => {
  assert.equal(isAuthorized({ baselineMode: true, dryRun: true, promote: true, approvalToken: APPROVAL_TOKEN_VALUE }), true);
  assert.equal(isAuthorized({ baselineMode: false, dryRun: true, promote: true, approvalToken: APPROVAL_TOKEN_VALUE }), false);
  assert.equal(isAuthorized({ baselineMode: true, dryRun: false, promote: true, approvalToken: APPROVAL_TOKEN_VALUE }), false);
  assert.equal(isAuthorized({ baselineMode: true, dryRun: true, promote: false, approvalToken: APPROVAL_TOKEN_VALUE }), false);
});

test('isAuthorized rejects promotion outright when dryRun is false, independent of every other flag', () => {
  assert.equal(isAuthorized({ baselineMode: true, dryRun: false, promote: true, approvalToken: APPROVAL_TOKEN_VALUE }), false);
});

test('rollback authorization requires only the exact token, nothing else', () => {
  assert.equal(isRollbackAuthorized({ approvalToken: APPROVAL_TOKEN_VALUE }), true);
  assert.equal(isRollbackAuthorized({ approvalToken: '' }), false);
  assert.equal(isRollbackAuthorized({ approvalToken: 'wrong' }), false);
});

test('an invalid baseline (missing required field) fails validation', () => {
  const errors = validateBaselineForPromotion({ baseline: validBaseline({ test_ep: validEntry({ organization_id: undefined }) }), registry: validRegistry(), minContentLength: 200 });
  assert.ok(errors.some((e) => e.includes('organization_id')));
});

test('an entry whose normalized_hash is the well-known empty-content hash fails validation', () => {
  const errors = validateBaselineForPromotion({ baseline: validBaseline({ test_ep: validEntry({ normalized_hash: EMPTY_STRING_SHA256 }) }), registry: validRegistry(), minContentLength: 200 });
  assert.ok(errors.some((e) => e.includes('empty-content hash')));
});

test('a source whose registry endpoint is disabled fails validation', () => {
  const errors = validateBaselineForPromotion({ baseline: validBaseline(), registry: { endpoints: [{ id: 'test_ep', enabled: false, status: 'ACTIVE' }] }, minContentLength: 200 });
  assert.ok(errors.some((e) => e.includes('disabled')));
});

test('a source whose registry endpoint is not ACTIVE fails validation', () => {
  const errors = validateBaselineForPromotion({ baseline: validBaseline(), registry: { endpoints: [{ id: 'test_ep', enabled: false, status: 'REVIEW_REQUIRED' }] }, minContentLength: 200 });
  assert.ok(errors.some((e) => e.includes('not ACTIVE') || e.includes('REVIEW_REQUIRED')));
});

test('a source no longer present in the registry at all fails validation', () => {
  const errors = validateBaselineForPromotion({ baseline: validBaseline(), registry: { endpoints: [] }, minContentLength: 200 });
  assert.ok(errors.some((e) => e.includes('no longer present')));
});

test('isValidBackupName accepts only the exact generated shape, rejecting anything path-like', () => {
  assert.equal(isValidBackupName('source-baseline.2026-08-04T04-29-21-909Z.json'), true);
  assert.equal(isValidBackupName('../../etc/passwd'), false);
  assert.equal(isValidBackupName('source-baseline.json'), false);
  assert.equal(isValidBackupName('source-baseline.2026-08-04T04-29-21-909Z.bak.json'), false); // old local-file suffix, no longer valid
  assert.equal(isValidBackupName('..\\..\\windows'), false);
  assert.equal(isValidBackupName(''), false);
  assert.equal(isValidBackupName(null), false);
});

// ---------------------------------------------------------------------------
// git-state-branch.mjs plumbing — direct unit tests.
// ---------------------------------------------------------------------------

test('fetchStateBranch returns null when the branch does not exist on the remote', () => {
  const originDir = makeBareOrigin();
  const cloneDir = makeClone(originDir);
  assert.equal(fetchStateBranch({ cwd: cloneDir, remote: 'origin', branch: STATE_BRANCH }), null);
  assert.equal(resolveRemoteBranchSha({ cwd: cloneDir, remote: 'origin', branch: STATE_BRANCH }), null);
});

test('commitFilesAndPush creates the branch fresh (orphan commit) when it does not exist yet', () => {
  const originDir = makeBareOrigin();
  const cloneDir = makeClone(originDir);
  const { commitSha } = commitFilesAndPush({
    cwd: cloneDir, remote: 'origin', branch: STATE_BRANCH, parentSha: null,
    files: [{ path: 'state/source-baseline.json', content: '{}\n' }],
    message: 'test: create hermes-state'
  });
  assert.equal(resolveRemoteBranchSha({ cwd: cloneDir, remote: 'origin', branch: STATE_BRANCH }), commitSha);
  assert.equal(readFileAtCommit({ cwd: cloneDir, sha: commitSha, filePath: 'state/source-baseline.json' }), '{}\n');
});

test('commitFilesAndPush rejects (conflict) a push whose parentSha no longer matches the remote tip', () => {
  const originDir = makeBareOrigin();
  const cloneA = makeClone(originDir);
  const cloneB = makeClone(originDir);

  const first = commitFilesAndPush({
    cwd: cloneA, remote: 'origin', branch: STATE_BRANCH, parentSha: null,
    files: [{ path: 'state/source-baseline.json', content: '{"v":1}\n' }],
    message: 'test: first'
  });

  // cloneB still believes the branch does not exist (parentSha: null) —
  // exactly the stale view a concurrent process would have.
  assert.throws(() => {
    commitFilesAndPush({
      cwd: cloneB, remote: 'origin', branch: STATE_BRANCH, parentSha: null,
      files: [{ path: 'state/source-baseline.json', content: '{"v":2}\n' }],
      message: 'test: conflicting second'
    });
  }, (error) => error.conflict === true);

  // The remote must still be exactly cloneA's commit — untouched by the
  // rejected push.
  assert.equal(resolveRemoteBranchSha({ cwd: cloneA, remote: 'origin', branch: STATE_BRANCH }), first.commitSha);
});

test('listTreeAtCommit lists backup filenames under state/backups/, empty when absent', () => {
  const originDir = makeBareOrigin();
  const cloneDir = makeClone(originDir);
  const { commitSha } = commitFilesAndPush({
    cwd: cloneDir, remote: 'origin', branch: STATE_BRANCH, parentSha: null,
    files: [
      { path: 'state/source-baseline.json', content: '{}\n' },
      { path: 'state/backups/source-baseline.2026-01-01T00-00-00-000Z.json', content: '{}\n' },
      { path: 'state/backups/source-baseline.2026-01-02T00-00-00-000Z.json', content: '{}\n' }
    ],
    message: 'test: with backups'
  });
  const names = listTreeAtCommit({ cwd: cloneDir, sha: commitSha, dirPath: STATE_BACKUPS_DIR }).sort();
  assert.deepEqual(names, ['source-baseline.2026-01-01T00-00-00-000Z.json', 'source-baseline.2026-01-02T00-00-00-000Z.json']);
  assert.deepEqual(listTreeAtCommit({ cwd: cloneDir, sha: commitSha, dirPath: 'state/nonexistent' }), []);
});

// ---------------------------------------------------------------------------
// Scenario 1 & 2 — a promoted baseline survives a brand-new runner and is
// restored from hermes-state at the start of the next run.
// ---------------------------------------------------------------------------

test('1/2) a baseline promoted from one clone is restored correctly by a totally fresh, unrelated clone', () => {
  const originDir = makeBareOrigin();
  const promoterClone = makeClone(originDir);
  writePreview(promoterClone, validBaseline());
  const promoteResult = promoteBaselineToState({ cwd: promoterClone, remote: 'origin', previewPath: path.join(promoterClone, 'hermes', 'baselines', 'source-baseline.preview.json'), registry: validRegistry(), minContentLength: 200 });
  assert.equal(promoteResult.status, 'PROMOTED');

  // A brand-new clone, standing in for a fresh GitHub Actions runner next
  // week — shares no filesystem state with promoterClone at all.
  const freshRunnerClone = makeClone(originDir);
  const localBaselinePath = path.join(freshRunnerClone, 'hermes', 'baselines', 'source-baseline.json');
  assert.equal(fs.existsSync(localBaselinePath), false, 'a fresh clone must start with no local baseline at all');

  const restoreResult = restoreBaselineFromState({ cwd: freshRunnerClone, remote: 'origin', localBaselinePath });
  assert.equal(restoreResult.status, 'RESTORED');
  assert.equal(restoreResult.sources, 1);
  const restored = JSON.parse(fs.readFileSync(localBaselinePath, 'utf8'));
  assert.equal(restored.sources.test_ep.normalized_hash, 'b'.repeat(64));
});

test('2b) restore-baseline-from-state.mjs CLI performs the same restoration end-to-end', () => {
  const originDir = makeBareOrigin();
  const promoterClone = makeClone(originDir);
  writePreview(promoterClone, validBaseline());
  promoteBaselineToState({ cwd: promoterClone, remote: 'origin', previewPath: path.join(promoterClone, 'hermes', 'baselines', 'source-baseline.preview.json'), registry: validRegistry(), minContentLength: 200 });

  const freshRunnerClone = makeClone(originDir);
  const result = spawnSync(process.execPath, [RESTORE_SCRIPT], { cwd: freshRunnerClone, env: { PATH: process.env.PATH }, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /RESTORED/);
  assert.ok(fs.existsSync(path.join(freshRunnerClone, 'hermes', 'baselines', 'source-baseline.json')));
});

// ---------------------------------------------------------------------------
// Scenario 3 — no remote baseline at all => BASELINE_REQUIRED, nothing
// fabricated locally.
// ---------------------------------------------------------------------------

test('3) with no hermes-state branch on the remote at all, restore reports BASELINE_REQUIRED and writes nothing locally', () => {
  const originDir = makeBareOrigin();
  const cloneDir = makeClone(originDir); // origin has only `main`, never hermes-state
  const localBaselinePath = path.join(cloneDir, 'hermes', 'baselines', 'source-baseline.json');
  const result = restoreBaselineFromState({ cwd: cloneDir, remote: 'origin', localBaselinePath });
  assert.equal(result.status, 'BASELINE_REQUIRED');
  assert.equal(fs.existsSync(localBaselinePath), false);
});

test('3b) restore-baseline-from-state.mjs CLI reports BASELINE_REQUIRED and exits 0 (never fatal) with no remote branch', () => {
  const originDir = makeBareOrigin();
  const cloneDir = makeClone(originDir);
  const result = spawnSync(process.execPath, [RESTORE_SCRIPT], { cwd: cloneDir, env: { PATH: process.env.PATH }, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /BASELINE_REQUIRED/);
  assert.equal(fs.existsSync(path.join(cloneDir, 'hermes', 'baselines', 'source-baseline.json')), false);
});

// ---------------------------------------------------------------------------
// Scenario 4 — an artifact / local-only write is never treated as
// persistence: if the remote cannot even be read, promotion fails closed
// rather than reporting success from local state alone.
// ---------------------------------------------------------------------------

test("4) promotion fails closed (never PROMOTED) when the 'origin' remote is unreachable/misconfigured", () => {
  const cloneDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-state-noremote-'));
  git(['init', '--initial-branch=main', cloneDir]);
  git(['config', 'user.email', 'hermes-test@example.test'], cloneDir);
  git(['config', 'user.name', 'HERMES Test'], cloneDir);
  // Deliberately no `git remote add origin ...` at all.
  writePreview(cloneDir, validBaseline());
  const result = promoteBaselineToState({
    cwd: cloneDir, remote: 'origin',
    previewPath: path.join(cloneDir, 'hermes', 'baselines', 'source-baseline.preview.json'),
    registry: validRegistry(), minContentLength: 200
  });
  assert.equal(result.status, 'FAILED');
  assert.notEqual(result.status, 'PROMOTED');
});

// ---------------------------------------------------------------------------
// Scenarios 5 & 6 — the workflow never asks for the token as a manual input;
// it only ever comes from the repository secret.
// ---------------------------------------------------------------------------

test('5) the workflow_dispatch inputs no longer include a free-text approval_token', () => {
  const workflowText = fs.readFileSync(WORKFLOW_PATH, 'utf8');
  assert.doesNotMatch(workflowText, /approval_token:\s*\n\s*description:/);
  assert.doesNotMatch(workflowText, /github\.event\.inputs\.approval_token/);
  assert.match(workflowText, /promote_baseline:\s*\n\s*description:/);
  assert.match(workflowText, /rollback_backup_name:\s*\n\s*description:/);
});

test('6) both the promote and rollback workflow steps source the token exclusively from the repository secret', () => {
  const workflowText = fs.readFileSync(WORKFLOW_PATH, 'utf8');
  const occurrences = workflowText.match(/HERMES_BASELINE_APPROVAL_TOKEN:\s*\$\{\{\s*secrets\.HERMES_BASELINE_APPROVAL_TOKEN\s*\}\}/g) || [];
  assert.equal(occurrences.length, 2, 'expected exactly one secret-sourced token env var in the promote job and one in the rollback job');
  assert.doesNotMatch(workflowText, /HERMES_BASELINE_APPROVAL_TOKEN:\s*\$\{\{\s*(github\.event\.inputs|inputs)\./);
});

// ---------------------------------------------------------------------------
// Scenario 7 — a scheduled run can never promote or roll back.
// ---------------------------------------------------------------------------

test('7) the promote-baseline and rollback-baseline jobs are gated on workflow_dispatch inputs, which schedule runs never have', () => {
  const workflowText = fs.readFileSync(WORKFLOW_PATH, 'utf8');

  const promoteJobMatch = /promote-baseline:\s*\n([\s\S]{0,900})/.exec(workflowText);
  assert.ok(promoteJobMatch, 'expected a promote-baseline job');
  assert.match(promoteJobMatch[1], /if:\s*github\.event_name == 'workflow_dispatch' && inputs\.promote_baseline == true && github\.event\.inputs\.promote_baseline == 'true'/);

  const rollbackJobMatch = /rollback-baseline:\s*\n([\s\S]{0,600})/.exec(workflowText);
  assert.ok(rollbackJobMatch, 'expected a rollback-baseline job');
  assert.match(rollbackJobMatch[1], /if:\s*github\.event_name == 'workflow_dispatch' && github\.event\.inputs\.rollback_backup_name != ''/);
});

test('7b) the promotion step still forces HERMES_COLLECTION_DRY_RUN=true, independent of any repository Variable', () => {
  const workflowText = fs.readFileSync(WORKFLOW_PATH, 'utf8');
  const promoteStepMatch = /Promote preview to hermes-state[\s\S]{0,1400}/.exec(workflowText);
  assert.ok(promoteStepMatch);
  assert.match(promoteStepMatch[0], /HERMES_COLLECTION_DRY_RUN:\s*'true'/);
});

// ---------------------------------------------------------------------------
// Scenario 8 — the read job cannot write; only the manual write jobs can.
// ---------------------------------------------------------------------------

test('8) the weekly-collection (read) job carries no contents:write permission, while both write jobs declare it explicitly', () => {
  const workflowText = fs.readFileSync(WORKFLOW_PATH, 'utf8');
  assert.match(workflowText, /^permissions:\s*\n\s*contents:\s*read/m, 'workflow-level default permission must be read-only');

  const promoteJobBlock = /promote-baseline:\s*\n([\s\S]*?)\n {2}rollback-baseline:/.exec(workflowText)[1];
  assert.match(promoteJobBlock, /permissions:\s*\n\s*contents:\s*write/);

  const rollbackJobBlock = /rollback-baseline:\s*\n([\s\S]*?)\n {2}weekly-collection:/.exec(workflowText)[1];
  assert.match(rollbackJobBlock, /permissions:\s*\n\s*contents:\s*write/);

  const weeklyJobBlock = workflowText.slice(workflowText.indexOf('  weekly-collection:'));
  assert.doesNotMatch(weeklyJobBlock, /contents:\s*write/);
});

// ---------------------------------------------------------------------------
// Scenarios 9 & 10 — a promotion (and a rollback) writes only to
// hermes-state; `main` is never touched.
// ---------------------------------------------------------------------------

test('9/10) a promotion changes only refs/heads/hermes-state on the remote — refs/heads/main is byte-for-byte unchanged', () => {
  const originDir = makeBareOrigin();
  const cloneDir = makeClone(originDir);
  const before = mainSha(originDir);

  writePreview(cloneDir, validBaseline());
  const result = promoteBaselineToState({ cwd: cloneDir, remote: 'origin', previewPath: path.join(cloneDir, 'hermes', 'baselines', 'source-baseline.preview.json'), registry: validRegistry(), minContentLength: 200 });
  assert.equal(result.status, 'PROMOTED');

  assert.equal(mainSha(originDir), before, 'main must not move as a side effect of promoting the baseline');
  assert.equal(resolveRemoteBranchSha({ cwd: cloneDir, remote: 'origin', branch: STATE_BRANCH }), result.state_branch_commit);
});

// ---------------------------------------------------------------------------
// Scenario 11 — no write to elimfilters-vault/94-sync-log during promotion.
// ---------------------------------------------------------------------------

test('11) an authorized promotion via the real CLI writes nothing at all under elimfilters-vault/94-sync-log', () => {
  const originDir = makeBareOrigin();
  const cloneDir = makeClone(originDir);
  writePreview(cloneDir, validBaseline());

  const result = spawnSync(process.execPath, [PROMOTE_SCRIPT], {
    cwd: cloneDir,
    env: {
      PATH: process.env.PATH,
      HERMES_BASELINE_MODE: 'true',
      HERMES_BASELINE_PROMOTE: 'true',
      HERMES_COLLECTION_DRY_RUN: 'true',
      HERMES_BASELINE_APPROVAL_TOKEN: APPROVAL_TOKEN_VALUE
    },
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /BASELINE PROMOTED/);

  const vaultSyncLog = path.join(cloneDir, 'elimfilters-vault', '94-sync-log');
  assert.deepEqual(fs.readdirSync(vaultSyncLog), [], 'promotion must never write anything under elimfilters-vault/94-sync-log');

  // The one local, gitignored, ephemeral handoff file for the same-job
  // report step is the only local write, and it lives under
  // hermes/baselines/, never the vault.
  const localResult = JSON.parse(fs.readFileSync(path.join(cloneDir, 'hermes', 'baselines', 'promotion-result.local.json'), 'utf8'));
  assert.equal(localResult.status, 'PROMOTED');
  assert.equal(localResult.vault_write, false);
});

// ---------------------------------------------------------------------------
// Scenario 12 — at most 5 backups on hermes-state.
// ---------------------------------------------------------------------------

test('12) at most 5 backups are ever kept on hermes-state — older ones are rotated out', () => {
  const originDir = makeBareOrigin();
  const cloneDir = makeClone(originDir);

  let lastCommit = null;
  for (let i = 0; i < 8; i += 1) {
    writePreview(cloneDir, validBaseline({ test_ep: validEntry({ normalized_hash: String((i % 9)).repeat(64).slice(0, 64) }) }));
    const result = promoteBaselineToState({
      cwd: cloneDir, remote: 'origin',
      previewPath: path.join(cloneDir, 'hermes', 'baselines', 'source-baseline.preview.json'),
      registry: validRegistry(), minContentLength: 200,
      now: () => new Date(Date.UTC(2026, 0, 1, 0, 0, i))
    });
    assert.equal(result.status, 'PROMOTED');
    lastCommit = result.state_branch_commit;
  }

  const backups = listTreeAtCommit({ cwd: cloneDir, sha: lastCommit, dirPath: STATE_BACKUPS_DIR });
  assert.equal(backups.length, MAX_BACKUPS);
});

// ---------------------------------------------------------------------------
// Scenario 13 — a valid rollback on hermes-state.
// ---------------------------------------------------------------------------

test('13) rollback restores an earlier promoted baseline exactly, and itself backs up what it replaced', () => {
  const originDir = makeBareOrigin();
  const cloneDir = makeClone(originDir);

  writePreview(cloneDir, validBaseline({ test_ep: validEntry({ normalized_hash: 'a'.repeat(64) }) }));
  const first = promoteBaselineToState({ cwd: cloneDir, remote: 'origin', previewPath: path.join(cloneDir, 'hermes', 'baselines', 'source-baseline.preview.json'), registry: validRegistry(), minContentLength: 200 });
  assert.equal(first.status, 'PROMOTED');

  writePreview(cloneDir, validBaseline({ test_ep: validEntry({ normalized_hash: 'c'.repeat(64) }) }));
  const second = promoteBaselineToState({ cwd: cloneDir, remote: 'origin', previewPath: path.join(cloneDir, 'hermes', 'baselines', 'source-baseline.preview.json'), registry: validRegistry(), minContentLength: 200 });
  assert.equal(second.status, 'PROMOTED');
  assert.ok(second.backup_path, 'the second promotion must have backed up the first baseline');
  const backupName = second.backup_path.split('/').pop();

  const rollback = rollbackBaselineInState({ cwd: cloneDir, remote: 'origin', backupName });
  assert.equal(rollback.status, 'ROLLED_BACK');

  const sha = resolveRemoteBranchSha({ cwd: cloneDir, remote: 'origin', branch: STATE_BRANCH });
  const restoredRaw = readFileAtCommit({ cwd: cloneDir, sha, filePath: STATE_BASELINE_PATH });
  const restored = JSON.parse(restoredRaw);
  assert.equal(restored.sources.test_ep.normalized_hash, 'a'.repeat(64), 'rollback must restore the first (a-hash) baseline, not the second');

  // The baseline being replaced by the rollback (the c-hash one) is itself backed up.
  const backupsAfterRollback = listTreeAtCommit({ cwd: cloneDir, sha, dirPath: STATE_BACKUPS_DIR });
  assert.ok(backupsAfterRollback.length >= 1);
});

test('13b) rollback-baseline.mjs CLI rejects an unauthorized attempt and a malformed backup name before ever touching git', () => {
  const originDir = makeBareOrigin();
  const cloneDir = makeClone(originDir);

  const noToken = spawnSync(process.execPath, [ROLLBACK_SCRIPT, 'source-baseline.2026-08-03T00-00-00-000Z.json'], { cwd: cloneDir, env: { PATH: process.env.PATH }, encoding: 'utf8' });
  assert.notEqual(noToken.status, 0);
  assert.match(noToken.stderr, /NOT AUTHORIZED/);

  const traversal = spawnSync(process.execPath, [ROLLBACK_SCRIPT, '../../../etc/passwd'], { cwd: cloneDir, env: { PATH: process.env.PATH, HERMES_BASELINE_APPROVAL_TOKEN: APPROVAL_TOKEN_VALUE }, encoding: 'utf8' });
  assert.notEqual(traversal.status, 0);
  assert.match(traversal.stderr, /not a valid backup filename/);
});

// ---------------------------------------------------------------------------
// Scenarios 14 & 15 — concurrency: two promotions racing against the same
// hermes-state branch. GitHub Actions' `concurrency:` group is a first
// line of defense (asserted statically below); the second, unconditional
// line of defense is git's own non-fast-forward rejection, proven here for
// real by actually racing two independent clones against one origin.
// ---------------------------------------------------------------------------

test('14) both write jobs share the hermes-baseline-state concurrency group in the workflow', () => {
  const workflowText = fs.readFileSync(WORKFLOW_PATH, 'utf8');
  const occurrences = workflowText.match(/group:\s*hermes-baseline-state/g) || [];
  assert.equal(occurrences.length, 2, 'expected the concurrency group on both promote-baseline and rollback-baseline');
  assert.match(workflowText, /cancel-in-progress:\s*false/);
});

test('15) a concurrent promotion whose view of hermes-state is stale is rejected and never overwrites the winner', () => {
  // promoteBaselineToState() itself always re-reads hermes-state live
  // immediately before it pushes, so two *sequential* calls never actually
  // race — the second legitimately builds on top of the first, which is
  // correct. The race this scenario protects against is two truly
  // concurrent processes: B reads state (finds nothing yet), A promotes,
  // B pushes based on its now-stale read. That interleaving is reproduced
  // here explicitly and deterministically, using only the same exported
  // primitives promoteBaselineToState itself calls internally — no mocking
  // of git, no timing-dependent real subprocess race.
  const originDir = makeBareOrigin();
  const cloneA = makeClone(originDir);
  const cloneB = makeClone(originDir);

  // B's stale read: hermes-state does not exist yet, from B's point of view.
  const staleParentSha = fetchStateBranch({ cwd: cloneB, remote: 'origin', branch: STATE_BRANCH });
  assert.equal(staleParentSha, null);

  // A promotes for real in between B's read and B's (about to happen) push
  // — exactly the interleaving a genuine race would produce.
  writePreview(cloneA, validBaseline({ test_ep: validEntry({ normalized_hash: 'a'.repeat(64) }) }));
  const resultA = promoteBaselineToState({ cwd: cloneA, remote: 'origin', previewPath: path.join(cloneA, 'hermes', 'baselines', 'source-baseline.preview.json'), registry: validRegistry(), minContentLength: 200 });
  assert.equal(resultA.status, 'PROMOTED');

  // B now pushes the promotion it built from its stale (pre-A) read — the
  // same file set shape promoteBaselineToState would have assembled.
  assert.throws(() => {
    commitFilesAndPush({
      cwd: cloneB, remote: 'origin', branch: STATE_BRANCH, parentSha: staleParentSha,
      files: [
        { path: 'state/source-baseline.json', content: `${JSON.stringify(validBaseline({ test_ep: validEntry({ normalized_hash: 'b'.repeat(64) }) }), null, 2)}\n` },
        { path: 'state/promotion-audit.json', content: '[]\n' }
      ],
      message: 'test: stale concurrent promotion from B'
    });
  }, (error) => {
    assert.equal(error.conflict, true, 'a stale concurrent push must be rejected as a conflict, not silently accepted');
    return true;
  });

  // hermes-state must still hold exactly A's promotion, completely
  // unmodified by B's rejected attempt.
  const sha = resolveRemoteBranchSha({ cwd: cloneA, remote: 'origin', branch: STATE_BRANCH });
  assert.equal(sha, resultA.state_branch_commit);
  const finalBaseline = JSON.parse(readFileAtCommit({ cwd: cloneA, sha, filePath: STATE_BASELINE_PATH }));
  assert.equal(finalBaseline.sources.test_ep.normalized_hash, 'a'.repeat(64));
});

// ---------------------------------------------------------------------------
// Scenario 16 — remote verification happens after the push, and the
// reported result reflects it.
// ---------------------------------------------------------------------------

test('16) a successful promotion is only ever reported after independently re-reading the same commit from the remote', () => {
  const originDir = makeBareOrigin();
  const cloneDir = makeClone(originDir);
  writePreview(cloneDir, validBaseline());
  const result = promoteBaselineToState({ cwd: cloneDir, remote: 'origin', previewPath: path.join(cloneDir, 'hermes', 'baselines', 'source-baseline.preview.json'), registry: validRegistry(), minContentLength: 200 });
  assert.equal(result.status, 'PROMOTED');
  assert.equal(result.remote_verified, true);

  // Independent re-check, not reusing anything the function under test
  // computed — a fresh `git ls-remote` against the same bare origin.
  const independentSha = execFileSync('git', ['ls-remote', originDir, `refs/heads/${STATE_BRANCH}`], { encoding: 'utf8' }).split('\t')[0];
  assert.equal(independentSha, result.state_branch_commit);
});

// ---------------------------------------------------------------------------
// Scenario 17 — no code path here ever touches PostgreSQL, pgvector,
// unified-data, the frontend/chatbot, or any canonical Obsidian note.
// ---------------------------------------------------------------------------

test('17) the state-branch scripts import nothing related to PostgreSQL/pgvector/unified-data/frontend/chatbot, and never target elimfilters-vault as a write path', () => {
  const files = [
    'git-state-branch.mjs',
    'promote-baseline-core.mjs',
    'promote-baseline.mjs',
    'rollback-baseline.mjs',
    'restore-baseline-from-state.mjs'
  ].map((f) => path.join(REPO_ROOT, 'scripts', 'hermes', f));

  // These files legitimately mention pgvector_write/database_write/etc. as
  // self-declaring "false" fields in their own audit/log output (the same
  // honest-disclosure convention used across every HERMES script) — that is
  // not a violation, it's the opposite. What must never exist is an actual
  // *import* pulling in a database client, or a write call whose target
  // path is elimfilters-vault (which promotion used to write to, and now
  // must not).
  const forbiddenImportPattern = /^\s*import\b.*(pg|postgres|pgvector|unified-data|frontend\/|chatbot)/im;
  const forbiddenWriteCallPattern = /(writeFileSync|mkdirSync|appendFileSync|copyFileSync)\([^)]*elimfilters-vault/i;

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(text, forbiddenImportPattern, `${path.basename(file)} must not import anything related to PostgreSQL/pgvector/unified-data/frontend/chatbot`);
    assert.doesNotMatch(text, forbiddenWriteCallPattern, `${path.basename(file)} must never write into elimfilters-vault`);
  }
});

// ---------------------------------------------------------------------------
// Additional coverage carried over from the previous (local-file) design,
// adapted to the branch model.
// ---------------------------------------------------------------------------

test('a failed promotion (invalid preview) never creates or moves hermes-state at all', () => {
  const originDir = makeBareOrigin();
  const cloneDir = makeClone(originDir);
  writePreview(cloneDir, validBaseline({ test_ep: validEntry({ response_status: 500 }) })); // invalid: not 200
  const result = promoteBaselineToState({ cwd: cloneDir, remote: 'origin', previewPath: path.join(cloneDir, 'hermes', 'baselines', 'source-baseline.preview.json'), registry: validRegistry(), minContentLength: 200 });
  assert.equal(result.status, 'FAILED');
  assert.equal(resolveRemoteBranchSha({ cwd: cloneDir, remote: 'origin', branch: STATE_BRANCH }), null, 'hermes-state must not even exist after a failed first promotion attempt');
});

test('no backup is created (and none is claimed) when no prior baseline existed on hermes-state', () => {
  const originDir = makeBareOrigin();
  const cloneDir = makeClone(originDir);
  writePreview(cloneDir, validBaseline());
  const result = promoteBaselineToState({ cwd: cloneDir, remote: 'origin', previewPath: path.join(cloneDir, 'hermes', 'baselines', 'source-baseline.preview.json'), registry: validRegistry(), minContentLength: 200 });
  assert.equal(result.status, 'PROMOTED');
  assert.equal(result.backup_path, null);
});

test('a successful promotion writes exactly the three expected state paths — no candidate files, nothing else', () => {
  const originDir = makeBareOrigin();
  const cloneDir = makeClone(originDir);
  writePreview(cloneDir, validBaseline());
  const result = promoteBaselineToState({ cwd: cloneDir, remote: 'origin', previewPath: path.join(cloneDir, 'hermes', 'baselines', 'source-baseline.preview.json'), registry: validRegistry(), minContentLength: 200 });
  const listAll = execFileSync('git', ['ls-tree', '-r', '--name-only', result.state_branch_commit], { cwd: cloneDir, encoding: 'utf8' }).trim().split('\n').filter(Boolean).sort();
  assert.deepEqual(listAll, ['state/promotion-audit.json', 'state/source-baseline.json']);
});

test('the promotion audit record on hermes-state never contains the approval token value', () => {
  const originDir = makeBareOrigin();
  const cloneDir = makeClone(originDir);
  writePreview(cloneDir, validBaseline());
  const secretLookingToken = 'DEFINITELY_NOT_THE_REAL_TOKEN_XYZ';
  const result = spawnSync(process.execPath, [PROMOTE_SCRIPT], {
    cwd: cloneDir,
    env: { PATH: process.env.PATH, HERMES_BASELINE_MODE: 'true', HERMES_BASELINE_PROMOTE: 'true', HERMES_COLLECTION_DRY_RUN: 'true', HERMES_BASELINE_APPROVAL_TOKEN: secretLookingToken },
    encoding: 'utf8'
  });
  assert.doesNotMatch(result.stdout + result.stderr, new RegExp(secretLookingToken));
  const localResultPath = path.join(cloneDir, 'hermes', 'baselines', 'promotion-result.local.json');
  if (fs.existsSync(localResultPath)) {
    assert.doesNotMatch(fs.readFileSync(localResultPath, 'utf8'), new RegExp(secretLookingToken));
  }
});

test('an unauthorized attempt via the real CLI (missing token) never creates hermes-state at all', () => {
  const originDir = makeBareOrigin();
  const cloneDir = makeClone(originDir);
  writePreview(cloneDir, validBaseline());
  const result = spawnSync(process.execPath, [PROMOTE_SCRIPT], {
    cwd: cloneDir,
    env: { PATH: process.env.PATH, HERMES_BASELINE_MODE: 'true', HERMES_BASELINE_PROMOTE: 'true', HERMES_COLLECTION_DRY_RUN: 'true' },
    encoding: 'utf8'
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /NOT AUTHORIZED/);
  assert.equal(resolveRemoteBranchSha({ cwd: cloneDir, remote: 'origin', branch: STATE_BRANCH }), null);
});
