'use strict';

/**
 * Nullable dimension columns for the labels the official MANN page publishes and
 * lib/mann-official-spec-verifier.js already parses, but the catalogue could not store:
 *   Width (panel air / cabin filters), Outer diameter 1, Inner diameter 1, Inlet, Outlet.
 *
 * Without them, scripts/hermes/mann-dimensions-from-cached-pages.mjs holds those SKUs as
 * PARTIAL_NO_COLUMN (228 in the 2026-10-24 dry run, mostly product_width_mm), because a
 * dimension set is never written half-way. Columns only; no data is written here.
 *
 * Dry-run by default (ALTER inside a transaction, then ROLLBACK). --apply to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--apply');
const COLUMNS = ['product_width_mm', 'outer_diameter_1_mm', 'inner_diameter_1_mm', 'inlet_mm', 'outlet_mm'];

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  try {
    await db.query('BEGIN');
    const before = (await db.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='elimfilters_catalog' AND column_name = ANY($1::text[])`,
      [COLUMNS])).rows.map((r) => r.column_name);
    await db.query(`ALTER TABLE public.elimfilters_catalog ${COLUMNS.map((c) => `ADD COLUMN IF NOT EXISTS ${c} numeric`).join(', ')}`);
    const after = (await db.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='elimfilters_catalog' AND column_name = ANY($1::text[])`,
      [COLUMNS])).rows.map((r) => r.column_name);
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ migration: 'run_283_mann_dimension_columns', mode: APPLY ? 'apply' : 'dry-run',
      existed_before: before, present_after: after, added: after.filter((c) => !before.includes(c)), transaction: APPLY ? 'COMMIT' : 'ROLLBACK' }, null, 2));
  } catch (e) {
    await db.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    await db.end();
  }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
