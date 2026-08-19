// HERMES — regression tests for the John Deere/MAHLE/NFPA/SAE endpoint
// repair round. Covers: the MAHLE primary+fallback mechanism, the actual
// registry URLs now on file for John Deere and NFPA, the diagnostic tool's
// safe output shape, that one insufficient source never blocks the rest of
// a run, and that the global content-length threshold was never lowered to
// force a specific endpoint to pass. No real network — every fetch here is
// fake; the one place this suite touches the real registry file is a
// read-only assertion on its committed URLs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCollection, sourcesFromRegistry } from '../../scripts/hermes/collect-real-sources-core.mjs';
import { DEFAULT_MIN_CONTENT_LENGTH } from '../../scripts/hermes/source-baseline-core.mjs';
import { diagnoseEndpoint } from '../../scripts/hermes/diagnose-source-endpoint-core.mjs';
import { loadRegistry, validateRegistry } from '../../scripts/hermes/source-registry-core.mjs';

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));

function makeDirs() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-endpoint-fix-'));
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

const SUFFICIENT_BODY = '<html><title>Real page</title><body>' + 'Genuinely long visible press content. '.repeat(10) + '</body></html>';
const INSUFFICIENT_BODY = '<html><body>too short</body></html>';

function mahleSource(overrides = {}) {
  return {
    id: 'mahle__press_releases',
    name: 'MAHLE Aftermarket / Filtration',
    category: 'filtration_competitor',
    url: 'https://www.mahle.com/en/',
    fallback_url: 'https://www.mahle.com/en/investor-relations/financial-news/',
    source_type: 'html',
    enabled: true,
    official: true,
    trust_level: 'high',
    organization_id: 'mahle',
    endpoint_id: 'mahle__press_releases',
    region: 'Europe',
    ...overrides
  };
}

// 1) Endpoint principal MAHLE válido.
test('1) MAHLE primary endpoint alone, when it returns sufficient content, is used directly — the fallback is never fetched', async () => {
  const dirs = makeDirs();
  let fallbackCalls = 0;
  const fetchImpl = async (url) => {
    if (url === mahleSource().fallback_url) fallbackCalls += 1;
    return { ok: true, status: 200, text: async () => SUFFICIENT_BODY };
  };
  const summary = await runCollection({ ...dirs, sources: [mahleSource()], dryRun: false, baselineMode: true, fetchImpl });
  assert.equal(fallbackCalls, 0, 'fallback must not be fetched when the primary already has sufficient content');
  assert.equal(summary.results[0].status, 'BASELINE_RECORDED');
  assert.equal(summary.results[0].used_fallback, false);
});

// 2) Fallback MAHLE solo cuando el principal falla o es insuficiente.
test('2a) the fallback is fetched and used only when the primary returns insufficient content', async () => {
  const dirs = makeDirs();
  const src = mahleSource();
  const fetchImpl = async (url) => {
    if (url === src.url) return { ok: true, status: 200, text: async () => INSUFFICIENT_BODY };
    if (url === src.fallback_url) return { ok: true, status: 200, text: async () => SUFFICIENT_BODY };
    throw new Error(`unexpected url ${url}`);
  };
  const summary = await runCollection({ ...dirs, sources: [src], dryRun: false, baselineMode: true, fetchImpl });
  assert.equal(summary.results[0].status, 'BASELINE_RECORDED');
  assert.equal(summary.results[0].used_fallback, true);
  const cache = JSON.parse(fs.readFileSync(path.join(dirs.sourceCacheDir, `${src.id}.json`), 'utf8'));
  assert.equal(cache.source_url, src.fallback_url);
  assert.equal(cache.primary_url, src.url);
  assert.equal(cache.used_fallback, true);
});

test('2b) the fallback is never fetched when the primary fails outright (network error) — only on insufficient content', async () => {
  const dirs = makeDirs();
  const src = mahleSource();
  let fallbackCalls = 0;
  const fetchImpl = async (url) => {
    if (url === src.url) throw new Error('ECONNRESET');
    fallbackCalls += 1;
    return { ok: true, status: 200, text: async () => SUFFICIENT_BODY };
  };
  const summary = await runCollection({ ...dirs, sources: [src], dryRun: false, baselineMode: true, fetchImpl });
  assert.equal(fallbackCalls, 0, 'a network failure on the primary must stay FETCH_ERROR, not trigger the fallback');
  assert.equal(summary.results[0].status, 'FETCH_ERROR');
});

test('2c) if both primary and fallback are insufficient, the source is reported INSUFFICIENT_CONTENT with the attempt recorded, not silently dropped', async () => {
  const dirs = makeDirs();
  const src = mahleSource();
  const fetchImpl = async () => ({ ok: true, status: 200, text: async () => INSUFFICIENT_BODY });
  const summary = await runCollection({ ...dirs, sources: [src], dryRun: false, baselineMode: true, fetchImpl });
  assert.equal(summary.results[0].status, 'INSUFFICIENT_CONTENT');
  assert.equal(summary.results[0].fallback_attempted, true);
  assert.equal(summary.results[0].used_fallback, false);
});

test('a source with no fallback_url configured behaves exactly as before (no fallback attempted, ever)', async () => {
  const dirs = makeDirs();
  const src = mahleSource({ fallback_url: null });
  const fetchImpl = async () => ({ ok: true, status: 200, text: async () => INSUFFICIENT_BODY });
  const summary = await runCollection({ ...dirs, sources: [src], dryRun: false, baselineMode: true, fetchImpl });
  assert.equal(summary.results[0].status, 'INSUFFICIENT_CONTENT');
  assert.equal(summary.results[0].fallback_configured, false);
});

// 3) John Deere usa /en/news/ (and is excluded pending a real fix).
test('3) John Deere endpoint on file uses /en/news/ and is REVIEW_REQUIRED/disabled (diagnosed as a client-rendered SPA, not fixed by a URL swap)', () => {
  const endpoints = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'hermes', 'config', 'source-endpoints.json'), 'utf8')).endpoints;
  const johnDeere = endpoints.find((e) => e.id === 'john_deere__newsroom');
  assert.equal(johnDeere.url, 'https://www.deere.com/en/news/');
  assert.equal(johnDeere.status, 'REVIEW_REQUIRED');
  assert.equal(johnDeere.enabled, false);
  assert.match(johnDeere.notes, /client-side rendered/i);
});

// 4) NFPA usa community.nfpa.org/news.
test('4) NFPA endpoint on file uses community.nfpa.org/news and stays ACTIVE', () => {
  const endpoints = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'hermes', 'config', 'source-endpoints.json'), 'utf8')).endpoints;
  const nfpa = endpoints.find((e) => e.id === 'nfpa__news');
  assert.equal(nfpa.url, 'https://community.nfpa.org/news');
  assert.equal(nfpa.status, 'ACTIVE');
  assert.equal(nfpa.enabled, true);
});

test('MAHLE endpoint on file uses the homepage as primary with the investor-relations page as fallback_url', () => {
  const endpoints = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'hermes', 'config', 'source-endpoints.json'), 'utf8')).endpoints;
  const mahle = endpoints.find((e) => e.id === 'mahle__press_releases');
  assert.equal(mahle.url, 'https://www.mahle.com/en/');
  assert.equal(mahle.fallback_url, 'https://www.mahle.com/en/investor-relations/financial-news/');
  assert.equal(mahle.status, 'ACTIVE');
});

test('SAE endpoint on file stays REVIEW_REQUIRED/disabled with the diagnosis recorded, url unchanged (no fix applied without diagnosis)', () => {
  const endpoints = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'hermes', 'config', 'source-endpoints.json'), 'utf8')).endpoints;
  const sae = endpoints.find((e) => e.id === 'sae_international__news');
  assert.equal(sae.url, 'https://www.sae.org/news');
  assert.equal(sae.status, 'REVIEW_REQUIRED');
  assert.equal(sae.enabled, false);
  assert.match(sae.notes, /Angular/i);
});

test('sourcesFromRegistry only produces sources for ACTIVE+enabled endpoints — John Deere and SAE are excluded from the active set', () => {
  const registry = loadRegistry(path.join(REPO_ROOT, 'hermes', 'config', 'source-organizations.json'), path.join(REPO_ROOT, 'hermes', 'config', 'source-endpoints.json'));
  assert.deepEqual(validateRegistry(registry), []);
  const sources = sourcesFromRegistry(registry);
  const ids = sources.map((s) => s.id);
  assert.ok(!ids.includes('john_deere__newsroom'));
  assert.ok(!ids.includes('sae_international__news'));
  assert.ok(ids.includes('mahle__press_releases'));
  assert.ok(ids.includes('nfpa__news'));
});

// 5) Diagnóstico no guarda contenido completo.
test('5) the endpoint diagnostic never retains the full response body, cookies, or full headers — only lengths/status/classification', async () => {
  const bigBody = '<html><title>Diagnostic subject</title><body>' + 'x'.repeat(50_000) + '</body></html>';
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    headers: { get: (name) => (name === 'content-type' ? 'text/html' : name === 'set-cookie' ? 'session=SECRET_VALUE_ABC123' : null) },
    text: async () => bigBody
  });
  const result = await diagnoseEndpoint({ url: 'https://example.test/diagnose', fetchImpl });
  const serialized = JSON.stringify(result);
  assert.doesNotMatch(serialized, /x{100}/, 'the full 50KB body must never be embedded in the diagnostic record');
  assert.doesNotMatch(serialized, /SECRET_VALUE_ABC123/, 'cookies must never be captured');
  assert.doesNotMatch(Object.keys(result).join(','), /cookie|header/i);
  assert.equal(typeof result.raw_length, 'number');
  assert.equal(typeof result.normalized_length, 'number');
  assert.equal(result.result, 'VALID');
});

test('the diagnostic classifies EMPTY_CONTENT, INSUFFICIENT_CONTENT, and FAILED correctly', async () => {
  const empty = await diagnoseEndpoint({ url: 'https://example.test/empty', fetchImpl: async () => ({ ok: true, status: 200, headers: { get: () => null }, text: async () => '<html></html>' }) });
  assert.equal(empty.result, 'EMPTY_CONTENT');
  const insufficient = await diagnoseEndpoint({ url: 'https://example.test/short', fetchImpl: async () => ({ ok: true, status: 200, headers: { get: () => null }, text: async () => INSUFFICIENT_BODY }) });
  assert.equal(insufficient.result, 'INSUFFICIENT_CONTENT');
  const failed = await diagnoseEndpoint({ url: 'https://example.test/down', fetchImpl: async () => { throw new Error('ECONNREFUSED'); } });
  assert.equal(failed.result, 'FAILED');
  assert.match(failed.reason, /ECONNREFUSED/);
});

// 6) SAE insuficiente no bloquea la corrida.
test('6) one INSUFFICIENT_CONTENT source among several never blocks the others from processing normally', async () => {
  const dirs = makeDirs();
  const insufficientSource = mahleSource({ id: 'sae_like', endpoint_id: 'sae_like', fallback_url: null, url: 'https://example.test/thin' });
  const goodSource = mahleSource({ id: 'good_source', endpoint_id: 'good_source', fallback_url: null, url: 'https://example.test/good' });
  const fetchImpl = async (url) => {
    if (url.includes('thin')) return { ok: true, status: 200, text: async () => INSUFFICIENT_BODY };
    return { ok: true, status: 200, text: async () => SUFFICIENT_BODY };
  };
  const summary = await runCollection({ ...dirs, sources: [insufficientSource, goodSource], dryRun: false, baselineMode: true, fetchImpl });
  assert.equal(summary.results.find((r) => r.id === 'sae_like').status, 'INSUFFICIENT_CONTENT');
  assert.equal(summary.results.find((r) => r.id === 'good_source').status, 'BASELINE_RECORDED');
  assert.equal(summary.insufficient_content, 1);
  assert.equal(summary.baseline_recorded, 1);
});

// 7) No se reduce el umbral global.
test('7) the global default minimum content length threshold was not lowered to force any endpoint through', () => {
  assert.equal(DEFAULT_MIN_CONTENT_LENGTH, 200);
});

test('7b) collect-real-sources.mjs still defaults HERMES_COLLECTION_MIN_CONTENT_LENGTH to the unmodified 200-char constant', () => {
  const cliSource = fs.readFileSync(path.join(REPO_ROOT, 'scripts', 'hermes', 'collect-real-sources.mjs'), 'utf8');
  assert.match(cliSource, /HERMES_COLLECTION_MIN_CONTENT_LENGTH.*DEFAULT_MIN_CONTENT_LENGTH/);
  assert.doesNotMatch(cliSource, /minContentLength\s*=\s*\d/, 'the CLI must not hardcode a lowered numeric override');
});

// 8) Baseline preview sigue sin producir candidatos — re-verified against
// this round's actual (now-repaired) source set.
test('8) a full baseline-mode DRY RUN pass over the current source set produces zero candidates and only a baseline preview', async () => {
  const dirs = makeDirs();
  const sources = [mahleSource(), mahleSource({ id: 'nfpa_like', endpoint_id: 'nfpa_like', fallback_url: null, url: 'https://example.test/nfpa' })];
  const fetchImpl = async () => ({ ok: true, status: 200, text: async () => SUFFICIENT_BODY });
  const summary = await runCollection({ ...dirs, sources, dryRun: true, baselineMode: true, fetchImpl });
  assert.equal(summary.created, 0);
  assert.equal(summary.previewed, 0);
  assert.equal(summary.baseline_recorded, 2);
  assert.equal(fs.existsSync(dirs.baselinePath), false);
  assert.ok(fs.existsSync(dirs.baselinePreviewPath));
  const realFiles = fs.existsSync(dirs.realCandidatesDir) ? fs.readdirSync(dirs.realCandidatesDir) : [];
  assert.equal(realFiles.length, 0);
});
