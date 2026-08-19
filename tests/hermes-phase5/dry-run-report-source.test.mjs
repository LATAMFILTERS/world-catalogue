// HERMES Phase 5 Lite — regression tests for the DRY RUN report/email
// source-directory bug: collect-real-sources.mjs writes DRY RUN candidates
// to hermes/real-candidates-previews/, but hermes:validate:real and
// hermes:report:real used to hardcode hermes/real-candidates regardless of
// mode, so a successful DRY RUN collection always reported "Candidates
// scanned: 0". Fixed via the '--auto' sentinel + resolveRealCandidatesInputDir()
// in hermes-core.mjs. These tests run the real CLI scripts as child
// processes against a scratch directory — no real network, no real
// repository files touched.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildCandidate, sha256Hex } from '../../scripts/hermes/collect-real-sources-core.mjs';

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const VALIDATE_SCRIPT = path.join(REPO_ROOT, 'scripts', 'hermes', 'validate-candidates.mjs');
const REPORT_SCRIPT = path.join(REPO_ROOT, 'scripts', 'hermes', 'generate-weekly-report.mjs');
const EMAIL_SCRIPT = path.join(REPO_ROOT, 'scripts', 'hermes', 'send-weekly-email.mjs');

function makeCwd() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-dryrun-report-'));
  fs.mkdirSync(path.join(dir, 'hermes', 'real-candidates-previews'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'hermes', 'real-candidates'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'hermes', 'reports'), { recursive: true });
  return dir;
}

function writeCandidates(dir, count, suffix) {
  const capturedAt = new Date().toISOString();
  for (let i = 0; i < count; i += 1) {
    const source = {
      id: `fixture_source_${i}`,
      name: `Fixture Source ${i}`,
      category: 'standards',
      url: `https://example.test/fixture-${i}`,
      source_type: 'html',
      enabled: true,
      official: true,
      trust_level: 'high'
    };
    const { candidate } = buildCandidate({ source, contentHash: sha256Hex(`fixture-${i}-${suffix}`), title: null, capturedAt });
    fs.writeFileSync(path.join(dir, `${candidate.entity_code}.json`), JSON.stringify(candidate, null, 2) + '\n', 'utf8');
  }
}

function runNode(script, args, cwd, env = {}) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd,
    env: { PATH: process.env.PATH, ...env },
    encoding: 'utf8'
  });
}

test('DRY RUN: hermes:validate:real (--auto) reports candidates from hermes/real-candidates-previews', () => {
  const cwd = makeCwd();
  writeCandidates(path.join(cwd, 'hermes', 'real-candidates-previews'), 12, 'preview');
  const result = runNode(VALIDATE_SCRIPT, ['--auto'], cwd, { HERMES_COLLECTION_DRY_RUN: 'true' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /--auto resolved to hermes\/real-candidates-previews/);
  assert.match(result.stdout, /Validated: 12; passed: 12; failed: 0/);
});

test('DRY RUN (default, HERMES_COLLECTION_DRY_RUN unset): hermes:report:real (--auto) reports "Candidates scanned: 12" for 12 previews', () => {
  const cwd = makeCwd();
  writeCandidates(path.join(cwd, 'hermes', 'real-candidates-previews'), 12, 'preview-default');
  const result = runNode(REPORT_SCRIPT, ['--auto', 'hermes/reports'], cwd);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /--auto resolved to hermes\/real-candidates-previews/);

  const reportFiles = fs.readdirSync(path.join(cwd, 'hermes', 'reports')).filter((f) => /^hermes-weekly-.*\.md$/.test(f));
  assert.equal(reportFiles.length, 1);
  const reportText = fs.readFileSync(path.join(cwd, 'hermes', 'reports', reportFiles[0]), 'utf8');
  assert.match(reportText, /Candidates scanned: 12/);
  assert.match(reportText, /Ready for review: 12/);
});

test('LIVE (HERMES_COLLECTION_DRY_RUN=false): hermes:report:real (--auto) reports from hermes/real-candidates, not previews', () => {
  const cwd = makeCwd();
  // Previews present but must be ignored in LIVE mode.
  writeCandidates(path.join(cwd, 'hermes', 'real-candidates-previews'), 12, 'preview-ignored');
  writeCandidates(path.join(cwd, 'hermes', 'real-candidates'), 5, 'live');
  const result = runNode(REPORT_SCRIPT, ['--auto', 'hermes/reports'], cwd, { HERMES_COLLECTION_DRY_RUN: 'false' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /--auto resolved to hermes\/real-candidates$/m);

  const reportFiles = fs.readdirSync(path.join(cwd, 'hermes', 'reports')).filter((f) => /^hermes-weekly-.*\.md$/.test(f));
  const reportText = fs.readFileSync(path.join(cwd, 'hermes', 'reports', reportFiles[0]), 'utf8');
  assert.match(reportText, /Candidates scanned: 5/);
});

test('DRY RUN report/validate never write into hermes/real-candidates (no copy-through from previews)', () => {
  const cwd = makeCwd();
  writeCandidates(path.join(cwd, 'hermes', 'real-candidates-previews'), 12, 'preview-no-copy');
  runNode(VALIDATE_SCRIPT, ['--auto'], cwd, { HERMES_COLLECTION_DRY_RUN: 'true' });
  runNode(REPORT_SCRIPT, ['--auto', 'hermes/reports'], cwd, { HERMES_COLLECTION_DRY_RUN: 'true' });
  const realCandidatesFiles = fs.readdirSync(path.join(cwd, 'hermes', 'real-candidates'));
  assert.deepEqual(realCandidatesFiles, [], 'hermes/real-candidates must remain empty after a DRY RUN validate+report');
});

test('the email preview HTML contains the correct candidate count for a DRY RUN report', () => {
  const cwd = makeCwd();
  writeCandidates(path.join(cwd, 'hermes', 'real-candidates-previews'), 12, 'preview-email');
  const reportResult = runNode(REPORT_SCRIPT, ['--auto', 'hermes/reports'], cwd, { HERMES_COLLECTION_DRY_RUN: 'true' });
  assert.equal(reportResult.status, 0, reportResult.stderr);

  const emailResult = runNode(EMAIL_SCRIPT, ['hermes/reports'], cwd);
  assert.equal(emailResult.status, 0, emailResult.stderr);
  assert.match(emailResult.stdout, /DRY RUN/);

  const previewFiles = fs.readdirSync(path.join(cwd, 'hermes', 'reports')).filter((f) => /^hermes-email-preview-.*\.html$/.test(f));
  assert.equal(previewFiles.length, 1);
  const html = fs.readFileSync(path.join(cwd, 'hermes', 'reports', previewFiles[0]), 'utf8');
  assert.match(html, /Candidates scanned: 12/);
  assert.match(html, /Ready for review: 12/);
  // HERMES_EMAIL_LIVE was never set to true anywhere in this test.
  assert.doesNotMatch(html, /sent to/);
});

test('an explicit literal path argument still overrides --auto resolution (backward compatible)', () => {
  const cwd = makeCwd();
  writeCandidates(path.join(cwd, 'hermes', 'real-candidates-previews'), 12, 'preview-explicit');
  writeCandidates(path.join(cwd, 'hermes', 'real-candidates'), 3, 'explicit-override');
  // Explicit literal path wins over HERMES_COLLECTION_DRY_RUN, unlike '--auto'.
  const result = runNode(VALIDATE_SCRIPT, ['hermes/real-candidates'], cwd, { HERMES_COLLECTION_DRY_RUN: 'true' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Validated: 3; passed: 3; failed: 0/);
});

test('the bare zero-argument default is untouched (still hermes/test-candidates) — no regression to Phase 1 behavior', () => {
  const result = spawnSync(process.execPath, [VALIDATE_SCRIPT], { cwd: REPO_ROOT, env: { PATH: process.env.PATH }, encoding: 'utf8' });
  // Real repo hermes/test-candidates has 5 committed synthetic fixtures.
  assert.match(result.stdout, /Validated: 5/);
});
