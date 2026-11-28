'use strict';
// Operator 2026-11-27 ("certifica los 8"): Light Duty SKUs whose official MANN-FILTER page was opened that day and whose dimensions match the catalogue. EA39010 is held out: its applications are
// Mercedes-Benz Atego / Axor / Econic trucks (heavy duty). Records the verified MANN source for the base and creates the canonical identity. Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const APPLY = process.argv.includes('--execute');
const i = process.argv.indexOf('--snapshot');
const SNAPSHOT = i >= 0 ? process.argv[i + 1] : null;
const BASES = { EA32136: 'C2136', EA32027: 'C2027', EC34005: 'CU24005', EL32426: 'H2426KIT', EL32522: 'H2522XKIT', EL32826: 'H2826KIT', EL34008: 'H4008Z' };
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  try {
    await db.query('BEGIN');
    const skus = Object.keys(BASES);
    const rows = (await db.query(`SELECT c.sku, c.duty, c.catalog_active, c.codigo_base, c.filter_type, c.canonical_source_brand, c.canonical_source_code, c.canonical_source_status, c.canonical_source_url, c.canonical_verified_at, c.canonical_evidence, p.origin_group
      FROM public.elimfilters_catalog c JOIN public.catalog_ld_regional_policy_audit_v p ON p.sku=c.sku WHERE c.sku=ANY($1) FOR UPDATE OF c`, [skus])).rows;
    if (rows.length !== skus.length) throw new Error('SOURCE_CHANGED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows, identity_rows_before: [] }, null, 2), { flag: 'wx' });
    for (const r of rows) {
      const base = BASES[r.sku];
      if (r.duty !== 'LIGHT_DUTY' || !r.catalog_active || norm(r.codigo_base) !== base || r.origin_group !== 'EUROPEAN' || r.canonical_source_status === 'VERIFIED') throw new Error('SOURCE_CHANGED ' + r.sku);
      const url = `https://www.mann-filter.com/en/catalog/search-results/product.html/${base.toLowerCase()}_mann-filter.html`;
      const source = `MANN_OFFICIAL_PAGE_${base}_20261127`;
      await db.query(`UPDATE public.elimfilters_catalog SET canonical_source_brand='MANN-FILTER', canonical_source_code=$2, canonical_source_status='VERIFIED', canonical_source_url=$3, canonical_verified_at=now(), canonical_evidence=$4::jsonb WHERE sku=$1`,
        [r.sku, r.codigo_base, url, JSON.stringify({ source, authority: 'MANN_FILTER_OFFICIAL_PRODUCT_PAGE', check: 'page title names the base; dimensions match the catalogue' })]);
      await db.query(`INSERT INTO ld_catalog.ld_canonical_product_identity(elimfilters_sku, origin_group, canonical_brand, canonical_part_number, filter_type, status, evidence_source)
        VALUES ($1,'EUROPEAN','MANN-FILTER',$2,$3,'ACTIVE',$4)`, [r.sku, r.codigo_base, r.filter_type, source]);
    }
    const evaluate = fs.readFileSync(`${__dirname}/recertify_ld_skus_list.js`, 'utf8').match(/const EVALUATE = `([\s\S]*?)`;/)[1].replace(/\\\\/g, '\\');
    const checks = (await db.query(`SELECT sku, blockers FROM (${evaluate}) a WHERE a.sku=ANY($1) AND cardinality(a.blockers)>0`, [skus])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ transaction: APPLY ? 'COMMIT' : 'ROLLBACK', rows: rows.length, checks }));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.message); process.exit(1); });
