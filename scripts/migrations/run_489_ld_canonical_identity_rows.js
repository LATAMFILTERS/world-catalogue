'use strict';

/**
 * Light Duty canonical identity rows (operator 2026-11-25, "apruebo todo"). The LD certification needs exactly one ACTIVE row in ld_catalog.ld_canonical_product_identity whose part number
 * equals the SKU's verified code base (MANN-FILTER = EUROPEAN, FRAM = NON_EUROPEAN, same pattern as EA35004 / EA38506). Five LD SKUs have a verified base and an aligned regional policy but no identity row:
 *   EL30013 FRAM PH13 · EL30016 FRAM PH16 · EL30621 FRAM PH11203 · EL34997 FRAM PH4997 · EC32026 MANN-FILTER CU2026
 * The identity is written from the SKU's own catalogue base and checked against the regional policy view; nothing else is written.
 * NOT touched: EL33807 (identity MANN W6106 captured from the official MANN page on 2026-11-09 versus code base FRAM PH3807: needs an operator ruling) and EA33372 (base 3372 unverified).
 * Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const TARGETS = [
  { sku: 'EL30013', base: 'PH13', brand: 'FRAM', origin: 'NON_EUROPEAN' },
  { sku: 'EL30016', base: 'PH16', brand: 'FRAM', origin: 'NON_EUROPEAN' },
  { sku: 'EL30621', base: 'PH11203', brand: 'FRAM', origin: 'NON_EUROPEAN' },
  { sku: 'EL34997', base: 'PH4997', brand: 'FRAM', origin: 'NON_EUROPEAN' },
  { sku: 'EC32026', base: 'CU2026', brand: 'MANN-FILTER', origin: 'EUROPEAN' },
];
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', inserted: [] };
  try {
    await db.query('BEGIN');
    const skus = TARGETS.map((t) => t.sku);
    const before = (await db.query('SELECT * FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku = ANY($1::text[])', [skus])).rows;
    if (before.length) throw new Error('IDENTITY_ALREADY_PRESENT ' + before.map((r) => r.elimfilters_sku).join(','));
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows_before: before }, null, 2));
    for (const t of TARGETS) {
      const e = (await db.query('SELECT sku, duty, catalog_active, codigo_base, filter_type, canonical_source_brand, enrichment_data->\'codigo_base_governance\'->>\'state\' AS gov FROM public.elimfilters_catalog WHERE sku=$1', [t.sku])).rows[0];
      if (!e || e.duty !== 'LIGHT_DUTY' || !e.catalog_active || norm(e.codigo_base) !== norm(t.base) || e.gov !== 'CANONICAL_VERIFIED') throw new Error('SOURCE_CHANGED ' + t.sku);
      const p = (await db.query('SELECT regional_policy_state, origin_group, approved_manufacturer FROM public.catalog_ld_regional_policy_audit_v WHERE sku=$1', [t.sku])).rows[0];
      if (!p || p.regional_policy_state !== 'POLICY_ALIGNED' || p.origin_group !== t.origin || String(p.approved_manufacturer).toUpperCase() !== t.brand) throw new Error('POLICY_MISMATCH ' + t.sku + ' ' + JSON.stringify(p));
      const r = await db.query(`INSERT INTO ld_catalog.ld_canonical_product_identity(elimfilters_sku, origin_group, canonical_brand, canonical_part_number, filter_type, status, evidence_source)
        VALUES ($1,$2,$3,$4,$5,'ACTIVE','OPERATOR_APPROVED_20261125_BASE_VERIFIED') RETURNING elimfilters_sku, canonical_brand, canonical_part_number`, [t.sku, t.origin, t.brand, norm(e.codigo_base), e.filter_type]);
      report.inserted.push(r.rows[0]);
    }
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
