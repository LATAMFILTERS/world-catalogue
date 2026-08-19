// HERMES Phase 5 Lite — source registry validator tests.
// Pure in-memory fixtures; no filesystem or network access except for the
// regression check that the actually-shipped registry files still validate.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateRegistry,
  loadRegistry,
  buildCoverageReport,
  activeEndpoints
} from '../../scripts/hermes/source-registry-core.mjs';

function baseOrg(overrides = {}) {
  return {
    id: 'acme_oem',
    name: 'Acme OEM',
    category: 'oem_light_duty',
    parent_company: null,
    region: 'Global',
    official_domain: 'https://www.acme-oem.example',
    monitored_urls: [],
    source_type: 'html',
    enabled: false,
    official: true,
    trust_level: 'medium',
    priority: 2,
    market_scope: null,
    product_scope: null,
    notes: '',
    status: 'DISCOVERY_REQUIRED',
    discovery_required: true,
    ...overrides
  };
}

function baseEndpoint(overrides = {}) {
  return {
    id: 'acme_oem__news',
    organization_id: 'acme_oem',
    url: 'https://www.acme-oem.example/news',
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

test('a clean minimal registry validates with zero errors', () => {
  const org = baseOrg({ status: 'ACTIVE', discovery_required: false, enabled: true });
  const errors = validateRegistry({ organizations: [org], endpoints: [baseEndpoint()] });
  assert.deepEqual(errors, []);
});

test('duplicate organization ids are rejected', () => {
  const errors = validateRegistry({ organizations: [baseOrg(), baseOrg()], endpoints: [] });
  assert.ok(errors.some((e) => e.includes('duplicate organization id: acme_oem')));
});

test('two unrelated organizations sharing a domain without a common parent_company are rejected', () => {
  const orgs = [
    baseOrg({ id: 'brand_a', name: 'Brand A', parent_company: null }),
    baseOrg({ id: 'brand_b', name: 'Brand B', parent_company: null })
  ];
  const errors = validateRegistry({ organizations: orgs, endpoints: [] });
  assert.ok(errors.some((e) => e.includes('shared by organizations without a common parent_company')));
});

test('two divisions of the same parent sharing a domain are accepted', () => {
  const orgs = [
    baseOrg({ id: 'parent_co', name: 'Parent Co', parent_company: null }),
    baseOrg({ id: 'parent_co_division', name: 'Parent Co Division', parent_company: 'Parent Co' })
  ];
  const errors = validateRegistry({ organizations: orgs, endpoints: [] });
  assert.deepEqual(errors, []);
});

test('a non-HTTPS official_domain is rejected', () => {
  const errors = validateRegistry({ organizations: [baseOrg({ official_domain: 'http://www.acme-oem.example' })], endpoints: [] });
  assert.ok(errors.some((e) => e.includes('must be HTTPS')));
});

test('a non-HTTPS endpoint url is rejected', () => {
  const org = baseOrg({ status: 'ACTIVE', enabled: true, discovery_required: false });
  const endpoint = baseEndpoint({ url: 'http://www.acme-oem.example/news' });
  const errors = validateRegistry({ organizations: [org], endpoints: [endpoint] });
  assert.ok(errors.some((e) => e.includes('url must be HTTPS')));
});

test('an invalid category is rejected', () => {
  const errors = validateRegistry({ organizations: [baseOrg({ category: 'oem_spaceships' })], endpoints: [] });
  assert.ok(errors.some((e) => e.includes('invalid category')));
});

test('a missing official_domain is rejected', () => {
  const errors = validateRegistry({ organizations: [baseOrg({ official_domain: '' })], endpoints: [] });
  assert.ok(errors.some((e) => e.includes('missing official_domain')));
});

test('a known filtration competitor filed under an OEM category is rejected', () => {
  const errors = validateRegistry({ organizations: [baseOrg({ id: 'donaldson', name: 'Donaldson Company', category: 'oem_heavy_duty' })], endpoints: [] });
  assert.ok(errors.some((e) => e.includes('known filtration competitor classified under OEM category')));
});

test('a known OEM filed under filtration_competitor is rejected', () => {
  const errors = validateRegistry({ organizations: [baseOrg({ id: 'caterpillar', name: 'Caterpillar Inc.', category: 'filtration_competitor' })], endpoints: [] });
  assert.ok(errors.some((e) => e.includes('known OEM classified under filtration_competitor')));
});

test('an endpoint referencing an unknown organization_id is rejected as an invented endpoint', () => {
  const errors = validateRegistry({ organizations: [], endpoints: [baseEndpoint()] });
  assert.ok(errors.some((e) => e.includes('invented endpoint')));
});

test('an endpoint whose host does not belong to the organization domain is rejected', () => {
  const org = baseOrg({ status: 'ACTIVE', enabled: true, discovery_required: false });
  const endpoint = baseEndpoint({ url: 'https://totally-different-domain.example/news' });
  const errors = validateRegistry({ organizations: [org], endpoints: [endpoint] });
  assert.ok(errors.some((e) => e.includes('does not match organization')));
});

test('a login/account/cart URL is rejected as a disallowed collector target', () => {
  const org = baseOrg({ status: 'ACTIVE', enabled: true, discovery_required: false });
  for (const badPath of ['/login', '/account', '/cart', '/checkout']) {
    const endpoint = baseEndpoint({ url: `https://www.acme-oem.example${badPath}` });
    const errors = validateRegistry({ organizations: [org], endpoints: [endpoint] });
    assert.ok(errors.some((e) => e.includes('login/account/cart/admin')), `expected rejection for ${badPath}`);
  }
});

test('a full product catalog URL is rejected as a disallowed collector target', () => {
  const org = baseOrg({ status: 'ACTIVE', enabled: true, discovery_required: false });
  const endpoint = baseEndpoint({ url: 'https://www.acme-oem.example/product-catalog' });
  const errors = validateRegistry({ organizations: [org], endpoints: [endpoint] });
  assert.ok(errors.some((e) => e.includes('full product catalog')));
});

test('an invalid endpoint_type is rejected', () => {
  const org = baseOrg({ status: 'ACTIVE', enabled: true, discovery_required: false });
  const endpoint = baseEndpoint({ endpoint_type: 'internal_search_results' });
  const errors = validateRegistry({ organizations: [org], endpoints: [endpoint] });
  assert.ok(errors.some((e) => e.includes('invalid endpoint_type')));
});

test('enabled=true requires status=ACTIVE and vice versa', () => {
  const org = baseOrg({ status: 'ACTIVE', enabled: true, discovery_required: false });
  const mismatched = baseEndpoint({ status: 'REVIEW_REQUIRED', enabled: true });
  const errors = validateRegistry({ organizations: [org], endpoints: [mismatched] });
  assert.ok(errors.some((e) => e.includes('enabled=true requires status=ACTIVE')));
});

test('the shipped source-organizations.json and source-endpoints.json validate cleanly (regression)', () => {
  const registry = loadRegistry('hermes/config/source-organizations.json', 'hermes/config/source-endpoints.json');
  const errors = validateRegistry(registry);
  assert.deepEqual(errors, [], `registry has validation errors: ${JSON.stringify(errors)}`);
  assert.ok(registry.organizations.length > 100, 'expected a broad governed registry, not a handful of examples');
});

test('activeEndpoints only returns endpoints with status ACTIVE', () => {
  const endpoints = [baseEndpoint({ id: 'a', status: 'ACTIVE' }), baseEndpoint({ id: 'b', status: 'REVIEW_REQUIRED', enabled: false })];
  const result = activeEndpoints(endpoints);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'a');
});

test('buildCoverageReport aggregates totals, per-category, per-region and segment coverage', () => {
  const organizations = [
    baseOrg({ id: 'ld1', category: 'oem_light_duty', region: 'Global', status: 'ACTIVE', discovery_required: false, enabled: true }),
    baseOrg({ id: 'ld2', category: 'oem_light_duty', region: 'Europe' }),
    baseOrg({ id: 'comp1', category: 'filtration_competitor', region: 'North America' })
  ];
  const endpoints = [baseEndpoint({ id: 'ld1__news', organization_id: 'ld1' })];
  const report = buildCoverageReport({ organizations, endpoints }, '2026-08-03T00:00:00.000Z');
  assert.equal(report.totals.organizations, 3);
  assert.equal(report.totals.discovery_required_organizations, 2);
  assert.equal(report.by_category.oem_light_duty, 2);
  assert.equal(report.by_region.Europe, 1);
  assert.equal(report.coverage.light_duty.total, 2);
  assert.equal(report.coverage.light_duty.active, 1);
  assert.equal(report.database_write, false);
});
