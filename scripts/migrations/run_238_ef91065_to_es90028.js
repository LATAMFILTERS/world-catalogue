'use strict';

/**
 * EF91065 (Donaldson P551065, fuel/water separator filed as fuel filter) -> ES90028.
 *
 * run_237 left it out: its natural slot ES91065 is held by a different product
 * (Fleetguard FS1065, 248.67 mm tall vs 173.1 mm). CLAUDE.md collision rule:
 * derive the SKU from the verified Fleetguard cross instead. Fleetguard's own
 * record for FS20028 lists P551065 (captured 2026-10-12), so the SKU is ES90028.
 * Operator order 2026-10-12. codigo_base stays P551065; the slot decision is
 * written to codigo_base_governance.sku_slot_resolution.
 *
 * Also removes the FS19932 cite: Fleetguard's FS19932 record does not list
 * P551065 and it is a different part (207.98 mm tall).
 *
 * Same mechanism as run_237 (rename + SUPERSEDED) and run_235 (cite removal).
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');
const { normalizeCode } = require('../../lib/catalog-codigo-base-policy');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const FROM = 'EF91065';
const TO = 'ES90028';
const BASE = 'P551065';
const BLOCKED = 'ES91065';
const FLEETGUARD_CROSS = 'FS20028';
const BAD_CITE = 'FS19932';
const SOURCE = 'RUN_238_EF9_TO_ES9_RENUMBER';
const REASON = 'FLEETGUARD_RECORD_DOES_NOT_LIST_CODE__RUN_238';

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

const description = `ELIMFILTERS® ${TO} Fuel/water separator for diesel fuel systems. HYDROCORE™ media coalesces and drains free water from fuel before it reaches the injection system, preventing injector corrosion and microbial growth in the fuel tank.`;
const codeOf = entry => normalizeCode((entry && typeof entry === 'object' ? entry.code || entry.reference : entry) || '');

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
      'SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) FOR UPDATE', [[FROM, TO, BLOCKED]])).rows;
    const row = rows.find(r => r.sku === FROM);
    if (!row) throw new Error(`SOURCE_MISSING ${FROM}`);
    if (row.codigo_base !== BASE) throw new Error(`BASE_CHANGED ${FROM}: found ${row.codigo_base}`);
    if (rows.some(r => r.sku === TO)) throw new Error(`TARGET_OCCUPIED ${TO}`);
    // the detour is only valid while the natural slot belongs to another product
    const blocker = rows.find(r => r.sku === BLOCKED);
    if (!blocker || blocker.codigo_base === BASE) throw new Error(`NATURAL_SLOT_NOT_BLOCKED ${BLOCKED}`);
    if (!(row.competitor_codes || []).some(e => codeOf(e) === FLEETGUARD_CROSS)) throw new Error(`CROSS_NOT_ON_ROW ${FLEETGUARD_CROSS}`);
    const reserved = await db.query(
      `SELECT 1 FROM public.exact_part_reference WHERE reference_type='SUPERSEDED' AND brand='ELIMFILTERS' AND part_number=$1`, [TO]);
    if (reserved.rowCount) throw new Error(`TARGET_IS_A_FORMER_SKU ${TO}`);

    // 1. the unsupported Fleetguard cite goes out with the rename (run_235 mechanism)
    const patch = {};
    const removed = [];
    for (const field of ['competitor_codes', 'oem_codes']) {
      const before = Array.isArray(row[field]) ? row[field] : [];
      const after = before.filter(e => codeOf(e) !== BAD_CITE);
      if (after.length === before.length) continue;
      patch[field] = after;
      for (const e of before.filter(x => codeOf(x) === BAD_CITE)) removed.push({ field, code: e.code, manufacturer: e.manufacturer || null });
    }
    if (!removed.length) throw new Error(`CITE_NOT_FOUND ${BAD_CITE}`);
    assertGovernedCatalogPatch(row, patch, { rejectionCleanup: true });

    // 2. rename; parent first so FK children with ON UPDATE CASCADE follow
    const u = await db.query(
      `UPDATE public.elimfilters_catalog
       SET sku=$1, technology='HYDROCORE™', filter_type='water', description=$3,
           competitor_codes=coalesce($4::jsonb, competitor_codes), oem_codes=coalesce($5::jsonb, oem_codes),
           enrichment_data=jsonb_set(enrichment_data, '{codigo_base_governance,sku_slot_resolution}', $6::jsonb)
       WHERE sku=$2`,
      [TO, FROM, description,
        patch.competitor_codes ? JSON.stringify(patch.competitor_codes) : null,
        patch.oem_codes ? JSON.stringify(patch.oem_codes) : null,
        JSON.stringify({
          rule: 'HD_COLLISION_FLEETGUARD_CROSS_NATURAL_SKU',
          natural_sku_blocked: BLOCKED,
          blocked_by_codigo_base: blocker.codigo_base,
          sku_derived_from: FLEETGUARD_CROSS,
          evidence_url: 'https://www.fleetguard.com/es/product/fs20028/01t5x000008FBlqAAG',
          decided_by: 'OPERATOR',
          decided_at: '2026-10-12',
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
         WHERE ${column}::text ~ $1`, [token, TO]);
      if (j.rowCount) report.json[column] = j.rowCount;
    }

    const legacy = await db.query(
      `DELETE FROM public.oem_codes_legacy WHERE sku=$1 AND upper(regexp_replace(code,'[^A-Za-z0-9]','','g'))=$2`, [TO, BAD_CITE]);
    for (const r of removed) {
      await db.query(`
        INSERT INTO public.bad_crossref_quarantine(query_code,source_sku,source_base,source_duty,source_filter_type,source_field,brand,reason)
        SELECT $1,$2,$3,$4,$5,$6,$7,$8
        WHERE NOT EXISTS (SELECT 1 FROM public.bad_crossref_quarantine WHERE query_code=$1 AND source_sku=$2 AND source_field=$6)`,
      [r.code, TO, BASE, row.duty, 'water', r.field, r.manufacturer, REASON]);
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
    if (after.length !== 1 || after[0].sku !== TO || after[0].codigo_base !== BASE || after[0].technology !== 'HYDROCORE™') {
      throw new Error('VERIFICATION_FAILED ' + JSON.stringify(after));
    }
    const cache = (await db.query(
      `SELECT upper(regexp_replace(code,'[^A-Za-z0-9]','','g')) AS code FROM public.crossref_resolved_cache WHERE sku=$1`, [TO])).rows.map(r => r.code);
    if (cache.includes(BAD_CITE)) throw new Error(`CACHE_STILL_HOLDS ${BAD_CITE}`);
    if (!cache.includes(FLEETGUARD_CROSS)) throw new Error(`CACHE_MISSING ${FLEETGUARD_CROSS}`);

    Object.assign(report, { after: after[0], removed, oem_codes_legacy_rows_deleted: legacy.rowCount,
      superseded_registered: ins.rowCount, cache_rows: cache.length });
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
