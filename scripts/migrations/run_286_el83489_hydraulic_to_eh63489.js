'use strict';

/**
 * EL83489 (EL8 = lube, SYNTRAX™) carries codigo_base P173489, which Donaldson's own product page labels
 * "HYDRAULIC FILTER, CARTRIDGE" (operator local capture donaldson-local, 2026-11-02,
 * https://shop.donaldson.com/store/en-us/product/P173489/...). Prefix system: EH6 = hydraulic, NANOFORCE™.
 * Target EH63489 (EH6 + last four of the base) is free.
 *
 * Same mechanism as run_237 (rename + no-FK derived tables + jsonb token replace + former SKU registered as
 * SUPERSEDED so Part Search keeps resolving it). Dry-run by default (ROLLBACK). --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const FROM = 'EL83489'; const TO = 'EH63489'; const BASE = 'P173489';
const SOURCE = 'RUN_286_EL8_TO_EH6_DONALDSON_LOCAL';
const DESCRIPTION = `ELIMFILTERS® ${TO} NANOFORCE™ hydraulic cartridge filter is designed to help keep your precision hydraulic systems running as intended, providing a solution for various applications. This filter meets or exceeds the equipment OEM quality and performance, bringing your operation top-quality performance and an overall unbeatable total cost of ownership.`;
const DERIVED = [
  ['public.exact_part_reference', 'sku'], ['public.kit_components', 'filter_sku'], ['public.product_element', 'elimfilters_sku'],
  ['public.product_model', 'elimfilters_sku'], ['public.kg_product_equipment', 'product_sku'], ['public.kg_crossrefs', 'product_sku'],
  ['public.catalog_sku_certification', 'sku'], ['public.catalog_codigo_base_evidence', 'sku'], ['public.codigo_base_review_queue', 'sku'],
  ['public.hermes_catalogue_backlog', 'sku'], ['public.hermes_catalogue_dossier', 'sku'], ['public.hermes_catalogue_evidence', 'sku'],
  ['public.kg_product_systems', 'product_sku'], ['public.kg_product_technologies', 'product_sku'], ['public.oem_codes_legacy', 'sku'],
  ['public.catalog_application_evidence', 'sku'],
];
const JSON_COLUMNS = ['alternative_products', 'alternatives', 'enrichment_data', 'canonical_evidence'];

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', derived: {}, json: {} };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const rows = (await db.query('SELECT sku, codigo_base, technology, filter_type FROM public.elimfilters_catalog WHERE sku = ANY($1) FOR UPDATE', [[FROM, TO]])).rows;
    const src = rows.find((r) => r.sku === FROM);
    if (!src) throw new Error('SOURCE_MISSING');
    if (rows.some((r) => r.sku === TO)) throw new Error('TARGET_OCCUPIED');
    if (src.codigo_base !== BASE) throw new Error(`BASE_CHANGED ${src.codigo_base}`);
    const reserved = await db.query(`SELECT 1 FROM public.exact_part_reference WHERE reference_type='SUPERSEDED' AND brand='ELIMFILTERS' AND part_number=$1`, [TO]);
    if (reserved.rowCount) throw new Error('TARGET_IS_A_FORMER_SKU');
    report.was = `${src.technology} / ${src.filter_type}`;

    const u = await db.query(`UPDATE public.elimfilters_catalog SET sku=$1, technology='NANOFORCE™', filter_type='hydraulic', description=$3 WHERE sku=$2`, [TO, FROM, DESCRIPTION]);
    if (u.rowCount !== 1) throw new Error('CATALOG_RENAME_COUNT_CHANGED');
    for (const [qualified, column] of DERIVED) {
      const [schema, table] = qualified.split('.');
      const exists = await db.query(`SELECT 1 FROM information_schema.columns c JOIN information_schema.tables t USING (table_schema, table_name)
        WHERE c.table_schema=$1 AND c.table_name=$2 AND c.column_name=$3 AND t.table_type='BASE TABLE'`, [schema, table, column]);
      if (!exists.rowCount) continue;
      const d = await db.query(`UPDATE ${qualified} SET ${column}=$1 WHERE ${column}=$2`, [TO, FROM]);
      if (d.rowCount) report.derived[qualified] = d.rowCount;
    }
    for (const column of JSON_COLUMNS) {
      const hits = (await db.query(`SELECT id, ${column}::text AS t FROM public.elimfilters_catalog WHERE ${column}::text LIKE '%${FROM}%'`)).rows;
      for (const h of hits) {
        const next = h.t.replace(/[A-Z0-9]+/g, (tok) => (tok === FROM ? TO : tok));
        if (next === h.t) continue;
        await db.query(`UPDATE public.elimfilters_catalog SET ${column}=$1::jsonb WHERE id=$2`, [next, h.id]);
        report.json[column] = (report.json[column] || 0) + 1;
      }
    }
    await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku = $1', [FROM]);
    try { await db.query('SAVEPOINT cache'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [TO]); await db.query('RELEASE SAVEPOINT cache'); }
    catch (_) { await db.query('ROLLBACK TO SAVEPOINT cache'); }
    const ins = await db.query(`INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) VALUES ('SUPERSEDED','ELIMFILTERS',$1,$2,$3)
      ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`, [FROM, TO, SOURCE]);
    report.superseded_registered = ins.rowCount;
    const after = (await db.query('SELECT sku, technology, filter_type, catalog_active FROM public.elimfilters_catalog WHERE sku = ANY($1)', [[FROM, TO]])).rows;
    if (after.length !== 1 || after[0].sku !== TO || after[0].technology !== 'NANOFORCE™') throw new Error('VERIFICATION_FAILED ' + JSON.stringify(after));
    report.after = after[0];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
