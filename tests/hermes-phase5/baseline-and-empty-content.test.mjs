// HERMES — governed source baseline + empty/insufficient content guards.
// Regression suite for the MAHLE incident: a 95-byte response body
// (redirect/bot-protection stub) normalized to zero visible text, hashed to
// the well-known SHA-256 of an empty string, and was reported as a genuine
// "content changed" candidate. These tests cover every scenario in the
// fix's requirements list. No real network, no real repository directories
// — every fetch is fake and every directory is a fresh os.tmpdir() scratch
// folder.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import { runCollection } from '../../scripts/hermes/collect-real-sources-core.mjs';
import { EMPTY_STRING_SHA256, loadBaseline } from '../../scripts/hermes/source-baseline-core.mjs';

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const REPORT_SCRIPT = path.join(REPO_ROOT, 'scripts', 'hermes', 'generate-weekly-report.mjs');
const EMAIL_SCRIPT = path.join(REPO_ROOT, 'scripts', 'hermes', 'send-weekly-email.mjs');

function makeDirs() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-baseline-'));
  return {
    base,
    realCandidatesDir: path.join(base, 'real-candidates'),
    sourceCacheDir: path.join(base, 'source-cache'),
    previewDir: path.join(base, 'previews'),
    auditDir: path.join(base, 'audit'),
    baselinePath: path.join(base, 'baselines', 'source-baseline.json'),
    baselinePreviewPath: path.join(base, 'baselines', 'source-baseline.preview.json')
  };
}

function source(overrides = {}) {
  return {
    id: 'mahle_press_releases',
    name: 'MAHLE Aftermarket / Filtration',
    category: 'filtration_competitor',
    url: 'https://www.mahle.com/en/news-and-press/',
    source_type: 'html',
    enabled: true,
    official: true,
    trust_level: 'high',
    organization_id: 'mahle',
    endpoint_id: 'mahle_press_releases',
    region: 'Europe',
    ...overrides
  };
}

function htmlResponse(body) {
  return async () => ({ ok: true, status: 200, text: async () => body });
}

const REAL_BODY = '<html><title>Press release</title><body>' + 'A genuinely long press release body with real visible content. '.repeat(6) + '</body></html>';
const REAL_BODY_V2 = '<html><title>New press release</title><body>' + 'A different, genuinely long press release body with new content. '.repeat(6) + '</body></html>';

// 1) Hash vacío bloqueado — the exact well-known SHA-256("") is never
// permitted to become a candidate, matching the actual MAHLE incident.
test('1) a fetch whose normalized body hashes to the well-known empty-string SHA-256 is blocked, not a candidate', async () => {
  const dirs = makeDirs();
  // A tiny response (mirrors the real 95-byte MAHLE response) that
  // normalizes to nothing but whitespace/tags.
  const fetchImpl = htmlResponse('<html><head><meta http-equiv="refresh" content="0"></head></html>');
  const summary = await runCollection({ ...dirs, sources: [source()], dryRun: false, fetchImpl });
  assert.equal(summary.results[0].status, 'EMPTY_CONTENT');
  assert.equal(summary.empty_content, 1);
  assert.equal(summary.created, 0);
  const files = fs.existsSync(dirs.realCandidatesDir) ? fs.readdirSync(dirs.realCandidatesDir) : [];
  assert.equal(files.length, 0);
});

// 2) Cuerpo vacío bloqueado — a literally empty body, independent of the
// hash-equality check, is also blocked.
test('2) a literally empty normalized body is blocked as EMPTY_CONTENT, never invalid, never fatal', async () => {
  const dirs = makeDirs();
  const fetchImpl = htmlResponse('<script>var x = 1;</script><style>.a{color:red}</style><!-- nothing visible -->');
  const summary = await runCollection({ ...dirs, sources: [source()], dryRun: false, fetchImpl });
  assert.equal(summary.results[0].status, 'EMPTY_CONTENT');
  assert.equal(summary.invalid, 0);
  assert.equal(summary.fetch_errors, 0);
});

// 3) Contenido insuficiente bloqueado — below the configurable threshold,
// but not literally empty.
test('3) content below the configurable minContentLength threshold is blocked as INSUFFICIENT_CONTENT', async () => {
  const dirs = makeDirs();
  const fetchImpl = htmlResponse('<html><body>Too short</body></html>'); // ~9 chars normalized
  const summary = await runCollection({ ...dirs, sources: [source()], dryRun: false, minContentLength: 200, fetchImpl });
  assert.equal(summary.results[0].status, 'INSUFFICIENT_CONTENT');
  assert.equal(summary.insufficient_content, 1);
  assert.equal(summary.created, 0);
  // A lower configured threshold accepts the exact same content.
  const dirs2 = makeDirs();
  const summary2 = await runCollection({ ...dirs2, sources: [source()], dryRun: false, minContentLength: 5, fetchImpl });
  assert.notEqual(summary2.results[0].status, 'INSUFFICIENT_CONTENT');
});

// 4) Baseline inicial no produce candidatos.
test('4) HERMES_BASELINE_MODE=true establishes the baseline and produces zero candidates, ever', async () => {
  const dirs = makeDirs();
  const fetchImpl = htmlResponse(REAL_BODY);
  const summary = await runCollection({ ...dirs, sources: [source()], dryRun: false, baselineMode: true, fetchImpl });
  assert.equal(summary.baseline_mode, true);
  assert.equal(summary.created, 0);
  assert.equal(summary.previewed, 0);
  assert.equal(summary.results[0].status, 'BASELINE_RECORDED');
  const baseline = loadBaseline(dirs.baselinePath);
  assert.ok(baseline.sources[source().id]);
  assert.notEqual(baseline.sources[source().id].normalized_hash, EMPTY_STRING_SHA256);
});

// 5) Hash sin cambios no produce candidatos.
test('5) an unchanged hash relative to the baseline produces no candidate on any subsequent run', async () => {
  const dirs = makeDirs();
  const fetchImpl = htmlResponse(REAL_BODY);
  await runCollection({ ...dirs, sources: [source()], dryRun: false, baselineMode: true, fetchImpl });
  const summary = await runCollection({ ...dirs, sources: [source()], dryRun: false, fetchImpl });
  assert.equal(summary.results[0].status, 'UNCHANGED');
  assert.equal(summary.unchanged, 1);
  assert.equal(summary.created, 0);
});

// 6) Hash cambiado produce candidato.
test('6) a hash that differs from the baseline produces exactly one CHANGED candidate, requiring research', async () => {
  const dirs = makeDirs();
  await runCollection({ ...dirs, sources: [source()], dryRun: false, baselineMode: true, fetchImpl: htmlResponse(REAL_BODY) });
  const summary = await runCollection({ ...dirs, sources: [source()], dryRun: false, fetchImpl: htmlResponse(REAL_BODY_V2) });
  assert.equal(summary.results[0].status, 'CREATED');
  assert.equal(summary.changed, 1);
  assert.equal(summary.created, 1);
  const files = fs.readdirSync(dirs.realCandidatesDir);
  const candidate = JSON.parse(fs.readFileSync(path.join(dirs.realCandidatesDir, files[0]), 'utf8'));
  assert.equal(candidate.change_classification, 'CHANGE_DETECTED_REQUIRES_RESEARCH');
  assert.ok(candidate.confidence <= 0.4);
  assert.match(candidate.proposed_action, /do not treat this as a confirmed new product/);
});

// 7) Fuente caída no reemplaza baseline.
test('7) a source that is down never overwrites a previously valid baseline entry', async () => {
  const dirs = makeDirs();
  await runCollection({ ...dirs, sources: [source()], dryRun: false, baselineMode: true, fetchImpl: htmlResponse(REAL_BODY) });
  const baselineBefore = loadBaseline(dirs.baselinePath);
  const fetchImplDown = async () => { throw new Error('ECONNREFUSED'); };
  const summary = await runCollection({ ...dirs, sources: [source()], dryRun: false, fetchImpl: fetchImplDown });
  assert.equal(summary.results[0].status, 'FETCH_ERROR');
  const baselineAfter = loadBaseline(dirs.baselinePath);
  assert.deepEqual(baselineAfter, baselineBefore, 'baseline must be byte-for-byte unchanged after a down source');
});

// 8) Contenido vacío no reemplaza baseline.
test('8) empty/insufficient content never overwrites a previously valid baseline entry', async () => {
  const dirs = makeDirs();
  await runCollection({ ...dirs, sources: [source()], dryRun: false, baselineMode: true, fetchImpl: htmlResponse(REAL_BODY) });
  const baselineBefore = loadBaseline(dirs.baselinePath);
  const summary = await runCollection({ ...dirs, sources: [source()], dryRun: false, fetchImpl: htmlResponse('<html></html>') });
  assert.equal(summary.results[0].status, 'EMPTY_CONTENT');
  const baselineAfter = loadBaseline(dirs.baselinePath);
  assert.deepEqual(baselineAfter, baselineBefore, 'baseline must be byte-for-byte unchanged after empty content');
});

// 9) Fuente sin baseline queda BASELINE_REQUIRED.
test('9) a source with no baseline entry yet is BASELINE_REQUIRED, never silently treated as changed', async () => {
  const dirs = makeDirs();
  const summary = await runCollection({ ...dirs, sources: [source()], dryRun: false, fetchImpl: htmlResponse(REAL_BODY) });
  assert.equal(summary.results[0].status, 'BASELINE_REQUIRED');
  assert.equal(summary.baseline_required, 1);
  assert.equal(summary.created, 0);
  assert.equal(fs.existsSync(dirs.baselinePath), false, 'comparison mode must never silently seed a baseline for an unknown source');
});

// 10) DRY RUN no reemplaza baseline real.
test('10) DRY RUN writes a baseline preview only; the real baseline file is never touched', async () => {
  const dirs = makeDirs();
  await runCollection({ ...dirs, sources: [source()], dryRun: false, baselineMode: true, fetchImpl: htmlResponse(REAL_BODY) });
  const realBaselineBefore = fs.readFileSync(dirs.baselinePath, 'utf8');
  const summary = await runCollection({ ...dirs, sources: [source()], dryRun: true, fetchImpl: htmlResponse(REAL_BODY_V2) });
  assert.equal(summary.results[0].status, 'PREVIEWED');
  assert.equal(fs.readFileSync(dirs.baselinePath, 'utf8'), realBaselineBefore, 'real baseline must be untouched by a DRY RUN');
  assert.ok(fs.existsSync(dirs.baselinePreviewPath), 'a baseline preview should have been written');
  const preview = loadBaseline(dirs.baselinePreviewPath);
  assert.notEqual(preview.sources[source().id].normalized_hash, loadBaseline(dirs.baselinePath).sources[source().id].normalized_hash, 'preview should reflect the NEW hash, distinct from the untouched real baseline');
});

// 10b) DRY RUN baseline-mode bootstrap also never touches the real baseline
// (covered separately from comparison-mode DRY RUN above for clarity).
test('10b) DRY RUN + HERMES_BASELINE_MODE=true never writes the real baseline file, only a preview', async () => {
  const dirs = makeDirs();
  const summary = await runCollection({ ...dirs, sources: [source()], dryRun: true, baselineMode: true, fetchImpl: htmlResponse(REAL_BODY) });
  assert.equal(summary.results[0].status, 'BASELINE_RECORDED');
  assert.equal(fs.existsSync(dirs.baselinePath), false);
  assert.ok(fs.existsSync(dirs.baselinePreviewPath));
});

// 11) Email de baseline indica cero candidatos intencionalmente.
test('11) the weekly report and DRY RUN email preview clearly label an initial-baseline run as intentional, not an error', () => {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-baseline-report-'));
  fs.mkdirSync(path.join(scratch, 'hermes', 'real-candidates-previews'), { recursive: true });
  fs.mkdirSync(path.join(scratch, 'hermes', 'reports'), { recursive: true });
  fs.mkdirSync(path.join(scratch, 'elimfilters-vault', '94-sync-log'), { recursive: true });
  fs.writeFileSync(
    path.join(scratch, 'elimfilters-vault', '94-sync-log', 'collection-1.collection.json'),
    JSON.stringify({ baseline_mode: true, sources_checked: 12, unchanged: 0, changed: 0, empty_content: 0, insufficient_content: 0, failed: 0, baseline_required: 0, candidates_created: 0, candidates_suppressed: 0 })
  );
  execFileSync(process.execPath, [REPORT_SCRIPT, '--auto', 'hermes/reports'], { cwd: scratch, encoding: 'utf8' });
  const reportFile = fs.readdirSync(path.join(scratch, 'hermes', 'reports')).find((f) => /^hermes-weekly-.*\.md$/.test(f));
  const reportText = fs.readFileSync(path.join(scratch, 'hermes', 'reports', reportFile), 'utf8');
  assert.match(reportText, /INITIAL BASELINE — NO INTELLIGENCE CANDIDATES GENERATED/);
  assert.match(reportText, /Candidates scanned: 0/);

  const emailResult = spawnSync(process.execPath, [EMAIL_SCRIPT, 'hermes/reports'], { cwd: scratch, env: { PATH: process.env.PATH }, encoding: 'utf8' });
  assert.equal(emailResult.status, 0, emailResult.stderr);
  const previewFile = fs.readdirSync(path.join(scratch, 'hermes', 'reports')).find((f) => /^hermes-email-preview-.*\.html$/.test(f));
  const html = fs.readFileSync(path.join(scratch, 'hermes', 'reports', previewFile), 'utf8');
  assert.match(html, /INITIAL BASELINE — NO INTELLIGENCE CANDIDATES GENERATED/);
  // Zero candidates here must never be confused with an error or a broken run.
  assert.doesNotMatch(html, /error/i);
});

// 12) Reporte distingue UNCHANGED de EMPTY_CONTENT.
test('12) the weekly report renders Unchanged and Empty content as distinct, separately labeled counts', () => {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-baseline-report-distinct-'));
  fs.mkdirSync(path.join(scratch, 'hermes', 'real-candidates-previews'), { recursive: true });
  fs.mkdirSync(path.join(scratch, 'hermes', 'reports'), { recursive: true });
  fs.mkdirSync(path.join(scratch, 'elimfilters-vault', '94-sync-log'), { recursive: true });
  fs.writeFileSync(
    path.join(scratch, 'elimfilters-vault', '94-sync-log', 'collection-1.collection.json'),
    JSON.stringify({ baseline_mode: false, sources_checked: 12, unchanged: 7, changed: 1, empty_content: 2, insufficient_content: 1, failed: 1, baseline_required: 0, candidates_created: 1, candidates_suppressed: 0 })
  );
  execFileSync(process.execPath, [REPORT_SCRIPT, '--auto', 'hermes/reports'], { cwd: scratch, encoding: 'utf8' });
  const reportFile = fs.readdirSync(path.join(scratch, 'hermes', 'reports')).find((f) => /^hermes-weekly-.*\.md$/.test(f));
  const reportText = fs.readFileSync(path.join(scratch, 'hermes', 'reports', reportFile), 'utf8');
  assert.match(reportText, /- Unchanged: 7/);
  assert.match(reportText, /- Changed: 1/);
  assert.match(reportText, /- Empty content: 2/);
  assert.match(reportText, /- Insufficient content: 1/);
  assert.match(reportText, /- Failed: 1/);
  assert.doesNotMatch(reportText, /INITIAL BASELINE/);
});

// Additional coverage: the collector never persists in DRY RUN (baseline or
// candidates), matching the broader Phase 5 Lite safety contract.
test('a full DRY RUN pass (baseline bootstrap, then comparison) never writes hermes/real-candidates or the real baseline', async () => {
  const dirs = makeDirs();
  await runCollection({ ...dirs, sources: [source()], dryRun: true, baselineMode: true, fetchImpl: htmlResponse(REAL_BODY) });
  await runCollection({ ...dirs, sources: [source()], dryRun: true, fetchImpl: htmlResponse(REAL_BODY_V2) });
  assert.equal(fs.existsSync(dirs.baselinePath), false);
  const realFiles = fs.existsSync(dirs.realCandidatesDir) ? fs.readdirSync(dirs.realCandidatesDir) : [];
  assert.equal(realFiles.length, 0);
});
