'use strict';

/**
 * Fuel-processor elements: EF9 (fuel filter) -> ES9 (fuel/water separator).
 *
 * Operator ruling 2026-10-11: an element Fleetguard qualifies as a fuel/water
 * separator is ES9 / HYDROCORE™, not EF9 / SYNTAPORE™. Each pair below was
 * verified against Fleetguard's own record for the element: Fleetguard labels
 * it "Separador de Combustible/Agua" and its cross-reference list names the
 * Donaldson base of the row being renamed.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 * All six pairs move together or none does.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');

// from, to, codigo_base that must be on the row, Fleetguard element it was verified against
const PAIRS = [
  ['EF90460', 'ES90460', 'P550460', 'FS19730'],
  ['EF90467', 'ES90467', 'P550467', 'FS19624'],
  ['EF90736', 'ES90736', 'P550736', 'FS19728'],
  ['EF90849', 'ES90849', 'P550849', 'FS19763'],
  ['EF93014', 'ES93014', 'P553014', 'FS53014'],
  ['EF93015', 'ES93015', 'P553015', 'FS53015'],
];

// Same no-FK surfaces as run_215_global_last_four_remediation.js.
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
  // not in run_215's list; the dry-run found these rows left behind
  ['public.kg_product_systems', 'product_sku'],
  // technology_id stays as is: kg_technologies has no HYDROCORE™ row to point at
  ['public.kg_product_technologies', 'product_sku'],
  ['public.oem_codes_legacy', 'sku'], // read by v_crossref_engine
];

// jsonb columns of elimfilters_catalog that can carry a SKU as text
const JSON_COLUMNS = ['alternative_products', 'alternatives', 'enrichment_data', 'canonical_evidence'];

const es9Description = sku =>
  `ELIMFILTERS® ${sku} Fuel/water separator for diesel fuel systems. HYDROCORE™ media coalesces and drains free water from fuel before it reaches the injection system, preventing injector corrosion and microbial growth in the fuel tank.`;

async function columnExists(db, qualified, column) {
  const [schema, table] = qualified.split('.');
  const r = await db.query(
    `SELECT 1 FROM information_schema.columns c JOIN information_schema.tables t USING (table_schema, table_name)
     WHERE c.table_schema=$1 AND c.table_name=$2 AND c.column_name=$3 AND t.table_type='BASE TABLE'`,
    [schema, table, column]
  );
  return r.rowCount > 0;
}

// Every base-table column whose name looks like a SKU holder; used only to report leftovers.
async function remainingMentions(db, skus) {
  const cols = (await db.query(`
    SELECT c.table_schema, c.table_name, c.column_name
    FROM information_schema.columns c JOIN information_schema.tables t USING (table_schema, table_name)
    WHERE t.table_type='BASE TABLE' AND c.table_schema IN ('public','ld_catalog')
      AND c.column_name ~ 'sku' AND c.data_type IN ('text','character varying')
  `)).rows;
  const left = [];
  for (const c of cols) {
    const r = await db.query(
      `SELECT ${c.column_name} AS sku, count(*)::int AS n FROM ${c.table_schema}.${c.table_name}
       WHERE ${c.column_name} = ANY($1::text[]) GROUP BY 1`, [skus]);
    for (const row of r.rows) left.push({ table: `${c.table_schema}.${c.table_name}`, column: c.column_name, sku: row.sku, rows: row.n });
  }
  return left;
}

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', renamed: [], remaining_mentions: [] };

  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    for (const [from, to, base, element] of PAIRS) {
      const src = (await db.query(
        'SELECT sku, codigo_base, technology, filter_type FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) FOR UPDATE',
        [[from, to]])).rows;
      const row = src.find(r => r.sku === from);
      if (!row) throw new Error(`SOURCE_MISSING ${from}`);
      if (src.some(r => r.sku === to)) throw new Error(`TARGET_OCCUPIED ${to}`);
      if (row.codigo_base !== base) throw new Error(`BASE_CHANGED ${from}: expected ${base}, found ${row.codigo_base}`);

      // Parent first: FK children installed with ON UPDATE CASCADE follow atomically.
      const u = await db.query(
        `UPDATE public.elimfilters_catalog
         SET sku=$1, technology='HYDROCORE™', filter_type='water', description=$3
         WHERE sku=$2`, [to, from, es9Description(to)]);
      if (u.rowCount !== 1) throw new Error(`CATALOG_RENAME_COUNT_CHANGED ${from}`);

      const derived = [];
      for (const [table, column] of DERIVED) {
        if (!(await columnExists(db, table, column))) continue;
        const d = await db.query(`UPDATE ${table} SET ${column}=$1 WHERE ${column}=$2`, [to, from]);
        if (d.rowCount) derived.push({ table, column, rows: d.rowCount });
      }

      const json = [];
      for (const column of JSON_COLUMNS) {
        const j = await db.query(
          `UPDATE public.elimfilters_catalog SET ${column} = replace(${column}::text, $1, $2)::jsonb
           WHERE ${column}::text LIKE '%' || $1 || '%'`, [from, to]);
        if (j.rowCount) json.push({ column, rows: j.rowCount });
      }

      if (await columnExists(db, 'public.crossref_resolved_cache', 'sku')) {
        await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku = ANY($1::text[])', [[from, to]]);
      }
      try {
        await db.query('SAVEPOINT cache');
        await db.query('SELECT public.refresh_crossref_cache_sku($1)', [to]);
        await db.query('RELEASE SAVEPOINT cache');
      } catch (_) { await db.query('ROLLBACK TO SAVEPOINT cache'); }

      report.renamed.push({ from, to, codigo_base: base, fleetguard_element: element,
        was: { technology: row.technology, filter_type: row.filter_type }, derived, json });
    }

    const after = (await db.query(
      'SELECT sku, codigo_base, technology, filter_type FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku',
      [PAIRS.flatMap(p => [p[0], p[1]])])).rows;
    if (after.length !== PAIRS.length || after.some(r => !/^ES9/.test(r.sku) || r.technology !== 'HYDROCORE™')) {
      throw new Error('VERIFICATION_FAILED ' + JSON.stringify(after));
    }
    report.after = after;
    report.remaining_mentions = await remainingMentions(db, PAIRS.map(p => p[0]));

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
