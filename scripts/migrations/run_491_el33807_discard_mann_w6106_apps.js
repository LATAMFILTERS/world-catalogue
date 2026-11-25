'use strict';

/**
 * EL33807 is FRAM PH3807 (operator 2026-11-25), OD 83 x H 80, M20 x 1.5. The official MANN page for W 610/6 (https://www.mann-filter.com/en/catalog/search-results/product.html/w610/6_mann-filter.html)
 * gives OD 66 mm x H 90 mm, M20 x 1.5 (Honda): a different filter. Operator: "si el W610/6 no es el mismo filtro, descártalo". So the data that came from W 610/6 is discarded from EL33807:
 *   - ld_catalog.ld_vehicle_applications rows with elimfilters_sku=EL33807 and source_sku=W610/6 (MANN_OFFICIAL_CATALOG, 328 rows),
 *   - the catalog_application_evidence VEHICLE row whose authority is MANN_OFFICIAL_CATALOG for W 610/6.
 * NOT touched: the 586 applications published in the catalogue row and their OPERATOR_SUPPLIED (Millard ML-3807) evidence; only 28 of them share a make+model with the MANN rows.
 * The discarded rows are saved in the snapshot file (and the 2026-11-09 backup table keeps the 353 older rows). Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EL33807';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const sku = (await db.query('SELECT sku, codigo_base, canonical_source_brand, outer_diameter_mm, height_mm, vehicle_applications FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!sku || sku.codigo_base !== 'PH3807' || sku.canonical_source_brand !== 'FRAM') throw new Error('SOURCE_CHANGED');
    if (Number(sku.outer_diameter_mm) !== 83 || Number(sku.height_mm) !== 80) throw new Error('DIMENSIONS_CHANGED');
    const ld = (await db.query(`SELECT * FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND source_sku='W610/6' AND source_origin='MANN_OFFICIAL_CATALOG'`, [SKU])).rows;
    const evidence = (await db.query(`SELECT * FROM public.catalog_application_evidence WHERE sku=$1 AND application_kind='VEHICLE' AND evidence_authority='MANN_OFFICIAL_CATALOG' AND metadata->>'mann_code'='W 610/6'`, [SKU])).rows;
    if (!ld.length || evidence.length !== 1) throw new Error('NOTHING_TO_DISCARD_OR_EVIDENCE_COUNT ' + ld.length + '/' + evidence.length);
    const other = (await db.query(`SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND NOT (source_sku='W610/6' AND source_origin='MANN_OFFICIAL_CATALOG')`, [SKU])).rows[0].n;
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), ld_rows: ld, evidence_rows: evidence, row_sha256: sha([ld, evidence]) }, null, 2));
    report.ld_rows_discarded = (await db.query(`DELETE FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND source_sku='W610/6' AND source_origin='MANN_OFFICIAL_CATALOG'`, [SKU])).rowCount;
    report.evidence_rows_discarded = (await db.query('DELETE FROM public.catalog_application_evidence WHERE id=$1', [evidence[0].id])).rowCount;
    const after = (await db.query('SELECT vehicle_applications FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    if (sha(after.vehicle_applications) !== sha(sku.vehicle_applications)) throw new Error('CATALOGUE_APPLICATIONS_CHANGED');
    report.catalogue_applications_kept = (sku.vehicle_applications || []).length;
    report.other_ld_rows_kept = other;
    report.evidence_left = (await db.query('SELECT application_kind, evidence_authority FROM public.catalog_application_evidence WHERE sku=$1', [SKU])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
