'use strict';

/**
 * Evidence-driven historical sanitation worker.
 *
 * This worker NEVER infers manufacturer absence.
 * It only resolves rows when official manufacturer evidence is found.
 * Current implementation safely handles Donaldson-primary HD rows:
 *   - CANONICAL_EVIDENCED_NOT_VERIFIED: verifies current codigo_base on an official Donaldson product page.
 *   - REVIEW_PRIMARY_CANDIDATE: verifies exactly one Donaldson candidate by official cross-reference evidence.
 *
 * It does not touch OEM/competitor alternate arrays and it does not rename SKU.
 */

require('dotenv').config();
const crypto = require('crypto');
const { Pool } = require('pg');
const {
  normalizeCode,
  pageSupportsCrossReference,
  pageSupportsOfficialProduct,
} = require('../lib/donaldson-official-evidence');

const DATABASE_URL = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

const APPLY = process.argv.includes('--apply');
const limitArg = process.argv.find((v) => v.startsWith('--limit='));
const LIMIT = limitArg ? Math.max(1, Math.min(100, Number(limitArg.split('=')[1]) || 25)) : 25;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchOfficialDonaldsonPage(code) {
  const encoded = encodeURIComponent(String(code).trim());
  const urls = [
    `https://shop.donaldson.com/store/en-us/product/${encoded}`,
    `https://shop.donaldson.com/store/fr-us/product/${encoded}`,
  ];

  for (const url of urls) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'user-agent': 'ELIMFILTERS-Historical-Sanitation/1.0 (+https://elimfilters.com)',
          'accept-language': 'en-US,en;q=0.9',
        },
      });
      if (!response.ok) continue;
      const html = await response.text();
      if (!normalizeCode(html).includes(normalizeCode(code))) continue;
      return {
        ok: true,
        url: response.url || url,
        html,
        status: response.status,
        hash: crypto.createHash('sha256').update(html).digest('hex'),
      };
    } catch (_) {
      // A network failure is never evidence of absence.
    } finally {
      clearTimeout(timer);
    }
  }

  return { ok: false, url: null, html: '', status: null, hash: null };
}

function governance(row) {
  return row.enrichment_data?.codigo_base_governance || {};
}

async function verifyRow(row) {
  const gov = governance(row);
  const state = gov.state;

  if (row.duty !== 'HEAVY_DUTY') {
    return { resolved: false, reason: 'UNSUPPORTED_AUTHORITY_WORKER' };
  }

  if (state === 'CANONICAL_EVIDENCED_NOT_VERIFIED') {
    const page = await fetchOfficialDonaldsonPage(row.codigo_base);
    if (!page.ok || !pageSupportsOfficialProduct(page.html, row.codigo_base)) {
      return { resolved: false, reason: 'NO_OFFICIAL_DONALDSON_PRODUCT_EVIDENCE' };
    }
    return {
      resolved: true,
      approvedCodigoBase: row.codigo_base,
      evidenceKind: 'OFFICIAL_PRODUCT_PAGE',
      evidenceUrl: page.url,
      evidenceHash: page.hash,
      sourceCurrentBase: true,
    };
  }

  if (state === 'REVIEW_PRIMARY_CANDIDATE') {
    const candidates = Array.isArray(gov.observed_primary_candidates)
      ? [...new Set(gov.observed_primary_candidates.map(String).filter(Boolean))]
      : [];
    const matches = [];

    for (const candidate of candidates) {
      const page = await fetchOfficialDonaldsonPage(candidate);
      if (page.ok && pageSupportsCrossReference(page.html, candidate, row.codigo_base)) {
        matches.push({
          candidate,
          url: page.url,
          hash: page.hash,
        });
      }
      await sleep(250);
    }

    if (matches.length !== 1) {
      return {
        resolved: false,
        reason: matches.length === 0 ? 'NO_OFFICIAL_CROSS_REFERENCE_MATCH' : 'MULTIPLE_OFFICIAL_CROSS_REFERENCE_MATCHES',
        verifiedMatches: matches.map((m) => m.candidate),
      };
    }

    return {
      resolved: true,
      approvedCodigoBase: matches[0].candidate,
      evidenceKind: 'OFFICIAL_CROSS_REFERENCE',
      evidenceUrl: matches[0].url,
      evidenceHash: matches[0].hash,
      sourceCurrentBase: false,
    };
  }

  return { resolved: false, reason: 'STATE_REQUIRES_DIFFERENT_VERIFICATION_PATH' };
}

async function applyResolution(client, row, resolution) {
  const now = new Date().toISOString();
  const evidencePatch = {
    policy_version: '2026-08-19-v3.1',
    state: 'CANONICAL_VERIFIED',
    required_authority: 'DONALDSON',
    primary_manufacturer_verified: true,
    approved_manufacturer: 'DONALDSON',
    approved_codigo_base: resolution.approvedCodigoBase,
    evidence_authority: 'OFFICIAL_DONALDSON_SHOP',
    evidence_kind: resolution.evidenceKind,
    evidence_url: resolution.evidenceUrl,
    evidence_hash: resolution.evidenceHash,
    verified_at: now,
  };

  await client.query(`
    INSERT INTO catalog_codigo_base_evidence (
      sku, evidence_kind, authority, manufacturer, reference_code,
      normalized_reference, source_url, evidence_hash, verified_at, metadata
    ) VALUES ($1,$2,'DONALDSON','DONALDSON',$3,$4,$5,$6,$7,$8::jsonb)
    ON CONFLICT DO NOTHING
  `, [
    row.sku,
    resolution.evidenceKind,
    resolution.approvedCodigoBase,
    normalizeCode(resolution.approvedCodigoBase),
    resolution.evidenceUrl,
    resolution.evidenceHash,
    now,
    JSON.stringify({ prior_codigo_base: row.codigo_base, source_current_base: resolution.sourceCurrentBase }),
  ]);

  await client.query(`
    UPDATE elimfilters_catalog
    SET enrichment_data = jsonb_set(
          coalesce(enrichment_data, '{}'::jsonb),
          '{codigo_base_governance}',
          coalesce(enrichment_data->'codigo_base_governance','{}'::jsonb) || $1::jsonb,
          true
        ),
        codigo_base = $2
    WHERE sku = $3
  `, [JSON.stringify(evidencePatch), resolution.approvedCodigoBase, row.sku]);

  await client.query(`
    UPDATE catalog_codigo_base_sanitation_queue
    SET current_codigo_base=$1,
        governance_state='CANONICAL_VERIFIED',
        required_authority='DONALDSON',
        status='RESOLVED',
        attempts=attempts+1,
        last_attempt_at=now(),
        last_error=NULL,
        updated_at=now()
    WHERE sku=$2
  `, [resolution.approvedCodigoBase, row.sku]);
}

async function runHistoricalSanitationBatch({ apply = APPLY, limit = LIMIT } = {}) {
  const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  const summary = {
    mode: apply ? 'APPLY' : 'DRY_RUN',
    selected: 0,
    verified: 0,
    unresolved: 0,
    changed_codigo_base: 0,
    unchanged_codigo_base_verified: 0,
    absence_inferred: 0,
    alternate_columns_mutated: 0,
    sku_mutations: 0,
    details: [],
  };

  try {
    const { rows } = await client.query(`
      SELECT c.sku, c.codigo_base, c.duty, c.enrichment_data
      FROM catalog_codigo_base_sanitation_queue q
      JOIN elimfilters_catalog c ON c.sku=q.sku
      WHERE q.status='PENDING'
        AND c.duty='HEAVY_DUTY'
        AND c.enrichment_data->'codigo_base_governance'->>'state'
            IN ('CANONICAL_EVIDENCED_NOT_VERIFIED','REVIEW_PRIMARY_CANDIDATE')
      ORDER BY q.priority, q.sku
      LIMIT $1
    `, [limit]);

    summary.selected = rows.length;

    for (const row of rows) {
      const resolution = await verifyRow(row);
      if (!resolution.resolved) {
        summary.unresolved += 1;
        summary.details.push({ sku: row.sku, status: 'UNRESOLVED', reason: resolution.reason });
        if (apply) {
          await client.query(`
            UPDATE catalog_codigo_base_sanitation_queue
            SET attempts=attempts+1,last_attempt_at=now(),last_error=$1,updated_at=now()
            WHERE sku=$2
          `, [resolution.reason, row.sku]);
        }
        continue;
      }

      summary.verified += 1;
      if (normalizeCode(row.codigo_base) === normalizeCode(resolution.approvedCodigoBase)) {
        summary.unchanged_codigo_base_verified += 1;
      } else {
        summary.changed_codigo_base += 1;
      }
      summary.details.push({
        sku: row.sku,
        status: 'VERIFIED',
        from: row.codigo_base,
        to: resolution.approvedCodigoBase,
        evidence_kind: resolution.evidenceKind,
        evidence_url: resolution.evidenceUrl,
      });

      if (apply) {
        await client.query('BEGIN');
        try {
          await applyResolution(client, row, resolution);
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          summary.verified -= 1;
          if (normalizeCode(row.codigo_base) === normalizeCode(resolution.approvedCodigoBase)) {
            summary.unchanged_codigo_base_verified -= 1;
          } else {
            summary.changed_codigo_base -= 1;
          }
          summary.unresolved += 1;
          summary.details[summary.details.length - 1] = { sku: row.sku, status: 'ERROR', reason: error.message };
        }
      }
    }

    return summary;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  runHistoricalSanitationBatch()
    .then((result) => console.log('[historical-sanitation]', JSON.stringify(result)))
    .catch((error) => { console.error('[historical-sanitation] failed', error); process.exit(1); });
}

module.exports = {
  fetchOfficialDonaldsonPage,
  verifyRow,
  runHistoricalSanitationBatch,
};
