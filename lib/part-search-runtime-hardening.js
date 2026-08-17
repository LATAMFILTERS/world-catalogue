'use strict';

// Runtime hardening for Part Search.
// Keeps the production route behavior intact while ensuring exact SKU/base
// lookups use the same normalization expression as migration 066 indexes.
// Also adds one concise log line per /api/search request so production
// failures can be diagnosed from Render without exposing response payloads.

const pg = require('pg');
const express = require('express');

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

const originalGet = express.application.get;
if (!express.application.__elimPartSearchSearchAuditPatch) {
  Object.defineProperty(express.application, '__elimPartSearchSearchAuditPatch', {
    value: true,
    enumerable: false,
  });

  express.application.get = function patchedGet(path, ...handlers) {
    if (path !== '/api/search') return originalGet.call(this, path, ...handlers);

    const audit = (req, res, next) => {
      const startedAt = Date.now();
      const raw = String(req.query?.q || req.query?.sku || '').trim();
      const q = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 64);
      let source = 'unknown';
      let resultCount = null;

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (body && typeof body === 'object') {
          if (typeof body.source === 'string') source = body.source;
          if (Array.isArray(body.results)) resultCount = body.results.length;
          else if (Array.isArray(body.candidates)) resultCount = body.candidates.length;
        }
        return originalJson(body);
      };

      res.once('finish', () => {
        console.log(
          `[part-search-query] q=${q || '-'} status=${res.statusCode} source=${source}` +
          ` results=${resultCount == null ? '-' : resultCount} ms=${Date.now() - startedAt}`
        );
      });
      next();
    };

    return originalGet.call(this, path, audit, ...handlers);
  };
}

console.log('[part-search-runtime] normalized exact lookup + request audit enabled');
