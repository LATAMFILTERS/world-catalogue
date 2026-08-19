'use strict';

/**
 * Applies a controlled batch of primary-manufacturer evidence that was independently
 * verified against exact official Donaldson Shop product pages on 2026-08-19.
 *
 * Render receives HTTP 403 from Donaldson Shop, so this migration does NOT pretend
 * that a failed runtime fetch means manufacturer absence. Instead it persists the
 * already-reviewed official URL as evidence and hashes the canonical evidence record.
 *
 * Safety:
 * - exact SKU + codigo_base + HEAVY_DUTY expectation must match production first
 * - codigo_base itself is NOT changed in this batch
 * - SKU, duty, specs, oem_codes and competitor_codes are never changed
 * - no manufacturer absence is inferred
 */

require('dotenv').config();
const crypto = require('crypto');
const { Pool } = require('pg');
const { normalizeCode } = require('../../lib/donaldson-official-evidence');

const VERIFIED_AT = '2026-08-19T15:37:00.000Z';
const AUTHORITY = 'DONALDSON';
const VERIFICATION_METHOD = 'EXACT_OFFICIAL_DONALDSON_PRODUCT_PAGE_REVIEW';

const BATCH = [
  { sku: 'EA15026', codigo_base: 'DBA5026', url: 'https://shop.donaldson.com/store/en-us/product/DBA5026/11828' },
  { sku: 'EH60614', codigo_base: 'P580614', url: 'https://shop.donaldson.com/store/en-us/product/P580614/prod1640015' },
  { sku: 'EH66342', codigo_base: 'P566342', url: 'https://shop.donaldson.com/store/en-us/product/P566342/37385' },
  { sku: 'EH66353', codigo_base: 'P566353', url: 'https://shop.donaldson.com/store/en-us/product/P566353/37396' },
  { sku: 'EH66450', codigo_base: 'P566450', url: 'https://shop.donaldson.com/store/fr-us/product/P566450/37463' },
  { sku: 'EH66453', codigo_base: 'P566453', url: 'https://shop.donaldson.com/store/en-us/product/P566453/37466' },
  { sku: 'EH66460', codigo_base: 'P566460', url: 'https://shop.donaldson.com/store/en-us/product/P566460/37473' },
];

function evidenceRecord(item) {
  const record = {
    sku: item.sku,
    codigo_base: item.codigo_base,
    normalized_reference: normalizeCode(item.codigo_base),
    authority: AUTHORITY,
    manufacturer: AUTHORITY,
    source_url: item.url,
    verification_method: VERIFICATION_METHOD,
    verified_at: VERIFIED_AT,
  };
  return {
    record,
    hash: crypto.createHash('sha256').update(JSON.stringify(record)).digest('hex'),
  };
}

async function applyCuratedOfficialEvidenceBatch1() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  const report = {
    batch: '076_CURATED_OFFICIAL_EVIDENCE_BATCH1',
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
        SELECT sku, codigo_base, duty,
               enrichment_data->'codigo_base_governance' AS gov
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

      const { record, hash } = evidenceRecord(item);
      const patch = {
        policy_version: '2026-08-19-v3.1',
        state: 'CANONICAL_VERIFIED',
        required_authority: 'VERIFIED_DONALDSON',
        primary_manufacturer_verified: true,
        approved_manufacturer: 'DONALDSON',
        approved_codigo_base: row.codigo_base,
        evidence_authority: 'OFFICIAL_DONALDSON_SHOP',
        evidence_kind: 'OFFICIAL_PRODUCT_PAGE',
        evidence_url: item.url,
        evidence_hash: hash,
        evidence_hash_kind: 'CANONICAL_EVIDENCE_RECORD_SHA256',
        verification_method: VERIFICATION_METHOD,
        verified_at: VERIFIED_AT,
      };

      await client.query('BEGIN');
      try {
        await client.query(`
          INSERT INTO catalog_codigo_base_evidence (
            sku, evidence_kind, authority, manufacturer, reference_code,
            normalized_reference, source_url, evidence_hash, verified_at, metadata
          ) VALUES ($1,'OFFICIAL_PRODUCT_PAGE',$2,$2,$3,$4,$5,$6,$7,$8::jsonb)
          ON CONFLICT DO NOTHING
        `, [
          item.sku,
          AUTHORITY,
          row.codigo_base,
          normalizeCode(row.codigo_base),
          item.url,
          hash,
          VERIFIED_AT,
          JSON.stringify({
            verification_method: VERIFICATION_METHOD,
            evidence_hash_kind: 'CANONICAL_EVIDENCE_RECORD_SHA256',
            source_fetch_note: 'Official page independently reviewed; Render-origin fetch returns HTTP 403',
            canonical_evidence_record: record,
          }),
        ]);

        const updated = await client.query(`
          UPDATE elimfilters_catalog
          SET enrichment_data = jsonb_set(
                coalesce(enrichment_data, '{}'::jsonb),
                '{codigo_base_governance}',
                coalesce(enrichment_data->'codigo_base_governance','{}'::jsonb) || $1::jsonb,
                true
              )
          WHERE sku=$2
            AND duty='HEAVY_DUTY'
            AND upper(regexp_replace(codigo_base,'[^A-Z0-9]','','g'))=$3
          RETURNING sku
        `, [JSON.stringify(patch), item.sku, normalizeCode(row.codigo_base)]);

        if (updated.rowCount !== 1) throw new Error('CATALOG_ROW_CHANGED_DURING_APPLY');

        await client.query(`
          UPDATE catalog_codigo_base_sanitation_queue
          SET current_codigo_base=$1,
              governance_state='CANONICAL_VERIFIED',
              required_authority='VERIFIED_DONALDSON',
              status='RESOLVED',
              last_error=NULL,
              updated_at=now()
          WHERE sku=$2
        `, [row.codigo_base, item.sku]);

        await client.query('COMMIT');
        report.verified += 1;
        report.details.push({ sku: item.sku, status: 'VERIFIED', codigo_base: row.codigo_base, source_url: item.url });
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
  applyCuratedOfficialEvidenceBatch1()
    .then((result) => console.log('[curated-official-evidence-batch1]', JSON.stringify(result)))
    .catch((error) => { console.error('[curated-official-evidence-batch1] failed', error); process.exit(1); });
}

module.exports = { BATCH, evidenceRecord, applyCuratedOfficialEvidenceBatch1 };
