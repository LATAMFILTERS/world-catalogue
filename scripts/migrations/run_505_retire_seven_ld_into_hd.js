'use strict';
// Operator ruling (2026-10-12 / 2026-11-15, applied 2026-11-27): a Light Duty row that is a heavy equipment part with a Donaldson / Fleetguard Heavy Duty twin is retired into that product.
// Seven MANN-based rows whose official MANN page gives heavy equipment as main application, whose twin already cites the MANN code and whose dimensions agree within 5%.
// The retired rows keep all their data (reversible). No reference or application is copied. Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const APPLY = process.argv.includes('--execute');
const i = process.argv.indexOf('--snapshot');
const SNAPSHOT = i >= 0 ? process.argv[i + 1] : null;
const PAIRS = [['EF38144', 'ES91422'], ['EF38147', 'ES91425'], ['EF38141', 'ES91429'], ['EF38142', 'ES91426'], ['EF39190', 'ES90899'], ['EF31022', 'ES91838'], ['EF32003', 'EF96776']];
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const codes = (r) => [...(r.oem_codes || []), ...(r.competitor_codes || [])].map((e) => norm(e && typeof e === 'object' ? e.code : e)).filter(Boolean);
(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', pairs: [] };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const all = PAIRS.flat();
    const rows = (await db.query('SELECT c.*, z.certification_state AS cert FROM public.elimfilters_catalog c LEFT JOIN public.catalog_sku_certification z ON z.sku=c.sku WHERE c.sku=ANY($1) FOR UPDATE OF c', [all])).rows;
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows }, null, 2), { flag: 'wx' });
    for (const [from, to] of PAIRS) {
      const a = rows.find((r) => r.sku === from);
      const b = rows.find((r) => r.sku === to);
      if (!a || !b || !a.catalog_active || !b.catalog_active || a.duty !== 'LIGHT_DUTY' || b.duty !== 'HEAVY_DUTY') throw new Error(`SOURCE_CHANGED ${from}`);
      if (!codes(b).includes(norm(a.codigo_base))) {
        // ES91426: the catalogue did not cite WK8142 yet; Donaldson's official search (2026-11-27) returns P551426 alone for MANN & HUMMEL WK8142, so that one reference is added.
        if (from !== 'EF38142' || to !== 'ES91426') throw new Error(`TWIN_DOES_NOT_CITE ${from} ${a.codigo_base}`);
        const entry = { code: 'WK8142', manufacturer: 'MANN & HUMMEL', classification: 'AFTERMARKET', classification_source: 'DONALDSON_OFFICIAL_SEARCH__RUN_505', source_url: 'https://shop.donaldson.com/store/es-us/search?Ntt=WK8142' };
        await db.query("UPDATE public.elimfilters_catalog SET competitor_codes=coalesce(competitor_codes,'[]'::jsonb)||$2::jsonb WHERE sku=$1", [to, JSON.stringify([entry])]);
        await db.query('SELECT public.refresh_crossref_cache_sku($1)', [to]);
        report.reference_added = `${to} WK8142`;
      }
      if (b.cert !== 'CERTIFIED') throw new Error(`TARGET_NOT_CERTIFIED ${to} ${b.cert}`);
      const kits = (await db.query('SELECT sku FROM public.elimfilters_catalog WHERE catalog_active AND (enrichment_data->\'kit\'->\'components\' @> $1::jsonb OR specs->\'kit_components\' ? $2)', [JSON.stringify([{ sku: from }]), from])).rows;
      if (kits.length) throw new Error('RETIRED_SKU_USED_IN_KIT ' + from);
      await db.query(`UPDATE public.elimfilters_catalog SET catalog_active=false,
        enrichment_data=jsonb_set(jsonb_set(jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{resolution_status}', $2::jsonb), '{codigo_base_governance,state}', '"RETIRED_DUPLICATE"'::jsonb), '{codigo_base_governance,governance_state}', '"RETIRED_DUPLICATE"'::jsonb) WHERE sku=$1`,
      [from, JSON.stringify({ state: 'INACTIVE_RETIRED', reason: 'LIGHT_DUTY_ROW_FOR_A_HEAVY_EQUIPMENT_PART_WITH_HD_TWIN', superseded_by: to, decided_by: 'OPERATOR', updated_at: '2026-11-27', migration: 'run_505' })]);
      await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [from]);
      await db.query("DELETE FROM public.exact_part_reference WHERE sku=$1 AND reference_type<>'SUPERSEDED'", [from]);
      await db.query("INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) VALUES ('SUPERSEDED','ELIMFILTERS',$1,$2,'RUN_505_RETIRED_INTO_HD') ON CONFLICT DO NOTHING", [from, to]);
      const mine = [...new Set(codes(a))];
      const elsewhere = (await db.query(`SELECT DISTINCT upper(regexp_replace(e->>'code','[^A-Za-z0-9]','','g')) AS code FROM public.elimfilters_catalog c, jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb)||coalesce(c.competitor_codes,'[]'::jsonb)) e
        WHERE c.catalog_active AND upper(regexp_replace(e->>'code','[^A-Za-z0-9]','','g'))=ANY($1)`, [mine])).rows.map((r) => r.code);
      report.pairs.push({ from, to, base: a.codigo_base, refs: mine.length, refs_no_longer_on_any_active_product: mine.filter((c) => !elsewhere.includes(c)).length, vehicle_apps_kept_on_retired_row: (a.vehicle_applications || []).length });
    }
    report.resolver = (await db.query('SELECT code, sku FROM public.v_api_resolver_v7 WHERE code=ANY($1)', [PAIRS.map(([f]) => norm(rows.find((r) => r.sku === f).codigo_base))])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.message); process.exit(1); });
