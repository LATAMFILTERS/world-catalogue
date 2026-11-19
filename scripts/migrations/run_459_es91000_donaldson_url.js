'use strict';

/** ES91000: replace the generic Donaldson P551000 URL with the exact official product URL supplied by the operator 2026-11-18.
 * Evidence URL fields only (governance, canonical source, alternative_products source). Dry-run by default; --execute needs --snapshot <file>. */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'ES91000';
const URL_OLD = 'https://shop.donaldson.com/store/es-us/product/P551000';
const URL_NEW = 'https://shop.donaldson.com/store/es-us/product/P551000/20569';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const swap = (v) => JSON.parse(JSON.stringify(v).split(URL_OLD + '"').join(URL_NEW + '"'));

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };
  try {
    await db.query('BEGIN');
    const cur = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!cur || cur.codigo_base !== 'P551000') throw new Error('SOURCE_CHANGED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur }, null, 2));
    const evidence = { ...swap(cur.canonical_evidence), evidence_hash: sha({ sku: SKU, base: 'P551000', url: URL_NEW }) };
    const patch = {
      enrichment_data: swap(cur.enrichment_data), alternative_products: swap(cur.alternative_products),
      oem_codes: swap(cur.oem_codes), canonical_source_url: URL_NEW, canonical_evidence: evidence,
    };
    report.gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
    await db.query('UPDATE public.elimfilters_catalog SET enrichment_data=$2::jsonb, alternative_products=$3::jsonb, oem_codes=$4::jsonb, canonical_source_url=$5, canonical_evidence=$6::jsonb WHERE sku=$1',
      [SKU, JSON.stringify(patch.enrichment_data), JSON.stringify(patch.alternative_products), JSON.stringify(patch.oem_codes), URL_NEW, JSON.stringify(evidence)]);
    report.after = (await db.query("SELECT canonical_source_url, enrichment_data->'codigo_base_governance'->>'evidence_url' gov_url, codigo_base FROM public.elimfilters_catalog WHERE sku=$1", [SKU])).rows[0];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
