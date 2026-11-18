'use strict';

/**
 * EF91523 is renamed EF95935 (operator supplied the render EF9/EF95935.png, which prints EF95935): the gateway rule is SKU = EF9 + last four digits of the base (Fleetguard FF5935 -> 5935),
 * so the natural SKU is kept and the earlier operator-ruling exception (EF91523, from the Volvo OEM 20841523) is dropped. EF91523 is registered as a SUPERSEDED former SKU.
 * Rename mechanism of run_237/238/407/413. Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const CART = { from: 'EF91523', to: 'EF95935', base: 'FF5935' };
const SOURCE = 'RUN_436_EF91523_TO_EF95935';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

const DERIVED = [
  ['public.exact_part_reference', 'sku'], ['public.kit_components', 'filter_sku'], ['public.product_element', 'elimfilters_sku'],
  ['public.product_model', 'elimfilters_sku'], ['public.kg_product_equipment', 'product_sku'], ['public.kg_crossrefs', 'product_sku'],
  ['public.catalog_sku_certification', 'sku'], ['public.catalog_codigo_base_evidence', 'sku'], ['public.codigo_base_review_queue', 'sku'],
  ['public.hermes_catalogue_backlog', 'sku'], ['public.hermes_catalogue_dossier', 'sku'], ['public.hermes_catalogue_evidence', 'sku'],
  ['public.kg_product_systems', 'product_sku'], ['public.kg_product_technologies', 'product_sku'], ['public.oem_codes_legacy', 'sku'],
];
const JSON_COLUMNS = ['alternative_products', 'alternatives', 'enrichment_data', 'canonical_evidence'];

async function rename(db, m, report, clearImage) {
  const row = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [m.from])).rows[0];
  if (!row || !row.catalog_active || row.codigo_base !== m.base) throw new Error(`SOURCE_CHANGED ${m.from}`);
  const target = await db.query('SELECT 1 FROM public.elimfilters_catalog WHERE sku=$1', [m.to]);
  if (target.rowCount) throw new Error(`TARGET_OCCUPIED ${m.to}`);
  const former = await db.query(`SELECT 1 FROM public.exact_part_reference WHERE reference_type='SUPERSEDED' AND brand='ELIMFILTERS' AND part_number=$1`, [m.to]);
  if (former.rowCount) throw new Error(`TARGET_IS_A_FORMER_SKU ${m.to}`);
  const token = `\\m${m.from}\\M`;
  const slot = { rule: 'NATURAL_SKU_FF5935_IS_EF95935_OPERATOR_RENDER', natural_sku: 'EF95935', renamed_from: m.from, decided_by: 'OPERATOR', decided_at: '2026-11-17', migration: 'run_436' };
  const u = await db.query(
    `UPDATE public.elimfilters_catalog SET sku=$1::text, description=regexp_replace(description, $3::text, $1::text, 'g'), image_url=CASE WHEN $4::boolean THEN NULL ELSE 'https://cdn.elimfilters.com/EF9/EF95935.png' END,
       enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{codigo_base_governance,sku_slot_resolution}', $5::jsonb, true)
     WHERE sku=$2`,
    [m.to, m.from, token, clearImage, JSON.stringify(slot)]);
  if (u.rowCount !== 1) throw new Error('CATALOG_RENAME_COUNT_CHANGED ' + m.from);
  report.derived[m.from] = {};
  for (const [qualified, column] of DERIVED) {
    const [schema, table] = qualified.split('.');
    const exists = await db.query(`SELECT 1 FROM information_schema.columns c JOIN information_schema.tables t USING (table_schema, table_name) WHERE c.table_schema=$1 AND c.table_name=$2 AND c.column_name=$3 AND t.table_type='BASE TABLE'`, [schema, table, column]);
    if (!exists.rowCount) continue;
    const d = await db.query(`UPDATE ${qualified} SET ${column}=$1 WHERE ${column}=$2`, [m.to, m.from]);
    if (d.rowCount) report.derived[m.from][qualified] = d.rowCount;
  }
  for (const column of JSON_COLUMNS) {
    const j = await db.query(`UPDATE public.elimfilters_catalog SET ${column} = regexp_replace(${column}::text, $1, $2, 'g')::jsonb WHERE sku<>$3 AND ${column}::text ~ $1`, [token, m.to, m.to]);
    if (j.rowCount) report.derived[m.from]['json:' + column] = j.rowCount;
  }
  await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [m.from]);
}

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', derived: {} };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = $1 FOR UPDATE', [CART.from])).rows;
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows, row_sha256: sha(rows) }, null, 2));
    const kits = (await db.query(`SELECT sku FROM public.elimfilters_catalog WHERE catalog_active AND enrichment_data->'kit'->'components' @> '[{"sku":"EF91523"}]'::jsonb`)).rows;
    if (kits.length) throw new Error('SKU_USED_IN_KIT ' + kits.map((k) => k.sku).join(','));
    await rename(db, CART, report, false);
    const ins = await db.query(`INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) VALUES ('SUPERSEDED','ELIMFILTERS',$1,$2,$3) ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`, [CART.from, CART.to, SOURCE]);
    report.superseded_registered = ins.rowCount;
    try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [CART.to]); await db.query('RELEASE SAVEPOINT c'); } catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); }
    report.after = (await db.query(`SELECT sku, codigo_base, image_url, catalog_active, jsonb_array_length(equipment_applications) apps FROM public.elimfilters_catalog WHERE sku = ANY($1::text[])`, [[CART.from, CART.to]])).rows;
    if (report.after.length !== 1 || report.after[0].sku !== 'EF95935' || report.after[0].codigo_base !== 'FF5935') throw new Error('VERIFICATION_FAILED ' + JSON.stringify(report.after));
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code) IN (ld_catalog.norm_part('FF5935'), ld_catalog.norm_part('20841523'), ld_catalog.norm_part('EF91523'), ld_catalog.norm_part('EF95935'))`)).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
