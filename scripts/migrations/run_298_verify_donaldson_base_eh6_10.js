'use strict';

/**
 * 10 active EH6 SKUs carry a Donaldson codigo_base that was never verified (canonical_source_status UNVERIFIED,
 * canonical_source_brand empty, codigo_base_governance state REVIEW_PRIMARY_CANDIDATE / VERIFY_PRIMARY_ABSENCE), so the
 * catalogue write gateway (CATALOG_POLICY_V32) blocked their OEM/competitor fill. The operator's capture of
 * shop.donaldson.com (donaldson-local, 2026-11-02) has the official product page of each code: status EXTRAIDO,
 * part_number == requested code == codigo_base, description HYDRAULIC FILTER. That is the verification the policy asks
 * for: HD base = Donaldson. This records it (canonical source DONALDSON VERIFIED + governance block); SKU and base do
 * not change. Dry-run by default (ROLLBACK). --execute to COMMIT.
 * Usage: node scripts/migrations/run_298_verify_donaldson_base_eh6_10.js --file <productos.json> [--execute]
 */

require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const file = process.argv[process.argv.indexOf('--file') + 1];
const SKUS = ['EH66340', 'EH66510', 'EH66682', 'EH67000', 'EH67038', 'EH67081', 'EH67086', 'EH67089', 'EH67090', 'EH68073'];
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

(async () => {
  if (!process.argv.includes('--file') || !file) throw new Error('--file <productos.json> is required');
  const recs = new Map(JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, '')).map((r) => [norm(r.requested_code), r]));
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const done = [];
  try {
    await db.query('BEGIN');
    for (const sku of SKUS) {
      const row = (await db.query(`SELECT sku, codigo_base, enrichment_data->'codigo_base_governance' g FROM public.elimfilters_catalog WHERE sku=$1 AND catalog_active FOR UPDATE`, [sku])).rows[0];
      if (!row) throw new Error('MISSING ' + sku);
      const r = recs.get(norm(row.codigo_base));
      if (!r || r.status !== 'EXTRAIDO' || norm(r.official.part_number) !== norm(row.codigo_base) || !/HYDRAULIC/i.test(r.official.description)) throw new Error('NO_OFFICIAL_EVIDENCE ' + sku);
      if (String(row.codigo_base).replace(/\D/g, '').slice(-4) !== sku.replace(/\D/g, '').slice(-4)) throw new Error('SUFFIX ' + sku);
      const gov = { ...(row.g || {}), state: 'CANONICAL_VERIFIED', approved_codigo_base: row.codigo_base, current_codigo_base: row.codigo_base, approved_manufacturer: 'DONALDSON',
        approved_source_column: 'CODIGO_BASE', primary_manufacturer_verified: true, evidence_url: r.source_url, evidence_level: 'OFFICIAL_PRODUCT_PAGE',
        evidence_authority: 'DONALDSON_OFFICIAL_CATALOG', verified_at: r.scraped_at, verification_method: 'RUN_298_DONALDSON_LOCAL_CAPTURE', previous_state: (row.g || {}).state || null };
      await db.query(`UPDATE public.elimfilters_catalog SET canonical_source_brand='DONALDSON', canonical_source_code=$2, canonical_source_url=$3, canonical_source_status='VERIFIED',
          enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb),'{codigo_base_governance}',$4::jsonb) WHERE sku=$1`,
        [sku, row.codigo_base, r.source_url, JSON.stringify(gov)]);
      done.push(`${sku} ${row.codigo_base} ${r.official.description}`);
    }
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ mode: APPLY ? 'execute' : 'dry-run', verified: done, transaction: APPLY ? 'COMMIT' : 'ROLLBACK' }, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
