'use strict';

/**
 * LD prefix system (Victor, 2026-10-04): EF3 = fuel, SYNTAPORE™. The LD rules audit (2026-11-05) found active EF3 SKUs
 * labelled SYNTRAX™ (the lube technology). Only the technology label changes; rows are required to be EF3 and fuel
 * (filter_type fuel, or a FRAM G / PS fuel base). Operator approval 2026-11-04 (step 1).
 * Dry-run by default (ROLLBACK). --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  try {
    await db.query('BEGIN');
    const cand = (await db.query(`SELECT sku, codigo_base, filter_type FROM public.elimfilters_catalog
      WHERE catalog_active AND duty='LIGHT_DUTY' AND sku LIKE 'EF3%' AND upper(regexp_replace(coalesce(technology,''),'[^A-Za-z]','','g'))='SYNTRAX' ORDER BY sku`)).rows;
    const ok = cand.filter((r) => /fuel/i.test(r.filter_type || '') || /^(G|PS)\d/i.test(String(r.codigo_base || '')));
    const held = cand.filter((r) => !ok.includes(r)).map((r) => `${r.sku} ${r.codigo_base} ${r.filter_type}`);
    const u = await db.query(`UPDATE public.elimfilters_catalog SET technology='SYNTAPORE™',
        description=replace(description, 'SYNTRAX™', 'SYNTAPORE™') WHERE sku = ANY($1) AND catalog_active RETURNING sku`, [ok.map((r) => r.sku)]);
    for (const r of ok) { try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [r.sku]); await db.query('RELEASE SAVEPOINT c'); } catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); } }
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ mode: APPLY ? 'execute' : 'dry-run', candidates: cand.length, updated: u.rowCount, held, filter_types: [...new Set(ok.map((r) => r.filter_type))], transaction: APPLY ? 'COMMIT' : 'ROLLBACK' }));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
