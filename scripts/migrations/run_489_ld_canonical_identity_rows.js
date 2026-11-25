'use strict';

/**
 * Light Duty canonical identity rows (operator 2026-11-25, "apruebo todo"). The LD certification needs exactly one ACTIVE row in ld_catalog.ld_canonical_product_identity whose part number
 * equals the SKU's verified code base (MANN-FILTER = EUROPEAN, FRAM = NON_EUROPEAN, same pattern as EA35004 / EA38506). Five LD SKUs have a verified base and an aligned regional policy but no identity row:
 *   EL30013 FRAM PH13 · EL30016 FRAM PH16 · EL30621 FRAM PH11203 · EL34997 FRAM PH4997 · EC32026 MANN-FILTER CU2026
 * The identity is written from the SKU's own catalogue base and checked against the regional policy view; nothing else is written.
 * EL33807: operator ruling 2026-11-25 "es FRAM PH3807": its single identity row MANN-FILTER W6106 (captured 2026-11-09) is rewritten to FRAM PH3807 (NON_EUROPEAN). Its 336 vehicle applications that came from MANN W 610/6 stay as they are.
 * NOT touched: EA33372 (base 3372 unverified).
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
  { sku: 'EL33807', base: 'PH3807', brand: 'FRAM', origin: 'NON_EUROPEAN', retire: { brand: 'MANN-FILTER', part: 'W6106' } },
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
    const unexpected = before.filter((r) => !(r.elimfilters_sku === 'EL33807' && r.status === 'ACTIVE' && r.canonical_brand === 'MANN-FILTER' && norm(r.canonical_part_number) === 'W6106'));
    if (unexpected.length) throw new Error('IDENTITY_ALREADY_PRESENT ' + unexpected.map((r) => r.elimfilters_sku).join(','));
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows_before: before }, null, 2));
    for (const t of TARGETS) {
      const e = (await db.query('SELECT sku, duty, catalog_active, codigo_base, filter_type, canonical_source_brand, enrichment_data->\'codigo_base_governance\'->>\'state\' AS gov FROM public.elimfilters_catalog WHERE sku=$1', [t.sku])).rows[0];
      if (!e || e.duty !== 'LIGHT_DUTY' || !e.catalog_active || norm(e.codigo_base) !== norm(t.base) || e.gov !== 'CANONICAL_VERIFIED') throw new Error('SOURCE_CHANGED ' + t.sku);
      const p = (await db.query('SELECT regional_policy_state, origin_group, approved_manufacturer FROM public.catalog_ld_regional_policy_audit_v WHERE sku=$1', [t.sku])).rows[0];
      if (!p || p.regional_policy_state !== 'POLICY_ALIGNED' || p.origin_group !== t.origin || String(p.approved_manufacturer).toUpperCase() !== t.brand) throw new Error('POLICY_MISMATCH ' + t.sku + ' ' + JSON.stringify(p));
      if (t.retire) {
        // one identity row per SKU (primary key): the MANN-FILTER W6106 row is rewritten to FRAM PH3807 instead of adding a second row
        const up = await db.query(`UPDATE ld_catalog.ld_canonical_product_identity SET origin_group=$2, canonical_brand=$3, canonical_part_number=$4, filter_type=$5, status='ACTIVE',
          evidence_source='OPERATOR_RULING_20261125_EL33807_IS_FRAM_PH3807_WAS_MANN_W6106', updated_at=now()
          WHERE elimfilters_sku=$1 AND status='ACTIVE' AND canonical_brand=$6 AND ld_catalog.norm_part(canonical_part_number)=ld_catalog.norm_part($7)
          RETURNING elimfilters_sku, canonical_brand, canonical_part_number`, [t.sku, t.origin, t.brand, norm(e.codigo_base), e.filter_type, t.retire.brand, t.retire.part]);
        if (up.rowCount !== 1) throw new Error('REWRITE_COUNT ' + t.sku);
        report.rewritten = (report.rewritten || []).concat(up.rows[0]);
        continue;
      }
      const r = await db.query(`INSERT INTO ld_catalog.ld_canonical_product_identity(elimfilters_sku, origin_group, canonical_brand, canonical_part_number, filter_type, status, evidence_source)
        VALUES ($1,$2,$3,$4,$5,'ACTIVE','OPERATOR_APPROVED_20261125_BASE_VERIFIED') RETURNING elimfilters_sku, canonical_brand, canonical_part_number`, [t.sku, t.origin, t.brand, norm(e.codigo_base), e.filter_type]);
      report.inserted.push(r.rows[0]);
    }
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
