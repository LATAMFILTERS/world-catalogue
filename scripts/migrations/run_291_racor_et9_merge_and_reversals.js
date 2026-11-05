'use strict';

/**
 * Operator rulings 2026-11-04 (Victor), ET9 scope: separators are ES9/HYDROCORE, never ET9. Supersedes the
 * 2026-10-12 "Racor code -> ET9" decision behind run_239/run_250/run_255.
 *
 * A. MERGE ET93203 (Racor S3203) into ES93203 (Donaldson P553203): Donaldson's official P553203 page lists S3203 as a
 *    cross. HD base = Donaldson, so the Racor row is redundant: ET93203 is deactivated (kept, not deleted), registered
 *    SUPERSEDED -> ES93203, and S3203 (RACOR) is added to ES93203 competitor_codes.
 * B. REVERSE ET93209S -> ES93209S (Racor S3209S, Parker "Diesel Spin-on FF/WS") and ET99030 -> ES99030 (R9030MB,
 *    operator: spin-on separator). The old SUPERSEDED rows ES9->ET9 written by run_250/run_255 are replaced by
 *    ET9->ES9 ones. Base, technology and crosses stay; only the SKU changes.
 * Dry-run by default (ROLLBACK). --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const SOURCE = 'RUN_291_ET9_SCOPE_OPERATOR_20261104';
const REVERSALS = [
  { from: 'ET93209S', to: 'ES93209S', base: 'S3209S', old_source: 'RUN_250_ES93209S_TO_ET93209S' },
  { from: 'ET99030', to: 'ES99030', base: 'R9030MB', old_source: 'RUN_255_ES99030_TO_ET99030' },
];
const DERIVED = [
  ['public.exact_part_reference', 'sku'], ['public.kit_components', 'filter_sku'], ['public.product_element', 'elimfilters_sku'],
  ['public.product_model', 'elimfilters_sku'], ['public.kg_product_equipment', 'product_sku'], ['public.kg_crossrefs', 'product_sku'],
  ['public.catalog_sku_certification', 'sku'], ['public.catalog_codigo_base_evidence', 'sku'], ['public.codigo_base_review_queue', 'sku'],
  ['public.hermes_catalogue_backlog', 'sku'], ['public.hermes_catalogue_dossier', 'sku'], ['public.hermes_catalogue_evidence', 'sku'],
  ['public.kg_product_systems', 'product_sku'], ['public.kg_product_technologies', 'product_sku'], ['public.oem_codes_legacy', 'sku'],
  ['public.catalog_application_evidence', 'sku'],
];
const JSON_COLUMNS = ['alternative_products', 'alternatives', 'enrichment_data', 'canonical_evidence'];
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', derived: {}, json: {} };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    // A. merge
    const m = (await db.query(`SELECT sku, codigo_base, catalog_active, competitor_codes FROM public.elimfilters_catalog WHERE sku = ANY($1) FOR UPDATE`, [['ET93203', 'ES93203']])).rows;
    const et = m.find((r) => r.sku === 'ET93203'); const es = m.find((r) => r.sku === 'ES93203');
    if (!et || !et.catalog_active || et.codigo_base !== 'S3203') throw new Error('ET93203_STATE_CHANGED');
    if (!es || !es.catalog_active || es.codigo_base !== 'P553203') throw new Error('ES93203_STATE_CHANGED');
    await db.query(`UPDATE public.elimfilters_catalog SET catalog_active=false,
        enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb),'{superseded_by}',$2::jsonb) WHERE sku=$1`,
      ['ET93203', JSON.stringify({ sku: 'ES93203', reason: 'Donaldson P553203 official page lists Racor S3203 as cross; HD base Donaldson', source: SOURCE, at: new Date().toISOString() })]);
    const comp = es.competitor_codes || [];
    if (!comp.some((c) => norm(c && c.code) === 'S3203')) {
      comp.push({ code: 'S3203', manufacturer: 'RACOR', classification: 'AFTERMARKET', classification_source: 'DONALDSON_OFFICIAL_CROSS_REFERENCE_P553203' });
      await db.query(`UPDATE public.elimfilters_catalog SET competitor_codes=$2::jsonb WHERE sku=$1`, ['ES93203', JSON.stringify(comp)]);
      report.s3203_added_to_es93203 = true;
    }
    await db.query(`INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) VALUES ('SUPERSEDED','ELIMFILTERS','ET93203','ES93203',$1)
      ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`, [SOURCE]);
    await db.query(`UPDATE public.exact_part_reference SET sku='ES93203' WHERE reference_type='SUPERSEDED' AND brand='ELIMFILTERS' AND sku='ET93203'`); // older names of ET93203 follow
    await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku = $1', ['ET93203']);
    report.merge = 'ET93203 -> ES93203 (ET93203 inactive)';

    // B. reversals
    const tables = [];
    for (const [q, col] of DERIVED) {
      const [s, t] = q.split('.');
      if ((await db.query(`SELECT 1 FROM information_schema.columns c JOIN information_schema.tables t USING (table_schema, table_name)
        WHERE c.table_schema=$1 AND c.table_name=$2 AND c.column_name=$3 AND t.table_type='BASE TABLE'`, [s, t, col])).rowCount) tables.push([q, col]);
    }
    report.reversed = [];
    for (const p of REVERSALS) {
      const r = (await db.query(`SELECT sku, codigo_base FROM public.elimfilters_catalog WHERE sku = ANY($1) FOR UPDATE`, [[p.from, p.to]])).rows;
      if (r.length !== 1 || r[0].sku !== p.from || r[0].codigo_base !== p.base) throw new Error('STATE_CHANGED ' + p.from + ' ' + JSON.stringify(r));
      const del = await db.query(`DELETE FROM public.exact_part_reference WHERE reference_type='SUPERSEDED' AND brand='ELIMFILTERS' AND part_number=$1 AND sku=$2 AND source=$3`, [p.to, p.from, p.old_source]);
      if (del.rowCount !== 1) throw new Error('OLD_SUPERSEDED_ROW_NOT_FOUND ' + p.to);
      const u = await db.query(`UPDATE public.elimfilters_catalog SET sku=$1::text, description=replace(description, $2::text, $1::text) WHERE sku=$2::text`, [p.to, p.from]);
      if (u.rowCount !== 1) throw new Error('RENAME_COUNT ' + p.from);
      for (const [q, col] of tables) {
        const d = await db.query(`UPDATE ${q} SET ${col}=$1 WHERE ${col}=$2`, [p.to, p.from]);
        if (d.rowCount) report.derived[q] = (report.derived[q] || 0) + d.rowCount;
      }
      for (const column of JSON_COLUMNS) {
        const hits = (await db.query(`SELECT id, ${column}::text AS t FROM public.elimfilters_catalog WHERE ${column}::text LIKE $1`, ['%' + p.from + '%'])).rows;
        for (const h of hits) {
          const next = h.t.replace(/[A-Z0-9]+/g, (tok) => (tok === p.from ? p.to : tok));
          if (next !== h.t) { await db.query(`UPDATE public.elimfilters_catalog SET ${column}=$1::jsonb WHERE id=$2`, [next, h.id]); report.json[column] = (report.json[column] || 0) + 1; }
        }
      }
      await db.query(`INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) VALUES ('SUPERSEDED','ELIMFILTERS',$1,$2,$3)
        ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`, [p.from, p.to, SOURCE]);
      await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku = $1', [p.from]);
      try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [p.to]); await db.query('RELEASE SAVEPOINT c'); }
      catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); }
      report.reversed.push(`${p.from} -> ${p.to}`);
    }
    try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', ['ES93203']); await db.query('RELEASE SAVEPOINT c'); }
    catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); }
    report.after = (await db.query(`SELECT sku, codigo_base, catalog_active, technology FROM public.elimfilters_catalog WHERE sku = ANY($1) ORDER BY sku`,
      [['ET93203', 'ES93203', 'ET93209S', 'ES93209S', 'ET99030', 'ES99030']])).rows;
    report.superseded = (await db.query(`SELECT part_number, sku FROM public.exact_part_reference WHERE reference_type='SUPERSEDED' AND part_number = ANY($1) ORDER BY 1`,
      [['ET93203', 'ET93209S', 'ES93209S', 'ET99030', 'ES99030']])).rows;
    report.et9_hydrocore_left = (await db.query(`SELECT array_agg(sku ORDER BY sku) s FROM public.elimfilters_catalog WHERE catalog_active AND sku LIKE 'ET9%' AND technology LIKE 'HYDROCORE%'`)).rows[0].s;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
