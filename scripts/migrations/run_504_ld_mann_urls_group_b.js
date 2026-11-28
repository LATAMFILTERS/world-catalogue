'use strict';
// Operator 2026-11-27 ("certifica los 7"): record the official MANN-FILTER product page of seven Light Duty SKUs whose page was opened that day and whose dimensions match the catalogue.
// Only canonical_source_url changes. Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const APPLY = process.argv.includes('--execute');
const i = process.argv.indexOf('--snapshot');
const SNAPSHOT = i >= 0 ? process.argv[i + 1] : null;
const BASES = { EF30067: 'WK67X', EF30735: 'P735X', EF30738: 'P738X', EF38028: 'PU8028', EF30047: 'WK47', EF30849: 'WK849', EF36004: 'WK6004' };
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  try {
    await db.query('BEGIN');
    const rows = (await db.query('SELECT sku, duty, codigo_base, canonical_source_brand, canonical_source_status, canonical_source_url FROM public.elimfilters_catalog WHERE sku=ANY($1) FOR UPDATE', [Object.keys(BASES)])).rows;
    if (rows.length !== 7) throw new Error('SOURCE_CHANGED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows }, null, 2), { flag: 'wx' });
    for (const r of rows) {
      if (r.duty !== 'LIGHT_DUTY' || norm(r.codigo_base) !== BASES[r.sku] || r.canonical_source_status !== 'VERIFIED' || !/^MANN/i.test(r.canonical_source_brand || '') || r.canonical_source_url) throw new Error('SOURCE_CHANGED ' + r.sku);
      const url = `https://www.mann-filter.com/en/catalog/search-results/product.html/${BASES[r.sku].toLowerCase()}_mann-filter.html`;
      const u = await db.query('UPDATE public.elimfilters_catalog SET canonical_source_url=$2 WHERE sku=$1', [r.sku, url]);
      if (u.rowCount !== 1) throw new Error('NO_UPDATE ' + r.sku);
    }
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ transaction: APPLY ? 'COMMIT' : 'ROLLBACK', rows: rows.length }));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.message); process.exit(1); });
