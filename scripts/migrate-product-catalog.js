/**
 * migrate-product-catalog.js
 * Standalone migration runner for the Product Catalog extension schema.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... node scripts/migrate-product-catalog.js
 *   DATABASE_URL=postgresql://... node scripts/migrate-product-catalog.js --seed
 *   DATABASE_URL=postgresql://... node scripts/migrate-product-catalog.js --validate
 *   DATABASE_URL=postgresql://... node scripts/migrate-product-catalog.js --seed --validate
 *
 * Flags:
 *   (none)      Run DDL only (001_product_catalog_schema.sql)
 *   --seed      Also run seed data (002_hydrocore_seed_data.sql)
 *   --validate  Run validation queries and print results
 *   --all       DDL + seed + validate
 *
 * Exit codes:
 *   0  Success
 *   1  DATABASE_URL not set
 *   2  SQL execution error
 *   3  Validation failure (mismatches or orphans detected)
 */

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const args = process.argv.slice(2);
const RUN_SEED     = args.includes('--seed')     || args.includes('--all');
const RUN_VALIDATE = args.includes('--validate')  || args.includes('--all');

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('[migrate-product-catalog] ERROR: DATABASE_URL is not set');
    process.exit(1);
  }

  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('[migrate-product-catalog] Connected to database');

    // ── Step 1: DDL ──────────────────────────────────────────────────────────
    console.log('[migrate-product-catalog] Running DDL: 001_product_catalog_schema.sql');
    const ddl = fs.readFileSync(
      path.join(MIGRATIONS_DIR, '001_product_catalog_schema.sql'), 'utf8'
    );
    await client.query(ddl);
    console.log('[migrate-product-catalog] Schema OK');

    // ── Step 2: Seed data ────────────────────────────────────────────────────
    if (RUN_SEED) {
      console.log('[migrate-product-catalog] Running seed: 002_hydrocore_seed_data.sql');
      const seed = fs.readFileSync(
        path.join(MIGRATIONS_DIR, '002_hydrocore_seed_data.sql'), 'utf8'
      );
      await client.query(seed);
      console.log('[migrate-product-catalog] Seed data OK');
    }

    // ── Step 3: Validation ───────────────────────────────────────────────────
    if (RUN_VALIDATE) {
      console.log('[migrate-product-catalog] Running validation...');
      const results = await runValidation(client);
      printValidationReport(results);
      if (!results.overall_pass) {
        console.error('[migrate-product-catalog] VALIDATION FAILED — see report above');
        process.exit(3);
      }
    }

    console.log('[migrate-product-catalog] Done');
  } catch (e) {
    console.error('[migrate-product-catalog] SQL ERROR:', e.message);
    process.exit(2);
  } finally {
    await client.end();
  }
}

async function runValidation(client) {
  const results = { checks: [], overall_pass: true };

  // ── Row counts ──────────────────────────────────────────────────────────────
  const EXPECTED_COUNTS = {
    product_family:              1,
    product_model:               4,
    product_element:             6,
    model_element_compatibility: 12,
    alternative_group:           2,
    alternative_group_member:    6,
  };
  for (const [table, expected] of Object.entries(EXPECTED_COUNTS)) {
    let actual = 0;
    try {
      const r = await client.query(`SELECT COUNT(*) FROM ${table}`);
      actual = parseInt(r.rows[0].count);
    } catch (_) {
      results.checks.push({ check: `row_count.${table}`, status: 'FAIL', detail: 'Table not found' });
      results.overall_pass = false;
      continue;
    }
    const pass = actual >= expected;
    if (!pass) results.overall_pass = false;
    results.checks.push({
      check: `row_count.${table}`,
      status: pass ? 'PASS' : 'FAIL',
      detail: `expected >= ${expected}, got ${actual}`,
    });
  }

  // ── One baseline per group ──────────────────────────────────────────────────
  // LEFT JOIN so groups with zero baselines are detected, not just duplicates.
  try {
    const r = await client.query(`
      SELECT ag.group_code, COUNT(agm.element_id) AS baseline_count
      FROM alternative_group ag
      LEFT JOIN alternative_group_member agm
        ON agm.group_id = ag.id AND agm.is_baseline = TRUE
      GROUP BY ag.group_code
    `);
    const bad = r.rows.filter(row => parseInt(row.baseline_count) !== 1);
    const pass = bad.length === 0;
    if (!pass) results.overall_pass = false;
    const badLabeled = bad.map(row => ({
      group_code:     row.group_code,
      baseline_count: parseInt(row.baseline_count),
      failure:        parseInt(row.baseline_count) === 0 ? 'NO_BASELINE' : 'DUPLICATE_BASELINE',
    }));
    results.checks.push({
      check: 'one_baseline_per_group',
      status: pass ? 'PASS' : 'FAIL',
      detail: pass
        ? `${r.rows.length} group(s), all valid`
        : `Violations: ${JSON.stringify(badLabeled)}`,
    });
  } catch (e) {
    results.checks.push({ check: 'one_baseline_per_group', status: 'FAIL', detail: e.message });
    results.overall_pass = false;
  }

  // ── Compatibility class integrity ───────────────────────────────────────────
  try {
    const r = await client.query(`
      SELECT COUNT(*) AS mismatches
      FROM model_element_compatibility mec
      JOIN product_model  pm ON pm.id = mec.product_model_id
      JOIN product_element pe ON pe.id = mec.product_element_id
      WHERE pm.compatibility_class != pe.compatibility_class
    `);
    const mismatches = parseInt(r.rows[0].mismatches);
    const pass = mismatches === 0;
    if (!pass) results.overall_pass = false;
    results.checks.push({
      check: 'compatibility_class_integrity',
      status: pass ? 'PASS' : 'FAIL',
      detail: pass ? 'No mismatches' : `${mismatches} mismatch(es) found`,
    });
  } catch (e) {
    results.checks.push({ check: 'compatibility_class_integrity', status: 'FAIL', detail: e.message });
    results.overall_pass = false;
  }

  // ── Orphan elements ─────────────────────────────────────────────────────────
  try {
    const r = await client.query(`
      SELECT pe.element_code
      FROM product_element pe
      LEFT JOIN alternative_group_member agm ON agm.element_id = pe.id
      WHERE agm.element_id IS NULL
    `);
    const pass = r.rows.length === 0;
    if (!pass) results.overall_pass = false;
    results.checks.push({
      check: 'no_orphan_elements',
      status: pass ? 'PASS' : 'FAIL',
      detail: pass ? 'No orphans' : `Orphaned: ${r.rows.map(x => x.element_code).join(', ')}`,
    });
  } catch (e) {
    results.checks.push({ check: 'no_orphan_elements', status: 'FAIL', detail: e.message });
    results.overall_pass = false;
  }

  // ── PENDING compatibility confidence ────────────────────────────────────────
  try {
    const r = await client.query(`
      SELECT COUNT(*) AS pending_count
      FROM model_element_compatibility
      WHERE compatibility_confidence = 'PENDING'
    `);
    const count = parseInt(r.rows[0].pending_count);
    results.checks.push({
      check: 'pending_compatibility',
      status: count === 0 ? 'PASS' : 'WARNING',
      detail: count === 0
        ? 'No PENDING records'
        : `${count} PENDING record(s) — Recommendation Engine will cap confidence at LOW`,
    });
  } catch (e) {
    results.checks.push({ check: 'pending_compatibility', status: 'FAIL', detail: e.message });
  }

  // ── SKU linkage status ───────────────────────────────────────────────────────
  try {
    const pm = await client.query(`SELECT COUNT(*) AS c FROM product_model    WHERE elimfilters_sku IS NULL`);
    const pe = await client.query(`SELECT COUNT(*) AS c FROM product_element   WHERE elimfilters_sku IS NULL`);
    const unlinked_models   = parseInt(pm.rows[0].c);
    const unlinked_elements = parseInt(pe.rows[0].c);
    results.checks.push({
      check: 'sku_linkage',
      status: (unlinked_models + unlinked_elements === 0) ? 'PASS' : 'WARNING',
      detail: `Models unlinked: ${unlinked_models}. Elements unlinked: ${unlinked_elements}. `
            + 'Cross-reference lookups require SKU assignment in elimfilters_catalog.',
    });
  } catch (e) {
    results.checks.push({ check: 'sku_linkage', status: 'FAIL', detail: e.message });
  }

  return results;
}

function printValidationReport(results) {
  console.log('\n══════════════════════════════════════════════════');
  console.log(' PRODUCT CATALOG MIGRATION — VALIDATION REPORT');
  console.log('══════════════════════════════════════════════════');
  for (const check of results.checks) {
    const icon = check.status === 'PASS'    ? '✓'
               : check.status === 'WARNING' ? '⚠'
               : '✗';
    console.log(`  ${icon}  [${check.status.padEnd(7)}] ${check.check}`);
    console.log(`          ${check.detail}`);
  }
  console.log('──────────────────────────────────────────────────');
  console.log(`  OVERALL: ${results.overall_pass ? '✓ PASS' : '✗ FAIL'}`);
  console.log('══════════════════════════════════════════════════\n');
}

main();
