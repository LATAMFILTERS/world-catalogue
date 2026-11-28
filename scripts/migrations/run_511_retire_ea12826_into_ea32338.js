'use strict';
// Operator 2026-11-27 ("retira EA12826"): Donaldson P612826 only lists Sprinter vans (official shop, 2026-11-27: 5 equipment lines) and a diesel van filter is Light Duty, so EA12826 is retired into EA32338.
// EA32338 gains DONALDSON P612826 so the number is still found; earlier SKUs that pointed to EA12826 now point to EA32338. The retired row keeps all its data.
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
    const rows = (await db.query("SELECT * FROM public.elimfilters_catalog WHERE sku IN ('EA12826','EA32338') FOR UPDATE")).rows;
    const hd = rows.find((r) => r.sku === 'EA12826');
    const ld = rows.find((r) => r.sku === 'EA32338');
    if (!hd || !ld || !hd.catalog_active || !ld.catalog_active || hd.codigo_base !== 'P612826' || (hd.equipment_applications || []).length) throw new Error('SOURCE_CHANGED');
    const kits = (await db.query("SELECT sku FROM public.elimfilters_catalog WHERE catalog_active AND (enrichment_data->'kit'->'components' @> '[{\"sku\":\"EA12826\"}]'::jsonb OR specs->'kit_components' ? 'EA12826')")).rows;
    if (kits.length) throw new Error('RETIRED_SKU_USED_IN_KIT');
    const refs = (await db.query("SELECT * FROM public.exact_part_reference WHERE sku IN ('EA12826','EA32338')")).rows;
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows, exact_part_reference: refs }, null, 2), { flag: 'wx' });
    const entry = { code: 'P612826', manufacturer: 'DONALDSON', classification: 'AFTERMARKET', classification_source: 'DONALDSON_OFFICIAL_SHOP__RUN_511', source_url: 'https://shop.donaldson.com/store/es-us/search?Ntt=P612826' };
    await db.query("UPDATE public.elimfilters_catalog SET competitor_codes=coalesce(competitor_codes,'[]'::jsonb)||$1::jsonb WHERE sku='EA32338'", [JSON.stringify([entry])]);
    await db.query(`UPDATE public.elimfilters_catalog SET catalog_active=false,
      enrichment_data=jsonb_set(jsonb_set(enrichment_data, '{resolution_status}', $1::jsonb), '{codigo_base_governance}', coalesce(enrichment_data->'codigo_base_governance','{}'::jsonb)||'{"state":"RETIRED_DUPLICATE","governance_state":"RETIRED_DUPLICATE"}'::jsonb) WHERE sku='EA12826'`,
    [JSON.stringify({ state: 'INACTIVE_RETIRED', reason: 'SPRINTER_VAN_ONLY_PART_BELONGS_TO_LIGHT_DUTY', superseded_by: 'EA32338', decided_by: 'OPERATOR', updated_at: '2026-11-27', migration: 'run_511' })]);
    await db.query("DELETE FROM public.crossref_resolved_cache WHERE sku='EA12826'");
    report.former = (await db.query("SELECT DISTINCT part_number FROM public.exact_part_reference WHERE sku='EA12826' AND reference_type='SUPERSEDED'")).rows.map((r) => r.part_number);
    await db.query("INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) SELECT 'SUPERSEDED','ELIMFILTERS', p, 'EA32338', 'RUN_511_RETIRED_INTO_EA32338' FROM unnest($1::text[]) p ON CONFLICT DO NOTHING", [[...report.former, 'EA12826']]);
    report.exact_removed = (await db.query("DELETE FROM public.exact_part_reference WHERE sku='EA12826'")).rowCount;
    await db.query("SELECT public.refresh_crossref_cache_sku('EA32338')");
    report.resolver = (await db.query("SELECT code, sku FROM public.v_api_resolver_v7 WHERE code IN ('P612826','C32338','200129620')")).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.message); process.exit(1); });
