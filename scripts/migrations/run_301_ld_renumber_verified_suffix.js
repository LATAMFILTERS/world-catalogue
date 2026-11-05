'use strict';

/**
 * LD rule (Victor 2026-10-04): SKU = prefix + last four digits of the base code. Operator approval 2026-11-04 (step 4).
 * Renumbers ONLY active LD SKUs whose codigo_base is VERIFIED, belongs to the SKU family (FRAM CA/CF/PH/CH/XG/TG/G/PS,
 * MANN C/CU/CUK/FP/HU/W/WP/H/WK/PU/P shapes matched to EA3/EC3/EL3/EF3) and whose target slot is free.
 * Unverified bases, family conflicts (contaminated base), taken slots and MANN slash/suffix variants are NOT touched here.
 * Mechanism as run_290 (rename + derived tables + jsonb tokens + SUPERSEDED). Dry-run by default; --execute to COMMIT.
 * Usage: node scripts/migrations/run_301_ld_renumber_verified_suffix.js --plan <ld-suffix-plan.json> [--execute]
 */

require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const planFile = process.argv[process.argv.indexOf('--plan') + 1];
const SOURCE = 'RUN_301_LD_SUFFIX_RENUMBER';
const fam = (b) => { const c = String(b || '').toUpperCase().replace(/\s+/g, '');
  if (/^(CA)\d/.test(c)) return 'EA3'; if (/^(CF)\d/.test(c)) return 'EC3'; if (/^(PH|XG|TG|HM|CH)\d/.test(c)) return 'EL3'; if (/^(G|PS)\d/.test(c)) return 'EF3';
  if (/^(CUK|CU|FP)\d/.test(c)) return 'EC3'; if (/^C\d/.test(c)) return 'EA3'; if (/^(HU|W|WP|H)\d/.test(c)) return 'EL3'; if (/^(WK|PU|P)\d/.test(c)) return 'EF3'; return null; };
const DERIVED = [
  ['public.exact_part_reference', 'sku'], ['public.kit_components', 'filter_sku'], ['public.product_element', 'elimfilters_sku'],
  ['public.product_model', 'elimfilters_sku'], ['public.kg_product_equipment', 'product_sku'], ['public.kg_crossrefs', 'product_sku'],
  ['public.catalog_sku_certification', 'sku'], ['public.catalog_codigo_base_evidence', 'sku'], ['public.codigo_base_review_queue', 'sku'],
  ['public.hermes_catalogue_backlog', 'sku'], ['public.hermes_catalogue_dossier', 'sku'], ['public.hermes_catalogue_evidence', 'sku'],
  ['public.kg_product_systems', 'product_sku'], ['public.kg_product_technologies', 'product_sku'], ['public.oem_codes_legacy', 'sku'],
  ['public.catalog_application_evidence', 'sku'], ['ld_catalog.vehicle_application', 'sku'],
];

(async () => {
  const plan = JSON.parse(fs.readFileSync(planFile, 'utf8'));
  const PAIRS = plan.filter((p) => p.category === 'RENUMBER_FREE' && p.status === 'VERIFIED' && fam(p.base) === p.sku.slice(0, 3)).map((p) => ({ from: p.sku, to: p.target, base: p.base }));
  if (new Set(PAIRS.map((p) => p.to)).size !== PAIRS.length) throw new Error('TARGETS_NOT_UNIQUE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', pairs: PAIRS.length, moved: [], failed: [] };
  try {
    await db.query('BEGIN');
    const tables = [];
    for (const [q, col] of DERIVED) { const [s, t] = q.split('.');
      if ((await db.query(`SELECT 1 FROM information_schema.columns c JOIN information_schema.tables t USING (table_schema, table_name) WHERE c.table_schema=$1 AND c.table_name=$2 AND c.column_name=$3 AND t.table_type='BASE TABLE'`, [s, t, col])).rowCount) tables.push([q, col]); }
    for (const p of PAIRS) {
      await db.query('SAVEPOINT one');
      try {
        const r = (await db.query('SELECT sku, codigo_base FROM public.elimfilters_catalog WHERE sku = ANY($1) FOR UPDATE', [[p.from, p.to]])).rows;
        if (r.length !== 1 || r[0].sku !== p.from || r[0].codigo_base !== p.base) throw new Error('STATE_OR_SLOT');
        if ((await db.query(`SELECT 1 FROM public.exact_part_reference WHERE reference_type='SUPERSEDED' AND brand='ELIMFILTERS' AND part_number=$1`, [p.to])).rowCount) throw new Error('TARGET_IS_FORMER_SKU');
        await db.query(`UPDATE public.elimfilters_catalog SET sku=$1::text, description=replace(description, $2::text, $1::text) WHERE sku=$2::text`, [p.to, p.from]);
        for (const [q, col] of tables) await db.query(`UPDATE ${q} SET ${col}=$1 WHERE ${col}=$2`, [p.to, p.from]);
        for (const column of ['alternative_products', 'alternatives', 'enrichment_data', 'canonical_evidence']) {
          const hits = (await db.query(`SELECT id, ${column}::text AS t FROM public.elimfilters_catalog WHERE ${column}::text LIKE $1`, ['%' + p.from + '%'])).rows;
          for (const h of hits) { const n = h.t.replace(/[A-Z0-9]+/g, (tok) => (tok === p.from ? p.to : tok)); if (n !== h.t) await db.query(`UPDATE public.elimfilters_catalog SET ${column}=$1::jsonb WHERE id=$2`, [n, h.id]); }
        }
        await db.query(`INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) VALUES ('SUPERSEDED','ELIMFILTERS',$1,$2,$3) ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`, [p.from, p.to, SOURCE]);
        await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku = $1', [p.from]);
        try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [p.to]); await db.query('RELEASE SAVEPOINT c'); } catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); }
        await db.query('RELEASE SAVEPOINT one');
        report.moved.push(`${p.from}->${p.to} (${p.base})`);
      } catch (e) { await db.query('ROLLBACK TO SAVEPOINT one'); report.failed.push(`${p.from}->${p.to} ${e.message}`); }
    }
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
