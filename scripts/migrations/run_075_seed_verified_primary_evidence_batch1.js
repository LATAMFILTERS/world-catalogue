'use strict';

/**
 * First controlled historical-sanitation evidence batch.
 * Every item below was independently resolved to an exact official Donaldson Shop URL.
 * The script re-fetches and validates that official page at runtime before writing anything.
 * It never changes SKU, duty, specs, oem_codes, or competitor_codes.
 * For this batch codigo_base is expected to remain unchanged; only verification metadata,
 * evidence ledger, and sanitation queue status are updated.
 */

require('dotenv').config();
const crypto = require('crypto');
const { Pool } = require('pg');
const { normalizeCode, pageSupportsOfficialProduct } = require('../../lib/donaldson-official-evidence');

const BATCH = [
  { sku: 'EA15026', codigo_base: 'DBA5026', url: 'https://shop.donaldson.com/store/en-us/product/DBA5026/11828' },
  { sku: 'EH60614', codigo_base: 'P580614', url: 'https://shop.donaldson.com/store/en-us/product/P580614/prod1640015' },
  { sku: 'EH66342', codigo_base: 'P566342', url: 'https://shop.donaldson.com/store/en-us/product/P566342/37385' },
  { sku: 'EH66353', codigo_base: 'P566353', url: 'https://shop.donaldson.com/store/en-us/product/P566353/37396' },
  { sku: 'EH66450', codigo_base: 'P566450', url: 'https://shop.donaldson.com/store/fr-us/product/P566450/37463' },
  { sku: 'EH66453', codigo_base: 'P566453', url: 'https://shop.donaldson.com/store/en-us/product/P566453/37466' },
  { sku: 'EH66460', codigo_base: 'P566460', url: 'https://shop.donaldson.com/store/en-us/product/P566460/37473' },
];

const HEADERS = {
  'user-agent': 'Mozilla/5.0 (compatible; ELIMFILTERS-Catalog-Evidence/1.0; +https://elimfilters.com)',
  'accept-language': 'en-US,en;q=0.9',
};

async function fetchAndValidate(item) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(item.url, { redirect: 'follow', signal: controller.signal, headers: HEADERS });
    if (!response.ok) return { ok: false, reason: `HTTP_${response.status}` };
    const html = await response.text();
    if (!pageSupportsOfficialProduct(html, item.codigo_base)) {
      return { ok: false, reason: 'OFFICIAL_PAGE_VALIDATION_FAILED' };
    }
    return {
      ok: true,
      url: response.url || item.url,
      hash: crypto.createHash('sha256').update(html).digest('hex'),
    };
  } catch (error) {
    return { ok: false, reason: error?.name === 'AbortError' ? 'FETCH_TIMEOUT' : 'FETCH_FAILED' };
  } finally {
    clearTimeout(timer);
  }
}

async function seedVerifiedPrimaryEvidenceBatch1() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  const report = {
    batch: '075_VERIFIED_PRIMARY_EVIDENCE_BATCH1',
    selected: BATCH.length,
    verified: 0,
    skipped: 0,
    codigo_base_mutations: 0,
    sku_mutations: 0,
    alternate_column_mutations: 0,
    absence_inferred: 0,
    details: [],
  };

  try {
    for (const item of BATCH) {
      const current = await client.query(`
        SELECT sku, codigo_base, duty
        FROM elimfilters_catalog
        WHERE sku=$1
      `, [item.sku]);

      if (current.rowCount !== 1) {
        report.skipped += 1;
        report.details.push({ sku: item.sku, status: 'SKIPPED', reason: 'SKU_NOT_UNIQUE_OR_MISSING' });
        continue;
      }

      const row = current.rows[0];
      if (row.duty !== 'HEAVY_DUTY' || normalizeCode(row.codigo_base) !== normalizeCode(item.codigo_base)) {
        report.skipped += 1;
        report.details.push({ sku: item.sku, status: 'SKIPPED', reason: 'DB_EXPECTATION_MISMATCH', observed: row.codigo_base });
        continue;
      }

      const evidence = await fetchAndValidate(item);
      if (!evidence.ok) {
        report.skipped += 1;
        report.details.push({ sku: item.sku, status: 'SKIPPED', reason: evidence.reason });
        continue;
      }

      const now = new Date().toISOString();
      const patch = {
        policy_version: '2026-08-19-v3.1',
        state: 'CANONICAL_VERIFIED',
        required_authority: 'DONALDSON',
        primary_manufacturer_verified: true,
        approved_manufacturer: 'DONALDSON',
        approved_codigo_base: row.codigo_base,
        evidence_authority: 'OFFICIAL_DONALDSON_SHOP',
        evidence_kind: 'OFFICIAL_PRODUCT_PAGE',
        evidence_url: evidence.url,
        evidence_hash: evidence.hash,
        verified_at: now,
      };

      await client.query('BEGIN');
      try {
        await client.query(`
          INSERT INTO catalog_codigo_base_evidence (
            sku, evidence_kind, authority, manufacturer, reference_code,
            normalized_reference, source_url, evidence_hash, verified_at, metadata
          ) VALUES ($1,'OFFICIAL_PRODUCT_PAGE','DONALDSON','DONALDSON',$2,$3,$4,$5,$6,$7::jsonb)
          ON CONFLICT DO NOTHING
        `, [
          item.sku,
          row.codigo_base,
          normalizeCode(row.codigo_base),
          evidence.url,
          evidence.hash,
          now,
          JSON.stringify({ controlled_batch: '075', prior_codigo_base: row.codigo_base }),
        ]);

        await client.query(`
          UPDATE elimfilters_catalog
          SET enrichment_data = jsonb_set(
                coalesce(enrichment_data, '{}'::jsonb),
                '{codigo_base_governance}',
                coalesce(enrichment_data->'codigo_base_governance','{}'::jsonb) || $1::jsonb,
                true
              )
          WHERE sku=$2 AND upper(regexp_replace(codigo_base,'[^A-Z0-9]','','g'))=$3
        `, [JSON.stringify(patch), item.sku, normalizeCode(row.codigo_base)]);

        await client.query(`
          UPDATE catalog_codigo_base_sanitation_queue
          SET governance_state='CANONICAL_VERIFIED', required_authority='DONALDSON',
              status='RESOLVED', last_error=NULL, updated_at=now()
          WHERE sku=$1
        `, [item.sku]);

        await client.query('COMMIT');
        report.verified += 1;
        report.details.push({ sku: item.sku, status: 'VERIFIED', codigo_base: row.codigo_base, evidence_url: evidence.url });
      } catch (error) {
        await client.query('ROLLBACK');
        report.skipped += 1;
        report.details.push({ sku: item.sku, status: 'SKIPPED', reason: `DB_WRITE_FAILED:${error.message}` });
      }
    }

    return report;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  seedVerifiedPrimaryEvidenceBatch1()
    .then((result) => console.log('[verified-primary-evidence-batch1]', JSON.stringify(result)))
    .catch((error) => { console.error('[verified-primary-evidence-batch1] failed', error); process.exit(1); });
}

module.exports = { BATCH, fetchAndValidate, seedVerifiedPrimaryEvidenceBatch1 };
