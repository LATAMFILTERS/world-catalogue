'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { registerCoverageAuditEngine } = require('../src/coverage-audit-engine');
const { buildUnits, createCoverageAccumulator, addRows, finalizeCoverage } = require('../src/audit/coverage/service');

function row(sku, filterType, application, applicationSource = 'vehicle', pageSkuCount = 7, oemCodes = [], competitorCodes = []) {
  return {
    sku,
    filter_type: filterType,
    sub_type: null,
    duty: null,
    technology: null,
    application,
    application_source: applicationSource,
    oem_codes: oemCodes,
    competitor_codes: competitorCodes,
    page_sku_count: pageSkuCount,
  };
}

async function main() {
  const root = path.join(__dirname, '..');
  const requiredFiles = [
    'src/coverage-audit-engine.js',
    'src/audit/coverage/normalization.js',
    'src/audit/coverage/policies.js',
    'src/audit/coverage/repository.js',
    'src/audit/coverage/service.js',
    'src/audit/coverage/intelligence.js',
    'src/audit/coverage/route.js',
    'scripts/register-coverage-audit-direct.js',
    'server-original.js',
  ];

  for (const relative of requiredFiles) {
    const file = path.join(root, relative);
    assert(fs.existsSync(file), `Missing required file: ${relative}`);
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  }

  const matrixRows = [
    row('EA90001', 'air', { make: 'TOYOTA', model: '2017 COROLLA SEDAN 1.8L VVT-I USA', year_range: '01/17 → 12/17', engine: '2ZR-FE VVT-I', market: 'USA' }),
    row('EL90001', 'oil', { make: 'TOYOTA', model: '2017 COROLLA SEDAN 1.8L VVT-I USA', year_range: '01/17 → 12/17', engine: '2ZR-FE VVT-I', market: 'USA' }),
    row('EC90001', 'cabin', { make: 'TOYOTA', model: '2017 COROLLA SEDAN 1.8L VVT-I USA', year_range: '01/17 → 12/17', engine: '2ZR-FE VVT-I', market: 'USA' }),
    row('EA90002', 'air', { make: 'AGCO', model: 'TRACTOR 8000 SERIES 8775', engine: 'DIESEL' }, 'equipment'),
    row('EH90001', 'hydraulic', {}, 'none', 7, ['OEM-100'], ['CROSS-100']),
    row('EH90002', 'hydraulic', { make: 'CATERPILLAR', model: 'EXCAVATOR 320' }, 'equipment'),
    row('EF90001', 'fuel', {}, 'none'),
  ];

  const ld = buildUnits(matrixRows, 'LIGHT_DUTY');
  assert.strictEqual(ld.units.length, 1);
  assert.strictEqual(ld.units[0].status, 'complete');

  const accumulator = createCoverageAccumulator('ALL');
  addRows(accumulator, matrixRows.slice(0, 3));
  addRows(accumulator, matrixRows.slice(3));
  const complete = finalizeCoverage(accumulator, { gapLimit: 50, reviewLimit: 50 });

  assert.strictEqual(complete.summary.operational_rows, 5);
  assert.strictEqual(complete.summary.quarantined_rows, 2);
  assert.strictEqual(complete.summary.review_skus, 2);
  assert.strictEqual(complete.summary.rows_vehicle_application, 3);
  assert.strictEqual(complete.summary.rows_equipment_application, 2);
  assert.strictEqual(complete.summary.rows_without_published_application, 2);
  assert.strictEqual(complete.summary.hydraulic_without_published_equipment, 1);
  assert.strictEqual(complete.summary.products_with_oem_codes_but_no_application, 1);
  assert.strictEqual(complete.summary.products_with_crossrefs_but_no_application, 1);

  const hydraulicReview = complete.review_queue.find((item) => item.sku === 'EH90001');
  assert(hydraulicReview);
  assert.strictEqual(hydraulicReview.likely_hydraulic, true);
  assert.strictEqual(hydraulicReview.suggested_disposition, 'research_equipment_or_confirm_oem_only');
  assert(hydraulicReview.reasons.includes('hydraulic_without_published_equipment'));
  assert(hydraulicReview.reasons.includes('oem_reference_present_without_application'));
  assert(hydraulicReview.reasons.includes('lifecycle_or_oem_restriction_requires_verification'));

  const genericReview = complete.review_queue.find((item) => item.sku === 'EF90001');
  assert(genericReview);
  assert.strictEqual(genericReview.suggested_disposition, 'verify_active_obsolete_or_application_unpublished');

  assert(complete.coverage_matrix.by_segment.LIGHT_DUTY > 0);
  assert(complete.coverage_matrix.by_segment.HEAVY_DUTY > 0);
  assert(complete.opportunities_by_make.some((entry) => entry.make === 'AGCO'));

  const routes = { get: [], post: [] };
  const app = {
    get(route, limiter, handler) { assert.strictEqual(typeof limiter, 'function'); assert.strictEqual(typeof handler, 'function'); routes.get.push(route); },
    post(route, limiter, handler) { assert.strictEqual(typeof limiter, 'function'); assert.strictEqual(typeof handler, 'function'); routes.post.push(route); },
  };
  const pool = { async connect() { throw new Error('not called during registration'); } };
  const limiter = (_req, _res, next) => next();
  registerCoverageAuditEngine(app, pool, limiter);

  assert(routes.get.includes('/api/audit/coverage-engine'));
  assert(routes.get.includes('/api/audit/coverage-intelligence/status'));
  assert(routes.post.includes('/api/audit/coverage-intelligence/run'));

  const serverSource = fs.readFileSync(path.join(root, 'server-original.js'), 'utf8');
  const markerCount = (serverSource.match(/\/\/ COVERAGE_AUDIT_DIRECT_V4/g) || []).length;
  assert(markerCount <= 1, `Duplicate coverage registration markers: ${markerCount}`);

  console.log('[coverage-intelligence] full catalogue application-source verification passed');
}

main().catch((error) => {
  console.error('[coverage-intelligence] verification failed:', error.stack || error.message);
  process.exit(1);
});