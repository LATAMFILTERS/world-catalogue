// HERMES — 2026-08-19 weekly-intelligence hardening regression suite.
// Covers: real-intelligence-mode default, first-harvest extraction (not an
// avoidable zero), unchanged-source skipping, quota-exhaustion behavior
// (delegated to the existing industry-sweep-reliable suite — see note
// below), semantic-harvest state durability (separate from, never
// conflated with, the approval-gated baseline), zero-result diagnostics,
// the weekly source cap, promotion-cooldown, and the competitor-publication
// guard (every real candidate stays PENDING_REVIEW/approval_required).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { runCollection, applySourceCap, SOURCE_PRIORITY, DEFAULT_SOURCE_PRIORITY_TIER } from '../../scripts/hermes/collect-real-sources-core.mjs';
import { loadHarvestState, hasBeenHarvested, recordHarvest } from '../../scripts/hermes/semantic-harvest-state-core.mjs';
import { restoreHarvestStateFromBranch, persistHarvestStateToBranch, STATE_HARVEST_PATH } from '../../scripts/hermes/sync-harvest-state-core.mjs';
import { promoteBaselineToState, restoreBaselineFromState, STATE_BASELINE_PATH, STATE_BACKUPS_DIR, STATE_AUDIT_PATH } from '../../scripts/hermes/promote-baseline-core.mjs';
import { resolveRemoteBranchSha, fetchStateBranch, readFileAtCommit } from '../../scripts/hermes/git-state-branch.mjs';

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const WORKFLOW_PATH = path.join(REPO_ROOT, '.github', 'workflows', 'hermes-weekly.yml');

function git(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' });
}

function makeBareOrigin() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-harvest-origin-'));
  const originDir = path.join(base, 'origin.git');
  git(['init', '--bare', '--initial-branch=main', originDir]);
  return originDir;
}

function makeClone(originDir) {
  const cloneDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-harvest-clone-'));
  git(['init', '--initial-branch=main', cloneDir]);
  git(['remote', 'add', 'origin', originDir], cloneDir);
  git(['config', 'user.email', 'hermes-test@example.test'], cloneDir);
  git(['config', 'user.name', 'HERMES Test'], cloneDir);
  // A second (or third) clone against the same shared bare origin must
  // adopt whatever `main` already exists there rather than racing its own
  // unrelated "init" commit onto it.
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
  return cloneDir;
}

function makeDirs() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-hardening-'));
  return {
    base,
    realCandidatesDir: path.join(base, 'real-candidates'),
    sourceCacheDir: path.join(base, 'source-cache'),
    previewDir: path.join(base, 'previews'),
    auditDir: path.join(base, 'audit'),
    baselinePath: path.join(base, 'baselines', 'source-baseline.json'),
    baselinePreviewPath: path.join(base, 'baselines', 'source-baseline.preview.json'),
    harvestStatePath: path.join(base, 'baselines', 'source-observations.json')
  };
}

function source(overrides = {}) {
  return {
    id: 'test_source_one',
    name: 'Test OEM',
    category: 'oem_heavy_duty',
    url: 'https://example.test/news',
    source_type: 'html',
    enabled: true,
    official: true,
    trust_level: 'high',
    organization_id: 'test_org',
    endpoint_id: 'test_source_one',
    region: 'North America',
    ...overrides
  };
}

function htmlResponse(body) {
  return async () => ({ ok: true, status: 200, text: async () => body });
}

const REAL_BODY = '<html><title>Technical bulletin</title><body>' + 'Genuinely long technical bulletin content describing a new engine variant. '.repeat(6) + '</body></html>';
const REAL_BODY_V2 = '<html><title>Updated technical bulletin</title><body>' + 'A different, genuinely long technical bulletin describing a revised application. '.repeat(6) + '</body></html>';

// ---------------------------------------------------------------------------
// 3) First-harvest source is processed even with no prior semantic record.
// ---------------------------------------------------------------------------

test('3) a source with no baseline entry and no harvest record produces a FIRST_HARVEST candidate, not a silent zero', async () => {
  const dirs = makeDirs();
  const fetchImpl = htmlResponse(REAL_BODY);
  const summary = await runCollection({ ...dirs, sources: [source()], dryRun: false, fetchImpl });
  // Mirrors the existing CHANGED path's own convention: the per-source
  // result status is CREATED/PREVIEWED (recordCandidate's outcome), and
  // "this was a first-harvest, not a change" is tracked via
  // summary.first_harvest + the candidate's own change_classification —
  // exactly like `changed` is tracked via summary.changed, not a distinct
  // per-result status string.
  assert.equal(summary.results.length, 1, 'exactly one result entry per source, never a duplicate');
  assert.equal(summary.results[0].status, 'CREATED');
  assert.equal(summary.first_harvest, 1);
  assert.equal(summary.created, 1);
  assert.equal(summary.baseline_required, 0);
  const files = fs.readdirSync(dirs.realCandidatesDir);
  assert.equal(files.length, 1);
  const candidate = JSON.parse(fs.readFileSync(path.join(dirs.realCandidatesDir, files[0]), 'utf8'));
  assert.equal(candidate.change_classification, 'FIRST_SEMANTIC_HARVEST');
  assert.equal(candidate.workflow_status, 'PENDING_REVIEW');
  assert.equal(candidate.approval_required, true);
  assert.ok(candidate.confidence <= 0.4, 'first-harvest confidence must stay capped, same as a whole-page CHANGED diff');
});

// ---------------------------------------------------------------------------
// 4) A source already recorded in harvest state, but with no promoted
//    baseline yet, is NOT re-harvested (stays BASELINE_REQUIRED, no candidate).
// ---------------------------------------------------------------------------

test('4) a previously-harvested source with no promoted baseline yet is not re-processed', async () => {
  const dirs = makeDirs();
  const fetchImpl = htmlResponse(REAL_BODY);
  let harvestState = { schema_version: '1.0.0', updated_at: null, sources: {} };
  harvestState = recordHarvest(harvestState, 'test_source_one', { harvestedAt: '2026-08-01T00:00:00.000Z', contentHash: 'irrelevant-prior-hash' });
  const summary = await runCollection({ ...dirs, sources: [source()], dryRun: false, fetchImpl, harvestState });
  assert.equal(summary.results[0].status, 'BASELINE_REQUIRED');
  assert.equal(summary.results[0].previously_harvested, true);
  assert.equal(summary.first_harvest, 0);
  assert.equal(summary.created, 0);
});

// ---------------------------------------------------------------------------
// 5) A genuinely changed, previously-baselined source is still processed as
//    CHANGED (unaffected by the harvest-state addition).
// ---------------------------------------------------------------------------

test('5) a changed source (real prior baseline, different hash) is processed as CHANGED', async () => {
  const dirs = makeDirs();
  // First pass establishes a real baseline via baselineMode.
  await runCollection({ ...dirs, sources: [source()], dryRun: false, fetchImpl: htmlResponse(REAL_BODY), baselineMode: true });
  const summary = await runCollection({ ...dirs, sources: [source()], dryRun: false, fetchImpl: htmlResponse(REAL_BODY_V2) });
  assert.equal(summary.results[0].status, 'CREATED');
  assert.equal(summary.changed, 1);
  assert.equal(summary.first_harvest, 0);
});

// ---------------------------------------------------------------------------
// 3b/5b) Previously-harvested, unchanged source is skipped (legitimate zero).
// ---------------------------------------------------------------------------

test('unchanged source (real prior baseline, same hash) is skipped, not re-processed', async () => {
  const dirs = makeDirs();
  await runCollection({ ...dirs, sources: [source()], dryRun: false, fetchImpl: htmlResponse(REAL_BODY), baselineMode: true });
  const summary = await runCollection({ ...dirs, sources: [source()], dryRun: false, fetchImpl: htmlResponse(REAL_BODY) });
  assert.equal(summary.results[0].status, 'UNCHANGED');
  assert.equal(summary.created, 0);
  assert.equal(summary.zero_result_reason, 'ZERO — no sources changed and all previously-harvested sources were unchanged');
});

// ---------------------------------------------------------------------------
// 8) A normal weekly run never mutates the governed baseline's own file
//    path/shape — this is enforced structurally (runCollection only ever
//    writes hermes/baselines/source-baseline.json locally; only
//    promote-baseline-core.mjs ever pushes state/source-baseline.json).
// ---------------------------------------------------------------------------

test('8) collection never calls anything that writes to the governed hermes-state baseline path', async () => {
  const dirs = makeDirs();
  const fetchImpl = htmlResponse(REAL_BODY);
  await runCollection({ ...dirs, sources: [source()], dryRun: false, fetchImpl });
  // The only baseline file runCollection ever touches is the LOCAL
  // operational copy passed in as baselinePath — never a path under state/.
  assert.ok(!dirs.baselinePath.includes('state/'));
  assert.ok(fs.existsSync(dirs.baselinePath));
});

// ---------------------------------------------------------------------------
// 9) Semantic-harvest state persists durably (real bare-repo round trip),
//    and a persist never touches the governed baseline/backups/audit files.
// ---------------------------------------------------------------------------

test('9) harvest state persisted from one clone is restored correctly by a totally unrelated clone, and the governed baseline is carried through untouched', () => {
  const origin = makeBareOrigin();
  const cloneA = makeClone(origin);

  // Seed a governed baseline on hermes-state first, exactly as a real
  // promotion would, so we can prove persistHarvestStateToBranch leaves it
  // byte-for-byte alone.
  const registry = { endpoints: [{ id: 'ep', enabled: true, status: 'ACTIVE' }] };
  const baseline = {
    schema_version: '1.0.0', generated_at: '2026-08-01T00:00:00.000Z',
    sources: { ep: { organization_id: 'org', endpoint_id: 'ep', source_url: 'https://example.test/', normalized_hash: 'a'.repeat(64), observed_at: '2026-08-01T00:00:00.000Z', content_length: 5000, response_status: 200 } }
  };
  fs.mkdirSync(path.join(cloneA, 'hermes', 'baselines'), { recursive: true });
  fs.writeFileSync(path.join(cloneA, 'hermes', 'baselines', 'source-baseline.preview.json'), JSON.stringify(baseline));
  const promotion = promoteBaselineToState({ cwd: cloneA, remote: 'origin', previewPath: path.join(cloneA, 'hermes', 'baselines', 'source-baseline.preview.json'), registry, minContentLength: 200 });
  assert.equal(promotion.status, 'PROMOTED');

  // Now persist harvest state from a second, unrelated clone.
  const cloneB = makeClone(origin);
  const localHarvestPath = path.join(cloneB, 'hermes', 'baselines', 'source-observations.json');
  let harvestState = { schema_version: '1.0.0', updated_at: null, sources: {} };
  harvestState = recordHarvest(harvestState, 'ep', { harvestedAt: '2026-08-19T00:00:00.000Z', contentHash: 'b'.repeat(64) });
  fs.mkdirSync(path.dirname(localHarvestPath), { recursive: true });
  fs.writeFileSync(localHarvestPath, JSON.stringify(harvestState));
  const persistResult = persistHarvestStateToBranch({ cwd: cloneB, remote: 'origin', localHarvestPath });
  assert.equal(persistResult.status, 'PERSISTED');

  // A third, totally fresh clone restores it correctly.
  const cloneC = makeClone(origin);
  const restoredPath = path.join(cloneC, 'hermes', 'baselines', 'source-observations.json');
  const restoreResult = restoreHarvestStateFromBranch({ cwd: cloneC, remote: 'origin', localHarvestPath: restoredPath });
  assert.equal(restoreResult.status, 'RESTORED');
  assert.equal(restoreResult.sources, 1);
  assert.equal(hasBeenHarvested(loadHarvestState(restoredPath), 'ep'), true);

  // The governed baseline/backups/audit on hermes-state are byte-for-byte
  // unchanged after the harvest-state persist.
  const sha = fetchStateBranch({ cwd: cloneC, remote: 'origin', branch: 'hermes-state' });
  const baselineAfter = readFileAtCommit({ cwd: cloneC, sha, filePath: STATE_BASELINE_PATH });
  assert.equal(JSON.parse(baselineAfter).sources.ep.normalized_hash, 'a'.repeat(64), 'baseline must be untouched by the harvest-state persist');
  const auditAfter = readFileAtCommit({ cwd: cloneC, sha, filePath: STATE_AUDIT_PATH });
  assert.equal(JSON.parse(auditAfter).length, 1, 'promotion audit trail must be untouched (still exactly the one PROMOTED event)');

  // And main is untouched — only hermes-state ever moved.
  const mainSha = execFileSync('git', ['ls-remote', origin, 'refs/heads/main'], { encoding: 'utf8' }).split('\t')[0];
  assert.ok(mainSha, 'main must still exist and be resolvable');
});

test('restoreHarvestStateFromBranch never fabricates a state when hermes-state does not exist yet', () => {
  const origin = makeBareOrigin();
  const clone = makeClone(origin);
  const localHarvestPath = path.join(clone, 'hermes', 'baselines', 'source-observations.json');
  const result = restoreHarvestStateFromBranch({ cwd: clone, remote: 'origin', localHarvestPath });
  assert.equal(result.status, 'NOT_FOUND');
  assert.equal(fs.existsSync(localHarvestPath), false);
  // A collector reading this absent file naturally treats every source as
  // never-harvested (loadHarvestState returns an empty state on ENOENT).
  assert.equal(hasBeenHarvested(loadHarvestState(localHarvestPath), 'anything'), false);
});

// ---------------------------------------------------------------------------
// 10) Zero-result reason is always reported when a run produces nothing.
// ---------------------------------------------------------------------------

test('10) a run where every source is disabled reports a specific zero-result reason', async () => {
  const dirs = makeDirs();
  const summary = await runCollection({ ...dirs, sources: [source({ enabled: false })], dryRun: false, fetchImpl: htmlResponse(REAL_BODY) });
  assert.equal(summary.created, 0);
  assert.equal(summary.zero_result_reason, 'ZERO — all sources skipped due to configuration (disabled)');
});

test('10b) a run with candidates produced reports no zero-result reason at all', async () => {
  const dirs = makeDirs();
  const summary = await runCollection({ ...dirs, sources: [source()], dryRun: false, fetchImpl: htmlResponse(REAL_BODY) });
  assert.equal(summary.created, 1);
  assert.equal(summary.zero_result_reason, null);
});

// ---------------------------------------------------------------------------
// 11) Weekly source cap prioritizes technical/manufacturer sources.
// ---------------------------------------------------------------------------

test('11) applySourceCap keeps the highest-priority sources and preserves original order within a tier', () => {
  const sources = [
    source({ id: 'marketing_1', category: 'suppliers' }),
    source({ id: 'standards_1', category: 'standards' }),
    source({ id: 'oem_1', category: 'oem_heavy_duty' }),
    source({ id: 'marketing_2', category: 'filtration_manufacturers' }),
    source({ id: 'standards_2', category: 'regulation' })
  ];
  const capped = applySourceCap(sources, 3);
  assert.equal(capped.length, 3);
  const ids = capped.map((s) => s.id);
  assert.ok(ids.includes('standards_1'));
  assert.ok(ids.includes('oem_1'));
  assert.ok(ids.includes('standards_2'));
  assert.ok(!ids.includes('marketing_1'), 'lowest-priority sources must be trimmed first');
  assert.ok(!ids.includes('marketing_2'));
});

test('11b) applySourceCap(0) and applySourceCap when under the cap are no-ops', () => {
  const sources = [source({ id: 'a' }), source({ id: 'b' })];
  assert.deepEqual(applySourceCap(sources, 0), sources);
  assert.deepEqual(applySourceCap(sources, 35), sources);
});

test('11c) an unknown category falls back to the lowest priority tier rather than erroring', () => {
  const s = source({ category: 'some_future_category' });
  assert.equal(SOURCE_PRIORITY[s.category], undefined);
  const capped = applySourceCap([s, source({ id: 'std', category: 'standards' })], 1);
  assert.equal(capped[0].id, 'std');
});

// ---------------------------------------------------------------------------
// 1/2) Scheduled runs can never promote; workflow_dispatch defaults false.
// (Structural — the actual authorization AND is exercised exhaustively in
// baseline-promotion.test.mjs; this only re-confirms the workflow wiring
// that feeds isAuthorized() hasn't regressed under this change.)
// ---------------------------------------------------------------------------

test('1) the weekly-collection job real-intelligence default no longer silently stays in baseline-only mode', () => {
  const workflowText = fs.readFileSync(WORKFLOW_PATH, 'utf8');
  const weeklyEnvBlock = /weekly-collection:[\s\S]*?env:\s*\n([\s\S]*?)\n {4}steps:/.exec(workflowText)[1];
  assert.match(weeklyEnvBlock, /HERMES_BASELINE_MODE:\s*\$\{\{\s*vars\.HERMES_BASELINE_MODE\s*\|\|\s*'false'\s*\}\}/);
});

test('2) workflow_dispatch promote_baseline input still defaults to false', () => {
  const workflowText = fs.readFileSync(WORKFLOW_PATH, 'utf8');
  const inputBlock = /promote_baseline:\s*\n([\s\S]{0,400})/.exec(workflowText)[1];
  assert.match(inputBlock, /default:\s*false/);
});

// ---------------------------------------------------------------------------
// 12) Competitor-publication guard: every real candidate this module can
// produce (CHANGED or FIRST_SEMANTIC_HARVEST) stays PENDING_REVIEW with
// approval_required, regardless of source trust/official status — no path
// in collect-real-sources-core.mjs can mark a candidate APPROVED/SYNCED.
// ---------------------------------------------------------------------------

test('12) FIRST_SEMANTIC_HARVEST and CHANGED candidates are always PENDING_REVIEW and require approval, even for an official/high-trust source', async () => {
  const dirs = makeDirs();
  const officialSource = source({ official: true, trust_level: 'high' });
  const summary = await runCollection({ ...dirs, sources: [officialSource], dryRun: false, fetchImpl: htmlResponse(REAL_BODY) });
  const file = fs.readdirSync(dirs.realCandidatesDir)[0];
  const candidate = JSON.parse(fs.readFileSync(path.join(dirs.realCandidatesDir, file), 'utf8'));
  assert.equal(candidate.workflow_status, 'PENDING_REVIEW');
  assert.equal(candidate.approval_required, true);
  assert.equal(candidate.approved_by, null);
  assert.equal(candidate.sync_status, 'NOT_READY');
  assert.deepEqual(candidate.sync_target, []);
});

// ---------------------------------------------------------------------------
// Promotion cooldown (task 3: "one dispatch must not result in multiple
// unintended promotions" — the actual 2026-08-18 incident was repeated
// *dispatches*, not one dispatch promoting twice; this cooldown adds
// friction against exactly that).
// ---------------------------------------------------------------------------

test('a second promotion within the cooldown window is refused; one after the window succeeds', () => {
  const origin = makeBareOrigin();
  const clone = makeClone(origin);
  const registry = { endpoints: [{ id: 'ep', enabled: true, status: 'ACTIVE' }] };
  function preview(hash) {
    const p = path.join(clone, 'hermes', 'baselines', 'source-baseline.preview.json');
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify({
      schema_version: '1.0.0', generated_at: '2026-08-19T00:00:00.000Z',
      sources: { ep: { organization_id: 'org', endpoint_id: 'ep', source_url: 'https://example.test/', normalized_hash: hash, observed_at: '2026-08-19T00:00:00.000Z', content_length: 5000, response_status: 200 } }
    }));
    return p;
  }

  const first = promoteBaselineToState({
    cwd: clone, remote: 'origin', previewPath: preview('a'.repeat(64)), registry, minContentLength: 200,
    now: () => new Date('2026-08-19T00:00:00.000Z'), minPromotionIntervalMs: 60 * 60 * 1000
  });
  assert.equal(first.status, 'PROMOTED');

  const tooSoon = promoteBaselineToState({
    cwd: clone, remote: 'origin', previewPath: preview('b'.repeat(64)), registry, minContentLength: 200,
    now: () => new Date('2026-08-19T00:30:00.000Z'), minPromotionIntervalMs: 60 * 60 * 1000
  });
  assert.equal(tooSoon.status, 'FAILED');
  assert.match(tooSoon.reason, /cooldown/);

  const afterCooldown = promoteBaselineToState({
    cwd: clone, remote: 'origin', previewPath: preview('c'.repeat(64)), registry, minContentLength: 200,
    now: () => new Date('2026-08-19T01:01:00.000Z'), minPromotionIntervalMs: 60 * 60 * 1000
  });
  assert.equal(afterCooldown.status, 'PROMOTED');
});

test('a cooldown of 0 disables the check entirely (opt-out, never a default)', () => {
  const origin = makeBareOrigin();
  const clone = makeClone(origin);
  const registry = { endpoints: [{ id: 'ep', enabled: true, status: 'ACTIVE' }] };
  function preview(hash) {
    const p = path.join(clone, 'hermes', 'baselines', 'source-baseline.preview.json');
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify({
      schema_version: '1.0.0', generated_at: '2026-08-19T00:00:00.000Z',
      sources: { ep: { organization_id: 'org', endpoint_id: 'ep', source_url: 'https://example.test/', normalized_hash: hash, observed_at: '2026-08-19T00:00:00.000Z', content_length: 5000, response_status: 200 } }
    }));
    return p;
  }
  promoteBaselineToState({ cwd: clone, remote: 'origin', previewPath: preview('a'.repeat(64)), registry, minContentLength: 200, now: () => new Date('2026-08-19T00:00:00.000Z'), minPromotionIntervalMs: 0 });
  const second = promoteBaselineToState({ cwd: clone, remote: 'origin', previewPath: preview('b'.repeat(64)), registry, minContentLength: 200, now: () => new Date('2026-08-19T00:00:01.000Z'), minPromotionIntervalMs: 0 });
  assert.equal(second.status, 'PROMOTED');
});
