'use strict';

/**
 * ET96380: (1) all 63 Perkins engine models from the official Perkins shop page,
 * (2) the operator-supplied competitor references, (3) drop the unverified 128 mm height
 * (Perkins publishes packaged height only). Only ET96380 changes (asserted).
 * Dry-run by default (ROLLBACK). --execute commits. --snapshot <file> writes the before row.
 */
require('dotenv').config();
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const si = process.argv.indexOf('--snapshot');
const SNAPSHOT = si > 0 ? process.argv[si + 1] : null;
const SKU = 'ET96380';
const PERKINS_URL = 'https://shop.perkins.com/product/perkins-130306380-fuel-filter-assembly?tabs-f11a=tab2';
const OPERATOR = 'https://github.com/LATAMFILTERS/world-catalogue/blob/main/scripts/candidates/et96380_turbocore_assembly.json';

const ENGINES = '102.05;103.06;103.07;103.09;103.1;103.11;103.13;103.15;104.19;104.22;1103A-33;1103A-33T;1103C-33;1103C-33T;1103D-33;1103D-33T;1104A-44;1104A-44T;1104C-44;1104C-44T;1104C-44TA;1104D-44T;402C-05;402D-05;402F-05;403A-11;403A-15;403C-07;403C-11;403C-15;403D-07;403D-11;403D-15;403D-15T;403F-11;403F-15;403F-15T;404A-22;404C-15;404C-22;404C-22T;404D-15;404D-22;404D-22T;404D-22TA;404F-22;404F-22T;403F-E17T;404F-E22T;404F-E22TA;403J-07;403J-11;403J-17;403J-17T;404J-22;404J-E22T;404J-E22TA;403J-E17T;403J-11T;403EA-11;403EA-17;404EA-22;404EA-22T'.split(';');
const COMP = [
  ['HIFI FILTER', 'MO 1657'], ['FLEETGUARD', 'FS20088'],
  ['WIX', 'WF10190'], ['SF FILTER', 'SK 3177'], ['FIN-FILTER', 'FIN-FF30614'],
].map(([manufacturer, code]) => ({ manufacturer, code, classification: 'COMPETITOR', product_scope: 'COMPLETE_ASSEMBLY', source_url: OPERATOR, evidence_status: 'OPERATOR_PROVIDED' }));

if (ENGINES.length !== 63) throw new Error('ENGINE_COUNT');

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };
  try {
    await db.query('BEGIN');
    const others = () => db.query(`SELECT md5(string_agg(c::text,'|' ORDER BY c.sku)) h FROM public.elimfilters_catalog c WHERE sku<>$1`, [SKU]).then((r) => r.rows[0].h);
    const h0 = await others();
    const row = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!row) throw new Error('SKU_MISSING');
    if (SNAPSHOT) require('fs').writeFileSync(SNAPSHOT, JSON.stringify(row, null, 1));
    const specs = { ...row.specs };
    delete specs.height_mm;
    specs.application_targets = ENGINES.map((engine) => ({ manufacturer: 'PERKINS', engine }));
    specs.application_source_url = PERKINS_URL;
    specs.application_source = 'PERKINS_OFFICIAL_SHOP_PAGE_20261108';
    specs.operator_provided_unverified = ['hose_8mm', 'bowl_diameter_mm=60', 'mounting_hole_distance_mm=9', 'micron=100'];
    specs.perkins_packaged_height_mm = 130;
    specs.perkins_packaged_width_mm = 80;
    const oem = (row.oem_codes || []).map((o) => (o.code === '130306380' ? { ...o, source_url: PERKINS_URL, evidence_status: 'PERKINS_OFFICIAL_SHOP_PAGE' } : o));
    const patch = { competitor_codes: COMP, oem_codes: oem, specs, height_mm: null };
    assertGovernedCatalogPatch(row, patch);
    await db.query('UPDATE public.elimfilters_catalog SET competitor_codes=$2::jsonb, oem_codes=$3::jsonb, specs=$4::jsonb, height_mm=NULL WHERE sku=$1',
      [SKU, JSON.stringify(COMP), JSON.stringify(oem), JSON.stringify(specs)]);
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);
    if (await others() !== h0) throw new Error('OTHER_ROWS_CHANGED');
    const codes = ['130306380', ...COMP.map((c) => c.code)];
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ANY(SELECT ld_catalog.norm_part(x) FROM unnest($1::text[]) x) ORDER BY code,sku`, [codes])).rows;
    report.integrity = (await db.query(`SELECT
      (SELECT count(*)::int FROM public.exact_part_conflicts WHERE $1=ANY(skus)) exact_conflicts,
      (SELECT count(*)::int FROM public.catalog_reference_classification_conflicts_v WHERE sku=$1) classification_conflicts,
      (SELECT count(*)::int FROM public.bad_crossref_quarantine WHERE source_sku=$1) quarantine_rows`, [SKU])).rows[0];
    report.shared_with_other_skus = (await db.query(`SELECT sku,codigo_base,duty,catalog_active FROM public.elimfilters_catalog WHERE sku<>$1 AND (
      ${codes.map((_, i) => `competitor_codes::text ILIKE '%'||$${i + 2}||'%' OR oem_codes::text ILIKE '%'||$${i + 2}||'%'`).join(' OR ')})`, [SKU, ...COMP.map((c) => c.code).concat('130306380')].slice(0, codes.length + 1))).rows;
    const i = report.integrity;
    if (i.exact_conflicts || i.classification_conflicts || i.quarantine_rows) throw new Error('INTEGRITY_FAILED ' + JSON.stringify(i));
    report.cert = (await db.query('SELECT certification_state,blocker_count FROM public.catalog_sku_certification WHERE sku=$1', [SKU])).rows[0];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
