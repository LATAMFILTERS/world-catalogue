'use strict';

/**
 * ES93209S (base P559624) -> ET93209S, base Racor S3209S.
 *
 * It is the 2-micron member of the Racor S3209 spin-on element family; its
 * siblings ET93209P (S3209P) and ET93209T (S3209T) were rebased by run_239.
 * It was missed then because its SKU starts with ES9. Its own evidence row
 * records racor_reference S3209S.
 *
 * P559624 is not this product: Donaldson's page describes P559624 as
 * "FUEL FILTER, SPIN-ON", 210 mm x 96 mm, DAF 247138 — that is EF99624. With
 * both rows on that base, Part Search answered P559624 as ambiguous.
 *
 * Same ruling as run_239 (operator, 2026-10-12): Racor spin-on products
 * homologated with Parker keep HYDROCORE and use the Racor number; they live
 * in ET9. Parker's pages could not be read (403): the Racor number is the one
 * recorded with the row. Technology and filter_type do not change.
 *
 * Mechanism: run_240 (rename, derived tables, SUPERSEDED, base).
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const SOURCE = 'RUN_250_ES93209S_TO_ET93209S';

// from, to, Donaldson base on the row today, Racor part number
const ROWS = [
  ['ES93209S', 'ET93209S', 'P559624', 'S3209S'],
];

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
  ['public.catalog_application_evidence', 'sku'],
  ['public.codigo_base_review_queue', 'sku'],
  ['public.hermes_catalogue_backlog', 'sku'],
  ['public.hermes_catalogue_dossier', 'sku'],
  ['public.hermes_catalogue_evidence', 'sku'],
  ['public.kg_product_systems', 'product_sku'],
  ['public.kg_product_technologies', 'product_sku'],
  ['public.oem_codes_legacy', 'sku'],
];
const JSON_COLUMNS = ['alternative_products', 'alternatives', 'enrichment_data', 'canonical_evidence'];

const last4 = code => code.replace(/\D/g, '').slice(-4);

(async () => {
  for (const [, to, , racor] of ROWS) if (last4(to) !== last4(racor)) throw new Error(`SKU_DOES_NOT_FOLLOW_RACOR_NUMBER ${to} ${racor}`);

  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', renumbered: [] };

  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    for (const [from, to, donaldson, racor] of ROWS) {
      const found = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) FOR UPDATE', [[from, to]])).rows;
      const row = found.find(r => r.sku === from);
      if (!row) throw new Error(`SOURCE_MISSING ${from}`);
      if (found.some(r => r.sku === to)) throw new Error(`TARGET_OCCUPIED ${to}`);
      if (row.codigo_base !== donaldson) throw new Error(`BASE_CHANGED ${from}: found ${row.codigo_base}`);
      const reserved = await db.query(
        `SELECT 1 FROM public.exact_part_reference WHERE reference_type='SUPERSEDED' AND brand='ELIMFILTERS' AND part_number=$1`, [to]);
      if (reserved.rowCount) throw new Error(`TARGET_IS_A_FORMER_SKU ${to}`);
      const recorded = await db.query(
        `SELECT 1 FROM public.catalog_codigo_base_evidence WHERE sku=$1 AND metadata->>'racor_reference'=$2`, [from, racor]);
      if (!recorded.rowCount) throw new Error(`RACOR_NUMBER_NOT_ON_RECORD ${from} ${racor}`);
      const taken = await db.query(
        `SELECT sku FROM public.elimfilters_catalog WHERE upper(regexp_replace(codigo_base,'[^A-Za-z0-9]','','g'))=$1`, [racor]);
      if (taken.rowCount) throw new Error(`RACOR_BASE_ALREADY_USED ${racor} by ${taken.rows[0].sku}`);

      const enrichment = { ...(row.enrichment_data || {}) };
      enrichment.codigo_base_governance = {
        state: 'CANONICAL_VERIFIED',
        policy_version: '2026-08-19-v3.1',
        required_authority: 'VERIFIED_OEM_FALLBACK',
        evidence_authority: 'RACOR_REFERENCE_ON_RECORD',
        verification_method: 'ELIMFILTERS_OPERATOR_RULING_PLUS_RECORDED_RACOR_REFERENCE',
        racor_official_page_verified: false,
        current_codigo_base: racor,
        approved_codigo_base: racor,
        approved_manufacturer: 'RACOR',
        approved_source_column: 'OEM_CODES',
        donaldson_absence_verified: true,
        donaldson_absence_note: 'ELIMFILTERS operator ruling 2026-10-12: ET9 never takes a Donaldson base; Racor spin-on products use the Parker Racor part number.',
        // the gateway has no ET9 exception: both flags record the operator ruling, not a manufacturing check
        fleetguard_absence_verified: true,
        fleetguard_absence_note: 'Set by the same ELIMFILTERS operator ruling 2026-10-12 (ET9 exception), not by a Fleetguard manufacturing check.',
        primary_manufacturer_verified: false,
        fallback_manufacturer_verified: true,
        fallback_commercial_code_verified: true,
        previous_codigo_base: donaldson,
        previous_sku: from,
      };
      assertCanonicalWrite({ ...row, sku: to, codigo_base: racor, canonical_source_code: racor,
        competitor_codes: Array.isArray(row.competitor_codes) ? row.competitor_codes : [],
        oem_codes: Array.isArray(row.oem_codes) ? row.oem_codes : [], enrichment_data: enrichment });

      // Parent first: FK children installed with ON UPDATE CASCADE follow atomically.
      const u = await db.query(
        `UPDATE public.elimfilters_catalog
         SET sku=$2::text, codigo_base=$3::text, canonical_source_code=$3::text, enrichment_data=$4::jsonb,
             description=replace(description, $1::text, $2::text)
         WHERE sku=$1::text`, [from, to, racor, JSON.stringify(enrichment)]);
      if (u.rowCount !== 1) throw new Error(`UPDATE_COUNT_CHANGED ${from}`);

      const derived = {};
      for (const [qualified, column] of DERIVED) {
        const [schema, table] = qualified.split('.');
        const exists = await db.query(
          `SELECT 1 FROM information_schema.columns c JOIN information_schema.tables t USING (table_schema, table_name)
           WHERE c.table_schema=$1 AND c.table_name=$2 AND c.column_name=$3 AND t.table_type='BASE TABLE'`, [schema, table, column]);
        if (!exists.rowCount) continue;
        const d = await db.query(`UPDATE ${qualified} SET ${column}=$1 WHERE ${column}=$2`, [to, from]);
        if (d.rowCount) derived[qualified] = d.rowCount;
      }
      const token = `\\m${from}\\M`; // whole-token match
      const json = {};
      for (const column of JSON_COLUMNS) {
        const j = await db.query(
          `UPDATE public.elimfilters_catalog SET ${column} = regexp_replace(${column}::text, $1, $2, 'g')::jsonb
           WHERE ${column}::text ~ $1 AND sku <> $2`, [token, to]);
        if (j.rowCount) json[column] = j.rowCount;
      }

      await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [from]);
      try {
        await db.query('SAVEPOINT cache');
        await db.query('SELECT public.refresh_crossref_cache_sku($1)', [to]);
        await db.query('RELEASE SAVEPOINT cache');
      } catch (_) { await db.query('ROLLBACK TO SAVEPOINT cache'); }

      // former SKU keeps resolving in Part Search
      const ins = await db.query(
        `INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source)
         VALUES ('SUPERSEDED', 'ELIMFILTERS', $1, $2, $3)
         ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`, [from, to, SOURCE]);

      const after = (await db.query(
        'SELECT sku, codigo_base, technology, catalog_active FROM public.elimfilters_catalog WHERE sku = ANY($1::text[])', [[from, to]])).rows;
      if (after.length !== 1 || after[0].sku !== to || after[0].codigo_base !== racor || after[0].technology !== row.technology) {
        throw new Error('VERIFICATION_FAILED ' + JSON.stringify(after));
      }
      report.renumbered.push({ from, to, base_from: donaldson, base_to: racor, derived, json, superseded_registered: ins.rowCount, after: after[0] });
    }

    report.et9_on_any_donaldson_base = (await db.query(
      `SELECT sku, codigo_base FROM public.elimfilters_catalog WHERE sku LIKE 'ET9%' AND codigo_base ~ '^P[0-9]{6}$' ORDER BY sku`)).rows;

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
