'use strict';

/**
 * ET9 scope (Victor, 2026-11-04): ET9/TURBOCORE is only for Racor turbine housings and their elements and Fleetguard
 * fuel-processor housings. Racor spin-on fuel/water separators (Parker "Diesel/Engine Spin-on" Aquabloc pages, Racor
 * Aftermarket "Spin-On Filter with Bowl") filed as ET9 HYDROCORE move to ES9 HYDROCORE. The Racor code stays the base and
 * its P/S/T letter stays on the SKU (S3209P -> ES93209P), as the operator ruled. Only rows whose target slot is free
 * (plan action RACOR_BASE in scripts/hermes/et9-scope-plan.mjs) are moved; slot collisions stay for review.
 *
 * Same rename mechanism as run_237/run_286 (derived tables, jsonb tokens, SUPERSEDED reference for the former SKU).
 * Usage: node scripts/migrations/run_290_racor_spin_on_et9_to_es9.js --plan <et9-scope-plan.json> [--execute]
 */

require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const planArg = process.argv[process.argv.indexOf('--plan') + 1];
if (!process.argv.includes('--plan') || !planArg) throw new Error('--plan <et9-scope-plan.json> is required');
const PAIRS = JSON.parse(fs.readFileSync(planArg, 'utf8')).filter((p) => p.action === 'RACOR_BASE').map((p) => ({ from: p.sku, to: p.to, base: p.base }));
const SOURCE = 'RUN_290_RACOR_SPIN_ON_ET9_TO_ES9';
const DESCRIPTION = (sku) => `ELIMFILTERS® ${sku} Fuel/water separator for diesel fuel systems. HYDROCORE™ media coalesces and drains free water from fuel before it reaches the injection system, preventing injector corrosion and microbial growth in the fuel tank.`;
const DERIVED = [
  ['public.exact_part_reference', 'sku'], ['public.kit_components', 'filter_sku'], ['public.product_element', 'elimfilters_sku'],
  ['public.product_model', 'elimfilters_sku'], ['public.kg_product_equipment', 'product_sku'], ['public.kg_crossrefs', 'product_sku'],
  ['public.catalog_sku_certification', 'sku'], ['public.catalog_codigo_base_evidence', 'sku'], ['public.codigo_base_review_queue', 'sku'],
  ['public.hermes_catalogue_backlog', 'sku'], ['public.hermes_catalogue_dossier', 'sku'], ['public.hermes_catalogue_evidence', 'sku'],
  ['public.kg_product_systems', 'product_sku'], ['public.kg_product_technologies', 'product_sku'], ['public.oem_codes_legacy', 'sku'],
  ['public.catalog_application_evidence', 'sku'],
];
const JSON_COLUMNS = ['alternative_products', 'alternatives', 'enrichment_data', 'canonical_evidence'];
const digits4 = (v) => String(v || '').replace(/\D/g, '').slice(-4);

(async () => {
  for (const p of PAIRS) {
    if (!/^ET9/.test(p.from) || !/^ES9\d{4}[PST]?$/.test(p.to) || digits4(p.to) !== digits4(p.base)) throw new Error('DATA_RULE_BROKEN ' + JSON.stringify(p));
    const letter = (/[PST]$/.exec(p.base.toUpperCase()) || [''])[0];
    if (!p.to.endsWith(letter)) throw new Error('SUFFIX_LETTER_LOST ' + p.from);
  }
  if (new Set(PAIRS.map((p) => p.to)).size !== PAIRS.length) throw new Error('TARGETS_NOT_UNIQUE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', pairs: PAIRS.length, derived: {}, json: {}, superseded_registered: 0, failed: [] };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const rows = (await db.query('SELECT sku, codigo_base, technology FROM public.elimfilters_catalog WHERE sku = ANY($1) FOR UPDATE', [PAIRS.flatMap((p) => [p.from, p.to])])).rows;
    const by = new Map(rows.map((r) => [r.sku, r]));
    const former = new Set((await db.query(`SELECT part_number FROM public.exact_part_reference WHERE reference_type='SUPERSEDED' AND brand='ELIMFILTERS' AND part_number = ANY($1)`, [PAIRS.map((p) => p.to)])).rows.map((r) => r.part_number));
    for (const p of PAIRS) {
      const r = by.get(p.from);
      if (!r) throw new Error('SOURCE_MISSING ' + p.from);
      if (r.codigo_base !== p.base) throw new Error('BASE_CHANGED ' + p.from);
      if (by.has(p.to) || former.has(p.to)) throw new Error('TARGET_OCCUPIED ' + p.to);
    }
    const tables = [];
    for (const [q, col] of DERIVED) {
      const [s, t] = q.split('.');
      if ((await db.query(`SELECT 1 FROM information_schema.columns c JOIN information_schema.tables t USING (table_schema, table_name)
        WHERE c.table_schema=$1 AND c.table_name=$2 AND c.column_name=$3 AND t.table_type='BASE TABLE'`, [s, t, col])).rowCount) tables.push([q, col]);
    }
    for (const p of PAIRS) {
      await db.query('SAVEPOINT one');
      try {
        const u = await db.query(`UPDATE public.elimfilters_catalog SET sku=$1, technology='HYDROCORE™', filter_type='water', description=$3 WHERE sku=$2`, [p.to, p.from, DESCRIPTION(p.to)]);
        if (u.rowCount !== 1) throw new Error('RENAME_COUNT');
        await db.query('RELEASE SAVEPOINT one');
      } catch (e) { await db.query('ROLLBACK TO SAVEPOINT one'); report.failed.push({ ...p, error: e.message }); continue; }
      for (const [q, col] of tables) {
        const d = await db.query(`UPDATE ${q} SET ${col}=$1 WHERE ${col}=$2`, [p.to, p.from]);
        if (d.rowCount) report.derived[q] = (report.derived[q] || 0) + d.rowCount;
      }
      const ins = await db.query(`INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) VALUES ('SUPERSEDED','ELIMFILTERS',$1,$2,$3)
        ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`, [p.from, p.to, SOURCE]);
      report.superseded_registered += ins.rowCount;
    }
    const moved = PAIRS.filter((p) => !report.failed.some((f) => f.from === p.from));
    const map = new Map(moved.map((p) => [p.from, p.to]));
    for (const column of JSON_COLUMNS) {
      const hits = (await db.query(`SELECT id, ${column}::text AS t FROM public.elimfilters_catalog WHERE ${column}::text ~ 'ET9[0-9]'`)).rows;
      for (const h of hits) {
        const next = h.t.replace(/[A-Z0-9]+/g, (tok) => map.get(tok) || tok);
        if (next === h.t) continue;
        await db.query(`UPDATE public.elimfilters_catalog SET ${column}=$1::jsonb WHERE id=$2`, [next, h.id]);
        report.json[column] = (report.json[column] || 0) + 1;
      }
    }
    await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku = ANY($1)', [moved.map((p) => p.from)]);
    for (const p of moved) {
      try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [p.to]); await db.query('RELEASE SAVEPOINT c'); }
      catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); }
    }
    report.moved = moved.map((p) => `${p.from}->${p.to}`);
    report.et9_hydrocore_left = (await db.query(`SELECT count(*)::int n FROM public.elimfilters_catalog WHERE catalog_active AND sku LIKE 'ET9%' AND technology LIKE 'HYDROCORE%'`)).rows[0].n;
    if (APPLY && report.failed.length) throw new Error('FAILURES_IN_BATCH ' + JSON.stringify(report.failed));
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
