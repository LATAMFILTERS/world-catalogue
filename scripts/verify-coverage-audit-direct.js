'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { registerCoverageAuditEngine } = require('../src/coverage-audit-engine');
const { buildUnits, createCoverageAccumulator, addRows, finalizeCoverage } = require('../src/audit/coverage/service');

function row(sku, filterType, application, pageSkuCount = 5) {
  return { sku, filter_type: filterType, sub_type: null, duty: null, technology: null, application, page_sku_count: pageSkuCount };
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
    row('EA90002', 'air', { make: 'AGCO', model: 'TRACTOR 8000 SERIES 8775', engine: 'DIESEL' }),
    row('EH90001', 'hydraulic', {}),
  ];

  const ld = buildUnits(matrixRows, 'LIGHT_DUTY');
  assert.strictEqual(ld.units.length, 1);
  assert.strictEqual(ld.units[0].status, 'complete');

  const accumulator = createCoverageAccumulator('ALL');
  addRows(accumulator, matrixRows.slice(0, 2));
  addRows(accumulator, matrixRows.slice(2));
  const complete = finalizeCoverage(accumulator, { gapLimit: 50, reviewLimit: 50 });
  assert.strictEqual(complete.summary.operational_rows, 4);
  assert.strictEqual(complete.summary.quarantined_rows, 1);
  assert.strictEqual(complete.summary.review_skus, 1);
  assert.strictEqual(complete.review_queue[0].sku, 'EH90001');
  assert.strictEqual(complete.review_queue[0].likely_hydraulic, true);
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

  console.log('[coverage-intelligence] phase 1 full-catalog verification passed');
}

main().catch((error) => {
  console.error('[coverage-intelligence] phase 1 verification failed:', error.stack || error.message);
  process.exit(1);
});