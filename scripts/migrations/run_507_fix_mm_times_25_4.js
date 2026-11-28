'use strict';
// Operator 2026-11-27 ("corrige las 127"): active rows with a height / outer diameter above 1,500 mm had millimetre values multiplied by 25.4. Every dimension above 600 mm in those rows is divided by 25.4.
// A row is changed only when every converted value is a whole or half millimetre between 15 and 700. Held out: EL31226 (result contradicts the MANN page) and EA30374 (does not follow the pattern).
// Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const APPLY = process.argv.includes('--execute');
const i = process.argv.indexOf('--snapshot');
const SNAPSHOT = i >= 0 ? process.argv[i + 1] : null;
const COLS = ['height_mm', 'outer_diameter_mm', 'inner_diameter_mm', 'gasket_od_mm', 'gasket_id_mm', 'product_length_mm', 'product_width_mm'];
const HELD = new Set(['EL31226', 'EA30374']);
(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', rows: 0, values: 0, skipped: {} };
  try {
    await db.query('BEGIN');
    const rows = (await db.query(`SELECT sku, ${COLS.join(', ')} FROM public.elimfilters_catalog WHERE catalog_active AND greatest(coalesce(height_mm,0),coalesce(outer_diameter_mm,0))>1500 ORDER BY sku FOR UPDATE`)).rows;
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows }, null, 2), { flag: 'wx' });
    for (const r of rows) {
      if (HELD.has(r.sku)) { report.skipped[r.sku] = 'HELD'; continue; }
      const set = COLS.filter((c) => Number(r[c]) > 600).map((c) => { const q = Number(r[c]) / 25.4; return { c, from: Number(r[c]), to: Math.round(q * 2) / 2, ok: Math.abs(q * 2 - Math.round(q * 2)) < 0.002 && q >= 15 && q <= 700 }; });
      if (!set.length || set.some((x) => !x.ok)) { report.skipped[r.sku] = 'NOT_EXACT'; continue; }
      const u = await db.query(`UPDATE public.elimfilters_catalog SET ${set.map((x, n) => `${x.c}=$${n + 2}`).join(', ')} WHERE sku=$1`, [r.sku, ...set.map((x) => x.to)]);
      if (u.rowCount !== 1) throw new Error('NO_UPDATE ' + r.sku);
      report.rows += 1; report.values += set.length;
    }
    report.remaining_over_1500 = (await db.query('SELECT sku FROM public.elimfilters_catalog WHERE catalog_active AND greatest(coalesce(height_mm,0),coalesce(outer_diameter_mm,0))>1500 ORDER BY sku')).rows.map((x) => x.sku);
    report.sample = (await db.query("SELECT sku, height_mm, outer_diameter_mm, gasket_od_mm FROM public.elimfilters_catalog WHERE sku IN ('EA36154','EA30187') ORDER BY sku")).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.message); process.exit(1); });
