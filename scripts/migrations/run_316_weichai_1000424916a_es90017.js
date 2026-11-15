'use strict';

/**
 * HERMES #1313: attach the Weichai OEM 1000424916A (distinct from 1000424916)
 * and the officially cross-referenced WIX 95102E / SF SK 3359 to the EXISTING
 * ES90017 (canonical Donaldson R010017, untouched).
 *
 * Not written: HIFI SN 70207 (official page not verifiable), any new
 * Donaldson/Fleetguard equivalence. Dry-run by default; --execute commits and
 * requires --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'ES90017';
const VERIFIED_AT = '2026-11-15T00:00:00.000Z';
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

const MANN = 'https://www.mann-filter.com/en/catalog/search-results/product.html/pl420x_mann-filter.html';
const WIX = 'https://www.wixfilters.com/es-es/catalog/results/product.html/95102e_wix.html';
const SF = 'https://www.sf-filter.com/en/cross-reference-list?searchValue=1000424916A';

const OEM = { manufacturer: 'WEICHAI', code: '1000424916A', source_url: MANN, verification_status: 'VERIFIED', verified_at: VERIFIED_AT };
const COMPETITORS = [
  { manufacturer: 'WIX', code: '95102E', source_url: WIX, classification: 'AFTERMARKET' },
  { manufacturer: 'SF-FILTER', code: 'SK 3359', source_url: SF, classification: 'AFTERMARKET' },
].map((x) => ({ ...x, classification_source: 'OFFICIAL_CROSS_REFERENCE_1000424916A_20261115', verification_status: 'VERIFIED', verified_at: VERIFIED_AT }));

const stamp = (x) => ({ ...x, evidence_hash: sha({ sku: SKU, code: x.code, source_url: x.source_url }) });
const has = (list, code) => list.some((x) => norm(x && (x.code || x.reference)) === norm(code));

function plan(row) {
  const oem = Array.isArray(row.oem_codes) ? row.oem_codes : [];
  const comp = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
  const patch = {};
  if (!has(oem, OEM.code)) patch.oem_codes = [...oem, stamp(OEM)];
  const add = COMPETITORS.filter((x) => !has(comp, x.code)).map(stamp);
  if (add.length) patch.competitor_codes = [...comp, ...add];
  return Object.keys(patch).length ? patch : null;
}

const OWNER_SQL = `SELECT sku FROM public.elimfilters_catalog c
  WHERE regexp_replace(upper(coalesce(c.codigo_base,'')),'[^A-Z0-9]','','g')=$1
     OR regexp_replace(upper(coalesce(c.canonical_source_code,'')),'[^A-Z0-9]','','g')=$1
     OR EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb) || coalesce(c.competitor_codes,'[]'::jsonb)) x
                WHERE regexp_replace(upper(coalesce(x->>'code',x->>'reference','')),'[^A-Z0-9]','','g')=$1)
  ORDER BY sku`;

if (require.main === module) (async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB_URL_MISSING');
  const db = new Client({ connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };
  try {
    await db.query('BEGIN');
    const current = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!current) throw new Error('SKU_NOT_FOUND');
    if (current.canonical_source_brand !== 'DONALDSON' || current.canonical_source_code !== 'R010017') throw new Error('CANONICAL_MISMATCH');
    const before = { canonical: [current.canonical_source_brand, current.canonical_source_code, current.canonical_source_status], base: current.codigo_base, height: current.height_mm, od: current.outer_diameter_mm };
    const patch = plan(current);
    report.already_present = patch === null;
    if (patch) {
      report.gateway = assertGovernedCatalogPatch(current, patch, { validateApplications: false });
      if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: current, row_sha256: sha(current) }, null, 2));
      await db.query('UPDATE public.elimfilters_catalog SET oem_codes=COALESCE($2::jsonb,oem_codes), competitor_codes=COALESCE($3::jsonb,competitor_codes) WHERE sku=$1',
        [SKU, patch.oem_codes ? JSON.stringify(patch.oem_codes) : null, patch.competitor_codes ? JSON.stringify(patch.competitor_codes) : null]);
    }
    report.owners = {};
    for (const code of [OEM.code, ...COMPETITORS.map((x) => x.code)]) {
      const owners = (await db.query(OWNER_SQL, [norm(code)])).rows.map((x) => x.sku);
      report.owners[code] = owners;
      if (owners.length !== 1 || owners[0] !== SKU) throw new Error(`REFERENCE_COLLISION ${code} ${owners.join(',')}`);
    }
    const saved = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    const after = { canonical: [saved.canonical_source_brand, saved.canonical_source_code, saved.canonical_source_status], base: saved.codigo_base, height: saved.height_mm, od: saved.outer_diameter_mm };
    if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('IDENTITY_CHANGED');
    if (!has(saved.oem_codes, OEM.code) || !has(saved.oem_codes, '1000424916')) throw new Error('POST_WRITE_VERIFICATION_FAILED_OEM');
    for (const c of COMPETITORS) if (!has(saved.competitor_codes, c.code)) throw new Error('POST_WRITE_VERIFICATION_FAILED_' + c.code);
    report.oem_count = saved.oem_codes.length;
    report.competitor_codes = saved.competitor_codes.map((x) => x.manufacturer + ':' + x.code);
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw error;
  } finally {
    await db.end();
  }
})().catch((error) => { console.error(error.stack || error); process.exit(1); });

module.exports = { plan, norm, OEM, COMPETITORS };
