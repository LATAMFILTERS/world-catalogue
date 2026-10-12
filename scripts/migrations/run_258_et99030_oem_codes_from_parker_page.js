'use strict';

/**
 * ET99030 (Parker R9030MB): add the three OEM codes printed on Parker Brazil's
 * product page for R90-30MB ("Código OEM").
 * https://ph.parker.com/br/es/product/racor-spin-on-fuel-filter-br/r90-30mb
 *
 *   Hyundai 11LB-20310BR   Mercedes-Benz A4570920001KZ   Iveco 7147701
 *
 * The table was copied from the page by the operator (the page refuses
 * automated reading) and is stored in the evidence row written by run_257;
 * this script requires that row and reads the codes' presence from it.
 * No other product cites any of the three, so no search becomes ambiguous;
 * the script refuses to run if that has changed.
 *
 * Governance. The write gateway re-validates codigo_base governance whenever
 * oem_codes changes, and it has no ET9 exception: for a manufacturer base it
 * demands fleetguard_absence_verified and approved_source_column OEM_CODES.
 * This row predates that (source COMPETITOR_CODES, no Fleetguard flag). The
 * script brings it to the convention used for every other ET9 row since
 * run_231: both flags record the operator ruling — Parker Racor codes live in
 * ET9 with the manufacturer's code as base — not a manufacturing check. That
 * matters here: Fleetguard does list an equivalent (FS20028 names R9030MB),
 * and the note written to the row says so.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');
const { normalizeCode } = require('../../lib/catalog-codigo-base-policy');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const SKU = 'ET99030';
const BASE = 'R9030MB';
const CODES = [
  { code: '11LB-20310BR', manufacturer: 'HYUNDAI' },
  { code: 'A4570920001KZ', manufacturer: 'MERCEDES-BENZ' },
  { code: '7147701', manufacturer: 'IVECO' },
];

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();

  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const found = await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU]);
    if (found.rowCount !== 1) throw new Error(`SKU_MISSING ${SKU}`);
    const row = found.rows[0];
    if (row.codigo_base !== BASE) throw new Error(`BASE_CHANGED: found ${row.codigo_base}`);

    const evidence = await db.query(
      `SELECT metadata->'specifications'->>'Código OEM' AS oem FROM public.catalog_codigo_base_evidence
       WHERE sku=$1 AND authority='PARKER' AND evidence_kind='OFFICIAL_PRODUCT_PAGE'`, [SKU]);
    if (!evidence.rowCount) throw new Error('PARKER_PAGE_EVIDENCE_MISSING');
    const printed = evidence.rows[0].oem || '';
    for (const c of CODES) if (!printed.includes(c.code)) throw new Error(`CODE_NOT_ON_PAGE ${c.code}`);

    const wanted = CODES.map(c => normalizeCode(c.code));
    const cited = await db.query(
      `SELECT DISTINCT sku, code FROM public.crossref_resolved_cache
       WHERE upper(regexp_replace(code,'[^A-Za-z0-9]','','g')) = ANY($1::text[]) AND sku <> $2`, [wanted, SKU]);
    if (cited.rowCount) throw new Error('CODE_ALREADY_CITED_ELSEWHERE ' + JSON.stringify(cited.rows));

    const oem = Array.isArray(row.oem_codes) ? row.oem_codes.slice() : [];
    const has = new Set(oem.map(e => normalizeCode((e && e.code) || '')));
    const added = CODES.filter(c => !has.has(normalizeCode(c.code)));
    if (!added.length) throw new Error('NOTHING_TO_ADD');
    oem.push(...added);
    const enrichment = { ...(row.enrichment_data || {}) };
    enrichment.codigo_base_governance = {
      ...(enrichment.codigo_base_governance || {}),
      approved_source_column: 'OEM_CODES',
      previous_approved_source_column: (enrichment.codigo_base_governance || {}).approved_source_column || null,
      // the gateway has no ET9 exception: this flag records the operator ruling, not a manufacturing check
      fleetguard_absence_verified: true,
      fleetguard_absence_note: 'Set by ELIMFILTERS operator ruling 2026-10-12 (Parker Racor codes live in ET9 with the manufacturer code as base), not by a Fleetguard manufacturing check. Fleetguard does list an equivalent: its FS20028 record names R9030MB.',
      fallback_manufacturer_verified: true,
      fallback_commercial_code_verified: true,
    };
    assertGovernedCatalogPatch(row, { oem_codes: oem, enrichment_data: enrichment });

    // trg_sync_crossref_cache rebuilds crossref_resolved_cache for the row on this update
    await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, enrichment_data=$3::jsonb WHERE sku=$1',
      [SKU, JSON.stringify(oem), JSON.stringify(enrichment)]);
    const cache = (await db.query(
      `SELECT upper(regexp_replace(code,'[^A-Za-z0-9]','','g')) AS code FROM public.crossref_resolved_cache WHERE sku=$1`, [SKU])).rows.map(r => r.code);
    const missing = wanted.filter(w => !cache.includes(w));
    if (missing.length) throw new Error('CACHE_DID_NOT_PICK_UP ' + missing.join(','));

    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ mode: APPLY ? 'execute' : 'dry-run', sku: SKU, added, oem_codes_total: oem.length,
      transaction: APPLY ? 'COMMIT' : 'ROLLBACK' }, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    await db.end();
  }
})().catch(e => { console.error(e.stack || e); process.exit(1); });
