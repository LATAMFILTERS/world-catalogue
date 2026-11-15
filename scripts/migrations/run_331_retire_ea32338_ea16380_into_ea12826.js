'use strict';

/**
 * Retire EA32338 (Light Duty, base MANN C32338) and EA16380 (base Fleetguard AF26380M, mis-coded, never needed)
 * into EA12826 (Heavy Duty, base Donaldson P612826, 70 mm air panel, already cites C32338).
 *
 * Operator ruling 2026-11-15: a Mercedes-Benz Sprinter with a diesel engine is Heavy Duty, and a product whose
 * identity is Donaldson cannot be Light Duty (same mechanism as run_275). No new SKU is created (EA12338 would
 * duplicate EA12826 and a MANN/Sakura base is not allowed in Heavy Duty).
 *
 * Steps (one transaction):
 *  1. EA12826 receives the references that are on the official MANN C 32 338 page and that it lacks
 *     (VW GROUP 200 129 620; the Mercedes 003 094 82 04 is already held by EA14015 and would create a conflict). The older Mercedes numbers, MANN C32338/1
 *     and the Sakura entries stay on the retired rows (no official source for this pair).
 *  2. EA12826 receives the MANN-listed Sprinter 2500/3500 2003-2006 (L5 2.7 L turbo diesel) as equipment
 *     applications, evidence = MANN official product page; its Donaldson evidence is kept as a second row.
 *  3. Both rows become inactive with resolution_status.superseded_by = EA12826 and are registered as SUPERSEDED
 *     references so the former SKUs still find the product.
 * Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { normalizeCode } = require('../../lib/catalog-codigo-base-policy');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');
const { applyVerifiedApplications, insertEvidence, dbJsonHash } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const TO = 'EA12826';
const TO_BASE = 'P612826';
const MANN_URL = 'https://www.mann-filter.com/en/catalog/search-results/product.html/c32338_mann-filter.html';
const AT = '2026-11-15';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const codeOf = (e) => normalizeCode((e && typeof e === 'object' ? e.code || e.reference : e) || '');
const RETIRE = [
  ['EA32338', 'C32338', 'LIGHT_DUTY_ROW_FOR_A_DIESEL_MERCEDES_PART_WITH_DONALDSON_HD_TWIN'],
  ['EA16380', 'AF26380M', 'MISCODED_SKU_NEVER_NEEDED'],
];
const CARRY = [
  ['oem_codes', 'VW GROUP (AUDI/SEAT/SKODA/VW)', '200 129 620', 'EA32338'],
];
const SPRINTER = ['2500', '3500'].map((m) => ({
  type: 'LIGHT TRUCK', engine: 'MERCEDES-BENZ L5 2.7L FI TURBO DIESEL', equipment: `MERCEDES-BENZ SPRINTER ${m}`, equipment_options: '2003-2006; 2687 cc',
}));

if (require.main === module) (async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB_URL_MISSING');
  const db = new Client({ connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const skus = RETIRE.map((r) => r[0]);
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku FOR UPDATE', [[...skus, TO]])).rows;
    const to = rows.find((r) => r.sku === TO);
    if (!to || to.codigo_base !== TO_BASE || !to.catalog_active) throw new Error('TARGET_CHANGED');
    for (const [sku, base] of RETIRE) {
      const from = rows.find((r) => r.sku === sku);
      if (!from || from.codigo_base !== base || !from.catalog_active) throw new Error(`SOURCE_CHANGED ${sku}`);
    }
    const kits = (await db.query(`SELECT sku FROM public.elimfilters_catalog WHERE catalog_active AND enrichment_data->'kit'->'components' @> ANY(ARRAY['[{"sku":"EA32338"}]'::jsonb,'[{"sku":"EA16380"}]'::jsonb])`)).rows;
    if (kits.length) throw new Error('RETIRED_SKU_USED_IN_KIT ' + kits.map((k) => k.sku).join(','));
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows, row_sha256: sha(rows) }, null, 2));

    // 1. references
    const toCodes = new Set([...(to.oem_codes || []), ...(to.competitor_codes || [])].map(codeOf));
    const patch = { oem_codes: [...(to.oem_codes || [])], competitor_codes: [...(to.competitor_codes || [])] };
    report.carried = [];
    for (const [field, manufacturer, code, fromSku] of CARRY) {
      const from = rows.find((r) => r.sku === fromSku);
      if (![...(from.oem_codes || []), ...(from.competitor_codes || [])].some((e) => codeOf(e) === normalizeCode(code))) throw new Error('REFERENCE_NOT_ON_SOURCE ' + code);
      if (toCodes.has(normalizeCode(code))) continue;
      toCodes.add(normalizeCode(code));
      patch[field].push({ code, manufacturer, classification: 'OEM', classification_source: 'MANN_OFFICIAL_PAGE_C32338__RUN_331', source_url: MANN_URL });
      report.carried.push(`${manufacturer} ${code}`);
    }
    if (report.carried.length) {
      assertGovernedCatalogPatch(to, patch);
      await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [TO, JSON.stringify(patch.oem_codes), JSON.stringify(patch.competitor_codes)]);
    }

    // 2. applications
    const donEv = (await db.query(`SELECT source_url, evidence_hash FROM public.catalog_application_evidence WHERE sku=$1 AND application_kind='EQUIPMENT' ORDER BY id DESC LIMIT 1`, [TO])).rows[0];
    const have = new Set((to.equipment_applications || []).map((x) => `${x.equipment}|${x.engine}`));
    const add = SPRINTER.filter((x) => !have.has(`${x.equipment}|${x.engine}`));
    report.applications_added = add.length;
    if (add.length) {
      const list = [...to.equipment_applications, ...add];
      await applyVerifiedApplications(db, { sku: TO, equipment_applications: list,
        evidence: { authority: 'MANN_FILTER_OFFICIAL_PRODUCT_PAGE', source_url: MANN_URL, evidence_hash: sha({ sku: TO, add, MANN_URL }),
          metadata: { method: 'operator-pasted-official-mann-page', reference_code: 'C 32 338', added: add.length } } });
      if (donEv) {
        const h = await dbJsonHash(db, list);
        for (const kind of ['EQUIPMENT', 'ENGINE']) await insertEvidence(db, { sku: TO, kind, payloadHash: h, evidenceAuthority: 'DONALDSON', sourceUrl: donEv.source_url, evidenceHash: donEv.evidence_hash, metadata: { method: 'kept-from-previous-donaldson-evidence' } });
      }
    }

    // 3. retire
    report.cache_rows_removed = 0;
    for (const [sku, , reason] of RETIRE) {
      const u = await db.query(`UPDATE public.elimfilters_catalog SET catalog_active=false,
        enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{resolution_status}', $2::jsonb) WHERE sku=$1`,
      [sku, JSON.stringify({ state: 'INACTIVE_RETIRED', reason, superseded_by: TO, donaldson_base: TO_BASE, decided_by: 'OPERATOR', updated_at: AT, migration: 'run_331' })]);
      if (u.rowCount !== 1) throw new Error('RETIRE_UPDATE_COUNT ' + sku);
      report.cache_rows_removed += (await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [sku])).rowCount;
      await db.query(`INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) VALUES ('SUPERSEDED','ELIMFILTERS',$1,$2,'RUN_331_RETIRED_INTO_EA12826') ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`, [sku, TO]);
    }

    // checks
    const s = (await db.query('SELECT sku, duty, catalog_active, codigo_base, jsonb_array_length(oem_codes) oem, jsonb_array_length(equipment_applications) eq FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku', [[...skus, TO]])).rows;
    report.rows = s;
    const holders = (await db.query(`SELECT x.code, array_agg(DISTINCT c.sku ORDER BY c.sku) skus FROM unnest($1::text[]) x(code) JOIN public.elimfilters_catalog c ON c.catalog_active AND EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb)||coalesce(c.competitor_codes,'[]'::jsonb)) e WHERE upper(regexp_replace(e->>'code','[^A-Za-z0-9]','','g'))=upper(regexp_replace(x.code,'[^A-Za-z0-9]','','g'))) GROUP BY x.code`, [['C32338', '2D0129620', '0030947504', '0030948204', '200129620']])).rows;
    report.active_holders = holders;
    if (s.find((r) => r.sku === TO).duty !== 'HEAVY_DUTY') throw new Error('TARGET_NOT_HD');
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
