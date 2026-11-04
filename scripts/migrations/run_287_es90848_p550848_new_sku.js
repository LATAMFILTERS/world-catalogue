'use strict';

/**
 * New HD SKU ES90848 for Donaldson P550848 "FUEL FILTER, WATER SEPARATOR SPIN-ON TWIST&DRAIN" (Type: Water Separator).
 * Operator request 2026-11-04: Donaldson codes of his local capture that are not in the catalogue must be included.
 * Policy: HD base Donaldson; ES9 = fuel/water separator, HYDROCORE™; SKU = ES9 + last four of the base. Slot verified free.
 * Every value comes from the official Donaldson product page in the operator's capture (donaldson-local, scraped
 * 2026-11-03): dimensions, thread, efficiency, OEM cross references and equipment. No value is invented; fields the page
 * does not publish stay null.
 *
 * Usage: node scripts/migrations/run_287_es90848_p550848_new_sku.js --file <productos.json> [--execute]
 * Dry-run by default (ROLLBACK).
 */

require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const fileArg = process.argv[process.argv.indexOf('--file') + 1];
if (!process.argv.includes('--file') || !fileArg) throw new Error('--file <productos.json> is required');
const SKU = 'ES90848'; const BASE = 'P550848';
const rec = JSON.parse(fs.readFileSync(fileArg, 'utf8').replace(/^﻿/, '')).find((r) => r.requested_code === BASE);
if (!rec || rec.status !== 'EXTRAIDO' || rec.official.part_number !== BASE) throw new Error('CAPTURE_RECORD_NOT_USABLE');
if (!/WATER SEPARATOR/i.test(rec.official.description) || rec.official.attributes.Type !== 'Water Separator') throw new Error('NOT_A_SEPARATOR');
const a = rec.official.attributes;
const mm = (v) => { const m = /\(\s*([\d.]+)\s*mm\s*\)/i.exec(String(v || '')); return m ? Number(m[1]) : null; };
const AFTERMARKET = new Set(['VMC']);
const oem = []; const comp = [];
for (const [maker, code] of rec.official.cross_references_raw || []) {
  const row = { code, manufacturer: maker, classification_source: 'DONALDSON_OFFICIAL_CROSS_REFERENCE_20261103' };
  (AFTERMARKET.has(maker) ? comp : oem).push({ ...row, classification: AFTERMARKET.has(maker) ? 'AFTERMARKET' : 'OEM' });
}
const equipment = (rec.official.equipment_raw || []).map((e) => {
  const o = { type: e[2], equipment: e[0] };
  if (e[4] && !String(e[4]).startsWith('-')) o.engine = e[4];
  if (e[1] && e[1] !== '-') o.year = e[1];
  return o;
});
const evidence = { authority: 'DONALDSON_OFFICIAL_PRODUCT_PAGE', source_url: rec.source_url, scraped_at: rec.scraped_at, part_number: BASE,
  description: rec.official.description, attributes: a, capture: 'operator local capture donaldson-local 2026-11-02', minted_by: 'run_287' };
const row = {
  sku: SKU, duty: 'HEAVY_DUTY', codigo_base: BASE, technology: 'HYDROCORE™', filter_type: 'water', sub_type: 'Spin On', installation_type: 'Spin-On',
  description: `ELIMFILTERS® ${SKU} Fuel/water separator for diesel fuel systems. HYDROCORE™ media coalesces and drains free water from fuel before it reaches the injection system, preventing injector corrosion and microbial growth in the fuel tank.`,
  thread_size: a['Thread Size'] || null, outer_diameter_mm: mm(a['Outer Diameter']), height_mm: mm(a.Length), gasket_od_mm: mm(a['Gasket OD']), gasket_id_mm: mm(a['Gasket ID']),
  micron_rating: (/(\d+)\s*micron/i.exec(a['Efficiency 99%'] || '') || [])[1] || null, nominal_efficiency: a['Efficiency 99%'] || null, iso_test_method: a['Efficiency Test Std'] || null,
  canonical_source_brand: 'DONALDSON', canonical_source_code: BASE, canonical_source_url: rec.source_url, canonical_source_status: 'VERIFIED',
  product_dimensions_source: 'OFFICIAL_DONALDSON_PRODUCT_PAGE', product_dimensions_validation_status: 'FULL_PRODUCT_DIMENSIONS_OFFICIAL',
  catalog_active: true, alternatives: [], vehicle_applications: [],
  oem_codes: oem, competitor_codes: comp, equipment_applications: [], // equipment goes through the governed gateway below
  enrichment_data: { dimension_evidence: evidence, source_evidence: evidence,
    // CATALOG_POLICY_V32: HD base authority = Donaldson, verified on Donaldson's own product page.
    codigo_base_governance: { primary_manufacturer_verified: true, approved_manufacturer: 'DONALDSON', approved_codigo_base: BASE,
      approved_source_column: 'codigo_base', evidence_url: rec.source_url, verified_at: rec.scraped_at, policy: 'HD_DONALDSON_FIRST', recorded_by: 'run_287' } },
};
const JSONB = new Set(['oem_codes', 'competitor_codes', 'equipment_applications', 'enrichment_data', 'alternatives', 'vehicle_applications']);

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const taken = await db.query(`SELECT sku FROM public.elimfilters_catalog WHERE sku=$1 OR upper(codigo_base)=$2`, [SKU, BASE]);
    if (taken.rowCount) throw new Error('ALREADY_PRESENT ' + taken.rows.map((r) => r.sku).join(','));
    const former = await db.query(`SELECT 1 FROM public.exact_part_reference WHERE reference_type='SUPERSEDED' AND brand='ELIMFILTERS' AND part_number=$1`, [SKU]);
    if (former.rowCount) throw new Error('TARGET_IS_A_FORMER_SKU');
    const cols = new Set((await db.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='elimfilters_catalog'`)).rows.map((r) => r.column_name));
    const keys = Object.keys(row).filter((k) => cols.has(k) && row[k] != null);
    const ins = await db.query(`INSERT INTO public.elimfilters_catalog (${keys.join(',')}) VALUES (${keys.map((k, i) => `$${i + 1}${JSONB.has(k) ? '::jsonb' : ''}`).join(',')}) RETURNING sku`,
      keys.map((k) => (JSONB.has(k) ? JSON.stringify(row[k]) : row[k])));
    const apps = await applyVerifiedApplications(db, { sku: SKU, equipment_applications: equipment, evidence: {
      authority: 'DONALDSON_OFFICIAL_PRODUCT_PAGE', source_url: rec.source_url,
      evidence_hash: require('crypto').createHash('sha256').update(JSON.stringify(equipment)).digest('hex'),
      metadata: { migration: 'run_287', canonical_base: BASE, scraped_at: rec.scraped_at } } });
    try { await db.query('SAVEPOINT cache'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]); await db.query('RELEASE SAVEPOINT cache'); }
    catch (_) { await db.query('ROLLBACK TO SAVEPOINT cache'); }
    const cache = (await db.query('SELECT count(*)::int n FROM public.crossref_resolved_cache WHERE sku=$1', [SKU])).rows[0].n;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ mode: APPLY ? 'execute' : 'dry-run', inserted: ins.rows[0].sku, columns: keys, skipped_columns: Object.keys(row).filter((k) => !cols.has(k)),
      values: Object.fromEntries(keys.filter((k) => !JSONB.has(k)).map((k) => [k, row[k]])), oem_codes: oem.length, competitor_codes: comp.length,
      equipment: equipment.length, equipment_sample: equipment.slice(0, 3), crossref_cache_rows: cache, transaction: APPLY ? 'COMMIT' : 'ROLLBACK' }, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
