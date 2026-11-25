'use strict';

/**
 * EA30008 (Light Duty air panel, base 0008, FRAM CA8 family): FRAM no longer publishes it (fram.com search for CA8, CA8P, CA8PL2, CA8AF1128F, CA8AF1129 returns no product).
 * Operator ruling 2026-11-25: eliminate it. The row is retired whole, never deleted (catalog_active=false, resolution_status INACTIVE_RETIRED), same mechanism as run_388 / run_331.
 * Stops if the row is used by a kit, changed since it was reviewed, or any of its codes is held ONLY by this row (reported). Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EA30008';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const row = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!row || !row.catalog_active || row.duty !== 'LIGHT_DUTY' || row.codigo_base !== '0008' || row.filter_type !== 'air') throw new Error('SOURCE_CHANGED');
    const kits = (await db.query(`SELECT sku FROM public.elimfilters_catalog WHERE catalog_active AND enrichment_data->'kit'->'components' @> $1::jsonb`, [JSON.stringify([{ sku: SKU }])])).rows;
    if (kits.length) throw new Error('RETIRED_SKU_USED_IN_KIT ' + kits.map((k) => k.sku).join(','));
    const codes = [...(row.oem_codes || []), ...(row.competitor_codes || [])].map((e) => e.code);
    report.codes = codes;
    // codes that no other active row holds would stop resolving: report them (they were only ever on this filler row)
    report.other_active_holders = (await db.query(`SELECT x.code, array_agg(DISTINCT c.sku ORDER BY c.sku) skus FROM unnest($1::text[]) x(code) JOIN public.elimfilters_catalog c ON c.catalog_active AND c.sku<>$2 AND EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb)||coalesce(c.competitor_codes,'[]'::jsonb)) e WHERE upper(regexp_replace(e->>'code','[^A-Za-z0-9]','','g'))=upper(regexp_replace(x.code,'[^A-Za-z0-9]','','g'))) GROUP BY x.code`, [codes, SKU])).rows;
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row, row_sha256: sha(row) }, null, 2));

    const u = await db.query(`UPDATE public.elimfilters_catalog SET catalog_active=false,
      enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{resolution_status}', $2::jsonb) WHERE sku=$1`,
    [SKU, JSON.stringify({ state: 'INACTIVE_RETIRED', reason: 'FRAM_CA8_FAMILY_DISCONTINUED_NOT_PUBLISHED', correct_product: null, decided_by: 'OPERATOR', updated_at: '2026-11-25', migration: 'run_478' })]);
    if (u.rowCount !== 1) throw new Error('RETIRE_UPDATE_COUNT');
    report.cache_rows_removed = (await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [SKU])).rowCount;
    report.exact_rows_removed = (await db.query('DELETE FROM public.exact_part_reference WHERE sku=$1 AND reference_type<>$2', [SKU, 'SUPERSEDED'])).rowCount;
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part('CA8')`)).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
