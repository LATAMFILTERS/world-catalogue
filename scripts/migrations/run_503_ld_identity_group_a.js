'use strict';
// Operator 2026-11-27 ("a"): Light Duty SKUs whose only blocker is the missing canonical identity and that already carry a VERIFIED FRAM / MANN source for their own base with the maker's official page.
// Creates only the ld_canonical_product_identity row. A SKU is included only when the official URL is on the maker's domain and names the base. Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
// --skus <json array file> lists the candidates.
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const APPLY = process.argv.includes('--execute');
const arg = (n) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const RULE = { EUROPEAN: { brand: 'MANN-FILTER', source: /^MANN/i, host: /(^|\.)mann-filter\.com$/i }, NON_EUROPEAN: { brand: 'FRAM', source: /^FRAM$/i, host: /(^|\.)fram\.com$/i } };
(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const list = JSON.parse(fs.readFileSync(arg('--skus'), 'utf8'));
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', created: [], skipped: {} };
  try {
    await db.query('BEGIN');
    const rows = (await db.query(`SELECT c.sku, c.duty, c.catalog_active, c.codigo_base, c.filter_type, c.canonical_source_brand, c.canonical_source_code, c.canonical_source_status, c.canonical_source_url, p.origin_group
      FROM public.elimfilters_catalog c JOIN public.catalog_ld_regional_policy_audit_v p ON p.sku=c.sku WHERE c.sku=ANY($1) FOR UPDATE OF c`, [list])).rows;
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), candidates: rows, identity_rows_before: [] }, null, 2), { flag: 'wx' });
    for (const r of rows) {
      const rule = RULE[r.origin_group];
      let host = '', path = '';
      try { const u = new URL(r.canonical_source_url); host = u.hostname; path = decodeURIComponent(u.pathname + u.search); } catch { /* no URL */ }
      const why = r.duty !== 'LIGHT_DUTY' || !r.catalog_active ? 'NOT_ACTIVE_LD'
        : !rule ? 'ORIGIN'
          : !rule.source.test(r.canonical_source_brand || '') || r.canonical_source_status !== 'VERIFIED' || norm(r.canonical_source_code) !== norm(r.codigo_base) ? 'SOURCE_NOT_VERIFIED'
            : !rule.host.test(host) ? 'URL_NOT_OFFICIAL ' + host
              : !norm(path).includes(norm(r.codigo_base)) ? 'URL_DOES_NOT_NAME_BASE' : null;
      if (why) { report.skipped[r.sku] = why; continue; }
      const dup = await db.query('SELECT elimfilters_sku FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=$1 OR upper(regexp_replace(canonical_part_number,\'[^A-Za-z0-9]\',\'\',\'g\'))=$2', [r.sku, norm(r.codigo_base)]);
      if (dup.rowCount) { report.skipped[r.sku] = 'IDENTITY_ALREADY_PRESENT'; continue; }
      await db.query(`INSERT INTO ld_catalog.ld_canonical_product_identity(elimfilters_sku, origin_group, canonical_brand, canonical_part_number, filter_type, status, evidence_source)
        VALUES ($1,$2,$3,$4,$5,'ACTIVE','CATALOG_VERIFIED_OFFICIAL_URL_RUN_503_20261127')`, [r.sku, r.origin_group, rule.brand, r.codigo_base, r.filter_type]);
      report.created.push(r.sku);
    }
    const evaluate = fs.readFileSync(`${__dirname}/recertify_ld_skus_list.js`, 'utf8').match(/const EVALUATE = `([\s\S]*?)`;/)[1].replace(/\\\\/g, '\\');
    report.checks = (await db.query(`SELECT sku, blockers FROM (${evaluate}) a WHERE a.sku=ANY($1) AND cardinality(a.blockers)>0`, [report.created])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.message); process.exit(1); });
