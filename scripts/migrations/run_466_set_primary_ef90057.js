'use strict';

/**
 * EF90057 (Donaldson P550057, HEAVY_DUTY, VERIFIED, catalog_active) is the only row for its base but carries is_primary=false,
 * so the distributor portal (HD_PRODUCTS_SQL: is_primary IS DISTINCT FROM FALSE) never lists it and its LATAM price cannot be loaded.
 * Operator confirmed 2026-11-24: P550057 is HD and validated. Fix: is_primary=true, only when no other active primary row shares the base.
 * Dry-run by default (ROLLBACK). --execute needs --snapshot <file>. ES91027 has the same defect: reported read-only, NOT changed.
 */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EF90057';
const BASE = 'P550057';
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const row = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!row || !row.catalog_active || row.is_primary !== false || row.codigo_base !== BASE || row.duty !== 'HEAVY_DUTY'
      || row.canonical_source_brand !== 'DONALDSON' || row.canonical_source_status !== 'VERIFIED') throw new Error('SOURCE_CHANGED');
    const rivals = (await db.query(
      `SELECT sku FROM public.elimfilters_catalog WHERE catalog_active IS TRUE AND is_primary IS DISTINCT FROM FALSE AND sku<>$1
          AND upper(regexp_replace(codigo_base,'[^A-Za-z0-9]','','g'))=$2`, [SKU, norm(BASE)])).rows.map((r) => r.sku);
    if (rivals.length) throw new Error(`ANOTHER_PRIMARY_FOR_BASE:${rivals.join(',')}`);
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows: [row] }, null, 2));

    report.gateway = assertGovernedCatalogPatch(row, { is_primary: true }, { validateApplications: false }).valid;
    await db.query('UPDATE public.elimfilters_catalog SET is_primary=true WHERE sku=$1', [SKU]);

    report.after = (await db.query('SELECT sku,is_primary,catalog_active,codigo_base FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows;
    report.also_orphan_not_changed = (await db.query(
      `SELECT e.sku, e.codigo_base, e.canonical_source_status FROM public.elimfilters_catalog e
        WHERE e.catalog_active IS TRUE AND e.is_primary IS FALSE AND e.sku<>$1
          AND NOT EXISTS (SELECT 1 FROM public.elimfilters_catalog p WHERE p.catalog_active IS TRUE AND p.is_primary IS DISTINCT FROM FALSE AND p.sku<>e.sku
                           AND upper(regexp_replace(p.codigo_base,'[^A-Za-z0-9]','','g'))=upper(regexp_replace(e.codigo_base,'[^A-Za-z0-9]','','g')))`, [SKU])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
