'use strict';

/** EF90202: technical specs aligned to Donaldson P550202 official page (operator order 2026-11-18, "si corrige").
 * Donaldson: OD 118.3 mm, length 260 mm, gasket OD 110 mm, gasket ID 98 mm, efficiency test ISO 19438. Burst 100 psi, thread and 9 micron already match.
 * Spec columns only; one transaction. Dry-run by default; --execute needs --snapshot <file>. */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EF90202';
const NEW = { outer_diameter_mm: '118.30', height_mm: '260.00', gasket_od_mm: '110.00', gasket_id_mm: '98.00', iso_test_method: 'ISO 19438' };

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };
  try {
    await db.query('BEGIN');
    const cur = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!cur || cur.codigo_base !== 'P550202') throw new Error('SOURCE_CHANGED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur }, null, 2));
    report.before = Object.fromEntries(Object.keys(NEW).map((k) => [k, cur[k]]));
    report.gateway = assertGovernedCatalogPatch(cur, NEW, { validateApplications: false }).valid;
    await db.query('UPDATE public.elimfilters_catalog SET outer_diameter_mm=$2, height_mm=$3, gasket_od_mm=$4, gasket_id_mm=$5, iso_test_method=$6 WHERE sku=$1',
      [SKU, NEW.outer_diameter_mm, NEW.height_mm, NEW.gasket_od_mm, NEW.gasket_id_mm, NEW.iso_test_method]);
    report.after = (await db.query('SELECT outer_diameter_mm,height_mm,gasket_od_mm,gasket_id_mm,iso_test_method,codigo_base FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
