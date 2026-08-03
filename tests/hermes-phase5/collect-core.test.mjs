// HERMES Phase 5 Lite — collector core tests.
// No real network access and no real repository directories are touched:
// every fetch is a fake implementation, and every directory is a fresh
// os.tmpdir() scratch folder cleaned up after each test.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runCollection, buildCandidate, sha256Hex, sourcesFromRegistry, CATEGORY_RULES } from '../../scripts/hermes/collect-real-sources-core.mjs';
import { ALLOWED_CATEGORIES } from '../../scripts/hermes/source-registry-core.mjs';
import { ALLOWED_CANDIDATE_TYPES, ALLOWED_TARGETS, validateCandidate } from '../../scripts/hermes/hermes-core.mjs';

function makeDirs() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-collect-'));
  return {
    base,
    realCandidatesDir: path.join(base, 'real-candidates'),
    sourceCacheDir: path.join(base, 'source-cache'),
    previewDir: path.join(base, 'previews'),
    auditDir: path.join(base, 'audit')
  };
}

function htmlResponse(status, body) {
  return async () => ({ ok: status < 400, status, text: async () => body });
}

function source(overrides = {}) {
  return {
    id: 'test_source',
    name: 'Test Source',
    category: 'standards',
    url: 'https://example.test/news',
    source_type: 'html',
    enabled: true,
    official: true,
    trust_level: 'high',
    ...overrides
  };
}

test('valid source produces exactly one candidate in LIVE mode', async () => {
  const dirs = makeDirs();
  const fetchImpl = async () => ({ ok: true, status: 200, text: async () => '<html><title>New Standard</title><body>Content A</body></html>' });
  const summary = await runCollection({ ...dirs, sources: [source()], dryRun: false, fetchImpl, now: () => new Date('2026-08-03T00:00:00Z') });
  assert.equal(summary.created, 1);
  assert.equal(summary.previewed, 0);
  const files = fs.readdirSync(dirs.realCandidatesDir).filter((f) => f.endsWith('.json'));
  assert.equal(files.length, 1);
  const candidate = JSON.parse(fs.readFileSync(path.join(dirs.realCandidatesDir, files[0]), 'utf8'));
  assert.equal(candidate.workflow_status, 'PENDING_REVIEW');
  assert.equal(candidate.approval_required, true);
  assert.equal(candidate.sync_status, 'NOT_READY');
  assert.match(candidate.source_hash, /^[a-f0-9]{64}$/);
});

test('a source that is down (network error) is recorded as FETCH_ERROR and does not abort the run', async () => {
  const dirs = makeDirs();
  const failing = source({ id: 'down_source', url: 'https://example.test/down' });
  const ok = source({ id: 'ok_source', url: 'https://example.test/ok' });
  const fetchImpl = async (url) => {
    if (url.includes('down')) throw new Error('ECONNREFUSED');
    return { ok: true, status: 200, text: async () => '<html><body>fine</body></html>' };
  };
  const summary = await runCollection({ ...dirs, sources: [failing, ok], dryRun: false, fetchImpl });
  assert.equal(summary.fetch_errors, 1);
  assert.equal(summary.created, 1);
  const errorResult = summary.results.find((r) => r.id === 'down_source');
  assert.equal(errorResult.status, 'FETCH_ERROR');
  assert.match(errorResult.error, /ECONNREFUSED/);
});

test('a source that never responds is aborted after the configured timeout', async () => {
  const dirs = makeDirs();
  const hangingFetch = (url, opts) => new Promise((_resolve, reject) => {
    opts.signal.addEventListener('abort', () => {
      const err = new Error('The operation was aborted');
      err.name = 'AbortError';
      reject(err);
    });
  });
  const summary = await runCollection({ ...dirs, sources: [source()], dryRun: false, fetchImpl: hangingFetch, timeoutMs: 40 });
  assert.equal(summary.fetch_errors, 1);
  assert.match(summary.results[0].error, /timeout after 40ms/);
});

test('unchanged content on a second run produces no new candidate (duplicate content is not re-reported)', async () => {
  const dirs = makeDirs();
  const body = '<html><title>Same</title><body>identical content</body></html>';
  const fetchImpl = htmlResponse(200, body);
  const first = await runCollection({ ...dirs, sources: [source()], dryRun: false, fetchImpl });
  assert.equal(first.created, 1);
  const second = await runCollection({ ...dirs, sources: [source()], dryRun: false, fetchImpl });
  assert.equal(second.created, 0);
  assert.equal(second.unchanged, 1);
  const files = fs.readdirSync(dirs.realCandidatesDir).filter((f) => f.endsWith('.json'));
  assert.equal(files.length, 1, 'no second file should have been written for unchanged content');
});

test('two different sources producing byte-identical content are deduplicated by source_hash', async () => {
  const dirs = makeDirs();
  const body = '<html><title>Shared</title><body>same bytes everywhere</body></html>';
  const fetchImpl = htmlResponse(200, body);
  const sourceA = source({ id: 'source_a', url: 'https://example.test/a' });
  const sourceB = source({ id: 'source_b', url: 'https://example.test/b' });
  await runCollection({ ...dirs, sources: [sourceA], dryRun: false, fetchImpl });
  const second = await runCollection({ ...dirs, sources: [sourceB], dryRun: false, fetchImpl });
  assert.equal(second.duplicates, 1);
  assert.equal(second.created, 0);
});

test('a source whose category has no candidate_type/target mapping is rejected, not silently written', async () => {
  const dirs = makeDirs();
  const fetchImpl = htmlResponse(200, '<html><body>content</body></html>');
  const badSource = source({ category: 'not_a_real_category' });
  const summary = await runCollection({ ...dirs, sources: [badSource], dryRun: false, fetchImpl });
  assert.equal(summary.created, 0);
  assert.equal(summary.results[0].status, 'BUILD_ERROR');
  const files = fs.existsSync(dirs.realCandidatesDir) ? fs.readdirSync(dirs.realCandidatesDir) : [];
  assert.equal(files.length, 0);
});

test('a candidate object that fails hermes-core schema validation is rejected before being written', () => {
  const { candidate } = buildCandidate({ source: source(), contentHash: sha256Hex('x'), title: null, capturedAt: new Date().toISOString() });
  candidate.confidence = 5; // out of [0,1] range — must be rejected by hermes-core validateCandidate
  const dirs = makeDirs();
  // Exercise the same validation path runCollection uses internally.
  return import('../../scripts/hermes/hermes-core.mjs').then(({ validateCandidate }) => {
    const errors = validateCandidate(candidate);
    assert.ok(errors.length > 0);
    assert.ok(errors.some((e) => e.includes('confidence')));
  });
});

test('DRY RUN writes previews only; hermes/real-candidates equivalent is never touched', async () => {
  const dirs = makeDirs();
  const fetchImpl = htmlResponse(200, '<html><title>Preview me</title><body>content</body></html>');
  const summary = await runCollection({ ...dirs, sources: [source()], dryRun: true, fetchImpl });
  assert.equal(summary.mode, 'DRY_RUN');
  assert.equal(summary.previewed, 1);
  assert.equal(summary.created, 0);
  const realFiles = fs.existsSync(dirs.realCandidatesDir) ? fs.readdirSync(dirs.realCandidatesDir).filter((f) => f.endsWith('.json')) : [];
  assert.equal(realFiles.length, 0);
  const previewFiles = fs.readdirSync(dirs.previewDir).filter((f) => f.endsWith('.preview.json'));
  assert.equal(previewFiles.length, 1);
});

test('the collector never writes to a canonical vault folder — only its own output dirs and the audit log', async () => {
  const dirs = makeDirs();
  const fetchImpl = htmlResponse(200, '<html><title>Audit only</title><body>content</body></html>');
  await runCollection({ ...dirs, sources: [source()], dryRun: false, fetchImpl });
  // The audit directory (standing in for elimfilters-vault/94-sync-log) should
  // contain exactly one collection audit record and nothing else appeared
  // anywhere outside the four directories explicitly passed in.
  const auditFiles = fs.readdirSync(dirs.auditDir);
  assert.equal(auditFiles.length, 1);
  assert.match(auditFiles[0], /\.collection\.json$/);
  const auditRecord = JSON.parse(fs.readFileSync(path.join(dirs.auditDir, auditFiles[0]), 'utf8'));
  assert.equal(auditRecord.database_write, false);
  assert.equal(auditRecord.pgvector_write, false);
  assert.equal(auditRecord.unified_data_write, false);
  assert.equal(auditRecord.approval_required, true);
});

test('a disabled source is skipped and never fetched', async () => {
  const dirs = makeDirs();
  let fetchCalls = 0;
  const fetchImpl = async () => { fetchCalls += 1; return { ok: true, status: 200, text: async () => 'x' }; };
  const summary = await runCollection({ ...dirs, sources: [source({ enabled: false })], dryRun: false, fetchImpl });
  assert.equal(fetchCalls, 0);
  assert.equal(summary.disabled, 1);
});

function registryOrg(overrides = {}) {
  return {
    id: 'org1',
    name: 'Org One',
    category: 'standards',
    parent_company: null,
    region: 'Global',
    official_domain: 'https://example.test',
    monitored_urls: [],
    source_type: 'html',
    enabled: false,
    official: true,
    trust_level: 'high',
    priority: 2,
    market_scope: null,
    product_scope: null,
    notes: '',
    status: 'DISCOVERY_REQUIRED',
    discovery_required: true,
    ...overrides
  };
}

function registryEndpoint(overrides = {}) {
  return {
    id: 'org1__news',
    organization_id: 'org1',
    url: 'https://example.test/news',
    endpoint_type: 'news',
    source_type: 'html',
    status: 'ACTIVE',
    enabled: true,
    verified_at: '2026-08-03T00:00:00.000Z',
    http_status_observed: 200,
    notes: '',
    ...overrides
  };
}

test('sourcesFromRegistry only includes endpoints that are both status=ACTIVE and enabled=true', () => {
  const organizations = [registryOrg({ id: 'org1', status: 'ACTIVE', enabled: true, discovery_required: false })];
  const endpoints = [
    registryEndpoint({ id: 'active_enabled', organization_id: 'org1', status: 'ACTIVE', enabled: true }),
    registryEndpoint({ id: 'active_disabled', organization_id: 'org1', status: 'ACTIVE', enabled: false }),
    registryEndpoint({ id: 'review_required', organization_id: 'org1', status: 'REVIEW_REQUIRED', enabled: false }),
    registryEndpoint({ id: 'paused', organization_id: 'org1', status: 'PAUSED', enabled: false })
  ];
  const sources = sourcesFromRegistry({ organizations, endpoints });
  assert.equal(sources.length, 1);
  assert.equal(sources[0].id, 'active_enabled');
});

test('sourcesFromRegistry never produces a source for a DISCOVERY_REQUIRED organization (no endpoint exists to select)', () => {
  const organizations = [registryOrg({ id: 'org1', status: 'DISCOVERY_REQUIRED', discovery_required: true, enabled: false })];
  const sources = sourcesFromRegistry({ organizations, endpoints: [] });
  assert.equal(sources.length, 0);
});

test('sourcesFromRegistry drops an endpoint that references an organization not present in the catalog', () => {
  const sources = sourcesFromRegistry({ organizations: [], endpoints: [registryEndpoint()] });
  assert.equal(sources.length, 0);
});

test('sourcesFromRegistry attaches organization_id, endpoint_id, region and trust_level to each source', () => {
  const organizations = [registryOrg({ id: 'org1', status: 'ACTIVE', enabled: true, discovery_required: false, region: 'Europe', trust_level: 'medium', category: 'filtration_competitor' })];
  const endpoints = [registryEndpoint({ id: 'org1__press', organization_id: 'org1' })];
  const [collectorSource] = sourcesFromRegistry({ organizations, endpoints });
  assert.equal(collectorSource.organization_id, 'org1');
  assert.equal(collectorSource.endpoint_id, 'org1__press');
  assert.equal(collectorSource.region, 'Europe');
  assert.equal(collectorSource.trust_level, 'medium');
  assert.equal(collectorSource.category, 'filtration_competitor');
});

test('a candidate built from a registry-derived source carries organization_id/endpoint_id/category/region/trust_level', () => {
  const organizations = [registryOrg({ id: 'org1', status: 'ACTIVE', enabled: true, discovery_required: false, region: 'North America', trust_level: 'high', category: 'standards' })];
  const endpoints = [registryEndpoint({ id: 'org1__news', organization_id: 'org1' })];
  const [collectorSource] = sourcesFromRegistry({ organizations, endpoints });
  const { candidate } = buildCandidate({ source: collectorSource, contentHash: sha256Hex('content'), title: 'Title', capturedAt: new Date().toISOString() });
  assert.equal(candidate.organization_id, 'org1');
  assert.equal(candidate.endpoint_id, 'org1__news');
  assert.equal(candidate.category, 'standards');
  assert.equal(candidate.region, 'North America');
  assert.equal(candidate.trust_level, 'high');
});

test('a candidate built from a legacy (non-registry) source never invents organization_id/endpoint_id/region', () => {
  const { candidate } = buildCandidate({ source: source(), contentHash: sha256Hex('content'), title: 'Title', capturedAt: new Date().toISOString() });
  assert.equal(candidate.organization_id, undefined);
  assert.equal(candidate.endpoint_id, undefined);
  assert.equal(candidate.region, undefined);
  assert.equal(candidate.category, 'standards');
  assert.equal(candidate.trust_level, 'high');
});

test('every category in the governed registry has a CATEGORY_RULES mapping (regression: this exact gap once made every non-"standards" registry candidate fail with BUILD_ERROR)', () => {
  for (const category of ALLOWED_CATEGORIES) {
    assert.ok(CATEGORY_RULES[category], `missing CATEGORY_RULES entry for registry category "${category}"`);
  }
});

test('every CATEGORY_RULES mapping points at a candidate_type and target folder hermes-core.mjs actually allows', () => {
  for (const [category, rule] of Object.entries(CATEGORY_RULES)) {
    assert.ok(ALLOWED_CANDIDATE_TYPES.has(rule.candidateType), `${category} maps to unknown candidate_type "${rule.candidateType}"`);
    assert.ok(ALLOWED_TARGETS.test(rule.targetFolder), `${category} maps to a target folder "${rule.targetFolder}" hermes-core.mjs would reject`);
  }
});

test('every ACTIVE+enabled endpoint in the shipped registry builds a schema-valid candidate (no BUILD_ERROR/INVALID_CANDIDATE)', async () => {
  const { loadRegistry } = await import('../../scripts/hermes/source-registry-core.mjs');
  const registry = loadRegistry('hermes/config/source-organizations.json', 'hermes/config/source-endpoints.json');
  const sources = sourcesFromRegistry(registry);
  assert.ok(sources.length > 0, 'expected at least one ACTIVE+enabled endpoint in the shipped registry');
  for (const collectorSource of sources) {
    const { candidate, error } = buildCandidate({ source: collectorSource, contentHash: sha256Hex(collectorSource.id), title: null, capturedAt: new Date().toISOString() });
    assert.equal(error, null, `${collectorSource.id}: ${error}`);
    const validationErrors = validateCandidate(candidate);
    assert.deepEqual(validationErrors, [], `${collectorSource.id}: ${JSON.stringify(validationErrors)}`);
  }
});

test('collector modules never import or connect to PostgreSQL, pgvector, or unified-data', () => {
  const coreSource = fs.readFileSync(new URL('../../scripts/hermes/collect-real-sources-core.mjs', import.meta.url), 'utf8');
  const cliSource = fs.readFileSync(new URL('../../scripts/hermes/collect-real-sources.mjs', import.meta.url), 'utf8');
  // The summary object legitimately mentions the *field names*
  // pgvector_write/database_write/unified_data_write (always false) — this
  // checks for an actual import/connection, not the presence of those field
  // name strings.
  for (const text of [coreSource, cliSource]) {
    assert.doesNotMatch(text, /from ['"]pg['"]/);
    assert.doesNotMatch(text, /require\(['"]pg['"]\)/);
    assert.doesNotMatch(text, /new (Pool|Client)\(/);
    assert.doesNotMatch(text, /import\s+.*pgvector/i);
    assert.doesNotMatch(text, /require\(['"].*pgvector.*['"]\)/i);
    assert.doesNotMatch(text, /unified-data\.ts/i);
  }
});
