'use strict';

/**
 * Retire EH66317 (base Fleetguard HF6317) and EL36219 (Light Duty, base MANN
 * WD 962/19 written as "6219") into EH60416 (base Donaldson P550416).
 *
 * EH66317: Heavy Duty takes a Fleetguard base only when Donaldson does not
 * make the part. Donaldson makes it: Fleetguard's own cross list for HF6317
 * names P550416, EH60416 already cites HF6317, and the two rows share 52
 * references. The row's base governance was still REVIEW_PRIMARY_CANDIDATE
 * with P550416 as the observed Donaldson candidate. Donaldson's competitor
 * search for DEMAG 77732173 (on all three rows) returns P550416 alone, so Part
 * Search answered that number as ambiguous.
 *
 * EL36219: operator ruling 2026-10-12, a product whose base code is Donaldson
 * cannot be Light Duty. The row is Light Duty "oil", but its 52 applications
 * are wheel loaders, mobile cranes and tractors, it has no Light Duty
 * canonical identity, and it carries the references of EH60416 (DEMAG
 * 77732173, the ZF 0750131053 family); Fleetguard's list for HF6317 names both
 * WD962/19 and P550416. It is the same Heavy Duty hydraulic spin-on.
 *
 * Known difference, accepted by the operator (order 2026-10-12, option 1):
 * Fleetguard publishes HF6317 at 210.5 mm tall, Donaldson P550416 at 181 mm,
 * same M24 x 1.5 thread.
 *
 * Steps:
 *  1. EH60416 receives the references that only the retired rows held and that
 *     are on Fleetguard's cross list for HF6317 (the list that names P550416):
 *     15 from EH66317, 2 from EL36219. Not carried over: references absent
 *     from that list (SAKURA HC2701; BERKO 510019WOR, CIM-TEK 70313, FIL
 *     ZP3272, SCHUPP SPH21024), a "Standpipe / NO" entry and P550416 itself.
 *     EL36219's vehicle applications are not carried either.
 *  2. Both rows become inactive, with resolution_status.superseded_by =
 *     EH60416. Reversible: the rows and their history stay.
 *  3. Both SKUs are registered as SUPERSEDED references of EH60416, the same
 *     way renumbered SKUs are, so a former SKU still finds the product. Part
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
// sku, base on the row, reason recorded on the retired row
const RETIRE = [
  ['EH66317', 'HF6317', 'FLEETGUARD_BASED_ROW_FOR_A_PART_DONALDSON_MAKES'],
  ['EL36219', '6219', 'LIGHT_DUTY_ROW_FOR_A_HEAVY_DUTY_PART_WITH_DONALDSON_BASE'],
];
const FLEETGUARD_CROSS = 'HF6317';
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
  // only on EL36219
  ['oem_codes', 'DOOSAN', 'MX501990'],
  ['oem_codes', 'SULLAIR', '46701'],
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
    const skus = RETIRE.map((r) => r[0]);
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku FOR UPDATE', [[...skus, TO]])).rows;
    const to = rows.find((r) => r.sku === TO);
    if (!to || to.codigo_base !== TO_BASE || !to.catalog_active) throw new Error('TARGET_CHANGED');
    if (!(to.competitor_codes || []).some((e) => codeOf(e) === normalizeCode(FLEETGUARD_CROSS))) throw new Error('TARGET_DOES_NOT_CITE_HF6317');
    const fromCodes = new Set();
    for (const [sku, base] of RETIRE) {
      const from = rows.find((r) => r.sku === sku);
      if (!from || from.codigo_base !== base || !from.catalog_active) throw new Error(`SOURCE_CHANGED ${sku}`);
      for (const e of [...(from.oem_codes || []), ...(from.competitor_codes || [])]) fromCodes.add(codeOf(e));
    }

    // 1. carry the references only the retired rows held
    const toCodes = new Set([...(to.oem_codes || []), ...(to.competitor_codes || [])].map(codeOf));
    const patch = { oem_codes: [...(to.oem_codes || [])], competitor_codes: [...(to.competitor_codes || [])] };
    report.carried = [];
    for (const [field, manufacturer, code] of CARRY) {
      const key = normalizeCode(code);
      if (!fromCodes.has(key)) throw new Error(`REFERENCE_NOT_ON_SOURCE ${code}`);
      if (toCodes.has(key)) continue;
      toCodes.add(key);
      patch[field].push({ code, manufacturer, classification: field === 'oem_codes' ? 'OEM' : 'COMPETITOR', classification_source: SOURCE });
      report.carried.push(`${manufacturer} ${code}`);
    }
    assertGovernedCatalogPatch(to, patch);
    // trg_sync_crossref_cache rebuilds crossref_resolved_cache for the row on this update
    await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1',
      [TO, JSON.stringify(patch.oem_codes), JSON.stringify(patch.competitor_codes)]);

    report.cache_rows_removed = 0;
    for (const [sku, , reason] of RETIRE) {
      // 2. retire
      const u = await db.query(
        `UPDATE public.elimfilters_catalog
         SET catalog_active=false,
             enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{resolution_status}', $2::jsonb)
         WHERE sku=$1`,
        [sku, JSON.stringify({
          state: 'INACTIVE_RETIRED',
          reason,
          superseded_by: TO,
          donaldson_base: TO_BASE,
          note: 'Fleetguard HF6317 is 210.5 mm tall, Donaldson P550416 181 mm, same M24 x 1.5 thread; accepted by the operator',
          decided_by: 'OPERATOR',
          updated_at: '2026-10-12',
          migration: 'run_275',
        })]);
      if (u.rowCount !== 1) throw new Error(`RETIRE_UPDATE_COUNT ${sku}`);
      // an inactive row must not keep answering cross-reference lookups
      report.cache_rows_removed += (await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [sku])).rowCount;

      // 3. the former SKU keeps finding the product
      await db.query(
        `INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source)
         VALUES ('SUPERSEDED', 'ELIMFILTERS', $1, $2, 'RUN_275_RETIRED_INTO_EH60416')
         ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`, [sku, TO]);
    }

    // checks
    const cache = new Set((await db.query(
      `SELECT upper(regexp_replace(code,'[^A-Za-z0-9]','','g')) AS code FROM public.crossref_resolved_cache WHERE sku=$1`, [TO])).rows.map((r) => r.code));
    const missing = [FLEETGUARD_CROSS, ...CARRY.map((c) => c[2])].map(normalizeCode).filter((c) => !cache.has(c));
    if (missing.length) throw new Error(`CACHE_MISSING ${missing.join(',')}`);
    report.active_holders = (await db.query(
      `SELECT x.code, array_agg(DISTINCT c.sku ORDER BY c.sku) AS skus
       FROM unnest($1::text[]) AS x(code)
       JOIN public.elimfilters_catalog c ON c.catalog_active
        AND EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb) || coalesce(c.competitor_codes,'[]'::jsonb)) e
                    WHERE upper(regexp_replace(e->>'code','[^A-Za-z0-9]','','g')) = upper(regexp_replace(x.code,'[^A-Za-z0-9]','','g')))
       GROUP BY x.code ORDER BY x.code`, [['77732173', FLEETGUARD_CROSS, ...CARRY.map((c) => c[2])]])).rows;
    report.rows = (await db.query(
      `SELECT sku, codigo_base, duty, catalog_active, jsonb_array_length(oem_codes) AS oem, jsonb_array_length(competitor_codes) AS competitor
       FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku`, [[...skus, TO]])).rows;

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
