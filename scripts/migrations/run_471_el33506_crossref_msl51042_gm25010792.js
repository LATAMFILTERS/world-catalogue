'use strict';

/**
 * EL33506 (FRAM PH3506) cross references the operator approved on 2026-11-25 from the FRAM PH3506 page interchange table (188 rows, 19 pages; 183 were already loaded):
 *   MICROGARD SELECT MSL51042 (competitor) and GENERAL MOTORS 25010792 (OEM).
 * NOT added: Flag C-3387A (operator: belongs to EL33387) and "Champion PH3506" (FRAM's own code).
 * Only competitor_codes / oem_codes change. Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EL33506';
const BASE = 'PH3506';
const SRC = 'https://www.fram.com/fram-extra-guard-oil-filter-spin-on-ph3506';
const AUTH = 'FRAM_OFFICIAL_PUBLISHED_INTERCHANGE_20261125';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const ADD_COMP = [{ code: 'MSL51042', manufacturer: 'MICROGARD SELECT', source_url: SRC, evidence_authority: AUTH }];
const ADD_OEM = [{ code: '25010792', manufacturer: 'GENERAL MOTORS', classification: 'OEM', source_url: SRC, evidence_authority: AUTH }];

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };
  try {
    await db.query('BEGIN');
    const cur = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!cur || cur.codigo_base !== BASE) throw new Error('SOURCE_CHANGED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur, row_sha256: sha(cur) }, null, 2));
    const has = (list, code) => (list || []).some((x) => norm(x.code) === norm(code));
    const comp = [...(cur.competitor_codes || [])];
    const oem = [...(cur.oem_codes || [])];
    report.added = [];
    for (const x of ADD_COMP) if (!has(comp, x.code)) { comp.push(x); report.added.push('competitor ' + x.code); }
    for (const x of ADD_OEM) if (!has(oem, x.code)) { oem.push(x); report.added.push('oem ' + x.code); }
    const beforeH = (await db.query("SELECT md5((to_jsonb(c)-'competitor_codes'-'oem_codes')::text) h FROM public.elimfilters_catalog c WHERE sku=$1", [SKU])).rows[0].h;
    const patch = { competitor_codes: comp, oem_codes: oem };
    report.gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
    await db.query('UPDATE public.elimfilters_catalog SET competitor_codes=$2::jsonb, oem_codes=$3::jsonb WHERE sku=$1', [SKU, JSON.stringify(comp), JSON.stringify(oem)]);
    try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]); await db.query('RELEASE SAVEPOINT c'); } catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); }
    const after = (await db.query(`SELECT sku, codigo_base, jsonb_array_length(competitor_codes) comp, jsonb_array_length(oem_codes) oem, md5((to_jsonb(c)-'competitor_codes'-'oem_codes')::text) h FROM public.elimfilters_catalog c WHERE sku=$1`, [SKU])).rows[0];
    if (beforeH !== after.h) throw new Error('PROTECTED_FIELD_CHANGED');
    report.before = { comp: (cur.competitor_codes || []).length, oem: (cur.oem_codes || []).length };
    report.after = { comp: after.comp, oem: after.oem };
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code) = ANY($1::text[])`, [['MSL51042', '25010792']])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
