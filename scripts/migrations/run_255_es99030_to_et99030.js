'use strict';

/**
 * ES99030 (base Parker R9030MB) -> ET99030.
 *
 * Operator decision 2026-10-12: products on a Parker Racor code live in ET9,
 * the one family whose codigo_base is the direct manufacturer's code instead
 * of Donaldson's. R9030MB is Parker's South American part number; the row's
 * governance records that the ELIMFILTERS product team confirmed Donaldson
 * makes no equivalent.
 *
 * Only the SKU changes. codigo_base (R9030MB), technology (HYDROCORE™),
 * filter_type and every cross stay as they are. R9030MB is not in the Racor
 * catalog reviewed today (it is a regional part), so nothing here is recorded
 * as verified against a Parker document.
 *
 * Former SKU ES99030 is registered as SUPERSEDED so Part Search keeps
 * resolving it. Mechanism: run_237.
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const FROM = 'ES99030';
const TO = 'ET99030';
const BASE = 'R9030MB';
const SOURCE = 'RUN_255_ES99030_TO_ET99030';

// Same no-FK surfaces as run_237.
const DERIVED = [
  ['public.exact_part_reference', 'sku'],
  ['public.kit_components', 'filter_sku'],
  ['public.product_element', 'elimfilters_sku'],
  ['public.product_model', 'elimfilters_sku'],
  ['public.kg_product_equipment', 'product_sku'],
  ['public.kg_crossrefs', 'product_sku'],
  ['public.catalog_sku_certification', 'sku'],
  ['public.catalog_codigo_base_evidence', 'sku'],
  ['public.codigo_base_review_queue', 'sku'],
  ['public.hermes_catalogue_backlog', 'sku'],
  ['public.hermes_catalogue_dossier', 'sku'],
  ['public.hermes_catalogue_evidence', 'sku'],
  ['public.kg_product_systems', 'product_sku'],
  ['public.kg_product_technologies', 'product_sku'],
  ['public.oem_codes_legacy', 'sku'],
];
const JSON_COLUMNS = ['alternative_products', 'alternatives', 'enrichment_data', 'canonical_evidence'];

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', from: FROM, to: TO, derived: {}, json: {} };

  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    const rows = (await db.query(
      'SELECT sku, codigo_base, technology, catalog_active FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) FOR UPDATE', [[FROM, TO]])).rows;
    const row = rows.find(r => r.sku === FROM);
    if (!row) throw new Error(`SOURCE_MISSING ${FROM}`);
    if (row.codigo_base !== BASE) throw new Error(`BASE_CHANGED ${FROM}: found ${row.codigo_base}`);
    if (rows.some(r => r.sku === TO)) throw new Error(`TARGET_OCCUPIED ${TO}`);
    const reserved = await db.query(
      `SELECT 1 FROM public.exact_part_reference WHERE reference_type='SUPERSEDED' AND brand='ELIMFILTERS' AND part_number=$1`, [TO]);
    if (reserved.rowCount) throw new Error(`TARGET_IS_A_FORMER_SKU ${TO}`);

    // parent first so FK children with ON UPDATE CASCADE follow; base unchanged
    const u = await db.query(
      `UPDATE public.elimfilters_catalog
       SET sku=$1::text, description=replace(description, $2::text, $1::text),
           enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{sku_family_decision}', $3::jsonb)
       WHERE sku=$2::text`,
      [TO, FROM, JSON.stringify({
        rule: 'PARKER_RACOR_CODE_LIVES_IN_ET9',
        previous_sku: FROM,
        decided_by: 'OPERATOR',
        decided_at: '2026-10-12',
        verified_against_parker_document: false,
        migration: 'run_255',
      })]);
    if (u.rowCount !== 1) throw new Error('CATALOG_RENAME_COUNT_CHANGED');

    for (const [qualified, column] of DERIVED) {
      const [schema, table] = qualified.split('.');
      const exists = await db.query(
        `SELECT 1 FROM information_schema.columns c JOIN information_schema.tables t USING (table_schema, table_name)
         WHERE c.table_schema=$1 AND c.table_name=$2 AND c.column_name=$3 AND t.table_type='BASE TABLE'`, [schema, table, column]);
      if (!exists.rowCount) continue;
      const d = await db.query(`UPDATE ${qualified} SET ${column}=$1 WHERE ${column}=$2`, [TO, FROM]);
      if (d.rowCount) report.derived[qualified] = d.rowCount;
    }
    const token = `\\m${FROM}\\M`; // whole-token match
    for (const column of JSON_COLUMNS) {
      const j = await db.query(
        `UPDATE public.elimfilters_catalog SET ${column} = regexp_replace(${column}::text, $1, $2, 'g')::jsonb
         WHERE ${column}::text ~ $1 AND sku <> $2`, [token, TO]); // own row keeps previous_sku in its decision note
      if (j.rowCount) report.json[column] = j.rowCount;
    }

    await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [FROM]);
    try {
      await db.query('SAVEPOINT cache');
      await db.query('SELECT public.refresh_crossref_cache_sku($1)', [TO]);
      await db.query('RELEASE SAVEPOINT cache');
    } catch (_) { await db.query('ROLLBACK TO SAVEPOINT cache'); }

    const ins = await db.query(
      `INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source)
       VALUES ('SUPERSEDED', 'ELIMFILTERS', $1, $2, $3)
       ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`, [FROM, TO, SOURCE]);

    const after = (await db.query(
      `SELECT sku, codigo_base, technology, filter_type, catalog_active FROM public.elimfilters_catalog WHERE sku = ANY($1::text[])`,
      [[FROM, TO]])).rows;
    if (after.length !== 1 || after[0].sku !== TO || after[0].codigo_base !== BASE || after[0].technology !== row.technology) {
      throw new Error('VERIFICATION_FAILED ' + JSON.stringify(after));
    }
    const cache = (await db.query('SELECT count(*)::int AS n FROM public.crossref_resolved_cache WHERE sku=$1', [TO])).rows[0].n;
    Object.assign(report, { after: after[0], superseded_registered: ins.rowCount, cache_rows: cache });
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    await db.end();
  }
})().catch(e => { console.error(e.stack || e); process.exit(1); });
