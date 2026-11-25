'use strict';

/**
 * ES91015 (HD, Fleetguard FS1015B, OD 99.57 x H 248.92, no applications, no codes, no kit, not in the price list or the cost list) is the empty natural-number duplicate of ES93242 (same base FS1015B, same
 * dimensions, 48 applications, price, costs, photo). The operator keeps the commercial number 3242 (approved SKU exception of ES93242), so ES91015 is eliminated: retired whole, never erased
 * (catalog_active=false, resolution_status INACTIVE_RETIRED, correct_product ES93242; its code-base governance leaves CANONICAL_VERIFIED so the resolver sees one owner of FS1015B), and registered as a
 * SUPERSEDED former SKU of ES93242 (run_485 mechanism). Nothing else changes. Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const OLD = 'ES91015';
const KEEP = 'ES93242';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku FOR UPDATE', [[OLD, KEEP]])).rows;
    const old = rows.find((r) => r.sku === OLD);
    const keep = rows.find((r) => r.sku === KEEP);
    if (!old || !keep || !old.catalog_active || !keep.catalog_active || old.duty !== 'HEAVY_DUTY' || keep.duty !== 'HEAVY_DUTY') throw new Error('SOURCE_CHANGED');
    if (old.codigo_base !== 'FS1015B' || keep.codigo_base !== 'FS1015B') throw new Error('BASE_CHANGED');
    if ((old.equipment_applications || []).length || (old.oem_codes || []).length || (old.competitor_codes || []).length) throw new Error('OLD_ROW_HAS_DATA');
    const kits = (await db.query(`SELECT sku FROM public.elimfilters_catalog WHERE catalog_active AND (enrichment_data->'kit'->'components' @> $1::jsonb OR enrichment_data->'kit'->'components' @> $2::jsonb)`, [JSON.stringify([{ sku: OLD }]), JSON.stringify([{ sku: KEEP }])])).rows;
    if (kits.length) throw new Error('SKU_USED_IN_KIT ' + kits.map((k) => k.sku).join(','));
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows, row_sha256: sha(rows) }, null, 2));
    const keepHash = sha(keep);
    await db.query(`UPDATE public.elimfilters_catalog SET catalog_active=false,
      enrichment_data=jsonb_set(jsonb_set(jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{resolution_status}', $2::jsonb), '{codigo_base_governance,state}', '"RETIRED_DUPLICATE"'::jsonb), '{codigo_base_governance,governance_state}', '"RETIRED_DUPLICATE"'::jsonb) WHERE sku=$1`,
    [OLD, JSON.stringify({ state: 'INACTIVE_RETIRED', reason: 'EMPTY_DUPLICATE_OF_ES93242_SAME_FLEETGUARD_FS1015B', correct_product: KEEP, decided_by: 'OPERATOR', updated_at: '2026-11-25', migration: 'run_499' })]);
    report.cache_rows_removed = (await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [OLD])).rowCount;
    report.exact_rows_removed = (await db.query('DELETE FROM public.exact_part_reference WHERE sku=$1 AND reference_type<>$2', [OLD, 'SUPERSEDED'])).rowCount;
    report.superseded_registered = (await db.query(`INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) VALUES ('SUPERSEDED','ELIMFILTERS',$1,$2,'RUN_499_ES91015_TO_ES93242') ON CONFLICT DO NOTHING`, [OLD, KEEP])).rowCount;
    if (sha((await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1', [KEEP])).rows[0]) !== keepHash) throw new Error('KEEPER_ROW_CHANGED');
    report.resolver_fs1015b = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part('FS1015B')`)).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
