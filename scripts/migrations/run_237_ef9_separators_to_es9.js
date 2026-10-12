'use strict';

/**
 * Fuel/water separators filed as EF9 (fuel filter) -> ES9 (HYDROCORE™).
 *
 * Operator ruling 2026-10-11: a product the manufacturer of its codigo_base
 * qualifies as a fuel/water separator is ES9, not EF9. The data file lists the
 * 202 products whose official record says so (Donaldson "FUEL FILTER, WATER
 * SEPARATOR ...", one Fleetguard) and whose target SKU — ES9 + last four digits
 * of the codigo_base — is free. Left out for operator review: EF91026 and
 * EF91027 (inactive leftovers of ES91026 / ES91027) and EF91065 (ES91065 is
 * taken by the FS1065 product).
 *
 * Same mechanism as run_227 (rename + derived tables) and run_229 (former SKU
 * registered as SUPERSEDED so Part Search keeps resolving it).
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 * All pairs move together or none does.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const PAIRS = require('./run_237_ef9_separators_to_es9.data.json');
const SOURCE = 'RUN_237_EF9_TO_ES9_RENUMBER';

// Same no-FK surfaces as run_227.
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
  // technology_id stays as is: kg_technologies has no HYDROCORE™ row to point at
  ['public.kg_product_technologies', 'product_sku'],
  ['public.oem_codes_legacy', 'sku'], // read by v_crossref_engine
];

// jsonb columns of elimfilters_catalog that can carry a SKU as text
const JSON_COLUMNS = ['alternative_products', 'alternatives', 'enrichment_data', 'canonical_evidence'];

const es9Description = sku =>
  `ELIMFILTERS® ${sku} Fuel/water separator for diesel fuel systems. HYDROCORE™ media coalesces and drains free water from fuel before it reaches the injection system, preventing injector corrosion and microbial growth in the fuel tank.`;

const targetSku = base => 'ES9' + base.replace(/\D/g, '').slice(-4);

// Whole-token replace: EF90106 must not rewrite the front of a longer code.
function replaceSkus(text, map) {
  return text.replace(/[A-Z0-9]+/g, token => map.get(token) || token);
}

function selfCheck() {
  const map = new Map([['EF90106', 'ES90106']]);
  const out = replaceSkus('{"a":"EF90106","b":"EF901065","c":"XEF90106"}', map);
  if (out !== '{"a":"ES90106","b":"EF901065","c":"XEF90106"}') throw new Error('SELF_CHECK_REPLACE ' + out);
  if (targetSku('P920967') !== 'ES90967' || targetSku('FF5824') !== 'ES95824') throw new Error('SELF_CHECK_TARGET');
}

async function existingDerived(db) {
  const out = [];
  for (const [qualified, column] of DERIVED) {
    const [schema, table] = qualified.split('.');
    const r = await db.query(
      `SELECT 1 FROM information_schema.columns c JOIN information_schema.tables t USING (table_schema, table_name)
       WHERE c.table_schema=$1 AND c.table_name=$2 AND c.column_name=$3 AND t.table_type='BASE TABLE'`,
      [schema, table, column]);
    if (r.rowCount) out.push([qualified, column]);
  }
  return out;
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
      `SELECT count(*)::int AS n, count(DISTINCT ${c.column_name})::int AS skus FROM ${c.table_schema}.${c.table_name}
       WHERE ${c.column_name} = ANY($1::text[])`, [skus]);
    if (r.rows[0].n) left.push({ table: `${c.table_schema}.${c.table_name}`, column: c.column_name, skus: r.rows[0].skus, rows: r.rows[0].n });
  }
  return left;
}

(async () => {
  selfCheck();
  const froms = PAIRS.map(p => p.from);
  const tos = PAIRS.map(p => p.to);
  if (new Set(froms).size !== PAIRS.length || new Set(tos).size !== PAIRS.length) throw new Error('DATA_NOT_UNIQUE');
  for (const p of PAIRS) {
    if (!/^EF9/.test(p.from) || p.to !== targetSku(p.codigo_base)) throw new Error(`DATA_RULE_BROKEN ${p.from}`);
    if (!/SEPARA/i.test(p.official_description)) throw new Error(`DATA_NOT_A_SEPARATOR ${p.from}`);
  }

  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', pairs: PAIRS.length, was: {}, derived: {}, json: {}, superseded_registered: 0 };

  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    const src = (await db.query(
      'SELECT sku, codigo_base, technology, filter_type FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) FOR UPDATE',
      [froms.concat(tos)])).rows;
    const bySku = new Map(src.map(r => [r.sku, r]));
    const reserved = (await db.query(
      `SELECT part_number FROM public.exact_part_reference
       WHERE reference_type='SUPERSEDED' AND brand='ELIMFILTERS' AND part_number = ANY($1::text[])`, [tos])).rows;
    if (reserved.length) throw new Error('TARGET_IS_A_FORMER_SKU ' + reserved.map(r => r.part_number).join(','));
    for (const p of PAIRS) {
      const row = bySku.get(p.from);
      if (!row) throw new Error(`SOURCE_MISSING ${p.from}`);
      if (bySku.has(p.to)) throw new Error(`TARGET_OCCUPIED ${p.to}`);
      if (row.codigo_base !== p.codigo_base) throw new Error(`BASE_CHANGED ${p.from}: expected ${p.codigo_base}, found ${row.codigo_base}`);
      const k = `${row.technology} / ${row.filter_type}`;
      report.was[k] = (report.was[k] || 0) + 1;
    }

    const derivedTables = await existingDerived(db);
    for (const p of PAIRS) {
      // Parent first: FK children installed with ON UPDATE CASCADE follow atomically.
      const u = await db.query(
        `UPDATE public.elimfilters_catalog
         SET sku=$1, technology='HYDROCORE™', filter_type='water', description=$3
         WHERE sku=$2`, [p.to, p.from, es9Description(p.to)]);
      if (u.rowCount !== 1) throw new Error(`CATALOG_RENAME_COUNT_CHANGED ${p.from}`);
      for (const [table, column] of derivedTables) {
        const d = await db.query(`UPDATE ${table} SET ${column}=$1 WHERE ${column}=$2`, [p.to, p.from]);
        if (d.rowCount) report.derived[table] = (report.derived[table] || 0) + d.rowCount;
      }
    }

    // SKUs carried as text inside jsonb: one scan per column, token-exact replace.
    const map = new Map(PAIRS.map(p => [p.from, p.to]));
    for (const column of JSON_COLUMNS) {
      const hits = (await db.query(
        `SELECT id, ${column}::text AS t FROM public.elimfilters_catalog WHERE ${column}::text ~ 'EF9[0-9]'`)).rows;
      for (const h of hits) {
        const next = replaceSkus(h.t, map);
        if (next === h.t) continue;
        await db.query(`UPDATE public.elimfilters_catalog SET ${column}=$1::jsonb WHERE id=$2`, [next, h.id]);
        report.json[column] = (report.json[column] || 0) + 1;
      }
    }

    await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku = ANY($1::text[])', [froms]);
    for (const p of PAIRS) {
      try {
        await db.query('SAVEPOINT cache');
        await db.query('SELECT public.refresh_crossref_cache_sku($1)', [p.to]);
        await db.query('RELEASE SAVEPOINT cache');
      } catch (_) { await db.query('ROLLBACK TO SAVEPOINT cache'); }
    }

    // Former SKUs keep resolving in Part Search (exact-reference step).
    for (const p of PAIRS) {
      const ins = await db.query(
        `INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source)
         VALUES ('SUPERSEDED', 'ELIMFILTERS', $1, $2, $3)
         ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`,
        [p.from, p.to, SOURCE]);
      report.superseded_registered += ins.rowCount;
    }

    const after = (await db.query(
      `SELECT sku, technology, filter_type, catalog_active FROM public.elimfilters_catalog WHERE sku = ANY($1::text[])`,
      [froms.concat(tos)])).rows;
    const bad = after.filter(r => !/^ES9/.test(r.sku) || r.technology !== 'HYDROCORE™' || r.filter_type !== 'water');
    if (after.length !== PAIRS.length || bad.length) throw new Error('VERIFICATION_FAILED ' + JSON.stringify(bad.slice(0, 5)));
    report.after = {
      renamed: after.length,
      active: after.filter(r => r.catalog_active).length,
      es9_total: (await db.query(`SELECT count(*)::int AS n FROM public.elimfilters_catalog WHERE sku LIKE 'ES9%'`)).rows[0].n,
      cache_rows_for_new_skus: (await db.query(
        'SELECT count(*)::int AS n FROM public.crossref_resolved_cache WHERE sku = ANY($1::text[])', [tos])).rows[0].n,
    };
    report.remaining_mentions = await remainingMentions(db, froms);

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
