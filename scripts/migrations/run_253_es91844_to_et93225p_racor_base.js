'use strict';

/**
 * ES91844 (base P551844) -> ET93225P, base Racor S3225P.
 *
 * The row is the Racor S3225P spin-on element: its own evidence records
 * racor_reference S3225P, and its micron rating, height, diameter and thread
 * match the Parker Racor catalog (operator-supplied RacorCatalog.pdf, Engine
 * Spin-On Series, PDF pages 169 and 372): 30 micron, 127 mm x 111 mm, 1"-14.
 * It was ET91844P until 2026-09-17, when it was renumbered to ES91844 for
 * carrying a Donaldson base.
 *
 * Operator ruling 2026-10-12: Racor spin-on products homologated with Parker
 * keep HYDROCORE and use the Racor number, in ET9. Same mechanism as run_252.
 *
 * P551844 is kept as a DONALDSON cross: the row's previous governance records
 * it as verified on Donaldson's product page (2026-09-27). That page could not
 * be re-read (the store refused this machine on 2026-10-12).
 *
 * Former SKU ES91844 is registered as SUPERSEDED; the older ET91844P reference
 * follows the row to its new SKU.
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const MIGRATION = 'run_253_es91844_to_et93225p_racor_base';
const SUPERSEDED_SOURCE = 'RUN_253_ES91844_TO_ET93225P';
const ROWS = require('./run_253_es91844_to_et93225p_racor_base.data.json');
const SOURCE = 'Parker Racor filtration catalog (RacorCatalog.pdf), Engine Spin-On Series';
const VERIFIED_AT = '2026-10-12T00:00:00.000Z';

// Same no-FK surfaces as run_240.
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
  for (const r of ROWS) if (last4(r.to) !== last4(r.racor)) throw new Error(`SKU_DOES_NOT_FOLLOW_RACOR_NUMBER ${r.to} ${r.racor}`);
  if (new Set(ROWS.map(r => r.racor)).size !== ROWS.length || new Set(ROWS.map(r => r.to)).size !== ROWS.length) throw new Error('DATA_NOT_UNIQUE');

  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', rebased: [], renumbered: [] };

  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const derivedTables = [];
    for (const [qualified, column] of DERIVED) {
      const [schema, table] = qualified.split('.');
      const exists = await db.query(
        `SELECT 1 FROM information_schema.columns c JOIN information_schema.tables t USING (table_schema, table_name)
         WHERE c.table_schema=$1 AND c.table_name=$2 AND c.column_name=$3 AND t.table_type='BASE TABLE'`, [schema, table, column]);
      if (exists.rowCount) derivedTables.push([qualified, column]);
    }

    for (const r of ROWS) {
      const rename = r.from !== r.to;
      const found = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) FOR UPDATE', [[r.from, r.to]])).rows;
      const row = found.find(x => x.sku === r.from);
      if (!row) throw new Error(`SOURCE_MISSING ${r.from}`);
      if (rename && found.some(x => x.sku === r.to)) throw new Error(`TARGET_OCCUPIED ${r.to}`);
      if (row.codigo_base !== r.current_base) throw new Error(`BASE_CHANGED ${r.from}: found ${row.codigo_base}`);
      if (row.technology !== 'HYDROCORE™') throw new Error(`TECHNOLOGY_CHANGED ${r.from}: ${row.technology}`);
      // the row must restate the official table
      if (parseInt(row.micron_rating, 10) !== r.micron) throw new Error(`MICRON_MISMATCH ${r.from}: ${row.micron_rating} vs ${r.micron}`);
      if (Math.abs(Number(row.height_mm) - r.height_mm) > 1) throw new Error(`HEIGHT_MISMATCH ${r.from}: ${row.height_mm} vs ${r.height_mm}`);
      if (Math.abs(Number(row.outer_diameter_mm) - r.diameter_mm) > 1) throw new Error(`DIAMETER_MISMATCH ${r.from}: ${row.outer_diameter_mm} vs ${r.diameter_mm}`);
      if (rename) {
        const reserved = await db.query(
          `SELECT 1 FROM public.exact_part_reference WHERE reference_type='SUPERSEDED' AND brand='ELIMFILTERS' AND part_number=$1`, [r.to]);
        if (reserved.rowCount) throw new Error(`TARGET_IS_A_FORMER_SKU ${r.to}`);
      }
      const taken = await db.query(
        `SELECT sku FROM public.elimfilters_catalog WHERE upper(regexp_replace(codigo_base,'[^A-Za-z0-9]','','g'))=$1`, [r.racor]);
      if (taken.rowCount) throw new Error(`RACOR_BASE_ALREADY_USED ${r.racor} by ${taken.rows[0].sku}`);

      const note = `${SOURCE}, PDF page ${r.pdf_page}: ${r.racor}, ${r.micron} micron, ${r.height_mm} mm x ${r.diameter_mm} mm, thread ${r.thread}`;
      const enrichment = { ...(row.enrichment_data || {}) };
      enrichment.codigo_base_governance = {
        ...(enrichment.codigo_base_governance || {}),
        state: 'CANONICAL_VERIFIED',
        policy_version: '2026-08-19-v3.1',
        required_authority: 'VERIFIED_OEM_FALLBACK',
        evidence_authority: 'RACOR_PRODUCT_CATALOG',
        verification_method: 'ELIMFILTERS_OPERATOR_RULING_PLUS_RACOR_CATALOG',
        racor_official_page_verified: true,
        evidence_note: note,
        verified_at: VERIFIED_AT,
        current_codigo_base: r.racor,
        approved_codigo_base: r.racor,
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
        previous_codigo_base: r.current_base,
        ...(rename ? { previous_sku: r.from } : {}),
      };
      const competitor = Array.isArray(row.competitor_codes) ? row.competitor_codes.slice() : [];
      if (r.keep_previous_base_as_cross && !competitor.some(e => e && e.code === r.current_base)) {
        competitor.push({ code: r.current_base, manufacturer: r.keep_previous_base_as_cross });
      }
      assertCanonicalWrite({ ...row, sku: r.to, codigo_base: r.racor, canonical_source_code: r.racor,
        competitor_codes: competitor,
        oem_codes: Array.isArray(row.oem_codes) ? row.oem_codes : [], enrichment_data: enrichment });

      // Parent first: FK children installed with ON UPDATE CASCADE follow atomically.
      const u = await db.query(
        `UPDATE public.elimfilters_catalog
         SET sku=$2::text, codigo_base=$3::text, canonical_source_code=$3::text, enrichment_data=$4::jsonb,
             competitor_codes=$5::jsonb, description=replace(description, $1::text, $2::text)
         WHERE sku=$1::text`, [r.from, r.to, r.racor, JSON.stringify(enrichment), JSON.stringify(competitor)]);
      if (u.rowCount !== 1) throw new Error(`UPDATE_COUNT_CHANGED ${r.from}`);

      if (rename) {
        for (const [qualified, column] of derivedTables) {
          await db.query(`UPDATE ${qualified} SET ${column}=$1 WHERE ${column}=$2`, [r.to, r.from]);
        }
        const token = `\\m${r.from}\\M`; // whole-token match
        for (const column of JSON_COLUMNS) {
          await db.query(
            `UPDATE public.elimfilters_catalog SET ${column} = regexp_replace(${column}::text, $1, $2, 'g')::jsonb
             WHERE ${column}::text ~ $1 AND sku <> $2`, [token, r.to]);
        }
        await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [r.from]);
        // former SKU keeps resolving in Part Search
        await db.query(
          `INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source)
           VALUES ('SUPERSEDED', 'ELIMFILTERS', $1, $2, $3)
           ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`, [r.from, r.to, SUPERSEDED_SOURCE]);
      }
      try {
        await db.query('SAVEPOINT cache');
        await db.query('SELECT public.refresh_crossref_cache_sku($1)', [r.to]);
        await db.query('RELEASE SAVEPOINT cache');
      } catch (_) { await db.query('ROLLBACK TO SAVEPOINT cache'); }

      const hash = crypto.createHash('md5').update(`${MIGRATION}|${r.to}|${r.racor}|${r.pdf_page}`).digest('hex');
      await db.query(
        `INSERT INTO public.catalog_codigo_base_evidence
           (sku, evidence_kind, authority, manufacturer, reference_code, normalized_reference, source_url, evidence_hash, verified_at, metadata)
         VALUES ($1, 'FALLBACK_MANUFACTURER', 'RACOR', 'RACOR', $2, $2, $3, $4, $5, $6::jsonb)
         ON CONFLICT DO NOTHING`,
        [r.to, r.racor, `${SOURCE}, PDF page ${r.pdf_page}`, hash, VERIFIED_AT,
          JSON.stringify({ migration: MIGRATION, racor_reference: r.racor, micron: r.micron, height_mm: r.height_mm,
            diameter_mm: r.diameter_mm, thread: r.thread })]);

      (rename ? report.renumbered : report.rebased).push({ from: r.from, to: r.to, base: r.racor });
    }

    const after = (await db.query(
      `SELECT sku, codigo_base, technology, catalog_active FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku`,
      [ROWS.flatMap(r => [r.from, r.to])])).rows;
    if (after.length !== ROWS.length || after.some(a => !ROWS.some(r => r.to === a.sku && r.racor === a.codigo_base))) {
      throw new Error('VERIFICATION_FAILED ' + JSON.stringify(after));
    }
    report.unverified_racor_rows_left = (await db.query(
      `SELECT sku, codigo_base FROM public.elimfilters_catalog
       WHERE sku LIKE 'ET9%' AND technology='HYDROCORE™' AND catalog_active
         AND coalesce(enrichment_data->'codigo_base_governance'->>'racor_official_page_verified','') <> 'true'
       ORDER BY sku`)).rows;

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
