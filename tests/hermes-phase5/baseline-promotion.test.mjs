// HERMES — governed baseline promotion + rollback regression suite.
// Covers every scenario in the promotion feature's requirements list. No
// real network; every fs operation happens inside a fresh os.tmpdir()
// scratch directory, except the CLI-level tests which spawn the real
// scripts against a scratch cwd, and the one static test that reads the
// real (committed) workflow YAML to confirm scheduled runs can never
// promote.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  isAuthorized,
  validateBaselineForPromotion,
  promoteBaseline,
  rollbackBaseline,
  rotateBackups,
  APPROVAL_TOKEN_VALUE,
  MAX_BACKUPS
} from '../../scripts/hermes/promote-baseline-core.mjs';
import { EMPTY_STRING_SHA256 } from '../../scripts/hermes/source-baseline-core.mjs';

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const PROMOTE_SCRIPT = path.join(REPO_ROOT, 'scripts', 'hermes', 'promote-baseline.mjs');
const ROLLBACK_SCRIPT = path.join(REPO_ROOT, 'scripts', 'hermes', 'rollback-baseline.mjs');

function makePaths() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-baseline-promo-'));
  return {
    base,
    previewPath: path.join(base, 'baselines', 'source-baseline.preview.json'),
    realPath: path.join(base, 'baselines', 'source-baseline.json'),
    backupDir: path.join(base, 'baselines', 'backups')
  };
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

function writePreview(paths, baseline) {
  fs.mkdirSync(path.dirname(paths.previewPath), { recursive: true });
  fs.writeFileSync(paths.previewPath, JSON.stringify(baseline));
}

// 1) Promoción bloqueada por defecto.
test('1) promotion is blocked by default (no env vars set)', () => {
  assert.equal(isAuthorized({ baselineMode: false, dryRun: true, promote: false, approvalToken: '' }), false);
});

// 2) Promoción bloqueada sin token.
test('2) promotion is blocked when every mode flag is correct but the approval token is absent', () => {
  assert.equal(isAuthorized({ baselineMode: true, dryRun: true, promote: true, approvalToken: '' }), false);
});

// 3) Promoción bloqueada con token incorrecto.
test('3) promotion is blocked when the approval token is present but does not match exactly', () => {
  assert.equal(isAuthorized({ baselineMode: true, dryRun: true, promote: true, approvalToken: 'victor_abreu_approved' }), false);
  assert.equal(isAuthorized({ baselineMode: true, dryRun: true, promote: true, approvalToken: APPROVAL_TOKEN_VALUE + ' ' }), false);
});

// 4) Promoción válida con token correcto.
test('4) promotion is authorized only when all four conditions hold together', () => {
  assert.equal(isAuthorized({ baselineMode: true, dryRun: true, promote: true, approvalToken: APPROVAL_TOKEN_VALUE }), true);
  // Any single condition flipped breaks authorization.
  assert.equal(isAuthorized({ baselineMode: false, dryRun: true, promote: true, approvalToken: APPROVAL_TOKEN_VALUE }), false);
  assert.equal(isAuthorized({ baselineMode: true, dryRun: false, promote: true, approvalToken: APPROVAL_TOKEN_VALUE }), false);
  assert.equal(isAuthorized({ baselineMode: true, dryRun: true, promote: false, approvalToken: APPROVAL_TOKEN_VALUE }), false);
});

function makeCliCwd() {
  // The CLI hardcodes hermes/baselines, hermes/config, and
  // elimfilters-vault/94-sync-log relative to cwd — build that exact
  // layout under a scratch directory.
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-baseline-cli-'));
  fs.mkdirSync(path.join(base, 'hermes', 'baselines'), { recursive: true });
  fs.mkdirSync(path.join(base, 'hermes', 'config'), { recursive: true });
  fs.mkdirSync(path.join(base, 'elimfilters-vault', '94-sync-log'), { recursive: true });
  fs.writeFileSync(path.join(base, 'hermes', 'config', 'source-organizations.json'), JSON.stringify({ organizations: [] }));
  fs.writeFileSync(path.join(base, 'hermes', 'config', 'source-endpoints.json'), JSON.stringify(validRegistry()));
  fs.writeFileSync(path.join(base, 'hermes', 'baselines', 'source-baseline.preview.json'), JSON.stringify(validBaseline()));
  return base;
}

test('4b) end-to-end: an authorized promotion via the real CLI writes exactly one real baseline file and reports PROMOTED', () => {
  const cwd = makeCliCwd();
  const result = spawnSync(process.execPath, [PROMOTE_SCRIPT], {
    cwd,
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
  assert.ok(fs.existsSync(path.join(cwd, 'hermes', 'baselines', 'source-baseline.json')));
  const auditFiles = fs.readdirSync(path.join(cwd, 'elimfilters-vault', '94-sync-log')).filter((f) => /\.promotion\.json$/.test(f));
  assert.equal(auditFiles.length, 1);
  const audit = JSON.parse(fs.readFileSync(path.join(cwd, 'elimfilters-vault', '94-sync-log', auditFiles[0]), 'utf8'));
  assert.equal(audit.status, 'PROMOTED');
  assert.equal(audit.sources_promoted, 1);
});

test('4c) end-to-end: an unauthorized attempt via the real CLI (missing token) never writes the real baseline', () => {
  const cwd = makeCliCwd();
  const result = spawnSync(process.execPath, [PROMOTE_SCRIPT], {
    cwd,
    env: { PATH: process.env.PATH, HERMES_BASELINE_MODE: 'true', HERMES_BASELINE_PROMOTE: 'true', HERMES_COLLECTION_DRY_RUN: 'true' },
    encoding: 'utf8'
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /NOT AUTHORIZED/);
  assert.equal(fs.existsSync(path.join(cwd, 'hermes', 'baselines', 'source-baseline.json')), false);
});

// 5) Baseline inválido no se promueve.
test('5) an invalid baseline (missing required field) is never promoted', () => {
  const paths = makePaths();
  writePreview(paths, validBaseline({ test_ep: validEntry({ organization_id: undefined }) }));
  const result = promoteBaseline({ previewPath: paths.previewPath, realPath: paths.realPath, backupDir: paths.backupDir, registry: validRegistry(), minContentLength: 200 });
  assert.equal(result.status, 'FAILED');
  assert.ok(result.errors.some((e) => e.includes('organization_id')));
  assert.equal(fs.existsSync(paths.realPath), false);
});

// 6) Hash vacío no se promueve.
test('6) an entry whose normalized_hash is the well-known empty-content hash is never promoted', () => {
  const paths = makePaths();
  writePreview(paths, validBaseline({ test_ep: validEntry({ normalized_hash: EMPTY_STRING_SHA256 }) }));
  const errors = validateBaselineForPromotion({ baseline: validBaseline({ test_ep: validEntry({ normalized_hash: EMPTY_STRING_SHA256 }) }), registry: validRegistry(), minContentLength: 200 });
  assert.ok(errors.some((e) => e.includes('empty-content hash')));
  const result = promoteBaseline({ previewPath: paths.previewPath, realPath: paths.realPath, backupDir: paths.backupDir, registry: validRegistry(), minContentLength: 200 });
  assert.equal(result.status, 'FAILED');
});

// 7) Fuente disabled no se promueve.
test('7) a source whose registry endpoint is disabled is never promoted', () => {
  const paths = makePaths();
  writePreview(paths, validBaseline());
  const disabledRegistry = { endpoints: [{ id: 'test_ep', enabled: false, status: 'ACTIVE' }] };
  const result = promoteBaseline({ previewPath: paths.previewPath, realPath: paths.realPath, backupDir: paths.backupDir, registry: disabledRegistry, minContentLength: 200 });
  assert.equal(result.status, 'FAILED');
  assert.ok(result.errors.some((e) => e.includes('disabled')));
});

// 8) Fuente no ACTIVE no se promueve.
test('8) a source whose registry endpoint is not ACTIVE (e.g. REVIEW_REQUIRED) is never promoted', () => {
  const paths = makePaths();
  writePreview(paths, validBaseline());
  const reviewRequiredRegistry = { endpoints: [{ id: 'test_ep', enabled: false, status: 'REVIEW_REQUIRED' }] };
  const result = promoteBaseline({ previewPath: paths.previewPath, realPath: paths.realPath, backupDir: paths.backupDir, registry: reviewRequiredRegistry, minContentLength: 200 });
  assert.equal(result.status, 'FAILED');
  assert.ok(result.errors.some((e) => e.includes('not ACTIVE') || e.includes('REVIEW_REQUIRED')));
});

test('a source no longer present in the registry at all blocks the whole promotion', () => {
  const paths = makePaths();
  writePreview(paths, validBaseline());
  const result = promoteBaseline({ previewPath: paths.previewPath, realPath: paths.realPath, backupDir: paths.backupDir, registry: { endpoints: [] }, minContentLength: 200 });
  assert.equal(result.status, 'FAILED');
  assert.ok(result.errors.some((e) => e.includes('no longer present')));
});

// 9) Escritura atómica.
test('9) the real baseline is written atomically (temp file + rename) — never observed half-written', () => {
  const paths = makePaths();
  writePreview(paths, validBaseline());
  promoteBaseline({ previewPath: paths.previewPath, realPath: paths.realPath, backupDir: paths.backupDir, registry: validRegistry(), minContentLength: 200 });
  // No leftover temp file from the write.
  const dirEntries = fs.readdirSync(path.dirname(paths.realPath));
  assert.ok(!dirEntries.some((f) => f.startsWith('.tmp-')), 'no temp file should remain after a successful atomic write');
  // The written file is complete, valid JSON.
  const written = JSON.parse(fs.readFileSync(paths.realPath, 'utf8'));
  assert.equal(Object.keys(written.sources).length, 1);
});

// 10) Backup antes de reemplazo.
test('10) an existing real baseline is backed up before being replaced', () => {
  const paths = makePaths();
  fs.mkdirSync(path.dirname(paths.realPath), { recursive: true });
  fs.writeFileSync(paths.realPath, JSON.stringify({ schema_version: '1.0.0', sources: {}, marker: 'original' }));
  writePreview(paths, validBaseline());
  const result = promoteBaseline({ previewPath: paths.previewPath, realPath: paths.realPath, backupDir: paths.backupDir, registry: validRegistry(), minContentLength: 200 });
  assert.equal(result.status, 'PROMOTED');
  assert.ok(result.backup_path);
  const backedUp = JSON.parse(fs.readFileSync(result.backup_path, 'utf8'));
  assert.equal(backedUp.marker, 'original');
});

test('no backup is created (and none is claimed) when no prior real baseline existed', () => {
  const paths = makePaths();
  writePreview(paths, validBaseline());
  const result = promoteBaseline({ previewPath: paths.previewPath, realPath: paths.realPath, backupDir: paths.backupDir, registry: validRegistry(), minContentLength: 200 });
  assert.equal(result.status, 'PROMOTED');
  assert.equal(result.backup_path, null);
  assert.equal(fs.existsSync(paths.backupDir), false);
});

// 11) Máximo 5 backups.
test('11) at most 5 backups are ever kept — older ones are rotated out', () => {
  const paths = makePaths();
  fs.mkdirSync(path.dirname(paths.realPath), { recursive: true });
  fs.writeFileSync(paths.realPath, JSON.stringify({ seed: true }));
  for (let i = 0; i < 8; i += 1) {
    writePreview(paths, validBaseline({ test_ep: validEntry({ normalized_hash: (i % 9).toString().repeat(64).slice(0, 64) }) }));
    promoteBaseline({ previewPath: paths.previewPath, realPath: paths.realPath, backupDir: paths.backupDir, registry: validRegistry(), minContentLength: 200, now: () => new Date(Date.UTC(2026, 0, 1, 0, 0, i)) });
  }
  const backups = fs.readdirSync(paths.backupDir);
  assert.equal(backups.length, MAX_BACKUPS);
});

test('rotateBackups directly: keeps only the most recent maxBackups files by name order', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-rotate-'));
  const names = [];
  for (let i = 0; i < 7; i += 1) {
    const name = `source-baseline.2026-08-0${i}T00-00-00-000Z.bak.json`;
    fs.writeFileSync(path.join(dir, name), '{}');
    names.push(name);
  }
  rotateBackups(dir, 5);
  const remaining = fs.readdirSync(dir).sort();
  assert.equal(remaining.length, 5);
  assert.deepEqual(remaining, names.slice(2).sort());
});

// 12) Fallo no destruye baseline anterior.
test('12) a failed promotion (invalid preview) never touches or destroys the existing real baseline', () => {
  const paths = makePaths();
  fs.mkdirSync(path.dirname(paths.realPath), { recursive: true });
  const originalContent = JSON.stringify({ schema_version: '1.0.0', sources: { test_ep: validEntry() }, marker: 'must-survive' });
  fs.writeFileSync(paths.realPath, originalContent);
  writePreview(paths, validBaseline({ test_ep: validEntry({ response_status: 500 }) })); // invalid: not 200
  const result = promoteBaseline({ previewPath: paths.previewPath, realPath: paths.realPath, backupDir: paths.backupDir, registry: validRegistry(), minContentLength: 200 });
  assert.equal(result.status, 'FAILED');
  assert.equal(fs.readFileSync(paths.realPath, 'utf8'), originalContent, 'the real baseline must be byte-for-byte unchanged after a failed promotion');
  assert.equal(fs.existsSync(paths.backupDir), false, 'no backup should be created for a promotion that never got past validation');
});

// 13) Schedule nunca promueve (static check of the real, committed workflow).
test('13) the workflow can never promote from a scheduled run — promotion is gated on workflow_dispatch inputs, which schedule runs never have', () => {
  const workflowText = fs.readFileSync(path.join(REPO_ROOT, '.github', 'workflows', 'hermes-weekly.yml'), 'utf8');
  assert.match(workflowText, /promote_baseline:/);
  assert.match(workflowText, /type:\s*boolean/);
  assert.match(workflowText, /default:\s*false/);
  const promotionStepMatch = /Promote baseline[\s\S]{0,1000}/.exec(workflowText);
  assert.ok(promotionStepMatch, 'expected a "Promote baseline" step in the workflow');
  assert.match(promotionStepMatch[0], /github\.event_name == 'workflow_dispatch'/);
  assert.match(promotionStepMatch[0], /github\.event\.inputs\.promote_baseline == 'true'/);
});

// 14) DRY RUN global permanece true.
test('14) the promotion step forces HERMES_COLLECTION_DRY_RUN=true regardless of the repository Variable', () => {
  const workflowText = fs.readFileSync(path.join(REPO_ROOT, '.github', 'workflows', 'hermes-weekly.yml'), 'utf8');
  const promotionStepMatch = /Promote baseline[\s\S]{0,1000}/.exec(workflowText);
  assert.match(promotionStepMatch[0], /HERMES_COLLECTION_DRY_RUN:\s*'true'/);
});

test('14b) isAuthorized rejects promotion outright when dryRun is false, independent of every other flag', () => {
  assert.equal(isAuthorized({ baselineMode: true, dryRun: false, promote: true, approvalToken: APPROVAL_TOKEN_VALUE }), false);
});

// 15) Ninguna carpeta de candidatos se escribe.
test('15) a successful promotion never creates hermes/real-candidates or hermes/real-candidates-previews — only the baseline file', () => {
  const paths = makePaths();
  writePreview(paths, validBaseline());
  promoteBaseline({ previewPath: paths.previewPath, realPath: paths.realPath, backupDir: paths.backupDir, registry: validRegistry(), minContentLength: 200 });
  const candidatesDir = path.join(paths.base, 'real-candidates');
  const previewsDir = path.join(paths.base, 'real-candidates-previews');
  assert.equal(fs.existsSync(candidatesDir), false);
  assert.equal(fs.existsSync(previewsDir), false);
  // Nothing under paths.base except the baselines directory tree.
  const topLevel = fs.readdirSync(paths.base);
  assert.deepEqual(topLevel, ['baselines']);
});

// 16) Rollback requiere aprobación.
test('16) rollback is blocked without the exact approval token', () => {
  const paths = makePaths();
  fs.mkdirSync(paths.backupDir, { recursive: true });
  const backupFile = path.join(paths.backupDir, 'source-baseline.2026-08-03T00-00-00-000Z.bak.json');
  fs.writeFileSync(backupFile, JSON.stringify(validBaseline()));

  const noToken = spawnSync(process.execPath, [ROLLBACK_SCRIPT, path.basename(backupFile)], {
    cwd: paths.base, env: { PATH: process.env.PATH }, encoding: 'utf8'
  });
  assert.notEqual(noToken.status, 0);
  assert.match(noToken.stderr, /NOT AUTHORIZED/);

  const wrongToken = spawnSync(process.execPath, [ROLLBACK_SCRIPT, path.basename(backupFile)], {
    cwd: paths.base, env: { PATH: process.env.PATH, HERMES_BASELINE_APPROVAL_TOKEN: 'not-it' }, encoding: 'utf8'
  });
  assert.notEqual(wrongToken.status, 0);
});

// 17) Rollback restaura backup válido.
test('17) rollback with correct approval restores the exact backup content and reports its hash', () => {
  const paths = makePaths();
  fs.mkdirSync(paths.backupDir, { recursive: true });
  const backupContent = { schema_version: '1.0.0', sources: { test_ep: validEntry() }, marker: 'restored' };
  const backupFile = path.join(paths.backupDir, 'source-baseline.2026-08-03T00-00-00-000Z.bak.json');
  fs.writeFileSync(backupFile, JSON.stringify(backupContent));
  fs.writeFileSync(paths.realPath, JSON.stringify({ marker: 'current-wrong-state' }));

  const result = rollbackBaseline({ backupPath: backupFile, realPath: paths.realPath });
  assert.equal(result.status, 'ROLLED_BACK');
  const restored = JSON.parse(fs.readFileSync(paths.realPath, 'utf8'));
  assert.equal(restored.marker, 'restored');
  assert.equal(result.baseline_sha256.length, 64);
});

test('rollback never touches a backup path outside hermes/baselines/backups (no traversal)', () => {
  const cwd = makeCliCwd();
  const realBackupDir = path.join(cwd, 'hermes', 'baselines', 'backups');
  fs.mkdirSync(realBackupDir, { recursive: true });
  const outsideSecret = path.join(cwd, 'outside-secret.json');
  fs.writeFileSync(outsideSecret, JSON.stringify({ marker: 'should-never-be-read-as-a-backup' }));

  const result = spawnSync(process.execPath, [ROLLBACK_SCRIPT, '../../../outside-secret.json'], {
    cwd, env: { PATH: process.env.PATH, HERMES_BASELINE_APPROVAL_TOKEN: APPROVAL_TOKEN_VALUE }, encoding: 'utf8'
  });
  // path.basename() strips any directory traversal component, so this
  // resolves to hermes/baselines/backups/outside-secret.json (which does
  // not exist there) rather than escaping the backups directory — the
  // secret content is never read into the process at all.
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /backup not found/);
  assert.doesNotMatch(result.stdout + result.stderr, /should-never-be-read-as-a-backup/);
});

test('the promotion audit record never contains the approval token value, only booleans about it', () => {
  const cwd = makeCliCwd();
  const secretLookingToken = 'DEFINITELY_NOT_THE_REAL_TOKEN_XYZ';
  const result = spawnSync(process.execPath, [PROMOTE_SCRIPT], {
    cwd,
    env: { PATH: process.env.PATH, HERMES_BASELINE_MODE: 'true', HERMES_BASELINE_PROMOTE: 'true', HERMES_COLLECTION_DRY_RUN: 'true', HERMES_BASELINE_APPROVAL_TOKEN: secretLookingToken },
    encoding: 'utf8'
  });
  assert.doesNotMatch(result.stdout + result.stderr, new RegExp(secretLookingToken));
  const auditDir = path.join(cwd, 'elimfilters-vault', '94-sync-log');
  const auditFiles = fs.readdirSync(auditDir);
  assert.ok(auditFiles.length > 0);
  for (const file of auditFiles) {
    const content = fs.readFileSync(path.join(auditDir, file), 'utf8');
    assert.doesNotMatch(content, new RegExp(secretLookingToken));
  }
});
