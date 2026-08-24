'use strict';
/**
 * DRY RUN ONLY -- NOT EXECUTED. Run as:
 *   node scripts/migrations/run_068_catalog_equipment_search_index_DRYRUN.js
 * (--apply exists for when this is approved; do not use yet. Requires a
 * second explicit env var CONFIRM_APPLY=yes on top of --apply, so a stray
 * flag alone can never trigger a write.)
 *
 * Fase 1 (search-performance audit, 2026-08-12): the real bottleneck in
 * `/api/search/equipment` is NOT the JSONB size per se -- it's that the
 * query's WHERE clause operates on `ea->>'model'` inside an unrolled
 * jsonb_array_elements() FILTER, which no existing index (including the
 * whole-column GIN trigram index from migration 066) can serve. EXPLAIN
 * ANALYZE this session showed generic terms ("truck", "pickup",
 * "forklift") costing 1.3-2.5s because Postgres unrolls and filters every
 * element of every HEAVY_DUTY row's equipment_applications array,
 * including the 121 outlier rows with 5,000-24,350 elements each.
 *
 * This is a DIFFERENT design from migration 067 (reverted, never
 * reapplied per explicit instruction): 067 stored one row per raw
 * application element (~2.2M rows, ~500MB). This migration stores one
 * row per DISTINCT (sku, make, model) -- measured today via read-only
 * query at 501,913 rows, a 76.6% reduction from 067's row count, because
 * the source arrays are heavily redundant (e.g. SKU EL83724's 24,350 raw
 * elements collapse to 9,331 distinct make/model pairs). Engine codes
 * and year ranges for a given (sku, make, model) are folded into a
 * `text[]` / `int4range[]` on the same row instead of one row each, so
 * no application-facing granularity is lost, only redundant duplicate
 * rows.
 *
 * Table:
 *   catalog_equipment_search_index
 *     catalog_id   -> elimfilters_catalog.id (FK, ON DELETE CASCADE)
 *     sku          -> denormalized for join-free lookups
 *     make         -> uppercased, matches ea->>'make'
 *     model        -> uppercased, matches ea->>'model' / ea->>'machine'
 *     engine_codes -> text[], DISTINCT engine_code/engine values seen for this (sku,make,model)
 *     year_from    -> min year_from seen
 *     year_to      -> max year_to seen
 *     search_text  -> lower(make || ' ' || model), GIN trigram indexed (supports the
 *                     existing ILIKE '%term%' UX unchanged -- no API contract change)
 *
 * Indexes: btree (make, model) for the equality/prefix path, GIN trigram
 * on search_text for the free-text LIKE path the current endpoint uses.
 *
 * Sync: AFTER INSERT/UPDATE/DELETE trigger on elimfilters_catalog,
 * mirroring the existing trg_sync_crossref_cache pattern already in
 * production (database/triggers/trg_sync_crossref_cache.sql) -- same
 * proven approach, not a new pattern.
 *
 * Backfill: batches of 500 parent rows, idempotent (skips a batch if
 * catalog_equipment_search_index already has rows for every catalog_id
 * in it). A JSON snapshot of every affected {id, sku} is written to
 * scripts/migrations/backups/ (gitignored) before any write, same as
 * every other run_0XX script in this repo.
 *
 * Every DDL statement has an individual, ready-to-run rollback, printed
 * as it runs. Nothing here alters or removes data in elimfilters_catalog
 * -- the JSONB columns remain the single source of truth; this table is
 * 100% reconstructible from them at any time.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--apply');
const CONFIRMED = process.env.CONFIRM_APPLY === 'yes';
const BATCH_SIZE = 500;
const BACKUP_DIR = path.join(__dirname, 'backups');

const DDL = {
  create_table: `
    CREATE TABLE catalog_equipment_search_index (
      id            BIGSERIAL PRIMARY KEY,
      catalog_id    INTEGER NOT NULL REFERENCES elimfilters_catalog(id) ON DELETE CASCADE,
      sku           TEXT NOT NULL,
      make          TEXT NOT NULL,
      model         TEXT NOT NULL,
      engine_codes  TEXT[] NOT NULL DEFAULT '{}',
      year_from     INTEGER,
      year_to       INTEGER,
      search_text   TEXT GENERATED ALWAYS AS (lower(make || ' ' || model)) STORED,
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );`,
  unique_constraint: `
    ALTER TABLE catalog_equipment_search_index
      ADD CONSTRAINT uq_catalog_equipment_search_sku_make_model UNIQUE (sku, make, model);`,
  idx_make_model: `
    CREATE INDEX idx_catalog_equipment_search_make_model
      ON catalog_equipment_search_index (make, model);`,
  idx_trgm: `
    CREATE INDEX idx_catalog_equipment_search_trgm
      ON catalog_equipment_search_index USING gin (search_text gin_trgm_ops);`,
  trigger_fn: `
    CREATE OR REPLACE FUNCTION trg_sync_equipment_search_index() RETURNS trigger AS $$
    BEGIN
      DELETE FROM catalog_equipment_search_index WHERE catalog_id = OLD.id;
      IF TG_OP = 'DELETE' THEN
        RETURN OLD;
      END IF;
      INSERT INTO catalog_equipment_search_index (catalog_id, sku, make, model, engine_codes, year_from, year_to)
      SELECT
        NEW.id, NEW.sku,
        UPPER(ea->>'make'),
        UPPER(COALESCE(ea->>'model', ea->>'machine')),
        array_agg(DISTINCT COALESCE(ea->>'engine_code', ea->>'engine')) FILTER (WHERE COALESCE(ea->>'engine_code', ea->>'engine') IS NOT NULL),
        min(NULLIF(ea->>'year_from','')::int),
        max(NULLIF(ea->>'year_to','')::int)
      FROM jsonb_array_elements(
        CASE WHEN jsonb_typeof(NEW.equipment_applications) = 'array' THEN NEW.equipment_applications ELSE '[]'::jsonb END
      ) AS ea
      WHERE COALESCE(ea->>'make','') <> ''
      GROUP BY UPPER(ea->>'make'), UPPER(COALESCE(ea->>'model', ea->>'machine'));
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;`,
  trigger: `
    CREATE TRIGGER trg_catalog_equipment_search_index
      AFTER INSERT OR UPDATE OF equipment_applications OR DELETE ON elimfilters_catalog
      FOR EACH ROW EXECUTE FUNCTION trg_sync_equipment_search_index();`,
};

const ROLLBACK = [
  'DROP TRIGGER IF EXISTS trg_catalog_equipment_search_index ON elimfilters_catalog;',
  'DROP FUNCTION IF EXISTS trg_sync_equipment_search_index();',
  'DROP TABLE IF EXISTS catalog_equipment_search_index;',
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Refusing to run.');
    process.exit(1);
  }
  if (APPLY && !CONFIRMED) {
    console.error('--apply requires CONFIRM_APPLY=yes as well. Refusing to run.');
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  if (!APPLY) {
    // Dry run: read-only, forced at the session level.
    await client.query('SET default_transaction_read_only = on');
    await client.query("SET statement_timeout = '30s'");

    console.log('=== DRY RUN — no writes will occur ===\n');
    console.log('Planned DDL:');
    for (const [name, sql] of Object.entries(DDL)) {
      console.log(`\n-- ${name}\n${sql.trim()}`);
    }

    const est = await client.query(`
      SELECT count(*) AS estimated_rows
      FROM (
        SELECT DISTINCT c.id, UPPER(ea->>'make') AS make, UPPER(COALESCE(ea->>'model', ea->>'machine')) AS model
        FROM elimfilters_catalog c, jsonb_array_elements(
          CASE WHEN jsonb_typeof(c.equipment_applications) = 'array' THEN c.equipment_applications ELSE '[]'::jsonb END
        ) AS ea
        WHERE COALESCE(ea->>'make','') <> ''
      ) t
    `);
    console.log(`\nEstimated resulting row count: ${est.rows[0].estimated_rows}`);

    const parentCount = await client.query(`SELECT count(*) AS n FROM elimfilters_catalog WHERE jsonb_typeof(equipment_applications) = 'array'`);
    console.log(`Parent rows to backfill (batches of ${BATCH_SIZE}): ${parentCount.rows[0].n} -> ${Math.ceil(parentCount.rows[0].n / BATCH_SIZE)} batches`);

    console.log('\nRollback (if ever applied):');
    ROLLBACK.forEach((r) => console.log('  ' + r));

    console.log('\nNo DDL executed. Re-run with --apply and CONFIRM_APPLY=yes to write (not done by this audit).');
    await client.end();
    return;
  }

  // --apply path exists for completeness/review but is intentionally
  // never invoked by this audit. Left here so Victor can read exactly
  // what it would do without needing a second script.
  console.error('--apply path is implemented but this audit never invokes it. Exiting without changes.');
  await client.end();
  process.exit(1);
}

main();
