'use strict';

/**
 * Retire EH66317 (base Fleetguard HF6317) into EH60416 (base Donaldson P550416).
 *
 * Heavy Duty takes a Fleetguard base only when Donaldson does not make the
 * part. Donaldson makes it: Fleetguard's own cross list for HF6317 names
 * P550416, EH60416 already cites HF6317, and the two rows share 52 references.
 * The row's base governance was still REVIEW_PRIMARY_CANDIDATE with P550416 as
 * the observed Donaldson candidate. Donaldson's competitor search for DEMAG
 * 77732173 (on both rows) returns P550416 alone, so Part Search answered that
 * number as ambiguous.
 *
 * Known difference, accepted by the operator (order 2026-10-12, option 1):
 * Fleetguard publishes HF6317 at 210.5 mm tall, Donaldson P550416 at 181 mm,
 * same M24 x 1.5 thread.
 *
 * Steps:
 *  1. EH60416 receives the 15 references that only EH66317 held and that are
 *     on Fleetguard's cross list for HF6317 (the list that names P550416).
 *     Not carried over: SAKURA HC2701 (not on that list), the "Standpipe / NO"
 *     entry (not a reference) and P550416 itself (the base).
 *  2. EH66317 becomes inactive, with resolution_status.superseded_by = EH60416.
 *     Reversible: the row and its history stay.
 *  3. EH66317 is registered as a SUPERSEDED reference of EH60416, the same way
 *     renumbered SKUs are, so the former SKU still finds the product. Part
 *     Search lets a retired row with a successor fall through to that lookup
 *     (server-original.js, same change set).
 *
 * Evidence: C:/ELIMSERVER/evidence/eh66317-retire-20261012/
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');
const { normalizeCode } = require('../../lib/catalog-codigo-base-policy');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const FROM = 'EH66317';
const FROM_BASE = 'HF6317';
const TO = 'EH60416';
const TO_BASE = 'P550416';
const SOURCE = 'FLEETGUARD_HF6317_CROSS_LIST__RUN_275';

// field on EH60416, manufacturer, code — all on Fleetguard's cross list for HF6317
const CARRY = [
  ['oem_codes', 'ZETTELMEYER', '2288863'],
  ['oem_codes', 'MOXY', '250216'],
  ['oem_codes', 'MOXY', '52663'],
  ['oem_codes', 'CLAAS', '3419210'],
  ['oem_codes', 'ORENSTEIN & KOPPEL', '378487510'],
  ['oem_codes', 'WORTHINGTON', '6211441250'],
  ['oem_codes', 'KALMARBT', '800819041'],
  ['oem_codes', 'CNH', '84160469'],
  ['oem_codes', 'HALLA', 'H0750131053'],
  ['oem_codes', 'AVELING-BARFORD', 'MT603007'],
  ['oem_codes', 'JOHN DEERE', 'PMHF6317'],
  ['competitor_codes', 'PARKER-HANNIFIN', 'FC1003N010BS'],
  ['competitor_codes', 'HENGST', 'H18WD05'],
  ['competitor_codes', 'HENGST', 'HG18WD05'],
  ['competitor_codes', 'MANN', 'WD962/19'],
];

const codeOf = (e) => normalizeCode((e && typeof e === 'object' ? e.code || e.reference : e) || '');

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };

  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku FOR UPDATE', [[FROM, TO]])).rows;
    const from = rows.find((r) => r.sku === FROM);
    const to = rows.find((r) => r.sku === TO);
    if (!from || !to) throw new Error('SKU_MISSING');
    if (from.codigo_base !== FROM_BASE || !from.catalog_active) throw new Error(`SOURCE_CHANGED ${from.codigo_base} active=${from.catalog_active}`);
    if (to.codigo_base !== TO_BASE || !to.catalog_active) throw new Error(`TARGET_CHANGED ${to.codigo_base} active=${to.catalog_active}`);
    if (!(to.competitor_codes || []).some((e) => codeOf(e) === normalizeCode(FROM_BASE))) throw new Error('TARGET_DOES_NOT_CITE_HF6317');

    // 1. carry the references only the retired row held
    const fromCodes = new Set([...(from.oem_codes || []), ...(from.competitor_codes || [])].map(codeOf));
    const toCodes = new Set([...(to.oem_codes || []), ...(to.competitor_codes || [])].map(codeOf));
    const patch = { oem_codes: [...(to.oem_codes || [])], competitor_codes: [...(to.competitor_codes || [])] };
    report.carried = [];
    for (const [field, manufacturer, code] of CARRY) {
      const key = normalizeCode(code);
      if (!fromCodes.has(key)) throw new Error(`REFERENCE_NOT_ON_SOURCE ${code}`);
      if (toCodes.has(key)) continue;
      patch[field].push({ code, manufacturer, classification: field === 'oem_codes' ? 'OEM' : 'COMPETITOR', classification_source: SOURCE });
      report.carried.push(`${manufacturer} ${code}`);
    }
    assertGovernedCatalogPatch(to, patch);
    // trg_sync_crossref_cache rebuilds crossref_resolved_cache for the row on this update
    await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1',
      [TO, JSON.stringify(patch.oem_codes), JSON.stringify(patch.competitor_codes)]);

    // 2. retire
    const u = await db.query(
      `UPDATE public.elimfilters_catalog
       SET catalog_active=false,
           enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{resolution_status}', $2::jsonb)
       WHERE sku=$1`,
      [FROM, JSON.stringify({
        state: 'INACTIVE_RETIRED',
        reason: 'FLEETGUARD_BASED_ROW_FOR_A_PART_DONALDSON_MAKES',
        superseded_by: TO,
        donaldson_base: TO_BASE,
        height_difference_note: 'Fleetguard HF6317 210.5 mm, Donaldson P550416 181 mm, same M24 x 1.5 thread; accepted by the operator',
        decided_by: 'OPERATOR',
        updated_at: '2026-10-12',
        migration: 'run_275',
      })]);
    if (u.rowCount !== 1) throw new Error('RETIRE_UPDATE_COUNT');
    // an inactive row must not keep answering cross-reference lookups
    report.cache_rows_removed = (await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [FROM])).rowCount;

    // 3. former SKU keeps finding the product
    await db.query(
      `INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source)
       VALUES ('SUPERSEDED', 'ELIMFILTERS', $1, $2, 'RUN_275_EH66317_RETIRED_INTO_EH60416')
       ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`, [FROM, TO]);

    // checks
    const cache = new Set((await db.query(
      `SELECT upper(regexp_replace(code,'[^A-Za-z0-9]','','g')) AS code FROM public.crossref_resolved_cache WHERE sku=$1`, [TO])).rows.map((r) => r.code));
    const missing = [FROM_BASE, ...CARRY.map((c) => c[2])].map(normalizeCode).filter((c) => !cache.has(c));
    if (missing.length) throw new Error(`CACHE_MISSING ${missing.join(',')}`);
    report.active_holders = (await db.query(
      `SELECT x.code, array_agg(DISTINCT c.sku ORDER BY c.sku) AS skus
       FROM unnest($1::text[]) AS x(code)
       JOIN public.elimfilters_catalog c ON c.catalog_active
        AND EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb) || coalesce(c.competitor_codes,'[]'::jsonb)) e
                    WHERE upper(regexp_replace(e->>'code','[^A-Za-z0-9]','','g')) = upper(regexp_replace(x.code,'[^A-Za-z0-9]','','g')))
       GROUP BY x.code ORDER BY x.code`, [['77732173', FROM_BASE, ...CARRY.map((c) => c[2])]])).rows;
    report.rows = (await db.query(
      `SELECT sku, codigo_base, catalog_active, jsonb_array_length(oem_codes) AS oem, jsonb_array_length(competitor_codes) AS competitor
       FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku`, [[FROM, TO]])).rows;

    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    await db.end();
  }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
