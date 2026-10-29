'use strict';

/**
 * Corrects four TROY legacy-SKU mappings recorded on 2026-10-01 (run_127–130,
 * applied on 5432 but never committed). Operator decision 2026-10-26:
 *
 *  - EF95951 is the NPR engine fuel filter with the reinforced steel cap
 *    (Donaldson P505951). EF90057 is a different product (secondary fuel
 *    filter). run_128 mapped EF95951 -> EF90057 and copied P505951 / FF5394
 *    into EF90057's competitor codes: both are removed. EF95951 itself is
 *    created separately, from official Donaldson data.
 *  - EL80013 = FRAM PH13 (non-European vehicle) -> EL30013, not EL80964.
 *  - EL80016 = FRAM PH16 (non-European vehicle) -> EL30016, not EL80963.
 *  - EC10025 = European vehicle, MANN CU 2026 base -> EC32026, not EC31919.
 *
 * Legacy entries are records only (Part Search does not read them). The only
 * search change: P505951 and FF5394 stop resolving to EF90057.
 * Not touched: the Toyota OEM 87139-YZZ20 that run_127 put on EC31919
 * (pending operator decision); EL30013 stays retired until it is rebuilt as PH13.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const RECORD = { scope: 'TROY_RD_HISTORICAL_ORDER_ONLY', status: 'LEGACY_SUPERSEDED', migration: 'run_286', recorded_at: '2026-10-26', decided_by: 'OPERATOR', legacy_shipment_allowed: true };
const REMOVE = [ // [sku that holds the wrong entry, legacy sku]
  ['EF90057', 'EF95951'], ['EL80964', 'EL80013'], ['EL80963', 'EL80016'], ['EC31919', 'EC10025'],
];
const ADD = [ // [current sku, legacy sku, basis]
  ['EL30013', 'EL80013', 'FRAM_PH13_NON_EUROPEAN'],
  ['EL30016', 'EL80016', 'FRAM_PH16_NON_EUROPEAN'],
  ['EC32026', 'EC10025', 'MANN_CU2026_EUROPEAN'],
];
const WRONG_CODES = ['P505951', 'FF5394'];
const legacyOf = (row) => (Array.isArray(row.enrichment_data?.legacy_supersession) ? row.enrichment_data.legacy_supersession : []);
const norm = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', db: new URL(url).host, removed: [], added: [] };
  const lock = async (sku) => {
    const r = await db.query('SELECT sku, competitor_codes, enrichment_data FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [sku]);
    if (r.rowCount !== 1) throw new Error(`SKU_MISSING ${sku}`);
    return r.rows[0];
  };
  const saveLegacy = (sku, list) => db.query(
    `UPDATE public.elimfilters_catalog SET enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{legacy_supersession}', $2::jsonb) WHERE sku=$1`, [sku, JSON.stringify(list)]);

  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    // 1. EF90057: drop the two codes run_128 copied from EF95951
    const ef = await lock('EF90057');
    const comp = Array.isArray(ef.competitor_codes) ? ef.competitor_codes : [];
    const keep = comp.filter((c) => !(WRONG_CODES.includes(norm(c.code)) && String(c.classification_source || '').startsWith('128_')));
    if (comp.length - keep.length !== 2) throw new Error(`EF90057_CODES_CHANGED removed=${comp.length - keep.length}`);
    await db.query('UPDATE public.elimfilters_catalog SET competitor_codes=$2::jsonb WHERE sku=$1', ['EF90057', JSON.stringify(keep)]);
    report.EF90057_codes_removed = WRONG_CODES;

    // 2. wrong legacy entries
    for (const [sku, legacy] of REMOVE) {
      const row = sku === 'EF90057' ? await db.query('SELECT enrichment_data FROM public.elimfilters_catalog WHERE sku=$1', [sku]).then((r) => r.rows[0]) : await lock(sku);
      const list = legacyOf(row);
      const next = list.filter((x) => x.legacy_sku !== legacy);
      if (list.length - next.length !== 1) throw new Error(`LEGACY_ENTRY_CHANGED ${sku}<-${legacy}`);
      await saveLegacy(sku, next);
      report.removed.push(`${legacy} -> ${sku}`);
    }

    // 3. correct legacy entries
    for (const [sku, legacy, basis] of ADD) {
      const row = await lock(sku);
      const next = legacyOf(row).filter((x) => x.legacy_sku !== legacy).concat({ ...RECORD, legacy_sku: legacy, current_sku: sku, evidence: [basis] });
      await saveLegacy(sku, next);
      report.added.push(`${legacy} -> ${sku}`);
    }

    for (const sku of ['EF90057', 'EL80964', 'EL80963', 'EC31919', 'EL30013', 'EL30016', 'EC32026']) await db.query('SELECT refresh_crossref_cache_sku($1)', [sku]);
    report.P505951_FF5394_resolve_to = (await db.query(
      `SELECT DISTINCT code, sku FROM public.crossref_resolved_cache WHERE code = ANY($1) ORDER BY code, sku`, [WRONG_CODES])).rows;
    if (report.P505951_FF5394_resolve_to.some((r) => r.sku === 'EF90057')) throw new Error('EF90057_STILL_RESOLVES');

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
