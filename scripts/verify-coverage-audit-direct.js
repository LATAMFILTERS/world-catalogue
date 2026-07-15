const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { registerCoverageAuditEngine } = require('../src/coverage-audit-engine');

async function main() {
  const root = path.join(__dirname, '..');
  const modulePath = path.join(root, 'src', 'coverage-audit-engine.js');
  const registrationPath = path.join(root, 'scripts', 'register-coverage-audit-direct.js');
  const serverPath = path.join(root, 'server-original.js');

  for (const file of [modulePath, registrationPath, serverPath]) {
    assert(fs.existsSync(file), `Missing required file: ${path.relative(root, file)}`);
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  }

  let capturedRoute = null;
  const app = {
    get(route, limiter, handler) {
      assert.strictEqual(route, '/api/audit/coverage-engine');
      assert.strictEqual(typeof limiter, 'function');
      assert.strictEqual(typeof handler, 'function');
      capturedRoute = handler;
    },
  };

  const rows = Array.from({ length: 250 }, (_, index) => {
    const n = String(index + 1).padStart(5, '0');
    const prefix = index % 4 === 0 ? 'EA' : index % 4 === 1 ? 'EL' : index % 4 === 2 ? 'EF' : 'EC';
    return {
      sku: `${prefix}${n}`,
      filter_type: prefix === 'EA' ? 'air' : prefix === 'EL' ? 'oil' : prefix === 'EF' ? 'fuel' : 'cabin',
      sub_type: null,
      duty: 'LIGHT_DUTY',
      technology: null,
      page_sku_count: 250,
      application: {
        make: 'TEST MAKE',
        model: `MODEL ${n}`,
        year_range: '01/20 → 12/20',
        engine: index % 2 === 0 ? 'VVT-I FI' : 'DIESEL',
        market: 'USA',
      },
    };
  }).sort((a, b) => a.sku.localeCompare(b.sku));

  let queryCalls = 0;
  const client = {
    async query(sql, params) {
      queryCalls += 1;
      if (queryCalls === 1) {
        assert.match(sql, /statement_timeout/);
        return { rows: [] };
      }
      assert.match(sql, /WITH page_skus AS/);
      assert.match(sql, /LIMIT \$4::int/);
      assert.deepStrictEqual(params, ['', 'LIGHT_DUTY', '', 250]);
      return { rows };
    },
    release() {},
  };
  const pool = { async connect() { return client; } };
  const limiter = (_req, _res, next) => next();

  registerCoverageAuditEngine(app, pool, limiter);
  assert.strictEqual(typeof capturedRoute, 'function');

  const req = { query: { duty: 'LIGHT_DUTY', limit: '250' } };
  let payload = null;
  const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { payload = body; return body; },
  };

  await capturedRoute(req, res);
  assert.strictEqual(res.statusCode, 200);
  assert(payload && payload.success === true);
  assert.strictEqual(payload.engine_version, 'coverage-audit-v4-direct');
  assert.strictEqual(payload.pagination.returned_skus, 250);
  assert.strictEqual(payload.summary.unique_skus, 250);
  assert.strictEqual(payload.pagination.next_after_sku, rows[rows.length - 1].sku);
  assert(payload.summary.category_unit_counts.air > 0);
  assert(payload.summary.category_unit_counts.oil > 0);
  assert(payload.summary.category_unit_counts.fuel > 0);
  assert(payload.summary.category_unit_counts.cabin > 0);
  assert.strictEqual(queryCalls, 2);

  const serverSource = fs.readFileSync(serverPath, 'utf8');
  const markerCount = (serverSource.match(/\/\/ COVERAGE_AUDIT_DIRECT_V4/g) || []).length;
  assert.strictEqual(markerCount, 1, `Expected one direct registration marker, found ${markerCount}`);
  assert(serverSource.includes("require('./src/coverage-audit-engine')"));
  assert(serverSource.includes('registerCoverageAuditEngine(app, pool, searchLimiter)'));

  console.log('[coverage-audit-engine] direct v4 verification passed');
}

main().catch((error) => {
  console.error('[coverage-audit-engine] direct v4 verification failed:', error.stack || error.message);
  process.exit(1);
});
