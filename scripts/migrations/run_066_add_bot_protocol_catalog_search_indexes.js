'use strict';
/**
 * DRY RUN ONLY -- NOT YET APPLIED. Run as:
 *   node scripts/migrations/run_066_add_bot_protocol_catalog_search_indexes.js
 * (--apply exists for when this is approved; do not use yet.)
 *
 * Purpose: fix the root cause of the 12-55s response times observed on the
 * live web chat (/api/chat -> lib/bot-protocol-unified-orchestrator.js ->
 * lib/bot-protocol-catalog.js). All three catalog queries used by the bot
 * protocol run as full sequential scans over elimfilters_catalog (12,182
 * rows) because none of the WHERE clauses match an existing index:
 *
 *   - searchByReferences() "direct" query filters on
 *     upper(regexp_replace(sku/codigo_base, ...)) -- an expression, not the
 *     raw column, so the existing sku/codigo_base btree indexes don't apply.
 *     Measured: 479ms.
 *   - crossReferenceCandidatesFor() filters oem_codes/competitor_codes with
 *     @> ANY(...) (JSONB containment) -- no GIN index exists on either
 *     column. Measured: 4,602ms.
 *   - searchByApplication() filters coalesce(equipment_applications::text,
 *     '') ILIKE '%term%' -- JSONB cast to text then pattern-matched with a
 *     leading wildcard, on every row, with no index able to help a plain
 *     ILIKE. Measured: 23,711ms -- this single query is the majority of the
 *     54.7s end-to-end response time reported by a live customer.
 *
 * This migration is schema-only and purely additive: four new indexes, one
 * new trusted extension (pg_trgm, not yet installed; verified installable by
 * the current role without superuser). No table data is read, written, or
 * locked for writes -- every CREATE INDEX runs CONCURRENTLY (outside any
 * transaction, per Postgres requirement) so production writes are never
 * blocked. Nothing here is destructive; every index has an individual,
 * ready-to-run DROP INDEX CONCURRENTLY rollback, printed as it's created and
 * listed again in the final summary.
 *
 * Scope: indexes only. The lib/bot-protocol-db.js statement_timeout clamp
 * bug (resolveStatementTimeout forces every caller-requested timeout up to a
 * 30s floor via Math.max, defeating searchByApplication's intended 8s and
 * searchCompatibleElements's intended 5s) is a separate code fix, deployed
 * and measured only after this migration's impact is confirmed.
 *
 * Verification: EXPLAIN (ANALYZE, BUFFERS) is run on each target query
 * before --apply (baseline) and after each index is created, to confirm the
 * planner actually switches from Seq Scan to an index-based plan -- not just
 * that the index exists. ANALYZE elimfilters_catalog runs after all indexes
 * are created so the planner's statistics reflect them immediately.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  // Two runs of this script both dropped the connection consistently right
  // after the first index step, including on a no-op (already-exists) skip
  // that took under a second -- pointing at an idle/network-layer connection
  // reset rather than genuine query duration. keepAlive matches the app's
  // own pool config in lib/bot-protocol-db.js, which does not exhibit this.
  keepAlive: true,
  keepAliveInitialDelayMillis: 5000,
});
// Without this handler, an async network drop surfaces as an uncaught
// 'error' event and crashes the process outside the try/catch below, rather
// than as a catchable rejection.
client.on('error', error => console.error('[db-client-error-event]', error.message));

const INDEXES = [
  {
    name: 'idx_catalog_oem_codes_gin',
    ddl: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_catalog_oem_codes_gin
            ON elimfilters_catalog USING gin (oem_codes jsonb_path_ops)`,
    rollback: 'DROP INDEX CONCURRENTLY IF EXISTS idx_catalog_oem_codes_gin',
    verify: {
      label: 'OEM/competitor cross-reference (oem_codes @> ANY)',
      sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
            SELECT id, sku FROM elimfilters_catalog c
             WHERE c.oem_codes @> ANY($1::jsonb[])
             LIMIT 40`,
      params: [[JSON.stringify([{ code: 'LF9009' }]), JSON.stringify([{ reference: 'LF9009' }]), JSON.stringify([{ part_number: 'LF9009' }])]],
      expectPlanContains: 'idx_catalog_oem_codes_gin'
    }
  },
  {
    name: 'idx_catalog_competitor_codes_gin',
    ddl: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_catalog_competitor_codes_gin
            ON elimfilters_catalog USING gin (competitor_codes jsonb_path_ops)`,
    rollback: 'DROP INDEX CONCURRENTLY IF EXISTS idx_catalog_competitor_codes_gin',
    verify: {
      label: 'OEM/competitor cross-reference (competitor_codes @> ANY)',
      sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
            SELECT id, sku FROM elimfilters_catalog c
             WHERE c.competitor_codes @> ANY($1::jsonb[])
             LIMIT 40`,
      params: [[JSON.stringify([{ code: 'LF9009' }]), JSON.stringify([{ reference: 'LF9009' }]), JSON.stringify([{ part_number: 'LF9009' }])]],
      expectPlanContains: 'idx_catalog_competitor_codes_gin'
    }
  },
  {
    name: 'idx_catalog_equipment_applications_trgm',
    requiresExtension: 'pg_trgm',
    ddl: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_catalog_equipment_applications_trgm
            ON elimfilters_catalog USING gin ((coalesce(equipment_applications::text, '')) gin_trgm_ops)`,
    rollback: 'DROP INDEX CONCURRENTLY IF EXISTS idx_catalog_equipment_applications_trgm',
    verify: {
      label: 'Free-text application lookup (equipment_applications ILIKE)',
      sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
            SELECT id, sku FROM elimfilters_catalog c
             WHERE coalesce(c.equipment_applications::text, '') ILIKE $1
             LIMIT 120`,
      params: ['%CL120%'],
      expectPlanContains: 'idx_catalog_equipment_applications_trgm'
    }
  },
  {
    name: 'idx_catalog_sku_normalized',
    ddl: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_catalog_sku_normalized
            ON elimfilters_catalog (upper(regexp_replace(coalesce(sku, ''), '[^A-Z0-9]', '', 'g')))`,
    rollback: 'DROP INDEX CONCURRENTLY IF EXISTS idx_catalog_sku_normalized',
    verify: {
      label: 'Direct SKU lookup (normalized sku)',
      sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
            SELECT id, sku FROM elimfilters_catalog c
             WHERE upper(regexp_replace(coalesce(c.sku, ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
             LIMIT 16`,
      params: [['LF9009']],
      expectPlanContains: 'idx_catalog_sku_normalized'
    }
  },
  {
    name: 'idx_catalog_codigo_base_normalized',
    ddl: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_catalog_codigo_base_normalized
            ON elimfilters_catalog (upper(regexp_replace(coalesce(codigo_base, ''), '[^A-Z0-9]', '', 'g')))`,
    rollback: 'DROP INDEX CONCURRENTLY IF EXISTS idx_catalog_codigo_base_normalized',
    verify: {
      label: 'Direct codigo_base lookup (normalized codigo_base)',
      sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
            SELECT id, sku FROM elimfilters_catalog c
             WHERE upper(regexp_replace(coalesce(c.codigo_base, ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
             LIMIT 16`,
      params: [['LF9009']],
      expectPlanContains: 'idx_catalog_codigo_base_normalized'
    }
  }
];

async function explainText(sql, params) {
  const { rows } = await client.query(sql, params);
  return rows.map(r => r['QUERY PLAN']).join('\n');
}

async function timeIt(fn) {
  const t0 = Date.now();
  const result = await fn();
  return { result, ms: Date.now() - t0 };
}

async function indexIsValid(name) {
  const { rows } = await client.query(
    `SELECT i.indisvalid FROM pg_class c JOIN pg_index i ON i.indexrelid = c.oid WHERE c.relname = $1`,
    [name]
  );
  return rows.length > 0 && rows[0].indisvalid === true;
}

(async () => {
  await client.connect();

  console.log('=== Baseline: EXPLAIN (ANALYZE, BUFFERS) before any index exists ===');
  const baseline = {};
  for (const idx of INDEXES) {
    const plan = await explainText(idx.verify.sql, idx.verify.params);
    const usesSeqScan = /Seq Scan/.test(plan);
    baseline[idx.name] = plan;
    console.log(`\n-- ${idx.verify.label} --`);
    console.log(plan);
    console.log(`Seq Scan present: ${usesSeqScan ? 'YES (expected pre-index)' : 'NO'}`);
  }

  console.log('\n=== Planned changes ===');
  console.log('Extension: CREATE EXTENSION IF NOT EXISTS pg_trgm; (trusted extension, current role has createdb)');
  for (const idx of INDEXES) {
    console.log(`\n${idx.name}:`);
    console.log(`  DDL:      ${idx.ddl.replace(/\s+/g, ' ').trim()}`);
    console.log(`  Rollback: ${idx.rollback};`);
  }

  if (!APPLY) {
    console.log('\nDRY RUN (this is a proposal -- pass --apply only once approved). No changes made.');
    await client.end();
    return;
  }

  // --- APPLY ---
  // CREATE INDEX CONCURRENTLY cannot run inside a transaction block; the
  // node-postgres Client defaults to autocommit per statement, which is
  // exactly what's required here. Never wrap the block below in BEGIN/COMMIT.
  console.log('\n=== Installing pg_trgm (idempotent) ===');
  await client.query('CREATE EXTENSION IF NOT EXISTS pg_trgm');
  console.log('pg_trgm ready.');

  const outcomes = [];
  for (const idx of INDEXES) {
    console.log(`\n=== Creating ${idx.name} (CONCURRENTLY) ===`);
    try {
      await client.query(idx.ddl);
    } catch (e) {
      console.log(`  FAILED to create: ${e.message}`);
      outcomes.push({ name: idx.name, created: false, valid: false, usesIndex: false, before: null, after: null, error: e.message });
      continue;
    }

    const valid = await indexIsValid(idx.name);
    if (!valid) {
      console.log(`  Index created but INVALID (concurrent build failed) -- dropping and reporting failure.`);
      await client.query(`DROP INDEX CONCURRENTLY IF EXISTS ${idx.name}`);
      outcomes.push({ name: idx.name, created: false, valid: false, usesIndex: false, before: null, after: null, error: 'index left invalid by concurrent build' });
      continue;
    }
    console.log('  Index valid.');

    await client.query('ANALYZE elimfilters_catalog');

    const { result: plan, ms } = await timeIt(() => explainText(idx.verify.sql, idx.verify.params));
    const usesIndex = plan.includes(idx.verify.expectPlanContains);
    console.log(`\n-- POST-INDEX EXPLAIN: ${idx.verify.label} --`);
    console.log(plan);
    console.log(`Planner used ${idx.name}: ${usesIndex ? 'YES' : 'NO -- STILL NOT USING THE NEW INDEX'}`);
    console.log(`Rollback if needed: ${idx.rollback};`);

    outcomes.push({ name: idx.name, created: true, valid: true, usesIndex, planExcerpt: plan.split('\n')[0] });
  }

  console.log('\n=== SUMMARY ===');
  for (const o of outcomes) {
    console.log(`  ${o.name}: created=${o.created} valid=${o.valid} usesIndex=${o.usesIndex ?? 'n/a'}${o.error ? ` error=${o.error}` : ''}`);
  }
  console.log('\nIndividual rollback commands (run any subset if something needs reverting):');
  for (const idx of INDEXES) console.log(`  ${idx.rollback};`);

  const allGood = outcomes.every(o => o.created && o.valid && o.usesIndex);
  console.log(`\n=== OVERALL: ${allGood ? 'ALL INDEXES CREATED AND CONFIRMED IN USE' : 'ONE OR MORE INDEXES NOT CONFIRMED -- REVIEW ABOVE'} ===`);

  await client.end();
  if (!allGood) process.exit(1);
})().catch(async (e) => {
  console.error('ERROR:', e.message);
  try { await client.end(); } catch {}
  process.exit(1);
});
