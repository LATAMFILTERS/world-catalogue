'use strict';

/**
 * Evidence-driven historical sanitation worker.
 *
 * This worker NEVER infers manufacturer absence.
 * It only resolves rows when official manufacturer evidence is found.
 * Search-engine HTML may be used only to DISCOVER official Donaldson evidence;
 * the evidence itself must come from shop.donaldson.com or allowlisted Donaldson literature.
 *
 * It does not rename SKU. Alternate arrays are immutable except during a verified
 * canonical promotion, where the promoted code is removed from alternates and the
 * prior base is preserved only when its manufacturer is explicitly proven.
 */

require('dotenv').config();
const crypto = require('crypto');
const { Pool } = require('pg');
const {
  normalizeCode,
  pageSupportsCrossReference,
  pageSupportsOfficialProduct,
} = require('../lib/donaldson-official-evidence');
const {
  canonicalOfficialProductUrl,
  discoveryUrls,
  extractOfficialProductUrls,
} = require('../lib/donaldson-url-discovery');
const {
  assertGovernedCatalogPatch,
} = require('../lib/catalog-write-gateway');

const DATABASE_URL = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

const APPLY = process.argv.includes('--apply');
const RECONCILE_ONLY = process.argv.includes('--reconcile-only');
const limitArg = process.argv.find((v) => v.startsWith('--limit='));
const concurrencyArg = process.argv.find((v) => v.startsWith('--verify-concurrency='));
const rowTimeoutArg = process.argv.find((v) => v.startsWith('--verify-row-timeout-ms='));
const skuArg = process.argv.find((v) => v.startsWith('--sku='));
const TARGET_SKU = skuArg ? String(skuArg.split('=')[1] || '').trim().toUpperCase() || null : null;
const LIMIT = limitArg ? Math.max(1, Math.min(1000, Number(limitArg.split('=')[1]) || 25)) : 25;
const VERIFY_CONCURRENCY = concurrencyArg
  ? Math.max(1, Math.min(8, Number(concurrencyArg.split('=')[1]) || 1))
  : 1;
const VERIFY_ROW_TIMEOUT_MS = rowTimeoutArg
  ? Math.max(5000, Math.min(120000, Number(rowTimeoutArg.split('=')[1]) || 35000))
  : 35000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const TERMINAL_GOVERNANCE_STATES = new Set([
  'CANONICAL_VERIFIED',
  'CANONICAL_VERIFIED_FALLBACK',
  'RETIRED',
  'SUPERSEDED',
]);

const FETCH_HEADERS = {
  'user-agent': 'Mozilla/5.0 (compatible; ELIMFILTERS-Historical-Sanitation/1.1; +https://elimfilters.com)',
  'accept-language': 'en-US,en;q=0.9',
};

function officialProductUrlRegex(code) {
  const escaped = String(code).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`https:\\/\\/shop\\.donaldson\\.com\\/store\\/[a-z]{2}-[a-z]{2}\\/product\\/${escaped}\\/[A-Za-z0-9_-]+`, 'i');
}

async function discoverOfficialDonaldsonUrl(code, externalSignal = null) {
  for (const discoveryUrl of discoveryUrls(code)) {
    if (externalSignal?.aborted) return null;
    const controller = new AbortController();
    const abortFromParent = () => controller.abort();
    externalSignal?.addEventListener('abort', abortFromParent, { once: true });
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(discoveryUrl, { redirect: 'follow', signal: controller.signal, headers: FETCH_HEADERS });
      if (!response.ok) continue;
      const payload = await response.text();
      const [officialUrl] = extractOfficialProductUrls(payload, code);
      if (officialUrl) return officialUrl;
    } catch (_) {
      // Discovery failure is not manufacturer evidence and never becomes absence evidence.
    } finally {
      clearTimeout(timer);
      externalSignal?.removeEventListener('abort', abortFromParent);
    }
  }
  return null;
}

async function fetchOfficialCandidate(candidate, code, externalSignal = null) {
  if (externalSignal?.aborted) {
    return { ok: false, reason: 'VERIFY_ROW_TIMEOUT', url: candidate, html: '', status: null, hash: null };
  }
  const controller = new AbortController();
  const abortFromParent = () => controller.abort();
  externalSignal?.addEventListener('abort', abortFromParent, { once: true });
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(candidate, {
      redirect: 'follow',
      signal: controller.signal,
      headers: FETCH_HEADERS,
    });
    if (!response.ok) {
      return { ok: false, reason: 'OFFICIAL_PRODUCT_FETCH_FAILED', url: candidate, html: '', status: response.status, hash: null };
    }
    const html = await response.text();
    const officialUrl = canonicalOfficialProductUrl(response.url || candidate, code);
    if (!officialUrl || !pageSupportsOfficialProduct(html, code)) {
      return { ok: false, reason: 'OFFICIAL_PRODUCT_PAGE_DID_NOT_VALIDATE', url: response.url || candidate, html, status: response.status, hash: null };
    }
    return {
      ok: true,
      reason: null,
      url: officialUrl,
      html,
      status: response.status,
      hash: crypto.createHash('sha256').update(html).digest('hex'),
    };
  } catch (_) {
    return {
      ok: false,
      reason: externalSignal?.aborted ? 'VERIFY_ROW_TIMEOUT' : 'OFFICIAL_PRODUCT_FETCH_FAILED',
      url: candidate,
      html: '',
      status: null,
      hash: null
    };
  } finally {
    clearTimeout(timer);
    externalSignal?.removeEventListener('abort', abortFromParent);
  }
}

async function fetchOfficialDonaldsonPage(code, externalSignal = null) {
  const encoded = encodeURIComponent(String(code).trim());
  const directCandidates = [
    `https://shop.donaldson.com/store/en-us/product/${encoded}`,
    `https://shop.donaldson.com/store/fr-us/product/${encoded}`,
  ];

  for (const candidate of directCandidates) {
    const result = await fetchOfficialCandidate(candidate, code, externalSignal);
    if (result.ok) return result;
    if (result.reason === 'VERIFY_ROW_TIMEOUT') return result;
  }

  const discovered = await discoverOfficialDonaldsonUrl(code, externalSignal);
  if (externalSignal?.aborted) {
    return { ok: false, reason: 'VERIFY_ROW_TIMEOUT', url: null, html: '', status: null, hash: null };
  }
  if (!discovered) {
    return { ok: false, reason: 'OFFICIAL_URL_DISCOVERY_FAILED', url: null, html: '', status: null, hash: null };
  }
  return fetchOfficialCandidate(discovered, code, externalSignal);
}

function governance(row) {
  return row.enrichment_data?.codigo_base_governance || {};
}

async function reconcileTerminalQueue(client, { apply = false } = {}) {
  const terminalStates = [...TERMINAL_GOVERNANCE_STATES];
  const preview = (await client.query(`
    SELECT
      c.enrichment_data->'codigo_base_governance'->>'state' AS governance_state,
      count(*)::int AS count
    FROM catalog_codigo_base_sanitation_queue q
    JOIN elimfilters_catalog c ON c.sku=q.sku
    WHERE q.status='PENDING'
      AND c.enrichment_data->'codigo_base_governance'->>'state'=ANY($1::text[])
    GROUP BY 1
    ORDER BY 1
  `, [terminalStates])).rows;

  const eligible = preview.reduce((sum, row) => sum + Number(row.count || 0), 0);
  if (!apply || eligible === 0) {
    return { eligible, updated: 0, by_state: preview };
  }

  const updated = Number((await client.query(`
    WITH changed AS (
      UPDATE catalog_codigo_base_sanitation_queue q
      SET current_codigo_base=c.codigo_base,
          governance_state=c.enrichment_data->'codigo_base_governance'->>'state',
          required_authority=COALESCE(
            c.enrichment_data->'codigo_base_governance'->>'required_authority',
            q.required_authority
          ),
          status='RESOLVED',
          last_error=NULL,
          updated_at=now()
      FROM elimfilters_catalog c
      WHERE c.sku=q.sku
        AND q.status='PENDING'
        AND c.enrichment_data->'codigo_base_governance'->>'state'=ANY($1::text[])
      RETURNING q.sku
    )
    SELECT count(*)::int AS n FROM changed
  `, [terminalStates])).rows[0].n);

  if (updated !== eligible) {
    throw new Error(`SANITATION_QUEUE_RECONCILIATION_COUNT_MISMATCH:${updated}!=${eligible}`);
  }

  return { eligible, updated, by_state: preview };
}

async function verifyRow(row, { signal = null } = {}) {
  const gov = governance(row);
  const state = gov.state;

  if (row.duty !== 'HEAVY_DUTY') {
    return { resolved: false, reason: 'UNSUPPORTED_AUTHORITY_WORKER' };
  }

  if (state === 'CANONICAL_EVIDENCED_NOT_VERIFIED') {
    const page = await fetchOfficialDonaldsonPage(row.codigo_base, signal);
    if (!page.ok) {
      return { resolved: false, reason: page.reason || 'OFFICIAL_PRODUCT_VERIFICATION_FAILED' };
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
    let discoveryFailures = 0;

    for (const candidate of candidates) {
      if (signal?.aborted) return { resolved: false, reason: 'VERIFY_ROW_TIMEOUT' };

      const page = await fetchOfficialDonaldsonPage(candidate, signal);
      if (!page.ok) {
        if (page.reason === 'OFFICIAL_URL_DISCOVERY_FAILED') discoveryFailures += 1;
      } else if (pageSupportsCrossReference(page.html, candidate, row.codigo_base)) {
        matches.push({
          candidate,
          url: page.url,
          hash: page.hash,
          evidenceKind: 'OFFICIAL_CROSS_REFERENCE',
          evidenceAuthority: 'OFFICIAL_DONALDSON_SHOP',
        });
      }

      await sleep(250);
    }

    if (matches.length !== 1) {
      let reason = 'NO_OFFICIAL_CROSS_REFERENCE_MATCH';
      if (matches.length > 1) reason = 'MULTIPLE_OFFICIAL_CROSS_REFERENCE_MATCHES';
      else if (candidates.length && discoveryFailures === candidates.length) reason = 'OFFICIAL_URL_DISCOVERY_FAILED';
      return { resolved: false, reason, verifiedMatches: matches.map((m) => m.candidate) };
    }

    return {
      resolved: true,
      approvedCodigoBase: matches[0].candidate,
      evidenceKind: matches[0].evidenceKind || 'OFFICIAL_CROSS_REFERENCE',
      evidenceAuthority: matches[0].evidenceAuthority || 'OFFICIAL_DONALDSON_SHOP',
      evidenceUrl: matches[0].url,
      evidenceHash: matches[0].hash,
      evidenceDocumentId: matches[0].evidenceDocumentId || null,
      evidenceHashKind: matches[0].evidenceHashKind || null,
      replacedReferenceManufacturer: matches[0].replacedReferenceManufacturer || null,
      sourceCurrentBase: false,
    };
  }

  return { resolved: false, reason: 'STATE_REQUIRES_DIFFERENT_VERIFICATION_PATH' };
}

async function verifyRowWithTimeout(row, timeoutMs = VERIFY_ROW_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const result = await verifyRow(row, { signal: controller.signal });
    if (controller.signal.aborted && !result.resolved) {
      return { resolved: false, reason: 'VERIFY_ROW_TIMEOUT' };
    }
    return result;
  } finally {
    clearTimeout(timer);
  }
}

function buildCanonicalPromotionAlternates(current, resolution) {
  const approved = normalizeCode(resolution.approvedCodigoBase);
  const previous = normalizeCode(current.codigo_base);
  const oemCodes = Array.isArray(current.oem_codes) ? current.oem_codes : [];
  const competitorCodes = Array.isArray(current.competitor_codes) ? current.competitor_codes : [];

  const cleanOem = oemCodes.filter((item) => normalizeCode(item?.code || item?.reference) !== approved);
  const cleanCompetitors = competitorCodes.filter((item) => normalizeCode(item?.code || item?.reference) !== approved);

  if (!resolution.sourceCurrentBase && previous && previous !== approved && resolution.replacedReferenceManufacturer) {
    const exists = [...cleanOem, ...cleanCompetitors].some(
      (item) => normalizeCode(item?.code || item?.reference) === previous
    );
    if (!exists) {
      cleanCompetitors.push({
        code: current.codigo_base,
        manufacturer: String(resolution.replacedReferenceManufacturer).trim().toUpperCase(),
      });
    }
  }

  return {
    oem_codes: cleanOem,
    competitor_codes: cleanCompetitors,
    mutated:
      JSON.stringify(oemCodes) !== JSON.stringify(cleanOem) ||
      JSON.stringify(competitorCodes) !== JSON.stringify(cleanCompetitors),
  };
}

async function applyResolution(client, row, resolution) {
  const lockedResult = await client.query(
    'SELECT * FROM elimfilters_catalog WHERE sku=$1 FOR UPDATE',
    [row.sku]
  );
  if (lockedResult.rowCount !== 1) throw new Error(`SANITATION_TARGET_NOT_UNIQUE:${row.sku}`);
  const current = lockedResult.rows[0];
  if (normalizeCode(current.codigo_base) !== normalizeCode(row.codigo_base)) {
    throw new Error(`SANITATION_STALE_CODIGO_BASE:${row.sku}:${current.codigo_base}!=${row.codigo_base}`);
  }

  const now = new Date().toISOString();
  const evidencePatch = {
    policy_version: '2026-08-19-v3.1',
    state: 'CANONICAL_VERIFIED',
    required_authority: 'DONALDSON',
    primary_manufacturer_verified: true,
    approved_manufacturer: 'DONALDSON',
    approved_codigo_base: resolution.approvedCodigoBase,
    evidence_authority: resolution.evidenceAuthority || 'OFFICIAL_DONALDSON_SHOP',
    evidence_kind: resolution.evidenceKind,
    evidence_url: resolution.evidenceUrl,
    evidence_hash: resolution.evidenceHash,
    verified_at: now,
  };
  const currentData = current.enrichment_data && typeof current.enrichment_data === 'object' && !Array.isArray(current.enrichment_data)
    ? current.enrichment_data
    : {};
  const currentGov = currentData.codigo_base_governance && typeof currentData.codigo_base_governance === 'object' && !Array.isArray(currentData.codigo_base_governance)
    ? currentData.codigo_base_governance
    : {};
  const nextData = {
    ...currentData,
    codigo_base_governance: { ...currentGov, ...evidencePatch },
  };
  const alternatePromotion = buildCanonicalPromotionAlternates(current, resolution);
  const patch = {
    codigo_base: resolution.approvedCodigoBase,
    enrichment_data: nextData,
    oem_codes: alternatePromotion.oem_codes,
    competitor_codes: alternatePromotion.competitor_codes,
  };
  const gateway = assertGovernedCatalogPatch(current, patch);

  await client.query(`
    INSERT INTO catalog_codigo_base_evidence (
      sku, evidence_kind, authority, manufacturer, reference_code,
      normalized_reference, source_url, evidence_hash, verified_at, metadata
    ) VALUES ($1,$2,$3,'DONALDSON',$4,$5,$6,$7,$8,$9::jsonb)
    ON CONFLICT DO NOTHING
  `, [
    row.sku,
    resolution.evidenceKind,
    resolution.evidenceAuthority || 'OFFICIAL_DONALDSON_SHOP',
    resolution.approvedCodigoBase,
    normalizeCode(resolution.approvedCodigoBase),
    resolution.evidenceUrl,
    resolution.evidenceHash,
    now,
    JSON.stringify({
      prior_codigo_base: row.codigo_base,
      source_current_base: resolution.sourceCurrentBase,
      evidence_document_id: resolution.evidenceDocumentId || null,
      evidence_hash_kind: resolution.evidenceHashKind || null,
    }),
  ]);

  const updated = await client.query(`
    UPDATE elimfilters_catalog
    SET enrichment_data=$1::jsonb,
        codigo_base=$2,
        oem_codes=$3::jsonb,
        competitor_codes=$4::jsonb
    WHERE sku=$5
      AND codigo_base IS NOT DISTINCT FROM $6
    RETURNING sku,codigo_base,oem_codes,competitor_codes,enrichment_data
  `, [
    JSON.stringify(nextData),
    resolution.approvedCodigoBase,
    JSON.stringify(alternatePromotion.oem_codes),
    JSON.stringify(alternatePromotion.competitor_codes),
    row.sku,
    current.codigo_base,
  ]);
  if (updated.rowCount !== 1) throw new Error(`SANITATION_COMPARE_AND_SWAP_FAILED:${row.sku}`);

  const post = updated.rows[0];
  const postGov = post.enrichment_data?.codigo_base_governance || {};
  if (normalizeCode(post.codigo_base) !== normalizeCode(resolution.approvedCodigoBase) ||
      postGov.state !== 'CANONICAL_VERIFIED' ||
      normalizeCode(postGov.approved_codigo_base) !== normalizeCode(resolution.approvedCodigoBase)) {
    throw new Error(`SANITATION_POSTCHECK_FAILED:${row.sku}`);
  }

  const postAlternateCodes = [
    ...(Array.isArray(post.oem_codes) ? post.oem_codes : []),
    ...(Array.isArray(post.competitor_codes) ? post.competitor_codes : []),
  ].map((item) => normalizeCode(item?.code || item?.reference)).filter(Boolean);
  if (postAlternateCodes.includes(normalizeCode(resolution.approvedCodigoBase))) {
    throw new Error(`SANITATION_POSTCHECK_CANONICAL_DUPLICATED:${row.sku}`);
  }
  if (!resolution.sourceCurrentBase && resolution.replacedReferenceManufacturer &&
      normalizeCode(row.codigo_base) !== normalizeCode(resolution.approvedCodigoBase) &&
      !postAlternateCodes.includes(normalizeCode(row.codigo_base))) {
    throw new Error(`SANITATION_POSTCHECK_PRIOR_BASE_NOT_PRESERVED:${row.sku}`);
  }

  const queue = await client.query(`
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
      AND status='PENDING'
    RETURNING sku
  `, [resolution.approvedCodigoBase, row.sku]);
  if (queue.rowCount !== 1) throw new Error(`SANITATION_QUEUE_COMPARE_AND_SWAP_FAILED:${row.sku}`);

  return { gateway, post, alternatePromotion };
}

async function runHistoricalSanitationBatch({
  apply = APPLY,
  limit = LIMIT,
  reconcileOnly = RECONCILE_ONLY,
  verifyConcurrency = VERIFY_CONCURRENCY,
  verifyRowTimeoutMs = VERIFY_ROW_TIMEOUT_MS,
  targetSku = TARGET_SKU,
} = {}) {
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
    gateway_validated: 0,
    verify_concurrency: verifyConcurrency,
    verify_row_timeout_ms: verifyRowTimeoutMs,
    target_sku: targetSku,
    queue_reconciliation: { eligible: 0, updated: 0, by_state: [] },
    details: [],
  };

  try {
    if (apply) {
      await client.query('BEGIN');
      try {
        summary.queue_reconciliation = await reconcileTerminalQueue(client, { apply: true });
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    } else {
      summary.queue_reconciliation = await reconcileTerminalQueue(client, { apply: false });
    }

    if (reconcileOnly) return summary;

    const { rows } = await client.query(`
      SELECT c.sku, c.codigo_base, c.duty, c.enrichment_data
      FROM catalog_codigo_base_sanitation_queue q
      JOIN elimfilters_catalog c ON c.sku=q.sku
      WHERE q.status='PENDING'
        AND q.attempts < 3
        AND c.duty='HEAVY_DUTY'
        AND c.enrichment_data->'codigo_base_governance'->>'state'
            IN ('CANONICAL_EVIDENCED_NOT_VERIFIED','REVIEW_PRIMARY_CANDIDATE')
        AND ($2::text IS NULL OR q.sku=$2)
      ORDER BY q.priority, q.attempts, q.sku
      LIMIT $1
    `, [limit, targetSku]);

    summary.selected = rows.length;

    const concurrency = Math.max(1, Math.min(8, Number(verifyConcurrency) || 1));
    for (let offset = 0; offset < rows.length; offset += concurrency) {
      const chunk = rows.slice(offset, offset + concurrency);
      const verifiedChunk = await Promise.all(chunk.map(async (row) => ({
        row,
        resolution: await verifyRowWithTimeout(row, verifyRowTimeoutMs),
      })));

      for (const { row, resolution } of verifiedChunk) {
        if (!resolution.resolved) {
          summary.unresolved += 1;
          summary.details.push({ sku: row.sku, status: 'UNRESOLVED', reason: resolution.reason });
          if (apply) {
            await client.query(`
              UPDATE catalog_codigo_base_sanitation_queue
              SET attempts=attempts+1,last_attempt_at=now(),last_error=$1,updated_at=now()
              WHERE sku=$2
                AND status='PENDING'
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
            const applied = await applyResolution(client, row, resolution);
            if (applied?.gateway?.valid === true) summary.gateway_validated += 1;
            if (applied?.alternatePromotion?.mutated === true) summary.alternate_columns_mutated += 1;
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
  officialProductUrlRegex,
  discoverOfficialDonaldsonUrl,
  fetchOfficialCandidate,
  fetchOfficialDonaldsonPage,
  reconcileTerminalQueue,
  verifyRow,
  verifyRowWithTimeout,
  applyResolution,
  runHistoricalSanitationBatch,
};
