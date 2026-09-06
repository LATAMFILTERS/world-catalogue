'use strict';

const { withProtocolClient } = require('./bot-protocol-db');

const RESOLVER_VIEW = 'v_api_resolver_v7';
const RESOLVED_STATUSES = new Set([
  'RESOLVED_SINGLE',
  'RESOLVED_CANONICAL',
  'RESOLVED_CANONICAL_BASE'
]);

const SELECT_FIELDS = `id, sku, codigo_base, name, description, duty, filter_type, sub_type, technology,
  thread_size, height_mm, outer_diameter_mm, gasket_od_mm, gasket_id_mm,
  micron_rating, nominal_efficiency, filter_media, oem_codes,
  competitor_codes, brand_crossrefs, equipment_applications, specs,
  enrichment_data, is_primary`;

function normalizeReference(value) {
  return String(value || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

function normalizeProduct(row = {}) {
  return {
    ...row,
    oem_codes: row.oem_codes || [],
    competitor_codes: row.competitor_codes || [],
    brand_crossrefs: row.brand_crossrefs || {},
    equipment_applications: row.equipment_applications || [],
    specs: row.specs || {},
    enrichment_data: row.enrichment_data || {}
  };
}

function uniqueBySku(rows = []) {
  const seen = new Set();
  const out = [];
  for (const row of rows) {
    const sku = normalizeReference(row?.sku);
    if (!sku || seen.has(sku)) continue;
    seen.add(sku);
    out.push(row);
  }
  return out;
}

function resolverRowsForReference(rows, reference) {
  const target = normalizeReference(reference);
  return rows.filter(row => normalizeReference(row.code) === target && RESOLVED_STATUSES.has(String(row.status || '').toUpperCase()));
}

async function fetchCatalogProducts(client, skus) {
  const normalizedSkus = [...new Set((skus || []).map(normalizeReference).filter(Boolean))];
  if (!normalizedSkus.length) return [];
  const result = await client.query(
    `SELECT ${SELECT_FIELDS}
       FROM elimfilters_catalog c
      WHERE upper(regexp_replace(coalesce(c.sku, ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
      ORDER BY is_primary DESC NULLS LAST, sku ASC`,
    [normalizedSkus]
  );
  return result.rows.map(normalizeProduct);
}

async function fetchInternalSkuMatches(client, references) {
  const normalized = [...new Set((references || []).map(normalizeReference).filter(Boolean))];
  if (!normalized.length) return [];
  const result = await client.query(
    `SELECT ${SELECT_FIELDS}
       FROM elimfilters_catalog c
      WHERE upper(regexp_replace(coalesce(c.sku, ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
      ORDER BY is_primary DESC NULLS LAST, sku ASC`,
    [normalized]
  );
  return result.rows.map(normalizeProduct).map(product => ({
    ...product,
    protocol_source_brand: 'ELIMFILTERS',
    protocol_resolved_reference: product.sku,
    protocol_resolver_status: 'RESOLVED_INTERNAL_SKU',
    protocol_resolver_score: 1000
  }));
}

async function resolveReferenceAuthority(references) {
  const normalized = [...new Set((references || []).map(normalizeReference).filter(Boolean))];
  if (!normalized.length) return { lookupStatus: 'not_required', products: [], resolverRows: [] };

  try {
    return await withProtocolClient(async client => {
      const resolverResult = await client.query(
        `SELECT code, sku, manufacturer, score, status
           FROM ${RESOLVER_VIEW}
          WHERE upper(regexp_replace(coalesce(code, ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
            AND status = ANY($2::text[])
          ORDER BY score DESC NULLS LAST, sku ASC, manufacturer ASC`,
        [normalized, [...RESOLVED_STATUSES]]
      );

      const resolverRows = resolverResult.rows || [];
      const resolved = [];
      for (const reference of normalized) {
        resolved.push(...resolverRowsForReference(resolverRows, reference));
      }

      if (!resolved.length) {
        const internal = await fetchInternalSkuMatches(client, normalized);
        if (!internal.length) {
          return {
            lookupStatus: 'not_found',
            products: [],
            resolverRows: [],
            authoritySource: RESOLVER_VIEW
          };
        }
        const uniqueInternal = uniqueBySku(internal);
        if (uniqueInternal.length > 1) {
          return {
            lookupStatus: 'ambiguous',
            products: [],
            resolverRows: [],
            authoritySource: 'elimfilters_catalog.sku'
          };
        }
        return {
          lookupStatus: 'validated',
          products: uniqueInternal,
          resolverRows: [],
          authoritySource: 'elimfilters_catalog.sku'
        };
      }

      const distinctSkuRows = uniqueBySku(resolved);
      if (distinctSkuRows.length > 1) {
        return {
          lookupStatus: 'ambiguous',
          products: [],
          resolverRows: resolved,
          authoritySource: RESOLVER_VIEW
        };
      }

      const winner = distinctSkuRows[0];
      const products = await fetchCatalogProducts(client, [winner.sku]);
      if (products.length !== 1) {
        return {
          lookupStatus: products.length > 1 ? 'ambiguous' : 'database_unavailable',
          products: [],
          resolverRows: resolved,
          authoritySource: RESOLVER_VIEW
        };
      }

      const product = products[0];
      const reference = resolved[0]?.code || normalized[0];
      const manufacturer = resolved[0]?.manufacturer || null;
      const augmented = {
        ...product,
        // Preserve raw catalog data separately. codigo_base is not treated as an
        // ELIMFILTERS identifier when the governed resolver says the searched
        // code belongs to an external manufacturer.
        protocol_catalog_codigo_base: product.codigo_base,
        codigo_base: normalizeReference(product.codigo_base) === normalizeReference(reference) && manufacturer
          ? null
          : product.codigo_base,
        competitor_codes: manufacturer && String(manufacturer).toUpperCase() !== 'ELIMFILTERS'
          ? [{ manufacturer, code: reference }, ...(product.competitor_codes || [])]
          : (product.competitor_codes || []),
        protocol_source_brand: manufacturer,
        protocol_resolved_reference: reference,
        protocol_resolver_status: resolved[0]?.status || null,
        protocol_resolver_score: resolved[0]?.score ?? null
      };

      return {
        lookupStatus: 'validated',
        products: [augmented],
        resolverRows: resolved,
        authoritySource: RESOLVER_VIEW
      };
    }, { statementTimeoutMs: 10000 });
  } catch (error) {
    console.error('[bot-protocol-reference-authority]', error.message);
    return {
      lookupStatus: 'database_unavailable',
      products: [],
      resolverRows: [],
      authoritySource: RESOLVER_VIEW,
      error: error.message
    };
  }
}

module.exports = {
  RESOLVER_VIEW,
  RESOLVED_STATUSES,
  normalizeReference,
  resolveReferenceAuthority
};
