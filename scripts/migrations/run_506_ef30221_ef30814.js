'use strict';
// Operator 2026-11-27 ("aplica ambos"):
//  1. EF30221 (Light Duty, provisional base "0221", Volvo / Renault Trucks applications, same as the retired EF31022) is retired into its Heavy Duty twin ES91838. The row keeps all its data.
//  2. EF30814 loses the reference MANN WK814/1 (unverified; without the slash it reads as WK8141, the MANN part of ES91429, and hid it). The removed entry is kept in enrichment_data.pending_review.
// Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const APPLY = process.argv.includes('--execute');
const i = process.argv.indexOf('--snapshot');
const SNAPSHOT = i >= 0 ? process.argv[i + 1] : null;
(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=ANY($1) FOR UPDATE', [['EF30221', 'ES91838', 'EF30814']])).rows;
    const by = Object.fromEntries(rows.map((r) => [r.sku, r]));
    const a = by.EF30221, b = by.ES91838, c = by.EF30814;
    if (!a || !b || !c || !a.catalog_active || a.codigo_base !== '0221' || !b.catalog_active || b.duty !== 'HEAVY_DUTY') throw new Error('SOURCE_CHANGED');
    const removed = (c.competitor_codes || []).filter((e) => e.code === 'WK814/1');
    if (removed.length !== 1) throw new Error('REFERENCE_CHANGED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows }, null, 2), { flag: 'wx' });
    await db.query(`UPDATE public.elimfilters_catalog SET catalog_active=false,
      enrichment_data=jsonb_set(jsonb_set(jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{resolution_status}', $2::jsonb), '{codigo_base_governance}', coalesce(enrichment_data->'codigo_base_governance','{}'::jsonb)), '{codigo_base_governance,state}', '"RETIRED_DUPLICATE"'::jsonb) WHERE sku=$1`,
    ['EF30221', JSON.stringify({ state: 'INACTIVE_RETIRED', reason: 'LIGHT_DUTY_ROW_FOR_A_HEAVY_TRUCK_PART_WITH_HD_TWIN', superseded_by: 'ES91838', decided_by: 'OPERATOR', updated_at: '2026-11-27', migration: 'run_506' })]);
    await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', ['EF30221']);
    await db.query("DELETE FROM public.exact_part_reference WHERE sku=$1 AND reference_type<>'SUPERSEDED'", ['EF30221']);
    await db.query("INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) VALUES ('SUPERSEDED','ELIMFILTERS','EF30221','ES91838','RUN_506_RETIRED_INTO_HD') ON CONFLICT DO NOTHING");
    const e = { ...(c.enrichment_data || {}) };
    e.pending_review = { ...(e.pending_review || {}), removed_references_run_506: removed };
    await db.query('UPDATE public.elimfilters_catalog SET competitor_codes=$2::jsonb, enrichment_data=$3::jsonb WHERE sku=$1', ['EF30814', JSON.stringify(c.competitor_codes.filter((x) => x.code !== 'WK814/1')), JSON.stringify(e)]);
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', ['EF30814']);
    report.resolver = (await db.query("SELECT code, sku FROM public.v_api_resolver_v7 WHERE code IN ('WK8141','WK110221Z','WK814')")).rows;
    report.holders = (await db.query("SELECT sku FROM public.elimfilters_catalog c WHERE catalog_active AND EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb)||coalesce(c.competitor_codes,'[]'::jsonb)) x WHERE upper(regexp_replace(x->>'code','[^A-Za-z0-9]','','g'))='WK8141')")).rows.map((r) => r.sku);
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.message); process.exit(1); });
