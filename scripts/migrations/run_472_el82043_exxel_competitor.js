'use strict';

/**
 * EL82043 (Donaldson P502043): EXXEL 14640055 sat twice in oem_codes and once in competitor_codes (REFERENCE_CLASSIFICATION_CONFLICT).
 * Operator 2026-11-25: Exxel is a COMPETITOR. Both OEM entries are removed (the competitor entry stays), and the evidence URL becomes the Donaldson product page.
 * Held (not loaded, classification not decided): AC DELCO 95631285 and SULLAIR 42712, which the Donaldson page lists. Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EL82043';
const BASE = 'P502043';
const URL_DON = 'https://shop.donaldson.com/store/es-us/product/P502043/18812';
const CODE = '14640055';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

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
    const oem = (cur.oem_codes || []).filter((x) => norm(x.code) !== CODE);
    const comp = [...(cur.competitor_codes || [])];
    if (!comp.some((x) => norm(x.code) === CODE)) throw new Error('COMPETITOR_ENTRY_MISSING');
    report.removed_from_oem = (cur.oem_codes || []).length - oem.length;
    const beforeH = (await db.query("SELECT md5((to_jsonb(c)-'oem_codes'-'canonical_source_url')::text) h FROM public.elimfilters_catalog c WHERE sku=$1", [SKU])).rows[0].h;
    const patch = { oem_codes: oem, canonical_source_url: URL_DON };
    report.gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
    await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, canonical_source_url=$3 WHERE sku=$1', [SKU, JSON.stringify(oem), URL_DON]);
    try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]); await db.query('RELEASE SAVEPOINT c'); } catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); }
    const after = (await db.query("SELECT jsonb_array_length(competitor_codes) comp, jsonb_array_length(oem_codes) oem, md5((to_jsonb(c)-'oem_codes'-'canonical_source_url')::text) h, canonical_source_url FROM public.elimfilters_catalog c WHERE sku=$1", [SKU])).rows[0];
    if (beforeH !== after.h) throw new Error('PROTECTED_FIELD_CHANGED');
    report.before = { comp: (cur.competitor_codes || []).length, oem: (cur.oem_codes || []).length };
    report.after = { comp: after.comp, oem: after.oem, url: after.canonical_source_url };
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
