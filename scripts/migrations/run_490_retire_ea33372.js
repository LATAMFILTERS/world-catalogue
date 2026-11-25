'use strict';

/**
 * EA33372 (Light Duty air panel OD 165 x H 353, base "3372" with no brand, never verified, 340 vehicle applications, 49 codes shared with an HD oil filter): operator 2026-11-25 "EA33372 bórralo".
 * It is RETIRED, not erased: catalog_active=false, resolution_status INACTIVE_RETIRED (same mechanism as run_388 / run_478 / run_482 / run_483), so the row, its applications and the snapshot stay recoverable.
 * Stops if the row is used by a kit or changed since it was reviewed. Codes held only by this row are reported. Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EA33372';
const BASE = '3372';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const row = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!row || !row.catalog_active || row.duty !== 'LIGHT_DUTY' || row.codigo_base !== BASE || row.canonical_source_brand) throw new Error('SOURCE_CHANGED');
    const kits = (await db.query(`SELECT sku FROM public.elimfilters_catalog WHERE catalog_active AND enrichment_data->'kit'->'components' @> $1::jsonb`, [JSON.stringify([{ sku: SKU }])])).rows;
    if (kits.length) throw new Error('RETIRED_SKU_USED_IN_KIT ' + kits.map((k) => k.sku).join(','));
    const codes = [...new Set([...(row.oem_codes || []), ...(row.competitor_codes || [])].map((e) => String(e.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '')))];
    const held = (await db.query(`SELECT upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g')) code, count(DISTINCT r.sku)::int others FROM public.exact_part_reference r JOIN public.elimfilters_catalog c ON c.sku=r.sku AND c.catalog_active
      WHERE r.sku<>$2 AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g')) = ANY($1::text[]) GROUP BY 1`, [codes, SKU])).rows;
    const heldSet = new Set(held.map((h) => h.code));
    report.codes = codes.length;
    report.codes_held_only_by_this_sku = codes.filter((c) => !heldSet.has(c)).length;
    report.vehicle_applications_kept_in_the_row = (row.vehicle_applications || []).length;
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row, row_sha256: sha(row) }, null, 2));
    await db.query(`UPDATE public.elimfilters_catalog SET catalog_active=false,
      enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{resolution_status}', $2::jsonb) WHERE sku=$1`,
    [SKU, JSON.stringify({ state: 'INACTIVE_RETIRED', reason: 'OPERATOR_ORDER_UNVERIFIED_BASE_3372_NO_BRAND', correct_product: null, decided_by: 'OPERATOR', updated_at: '2026-11-25', migration: 'run_490' })]);
    report.cache_rows_removed = (await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [SKU])).rowCount;
    report.exact_rows_removed = (await db.query('DELETE FROM public.exact_part_reference WHERE sku=$1 AND reference_type<>$2', [SKU, 'SUPERSEDED'])).rowCount;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
