'use strict';

/**
 * MANN W 962 (and its W 962/xx variants) must resolve to ONE principal SKU with its alternative products (operator ruling 2026-11-16).
 * Principal: EL83771 (Donaldson P553771, 93 x 200 mm, 1-12 UN; the largest of the holders: 1013 references, 1958 applications, and the
 * only 93 mm one that already carries the FAUN / IVECO / STEYR W 962 numbers). The other Donaldson spin-on rows that held the W 962 family
 * (EL80362, EL80317, EL83712, EL85616, EL87207, EL88250) keep their own identity and are listed as ALTERNATIVE products of the principal;
 * they lose the W 962 entries. The retired Light Duty EL30962 is not touched.
 * The principal already holds the plain code W 962 (FAUN / IVECO / STEYR entries), so no new W 962 entry is added (a second copy in the other
 * column is rejected by the ALTERNATE_INTEGRITY trigger). Nothing else changes.
 * Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const PRINCIPAL = 'EL83771';
const OTHERS = ['EL80362', 'EL80317', 'EL83712', 'EL85616', 'EL87207', 'EL88250'];
const MANN_URL = 'https://www.mann-filter.com/br-pt/catalogo/resultados-da-pesquisa/produto.html/w962_mann-filter.html';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const isW962 = (x) => /^W\s?962(\/?\d{1,2}[A-Z]?)?$/i.test(String(x.code || x.reference || '').trim());
const list = (v) => (Array.isArray(v) ? v : []);

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client(url
    ? { connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } }
    : { host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', principal: PRINCIPAL, removed: {} };
  try {
    await db.query('BEGIN');
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku FOR UPDATE', [[PRINCIPAL, ...OTHERS]])).rows;
    if (rows.length !== OTHERS.length + 1) throw new Error('SKU_NOT_FOUND');
    if (rows.some((r) => !r.catalog_active || r.duty !== 'HEAVY_DUTY')) throw new Error('NOT_ACTIVE_HD');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows, row_sha256: sha(rows) }, null, 2));
    const principal = rows.find((r) => r.sku === PRINCIPAL);

    // 1. the others lose the W 962 family
    for (const cur of rows.filter((r) => r.sku !== PRINCIPAL)) {
      const drop = [...list(cur.oem_codes), ...list(cur.competitor_codes)].filter(isW962);
      const dropKeys = new Set(drop.map((x) => norm(x.code)));
      report.removed[cur.sku] = drop.map((x) => `${x.manufacturer}:${x.code}`);
      if (!drop.length) continue;
      const patch = { oem_codes: list(cur.oem_codes).filter((x) => !isW962(x)), competitor_codes: list(cur.competitor_codes).filter((x) => !isW962(x)) };
      assertGovernedCatalogPatch(cur, patch, { validateApplications: false });
      await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [cur.sku, JSON.stringify(patch.oem_codes), JSON.stringify(patch.competitor_codes)]);
      await db.query(`DELETE FROM public.exact_part_reference WHERE sku=$1 AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g')) = ANY($2::text[])`, [cur.sku, [...dropKeys]]);
      await db.query('SELECT public.refresh_crossref_cache_sku($1)', [cur.sku]);
    }

    // 2. the principal gets the plain MANN W 962 and the alternative products
    const comp = list(principal.competitor_codes).slice();
    const has = [...list(principal.oem_codes), ...comp].some((x) => norm(x.code) === 'W962'); // already held (as FAUN / IVECO / STEYR numbers); a second copy would break the cross-column duplicate rule
    if (!has) comp.push({ code: 'W962', manufacturer: 'MANN', classification: 'AFTERMARKET', classification_source: 'MANN_OFFICIAL_PRODUCT_PAGE_W962_OPERATOR_PASTED_20261116', source_url: MANN_URL });
    report.principal_added_mann_w962 = !has;
    const altSet = [...new Set([...list(principal.alternatives), ...OTHERS])].filter((s) => s !== PRINCIPAL);
    const altProducts = [...new Set([...list(principal.alternative_products).map((x) => (typeof x === 'string' ? x : x.sku)), ...OTHERS])];
    const pPatch = { oem_codes: list(principal.oem_codes), competitor_codes: comp };
    assertGovernedCatalogPatch(principal, pPatch, { validateApplications: false });
    await db.query('UPDATE public.elimfilters_catalog SET competitor_codes=$2::jsonb, alternatives=$3::jsonb, alternative_products=$4::jsonb WHERE sku=$1',
      [PRINCIPAL, JSON.stringify(comp), JSON.stringify(altSet), JSON.stringify(altProducts)]);
    for (const o of rows.filter((r) => r.sku !== PRINCIPAL)) {
      const a = [...new Set([...list(o.alternatives), PRINCIPAL])];
      await db.query('UPDATE public.elimfilters_catalog SET alternatives=$2::jsonb WHERE sku=$1', [o.sku, JSON.stringify(a)]);
    }
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [PRINCIPAL]);

    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code) IN (ld_catalog.norm_part('W962'), ld_catalog.norm_part('W962/14'), ld_catalog.norm_part('W962/6'), ld_catalog.norm_part('W962/8'))`)).rows;
    report.after = (await db.query(`SELECT sku, alternatives FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku`, [[PRINCIPAL, ...OTHERS]])).rows.map((r) => `${r.sku}: ${JSON.stringify(r.alternatives)}`);
    report.integrity = (await db.query(`SELECT (SELECT count(*)::int FROM public.exact_part_conflicts WHERE skus::text[] && $1::text[]) exact_conflicts_among_these`, [[PRINCIPAL, ...OTHERS]])).rows[0];
    report.ledger = (await db.query(`SELECT sku,certification_state FROM public.catalog_sku_certification WHERE sku = ANY($1::text[]) ORDER BY sku`, [[PRINCIPAL, ...OTHERS]])).rows.map((r) => `${r.sku}:${r.certification_state}`);
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
