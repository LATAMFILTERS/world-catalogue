'use strict';
/**
 * DRY RUN ONLY -- NOT YET APPLIED. Run as:
 *   node scripts/migrations/run_067_add_catalog_equipment_applications_table.js
 * (--apply exists for when this is approved; do not use yet.)
 *
 * Follow-up to migration 066. That migration proved a GIN trigram index on
 * elimfilters_catalog.equipment_applications::text gets used by the planner,
 * but the free-text application query still took 17-31s in production. Root
 * cause (measured, not guessed): 121 of 12,182 products carry enormous,
 * genuinely non-redundant equipment_applications arrays -- one SKU alone has
 * 24,350 distinct entries, up to 460KB of JSONB. Any single-column design
 * (even a leaner derived text column -- tested and rejected, see below)
 * still forces Postgres's GIN bitmap-heap-scan recheck to detoast and
 * re-scan whichever of these outlier rows land in the candidate set, which
 * measured at ~10-14s projected, still short of the 3s target. Popular
 * brand searches (the customer's own "FREIGHTLINER"/"CL120" query) are
 * *more* likely to hit these outliers, not less, because heavily
 * cross-referenced filters are exactly the ones with huge application
 * lists.
 *
 * Rejected alternative (tested empirically before writing this migration):
 * a single derived TEXT column per product, even after removing redundant
 * fields (equipment already contains "<make> - <model>" in the common
 * case) and deduplicating with string_agg(DISTINCT ...), only shrank the
 * worst-case row from 460KB to 293KB (~36%) -- not enough, because the
 * underlying data really is mostly distinct, not padding.
 *
 * Fix: normalize to one row per application entry instead of one blob per
 * product, in a new catalog_equipment_applications table:
 *   catalog_id  -> elimfilters_catalog.id (FK, ON DELETE CASCADE)
 *   equipment_text -> elem.equipment, falling back to make+model / machine /
 *                     brand only when equipment itself is absent (avoids
 *                     duplicating make+model that's already embedded in
 *                     equipment for the common case)
 *   engine      -> elem.engine
 *   year        -> elem.year
 *   search_text -> lower(equipment_text || ' ' || engine || ' ' || year),
 *                  GIN trigram indexed
 * Each row is tens of bytes regardless of how many applications a product
 * has, so even the 24,350-entry outlier only costs a recheck on the ONE
 * matching child row, not the whole list -- this is what actually bounds
 * worst-case cost, not just the average case.
 *
 * A JSON snapshot of every {id, sku, equipment_applications} is written to
 * backups/ before touching anything (gitignored) -- this migration never
 * modifies elimfilters_catalog itself, only adds a derived table kept in
 * sync by a trigger, so the source JSONB remains the single source of
 * truth and the ultimate rollback path regardless.
 *
 * Backfill runs in batches of 500 parent rows (not one giant INSERT) to
 * avoid a long-held lock/large transaction against production. Idempotent:
 * a batch is skipped if catalog_equipment_applications already has rows for
 * every catalog_id in that batch, so a re-run after a partial failure only
 * finishes what's missing.
 *
 * Every DDL statement (table, both indexes, trigger) has an individual,
 * ready-to-run rollback, printed as it runs and listed again in the final
 * summary. Nothing here alters or removes data in elimfilters_catalog.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');
const BATCH_SIZE = 500;

// Mirrors lib/bot-protocol-catalog.js's field selection exactly, so the
// backfill and the trigger (lib/bot-protocol-catalog.js is not touched;
// this expression lives only here and in the trigger function body) stay
// in lockstep. equipment already contains "<make> - <model>" in the
// common case, so make/model/machine/brand are fallbacks only, not
// additions -- extracting both would duplicate the same tokens.
const EQUIPMENT_TEXT_EXPR = `coalesce(
  elem->>'equipment',
  nullif(trim(coalesce(elem->>'make','') || ' ' || coalesce(elem->>'model','')), ''),
  elem->>'machine',
  elem->>'brand'
)`;

const TABLE_DDL = `
  CREATE TABLE IF NOT EXISTS catalog_equipment_applications (
    id bigserial PRIMARY KEY,
    catalog_id integer NOT NULL REFERENCES elimfilters_catalog(id) ON DELETE CASCADE,
    equipment_text text,
    engine text,
    year text,
    search_text text NOT NULL
  )
`;

const INDEXES = [
  {
    name: 'idx_catalog_equipment_applications_catalog_id',
    ddl: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_catalog_equipment_applications_catalog_id
            ON catalog_equipment_applications (catalog_id)`,
    rollback: 'DROP INDEX CONCURRENTLY IF EXISTS idx_catalog_equipment_applications_catalog_id'
  },
  {
    name: 'idx_catalog_equipment_applications_search_trgm',
    requiresExtension: 'pg_trgm',
    ddl: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_catalog_equipment_applications_search_trgm
            ON catalog_equipment_applications USING gin (search_text gin_trgm_ops)`,
    rollback: 'DROP INDEX CONCURRENTLY IF EXISTS idx_catalog_equipment_applications_search_trgm'
  }
];

const TRIGGER_FUNCTION_DDL = `
  CREATE OR REPLACE FUNCTION sync_catalog_equipment_applications() RETURNS trigger AS $BODY$
  BEGIN
    IF TG_OP = 'UPDATE' AND NEW.equipment_applications IS NOT DISTINCT FROM OLD.equipment_applications THEN
      RETURN NEW;
    END IF;

    DELETE FROM catalog_equipment_applications WHERE catalog_id = NEW.id;

    INSERT INTO catalog_equipment_applications (catalog_id, equipment_text, engine, year, search_text)
    SELECT NEW.id, v.equipment_text, v.engine, v.year,
           lower(trim(concat_ws(' ', v.equipment_text, v.engine, v.year)))
    FROM (
      SELECT ${EQUIPMENT_TEXT_EXPR} AS equipment_text, elem->>'engine' AS engine, elem->>'year' AS year
      FROM jsonb_array_elements(coalesce(NEW.equipment_applications, '[]'::jsonb)) elem
    ) v
    WHERE coalesce(v.equipment_text, '') <> '' OR coalesce(v.engine, '') <> '' OR coalesce(v.year, '') <> '';

    RETURN NEW;
  END;
  $BODY$ LANGUAGE plpgsql
`;

const TRIGGER_DDL = `
  CREATE TRIGGER trg_sync_catalog_equipment_applications
  AFTER INSERT OR UPDATE OF equipment_applications ON elimfilters_catalog
  FOR EACH ROW EXECUTE FUNCTION sync_catalog_equipment_applications()
`;

async function withShortClient(fn) {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, keepAlive: true, keepAliveInitialDelayMillis: 5000 });
  client.on('error', e => console.error('  [client error event]', e.message));
  await client.connect();
  try {
    return await fn(client);
  } finally {
    try { await client.end(); } catch {}
  }
}

async function explainText(client, sql, params) {
  const { rows } = await client.query(sql, params);
  return rows.map(r => r['QUERY PLAN']).join('\n');
}

(async () => {
  console.log('=== Baseline: current elimfilters_catalog.equipment_applications ILIKE (pre-migration) ===');
  await withShortClient(async client => {
    const plan = await explainText(client,
      `EXPLAIN (ANALYZE, BUFFERS) SELECT id, sku FROM elimfilters_catalog c
        WHERE coalesce(c.equipment_applications::text, '') ILIKE $1 LIMIT 120`,
      ['%CL120%']
    );
    console.log(plan);
  });

  console.log('\n=== Planned changes ===');
  console.log('Table:', TABLE_DDL.replace(/\s+/g, ' ').trim());
  for (const idx of INDEXES) console.log(`${idx.name}: ${idx.ddl.replace(/\s+/g, ' ').trim()}\n  Rollback: ${idx.rollback};`);
  console.log('Trigger function: sync_catalog_equipment_applications() (see file for body)');
  console.log('Trigger: trg_sync_catalog_equipment_applications AFTER INSERT OR UPDATE OF equipment_applications ON elimfilters_catalog');
  console.log('Rollback (table+trigger, run in this order): DROP TRIGGER IF EXISTS trg_sync_catalog_equipment_applications ON elimfilters_catalog; DROP FUNCTION IF EXISTS sync_catalog_equipment_applications(); DROP TABLE IF EXISTS catalog_equipment_applications;');

  const idRange = await withShortClient(client =>
    client.query('SELECT min(id) AS min_id, max(id) AS max_id, count(*) AS total FROM elimfilters_catalog')
  );
  const { min_id: minId, max_id: maxId, total } = idRange.rows[0];
  console.log(`\nBackfill scope: ${total} catalog rows (id ${minId}..${maxId}), batches of ${BATCH_SIZE}`);

  if (!APPLY) {
    console.log('\nDRY RUN (this is a proposal -- pass --apply only once approved). No changes made.');
    return;
  }

  // --- APPLY ---
  const backupDir = path.join(__dirname, 'backups');
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  console.log('\n=== Writing logical backup (id, sku, equipment_applications snapshot) ===');
  await withShortClient(async client => {
    const { rows } = await client.query('SELECT id, sku, equipment_applications FROM elimfilters_catalog ORDER BY id');
    fs.writeFileSync(
      path.join(backupDir, `067_equipment_applications_snapshot_${stamp}.json`),
      JSON.stringify({ taken_at: new Date().toISOString(), row_count: rows.length, rows }, null, 2) + '\n'
    );
    console.log(`Backup written (${rows.length} rows).`);
  });

  console.log('\n=== Installing pg_trgm (idempotent) ===');
  await withShortClient(client => client.query('CREATE EXTENSION IF NOT EXISTS pg_trgm'));
  console.log('pg_trgm ready.');

  console.log('\n=== Creating table (idempotent) ===');
  await withShortClient(client => client.query(TABLE_DDL));
  console.log('catalog_equipment_applications ready.');

  for (const idx of INDEXES) {
    console.log(`\n=== Creating ${idx.name} (CONCURRENTLY) ===`);
    await withShortClient(client => client.query(idx.ddl));
    const valid = await withShortClient(async client => {
      const { rows } = await client.query(
        `SELECT indisvalid FROM pg_class c JOIN pg_index i ON i.indexrelid = c.oid WHERE c.relname = $1`,
        [idx.name]
      );
      return rows.length > 0 && rows[0].indisvalid === true;
    });
    console.log(`  valid=${valid}`);
    if (!valid) {
      await withShortClient(client => client.query(`DROP INDEX CONCURRENTLY IF EXISTS ${idx.name}`));
      console.error(`  ${idx.name} was invalid, dropped. Aborting.`);
      process.exit(1);
    }
    console.log(`  Rollback if needed: ${idx.rollback};`);
  }

  console.log('\n=== Installing trigger function + trigger ===');
  await withShortClient(client => client.query(TRIGGER_FUNCTION_DDL));
  await withShortClient(client => client.query('DROP TRIGGER IF EXISTS trg_sync_catalog_equipment_applications ON elimfilters_catalog'));
  await withShortClient(client => client.query(TRIGGER_DDL));
  console.log('Trigger installed.');

  console.log('\n=== Backfill (batched, resumable) ===');
  let batchStart = minId;
  let batchesRun = 0;
  let rowsInserted = 0;
  while (batchStart <= maxId) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, maxId);
    const result = await withShortClient(async client => {
      const pending = await client.query(
        `SELECT c.id FROM elimfilters_catalog c
          WHERE c.id BETWEEN $1 AND $2
            AND NOT EXISTS (SELECT 1 FROM catalog_equipment_applications a WHERE a.catalog_id = c.id)
            AND coalesce(jsonb_array_length(c.equipment_applications), 0) > 0`,
        [batchStart, batchEnd]
      );
      if (pending.rows.length === 0) return { inserted: 0, skipped: true };

      const ids = pending.rows.map(r => r.id);
      const insertResult = await client.query(
        `INSERT INTO catalog_equipment_applications (catalog_id, equipment_text, engine, year, search_text)
         SELECT c.id, v.equipment_text, v.engine, v.year,
                lower(trim(concat_ws(' ', v.equipment_text, v.engine, v.year)))
         FROM elimfilters_catalog c,
              LATERAL (
                SELECT ${EQUIPMENT_TEXT_EXPR} AS equipment_text, elem->>'engine' AS engine, elem->>'year' AS year
                FROM jsonb_array_elements(coalesce(c.equipment_applications, '[]'::jsonb)) elem
              ) v
         WHERE c.id = ANY($1::int[])
           AND (coalesce(v.equipment_text, '') <> '' OR coalesce(v.engine, '') <> '' OR coalesce(v.year, '') <> '')`,
        [ids]
      );
      return { inserted: insertResult.rowCount, skipped: false };
    });

    if (!result.skipped) {
      batchesRun += 1;
      rowsInserted += result.inserted;
      console.log(`  batch [${batchStart}-${batchEnd}]: +${result.inserted} child rows`);
    }
    batchStart = batchEnd + 1;
  }
  console.log(`Backfill complete: ${batchesRun} batches touched, ${rowsInserted} child rows inserted.`);

  console.log('\n=== POST-VERIFICATION ===');
  await withShortClient(async client => {
    const counts = await client.query(`
      SELECT
        (SELECT count(*) FROM catalog_equipment_applications) AS child_rows,
        (SELECT count(DISTINCT catalog_id) FROM catalog_equipment_applications) AS distinct_products,
        (SELECT count(*) FROM elimfilters_catalog WHERE coalesce(jsonb_array_length(equipment_applications),0) > 0) AS products_with_applications
    `);
    console.log(counts.rows[0]);
  });

  console.log('\n-- EXPLAIN (ANALYZE, BUFFERS): new EXISTS-based query for CL120 --');
  await withShortClient(async client => {
    const plan = await explainText(client,
      `EXPLAIN (ANALYZE, BUFFERS) SELECT c.id, c.sku FROM elimfilters_catalog c
        WHERE EXISTS (SELECT 1 FROM catalog_equipment_applications a WHERE a.catalog_id = c.id AND a.search_text ILIKE $1)
        LIMIT 120`,
      ['%cl120%']
    );
    console.log(plan);
    console.log(`Seq Scan on elimfilters_catalog present: ${/Seq Scan on elimfilters_catalog/.test(plan) ? 'YES -- unexpected' : 'NO'}`);
    console.log(`Uses idx_catalog_equipment_applications_search_trgm: ${plan.includes('idx_catalog_equipment_applications_search_trgm') ? 'YES' : 'NO -- STILL NOT USING THE NEW INDEX'}`);
  });

  console.log('\nDone. Rollback commands if needed (run in this order):');
  console.log('  DROP TRIGGER IF EXISTS trg_sync_catalog_equipment_applications ON elimfilters_catalog;');
  console.log('  DROP FUNCTION IF EXISTS sync_catalog_equipment_applications();');
  for (const idx of INDEXES) console.log(`  ${idx.rollback};`);
  console.log('  DROP TABLE IF EXISTS catalog_equipment_applications;');
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
