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

  const categories = [
    ['air', 'EA'],
    ['oil', 'EL'],
    ['fuel', 'EF'],
    ['cabin', 'EC'],
  ];
  const rows = [];
  for (const [category, prefix] of categories) {
    for (let index = 1; index <= 62; index += 1) {
      const n = String(index).padStart(5, '0');
      rows.push({
        sku: `${prefix}${n}`,
        filter_type: category,
        sub_type: category === 'cabin' ? 'cabin' : null,
        duty: 'LIGHT_DUTY',
        technology: null,
        audit_category: category,
        category_sku_count: 62,
        application: {
          make: 'TEST MAKE',
          model: `MODEL ${n}`,
          year_range: '01/20 → 12/20',
          engine: index % 2 === 0 ? 'VVT-I FI' : 'DIESEL',
          market: 'USA',
        },
      });
    }
  }
  rows.sort((a, b) => a.audit_category.localeCompare(b.audit_category) || a.sku.localeCompare(b.sku));

  let queryCalls = 0;
  const client = {
    async query(sql, params) {
      queryCalls += 1;
      if (queryCalls === 1) {
        assert.match(sql, /statement_timeout/);
        return { rows: [] };
      }
      assert.match(sql, /WITH eligible AS/);
      assert.match(sql, /ROW_NUMBER\(\) OVER \(PARTITION BY e\.audit_category/);
      assert.match(sql, /category_rank <= \$7::int/);
      assert.deepStrictEqual(params, ['', 'LIGHT_DUTY', '', '', '', '', 62]);
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
  assert.strictEqual(payload.engine_version, 'coverage-audit-v5-balanced');
  assert.strictEqual(payload.scope.per_category_quota, 62);
  assert.strictEqual(payload.pagination.returned_skus, 248);
  assert.strictEqual(payload.summary.unique_skus, 248);
  assert.deepStrictEqual(payload.summary.category_sku_counts, { air: 62, oil: 62, fuel: 62, cabin: 62 });
  assert.strictEqual(payload.pagination.next_cursors.air, 'EA00062');
  assert.strictEqual(payload.pagination.next_cursors.oil, 'EL00062');
  assert.strictEqual(payload.pagination.next_cursors.fuel, 'EF00062');
  assert.strictEqual(payload.pagination.next_cursors.cabin, 'EC00062');
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

  console.log('[coverage-audit-engine] balanced v5 verification passed');
}

main().catch((error) => {
  console.error('[coverage-audit-engine] balanced v5 verification failed:', error.stack || error.message);
  process.exit(1);
});
