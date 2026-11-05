'use strict';

/**
 * Operator rulings (Victor, 2026-11-04):
 *  - ES90083 keeps base FS20083 (Fleetguard, now obsolete). FS20385 (fleetguard.com: replaces FS20083) is added as the
 *    current Fleetguard cross, so Part Search finds the product by either code. FS20385 is also added to ES90710,
 *    which already lists FS20083.
 *  - ES90083 (Donaldson DBF0710 Blue) is the alternate SKU of ES90710 (Donaldson P580710; DBF0710's official page lists
 *    P580710 as its alternative). Alternate SKUs carry the same information; only the filter media differs. So ES90083
 *    takes ES90710's OEM codes, competitor codes and equipment applications (its own base FS20083 never as an alternate).
 * Applications go through the governed gateway (lib/catalog-application-write-service).
 * Dry-run by default (ROLLBACK). --execute to COMMIT.
 */

require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const ALT = 'ES90083'; const MAIN = 'ES90710'; const SOURCE = 'RUN_292_ALTERNATE_SKU_ES90083_OF_ES90710';
const FS_NEW = { code: 'FS20385', manufacturer: 'FLEETGUARD', classification: 'AFTERMARKET', classification_source: 'FLEETGUARD_OFFICIAL_PAGE_REPLACES_FS20083' };
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const key = (c) => `${norm(c && (c.code || c))}|${norm(c && c.manufacturer)}`;

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const rows = (await db.query(`SELECT sku, codigo_base, canonical_source_code, oem_codes, competitor_codes, equipment_applications, alternatives
      FROM public.elimfilters_catalog WHERE sku = ANY($1) AND catalog_active FOR UPDATE`, [[ALT, MAIN]])).rows;
    const alt = rows.find((r) => r.sku === ALT); const main = rows.find((r) => r.sku === MAIN);
    if (!alt || alt.codigo_base !== 'FS20083' || alt.canonical_source_code !== 'DBF0710') throw new Error('ES90083_STATE_CHANGED');
    if (!main || main.codigo_base !== 'P580710') throw new Error('ES90710_STATE_CHANGED');
    const excludeAlt = new Set([norm(alt.codigo_base), norm(ALT)]);
    const merge = (a, b, exclude) => { const seen = new Set(); const out = [];
      for (const c of [...(a || []), ...(b || [])]) { const k = key(c); if (!norm(c && (c.code || c)) || exclude.has(norm(c.code || c)) || seen.has(k)) continue; seen.add(k); out.push(c); }
      return out; };
    const altOem = merge(alt.oem_codes, main.oem_codes, excludeAlt);
    const altComp = merge(alt.competitor_codes, [...(main.competitor_codes || []), FS_NEW], excludeAlt);
    const mainComp = merge(main.competitor_codes, [FS_NEW], new Set([norm(main.codigo_base), norm(MAIN)]));
    await db.query(`UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb,
        enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb),'{alternate_sku_of}',$4::jsonb) WHERE sku=$1`,
      [ALT, JSON.stringify(altOem), JSON.stringify(altComp), JSON.stringify({ sku: MAIN, rule: 'Alternate SKUs carry the same information; only filter media differs (operator 2026-11-04)', source: SOURCE })]);
    await db.query(`UPDATE public.elimfilters_catalog SET competitor_codes=$2::jsonb WHERE sku=$1`, [MAIN, JSON.stringify(mainComp)]);
    report.oem = { before: (alt.oem_codes || []).length, after: altOem.length, es90710: (main.oem_codes || []).length };
    report.competitor = { before: (alt.competitor_codes || []).length, after: altComp.length, es90710_after: mainComp.length };
    // Union: the alternate keeps its own applications and gains the main SKU's (no application is dropped).
    const ek = (a) => JSON.stringify(Object.keys(a).sort().map((k) => [k, String(a[k]).trim().toUpperCase()]));
    const seenEq = new Set(); const eq = [];
    for (const a of [...(alt.equipment_applications || []), ...(main.equipment_applications || [])]) { const k = ek(a); if (!seenEq.has(k)) { seenEq.add(k); eq.push(a); } }
    report.equipment = { before: (alt.equipment_applications || []).length, es90710: (main.equipment_applications || []).length, after: eq.length };
    if (eq.length) {
      report.equipment.gateway = await applyVerifiedApplications(db, { sku: ALT, equipment_applications: eq, evidence: {
        authority: 'OPERATOR_ALTERNATE_SKU_RULE_OF_' + MAIN, source_url: 'https://shop.donaldson.com/store/en-us/product/DBF0710/prod2320005',
        evidence_hash: crypto.createHash('sha256').update(JSON.stringify(eq)).digest('hex'),
        metadata: { migration: 'run_292', main_sku: MAIN, main_base: 'P580710', alternate_base: 'DBF0710', ruling: 'operator 2026-11-04' } } });
    }
    for (const s of [ALT, MAIN]) {
      try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [s]); await db.query('RELEASE SAVEPOINT c'); }
      catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); }
    }
    report.fs20385_listed_on = (await db.query(`SELECT sku FROM public.elimfilters_catalog WHERE catalog_active AND competitor_codes @> '[{"code":"FS20385"}]'::jsonb`)).rows.map((r) => r.sku);
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
