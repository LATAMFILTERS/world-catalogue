'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { registerCoverageAuditEngine } = require('../src/coverage-audit-engine');
const { buildUnits } = require('../src/audit/coverage/service');

function row(sku, filterType, application) {
  return { sku, filter_type: filterType, sub_type: null, duty: null, technology: null, application, page_sku_count: 4 };
}

async function main() {
  const root = path.join(__dirname, '..');
  const requiredFiles = [
    'src/coverage-audit-engine.js',
    'src/audit/coverage/normalization.js',
    'src/audit/coverage/policies.js',
    'src/audit/coverage/repository.js',
    'src/audit/coverage/service.js',
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
    row('EA90003', 'air', { make: 'BECKER KOMPRESSOREN', model: 'ROTARY VANE COMPRESSOR OIL FREE DT 4 40' }),
  ];

  const ld = buildUnits(matrixRows, 'LIGHT_DUTY');
  assert.strictEqual(ld.units.length, 1, 'Corolla rows must form one LD coverage unit');
  assert.strictEqual(ld.units[0].status, 'complete');
  assert.deepStrictEqual(ld.units[0].categories, ['cabin_air', 'engine_air', 'engine_oil']);

  const hd = buildUnits(matrixRows, 'HEAVY_DUTY');
  assert.strictEqual(hd.units.length, 1, 'AGCO tractor must be classified as HD');
  assert.strictEqual(hd.units[0].asset_class, 'mobile_heavy_equipment');
  assert(hd.units[0].missing_required_categories.includes('engine_oil'));
  assert(hd.units[0].missing_required_categories.includes('fuel'));

  const industrial = buildUnits(matrixRows, 'INDUSTRIAL');
  assert.strictEqual(industrial.units.length, 1, 'Compressor must be classified as industrial');
  assert.strictEqual(industrial.units[0].asset_class, 'industrial_equipment');
  assert.deepStrictEqual(industrial.units[0].required_categories, []);

  let capturedRoute = null;
  const app = { get(route, limiter, handler) { assert.strictEqual(route, '/api/audit/coverage-engine'); assert.strictEqual(typeof limiter, 'function'); capturedRoute = handler; } };
  let queryCalls = 0;
  const client = {
    async query(sql, params) {
      queryCalls += 1;
      if (queryCalls === 1) return { rows: [] };
      assert.match(sql, /WITH page_skus AS/);
      assert.deepStrictEqual(params, ['', '', 250]);
      return { rows: matrixRows };
    },
    release() {},
  };
  const pool = { async connect() { return client; } };
  const limiter = (_req, _res, next) => next();
  registerCoverageAuditEngine(app, pool, limiter);

  let payload = null;
  const req = { query: { segment: 'ALL', limit: '250' } };
  const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { payload = body; return body; } };
  await capturedRoute(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(payload.engine_version, 'coverage-audit-domain-v1');
  assert(payload.summary.segment_counts.LIGHT_DUTY > 0);
  assert(payload.summary.segment_counts.HEAVY_DUTY > 0);
  assert(payload.summary.segment_counts.INDUSTRIAL > 0);
  assert.strictEqual(queryCalls, 2);

  const serverSource = fs.readFileSync(path.join(root, 'server-original.js'), 'utf8');
  const markerCount = (serverSource.match(/\/\/ COVERAGE_AUDIT_DIRECT_V4/g) || []).length;
  assert(markerCount <= 1, `Duplicate coverage registration markers: ${markerCount}`);

  console.log('[coverage-audit-engine] domain v1 matrix verification passed');
}

main().catch((error) => {
  console.error('[coverage-audit-engine] domain v1 matrix verification failed:', error.stack || error.message);
  process.exit(1);
});
