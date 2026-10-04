'use strict';

require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { normalizeCode, pageSupportsOfficialProduct } = require('../../lib/donaldson-official-evidence');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const EXECUTE = process.argv.includes('--execute');

const BATCH = Object.freeze([
  Object.freeze({ sku: 'EH66226', codigo_base: 'P566226', url: 'https://shop.donaldson.com/store/en-us/product/P566226/37322', operator_confirmed: true, expected_state: 'VERIFY_PRIMARY_ABSENCE' }),
  Object.freeze({ sku: 'EH66227', codigo_base: 'P566227', url: 'https://shop.donaldson.com/store/en-us/product/P566227/37323', operator_confirmed: true, expected_state: 'VERIFY_PRIMARY_ABSENCE' }),
  Object.freeze({ sku: 'EH66228', codigo_base: 'P566228', url: 'https://shop.donaldson.com/store/en-us/product/P566228/37324', operator_confirmed: true, expected_state: 'VERIFY_PRIMARY_ABSENCE' }),
  Object.freeze({ sku: 'EH66230', codigo_base: 'P566230', url: 'https://shop.donaldson.com/store/en-us/product/P566230/37326', operator_confirmed: true, expected_state: 'VERIFY_PRIMARY_ABSENCE' }),
  Object.freeze({ sku: 'EH66231', codigo_base: 'P566231', url: 'https://shop.donaldson.com/store/en-us/product/P566231/37327', operator_confirmed: true, expected_state: 'REVIEW_PRIMARY_CANDIDATE' }),
]);

const HEADERS = Object.freeze({
  'user-agent': 'Mozilla/5.0 (compatible; ELIMFILTERS-Canonical-Reconciliation/1.0; +https://elimfilters.com)',
  'accept-language': 'en-US,en;q=0.9',
});

async function fetchEvidence(item) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(item.url, { redirect: 'follow', signal: controller.signal });
    if (!response.ok) return { ok: false, reason: `HTTP_${response.status}` };
    const html = await response.text();
    if (!pageSupportsOfficialProduct(html, item.codigo_base)) {
      return { ok: false, reason: 'OFFICIAL_PRODUCT_PAGE_DID_NOT_VALIDATE' };
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

async function main() {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB_URL_MISSING');
  const parsed = new URL(url);
  const loopback = parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost';
  const allowedPort = parsed.port === '5432' || parsed.port === '5441';
  if (!loopback || !allowedPort || parsed.pathname !== '/catalogo_elimfilters') {
    throw new Error('REFUSE_NON_CANONICAL_DB');
  }

  const db = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await db.connect();

  const report = {
    migration: '190_RECONCILE_P566225_P566228_AUTHORITY',
    mode: EXECUTE ? 'execute' : 'dry-run',
    selected: BATCH.length,
    verified: 0,
    unresolved: 0,
    mutations: {
      sku: 0,
      codigo_base: 0,
      alternates: 0,
      governance: 0,
      evidence: 0,
      queue: 0,
    },
    details: [],
  };

  try {
    for (const item of BATCH) {
      const beforeResult = await db.query(
        `SELECT * FROM public.elimfilters_catalog WHERE sku=$1`,
        [item.sku],
      );
      if (beforeResult.rowCount !== 1) throw new Error(`SKU_NOT_UNIQUE:${item.sku}`);
      const before = beforeResult.rows[0];
      const gov = before.enrichment_data?.codigo_base_governance || {};

      const baselineOk =
        before.duty === 'HEAVY_DUTY' &&
        before.filter_type === 'hydraulic' &&
        normalizeCode(before.codigo_base) === normalizeCode(item.codigo_base) &&
        normalizeCode(before.canonical_source_code) === normalizeCode(item.codigo_base) &&
        String(before.canonical_source_status || '').toUpperCase() === 'UNVERIFIED' &&
        gov.state === item.expected_state &&
        item.operator_confirmed === true;

      if (!baselineOk) {
        report.unresolved += 1;
        report.details.push({
          sku: item.sku,
          status: 'UNRESOLVED',
          reason: 'BASELINE_CHANGED',
          observed: {
            codigo_base: before.codigo_base,
            duty: before.duty,
            filter_type: before.filter_type,
            canonical_source_brand: before.canonical_source_brand,
            canonical_source_code: before.canonical_source_code,
            canonical_source_status: before.canonical_source_status,
            governance_state: gov.state || null,
            canonical_evidence_source: before.canonical_evidence?.source || null,
          },
        });
        continue;
      }

      const evidence = await fetchEvidence(item);
      if (!evidence.ok) {
        report.unresolved += 1;
        report.details.push({ sku: item.sku, status: 'UNRESOLVED', reason: evidence.reason });
        continue;
      }

      const now = new Date().toISOString();
      const rejectedPrimaryCandidates = [
        ...new Set([
          ...(Array.isArray(gov.rejected_primary_candidates) ? gov.rejected_primary_candidates : []),
          ...(Array.isArray(gov.observed_primary_candidates) ? gov.observed_primary_candidates : []),
        ].map(String).filter(Boolean)),
      ];
      const nextGov = {
        ...gov,
        policy_version: '2026-10-03-v4.1',
        state: 'CANONICAL_VERIFIED',
        governance_state: 'CANONICAL_VERIFIED',
        required_authority: 'VERIFIED_DONALDSON',
        primary_manufacturer_verified: true,
        approved_manufacturer: 'DONALDSON',
        approved_codigo_base: before.codigo_base,
        approved_source_column: 'CODIGO_BASE',
        evidence_authority: 'OFFICIAL_DONALDSON_SHOP',
        evidence_kind: 'OFFICIAL_PRODUCT_PAGE',
        evidence_url: evidence.url,
        evidence_hash: evidence.hash,
        verified_at: now,
        observed_primary_candidates: [],
        observed_preferred_candidates: [],
        rejected_primary_candidates: rejectedPrimaryCandidates,
        rejected_primary_candidate_reason: rejectedPrimaryCandidates.length
          ? 'OPERATOR_CONFIRMED_CURRENT_CANONICAL_PLUS_OFFICIAL_PRODUCT_PAGE'
          : null,
      };
      const nextData = {
        ...(before.enrichment_data || {}),
        codigo_base_governance: nextGov,
      };

      const gateway = assertGovernedCatalogPatch(before, { enrichment_data: nextData });
      if (gateway.valid !== true) throw new Error(`GATEWAY_REJECTED:${item.sku}`);

      report.verified += 1;
      report.details.push({
        sku: item.sku,
        status: 'READY',
        codigo_base: before.codigo_base,
        evidence_url: evidence.url,
      });

      if (!EXECUTE) continue;

      await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
      try {
        const lockedResult = await db.query(
          `SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE`,
          [item.sku],
        );
        if (lockedResult.rowCount !== 1) throw new Error(`LOCK_FAILED:${item.sku}`);
        const locked = lockedResult.rows[0];
        const lockedGov = locked.enrichment_data?.codigo_base_governance || {};

        if (
          normalizeCode(locked.codigo_base) !== normalizeCode(item.codigo_base) ||
          normalizeCode(locked.canonical_source_code) !== normalizeCode(item.codigo_base) ||
          String(locked.canonical_source_status || '').toUpperCase() !== 'UNVERIFIED' ||
          lockedGov.state !== item.expected_state
        ) {
          throw new Error(`EXECUTION_BASELINE_CHANGED:${item.sku}`);
        }

        const lockedData = {
          ...(locked.enrichment_data || {}),
          codigo_base_governance: nextGov,
        };
        assertGovernedCatalogPatch(locked, { enrichment_data: lockedData });

        const evidenceInsert = await db.query(
          `INSERT INTO public.catalog_codigo_base_evidence (
             sku,evidence_kind,authority,manufacturer,reference_code,
             normalized_reference,source_url,evidence_hash,verified_at,metadata
           ) VALUES (
             $1,'OFFICIAL_PRODUCT_PAGE','OFFICIAL_DONALDSON_SHOP','DONALDSON',
             $2,$3,$4,$5,$6,$7::jsonb
           )
           ON CONFLICT DO NOTHING
           RETURNING id`,
          [
            item.sku,
            locked.codigo_base,
            normalizeCode(locked.codigo_base),
            evidence.url,
            evidence.hash,
            now,
            JSON.stringify({
              migration: '190_RECONCILE_P566225_P566228_AUTHORITY',
              canonical_evidence_source: locked.canonical_evidence?.source || null,
              prior_governance_state: lockedGov.state || null,
            }),
          ],
        );

        const canonicalEvidence = {
          source: 'OPERATOR_CONFIRMED_PLUS_OFFICIAL_DONALDSON_PRODUCT_PAGE',
          source_url: evidence.url,
          operator_confirmed: true,
          migration: '190_RECONCILE_P566225_P566228_AUTHORITY',
        };

        const updated = await db.query(
          `UPDATE public.elimfilters_catalog
              SET enrichment_data=$1::jsonb,
                  canonical_source_brand='DONALDSON',
                  canonical_source_code=$2,
                  canonical_source_url=$3,
                  canonical_source_status='VERIFIED',
                  canonical_verified_at=$4,
                  canonical_evidence=$5::jsonb
            WHERE sku=$6
              AND codigo_base IS NOT DISTINCT FROM $7
              AND canonical_source_status='UNVERIFIED'
            RETURNING sku,codigo_base,canonical_source_brand,canonical_source_code,
                      canonical_source_status,canonical_source_url,canonical_verified_at,
                      canonical_evidence,enrichment_data`,
          [
            JSON.stringify(lockedData),
            locked.codigo_base,
            evidence.url,
            now,
            JSON.stringify(canonicalEvidence),
            item.sku,
            locked.codigo_base,
          ],
        );
        if (updated.rowCount !== 1) throw new Error(`CATALOG_CAS_FAILED:${item.sku}`);

        const queue = await db.query(
          `UPDATE public.catalog_codigo_base_sanitation_queue
              SET governance_state='CANONICAL_VERIFIED',
                  required_authority='DONALDSON',
                  status='RESOLVED',
                  last_error=NULL,
                  updated_at=now()
            WHERE sku=$1
              AND status='PENDING'
              AND governance_state=$2
            RETURNING sku`,
          [item.sku, item.expected_state],
        );
        if (queue.rowCount !== 1) throw new Error(`QUEUE_CAS_FAILED:${item.sku}`);

        const post = updated.rows[0];
        const postGov = post.enrichment_data?.codigo_base_governance || {};
        if (
          normalizeCode(post.codigo_base) !== normalizeCode(item.codigo_base) ||
          postGov.state !== 'CANONICAL_VERIFIED' ||
          postGov.primary_manufacturer_verified !== true ||
          normalizeCode(postGov.approved_codigo_base) !== normalizeCode(item.codigo_base)
        ) {
          throw new Error(`POSTCHECK_FAILED:${item.sku}`);
        }

        report.mutations.governance += 1;
        report.mutations.queue += 1;
        report.mutations.evidence += evidenceInsert.rowCount;
        await db.query('COMMIT');
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    }

    return report;
  } finally {
    await db.end();
  }
}

if (require.main === module) {
  main()
    .then((report) => console.log(JSON.stringify(report, null, 2)))
    .catch((error) => {
      console.error(error.stack || error.message);
      process.exit(1);
    });
}

module.exports = { BATCH, fetchEvidence, main };
