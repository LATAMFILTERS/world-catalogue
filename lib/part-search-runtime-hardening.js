'use strict';

// Runtime hardening for Part Search.
// Exact PART NUMBER searches are fail-closed: only a directly certified
// ELIMFILTERS SKU or a single certified v7 canonical/reference resolution
// may reach the legacy catalogue search handler. This prevents fuzzy legacy
// matches from surfacing an unverified Light Duty base code.

const pg = require('pg');
const express = require('express');
const {
  applyGovernanceToSearchBody,
  governedDutyForReference,
  governanceForReferences,
} = require('./part-search-reference-governance-patch');

const REWRITES = [
  [
    /UPPER\(REPLACE\(sku,'-',''\)\) = \$1/g,
    "upper(regexp_replace(coalesce(sku, ''), '[^A-Z0-9]', '', 'g')) = $1",
  ],
  [
    /UPPER\(REPLACE\(codigo_base,'-',''\)\) = \$1/g,
    "upper(regexp_replace(coalesce(codigo_base, ''), '[^A-Z0-9]', '', 'g')) = $1",
  ],
  [
    /UPPER\(REPLACE\(sku,'-',''\)\) LIKE \$1/g,
    "upper(regexp_replace(coalesce(sku, ''), '[^A-Z0-9]', '', 'g')) LIKE $1",
  ],
  [
    /UPPER\(REPLACE\(codigo_base,'-',''\)\) LIKE \$1/g,
    "upper(regexp_replace(coalesce(codigo_base, ''), '[^A-Z0-9]', '', 'g')) LIKE $1",
  ],
];

function rewriteSql(input) {
  if (typeof input !== 'string') return input;
  let sql = input;
  for (const [pattern, replacement] of REWRITES) sql = sql.replace(pattern, replacement);
  return sql;
}

function patchQueryable(proto) {
  if (!proto || proto.__elimPartSearchNormalizedQueryPatch) return;
  const originalQuery = proto.query;
  if (typeof originalQuery !== 'function') return;

  Object.defineProperty(proto, '__elimPartSearchNormalizedQueryPatch', {
    value: true,
    enumerable: false,
  });

  proto.query = function patchedQuery(config, values, callback) {
    if (typeof config === 'string') {
      return originalQuery.call(this, rewriteSql(config), values, callback);
    }
    if (config && typeof config === 'object' && typeof config.text === 'string') {
      config = { ...config, text: rewriteSql(config.text) };
    }
    return originalQuery.call(this, config, values, callback);
  };
}

patchQueryable(pg.Client && pg.Client.prototype);
patchQueryable(pg.Pool && pg.Pool.prototype);

let strictPool = null;
function getStrictPool() {
  if (strictPool) return strictPool;
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  strictPool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 2,
  });
  return strictPool;
}

function normalizePart(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 64);
}

function filterResolvedSku(body, allowedSku) {
  if (!body || typeof body !== 'object' || !allowedSku) return body;
  const copy = Array.isArray(body) ? body.slice() : { ...body };
  for (const key of ['results', 'candidates', 'products']) {
    if (Array.isArray(copy[key])) {
      copy[key] = copy[key].filter((row) => String(row?.sku || row?.elimfilters_sku || '') === allowedSku);
    }
  }
  return copy;
}

const originalGet = express.application.get;
if (!express.application.__elimPartSearchSearchAuditPatch) {
  Object.defineProperty(express.application, '__elimPartSearchSearchAuditPatch', {
    value: true,
    enumerable: false,
  });

  express.application.get = function patchedGet(path, ...handlers) {
    if (path !== '/api/search') return originalGet.call(this, path, ...handlers);

    const audit = async (req, res, next) => {
      const startedAt = Date.now();
      const raw = String(req.query?.q || req.query?.sku || '').trim();
      const q = normalizePart(raw);
      const mode = String(req.query?.mode || '').trim().toLowerCase();
      const strictPartMode = mode === 'part' || mode === 'part_number' || mode === 'part-number';
      const governedDuty = governedDutyForReference(raw, req.query?.duty);
      if (governedDuty) req.query.duty = governedDuty;
      let source = 'unknown';
      let resultCount = null;
      let allowedSku = null;

      try {
        if (strictPartMode && q) {
          const resolved = await getStrictPool().query(`
            WITH direct_sku AS (
              SELECT c.sku::text AS sku, 'DIRECT_SKU'::text AS source
              FROM public.elimfilters_catalog c
              JOIN public.catalog_sku_certification cert ON cert.sku=c.sku
              WHERE cert.certification_state='CERTIFIED'
                AND upper(regexp_replace(coalesce(c.sku,''), '[^A-Z0-9]', '', 'g'))=$1
            ), canonical_reference AS (
              SELECT DISTINCT v.sku::text AS sku, 'V7_CANONICAL'::text AS source
              FROM public.v_api_resolver_v7 v
              JOIN public.catalog_sku_certification cert ON cert.sku=v.sku
              WHERE cert.certification_state='CERTIFIED'
                AND v.code=$1
            )
            SELECT DISTINCT sku, source
            FROM (
              SELECT * FROM direct_sku
              UNION ALL
              SELECT * FROM canonical_reference
            ) x
          `, [q]);

          const skus = [...new Set(resolved.rows.map((row) => row.sku))];
          if (skus.length !== 1) {
            source = skus.length > 1 ? 'strict_canonical_ambiguous' : 'strict_canonical_unverified';
            return res.status(200).json({
              success: true,
              source,
              resolution: skus.length > 1 ? 'AMBIGUOUS' : 'EVIDENCE_REQUIRED',
              results: [],
              candidates: [],
              products: [],
              mixed_duty: false,
              normalized_reference: q,
              reference_review_required: true,
              duty_clarification_required: false,
            });
          }
          allowedSku = skus[0];
        }
      } catch (error) {
        console.error('[part-search-strict-canonical-guard] lookup failed', error.message);
        return res.status(503).json({
          success: false,
          source: 'strict_canonical_guard_error',
          resolution: 'UNAVAILABLE',
          results: [],
          candidates: [],
          products: [],
        });
      }

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        let governedBody = applyGovernanceToSearchBody(body, raw);
        if (strictPartMode && allowedSku) governedBody = filterResolvedSku(governedBody, allowedSku);
        if (governedBody && typeof governedBody === 'object') {
          if (typeof governedBody.source === 'string') source = governedBody.source;
          if (Array.isArray(governedBody.results)) resultCount = governedBody.results.length;
          else if (Array.isArray(governedBody.candidates)) resultCount = governedBody.candidates.length;
          else if (Array.isArray(governedBody.products)) resultCount = governedBody.products.length;
        }
        return originalJson(governedBody);
      };

      res.once('finish', () => {
        console.log(
          `[part-search-query] q=${q || '-'} status=${res.statusCode} source=${source}` +
          ` results=${resultCount == null ? '-' : resultCount} ms=${Date.now() - startedAt}`
        );
      });

      governanceForReferences([raw, q]);
      next();
    };

    return originalGet.call(this, path, audit, ...handlers);
  };
}

console.log('[part-search-runtime] strict certified canonical PART NUMBER guard + normalized lookup enabled');
