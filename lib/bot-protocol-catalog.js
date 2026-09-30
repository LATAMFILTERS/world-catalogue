'use strict';

const { withProtocolClient } = require('./bot-protocol-db');

const MAX_RESULTS = 8;
const CROSSREF_CANDIDATE_LIMIT_PER_REFERENCE = 40;
const APPLICATION_CANDIDATE_LIMIT = 32;

async function withCatalogReadRetry(callback, primaryTimeoutMs) {
  try {
    return await withProtocolClient(callback, { statementTimeoutMs: primaryTimeoutMs });
  } catch (error) {
    if (error?.code !== '57014') throw error;
    console.warn('[bot-protocol-catalog] read timeout during startup load; retrying once');
    return withProtocolClient(callback, { statementTimeoutMs: 30000 });
  }
}

const RACOR_TURBINE_COMPATIBILITY = Object.freeze({
  '500FG': '2010',
  '500FH': '2010',
  '900FG': '2040',
  '900FH': '2040',
  '1000FG': '2020',
  '1000FH': '2020'
});

const SELECT_FIELDS = `id, sku, codigo_base, name, description, duty, filter_type, sub_type, technology,
  thread_size, height_mm, outer_diameter_mm, gasket_od_mm, gasket_id_mm,
  micron_rating, nominal_efficiency, filter_media, oem_codes,
  competitor_codes, brand_crossrefs, equipment_applications, vehicle_applications, specs,
  enrichment_data, is_primary`;

const YEAR_PATTERN = /^(?:19[8-9]\d|20[0-3]\d)$/;
const CODE_FIELD_NAMES = new Set([
  'code', 'reference', 'part_number', 'partnumber', 'partno',
  'oem_code', 'oemcode', 'cross_reference', 'crossreference'
]);

function normalizeReference(value) {
  return String(value || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

function extractReferences(text) {
  const source = String(text || '').toUpperCase();
  const years = new Set(source.match(/\b(?:19[8-9]\d|20[0-3]\d)\b/g) || []);
  const alphanumeric = source.match(/\b(?=[A-Z0-9./-]{4,}\b)(?=[A-Z0-9./-]*[A-Z])(?=[A-Z0-9./-]*\d)[A-Z0-9]+(?:[-/.][A-Z0-9]+)*\b/g) || [];
  const numeric = source.match(/\b(?:\d{2,}(?:[-/]\d{2,})+|\d{5,15})\b/g) || [];

  return [...new Set(
    [...alphanumeric, ...numeric]
      .map(normalizeReference)
      .filter(ref => ref.length >= 4 && !years.has(ref) && !YEAR_PATTERN.test(ref))
  )].slice(0, 8);
}

function normalizeProduct(row) {
  return {
    ...row,
    oem_codes: row.oem_codes || [],
    competitor_codes: row.competitor_codes || [],
    brand_crossrefs: row.brand_crossrefs || {},
    equipment_applications: row.equipment_applications || [],
    vehicle_applications: row.vehicle_applications || [],
    specs: row.specs || {},
    enrichment_data: row.enrichment_data || {}
  };
}

function legacyDelimitedCode(value) {
  const text = String(value || '').trim();
  const pipeIndex = text.indexOf('|');
  if (pipeIndex >= 0) return text.slice(pipeIndex + 1).trim();
  return text;
}

function collectReferenceCodes(value, output = []) {
  if (value == null) return output;

  if (typeof value === 'string' || typeof value === 'number') {
    const code = legacyDelimitedCode(value);
    if (code) output.push(code);
    return output;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectReferenceCodes(item, output);
    return output;
  }

  if (typeof value !== 'object') return output;

  for (const [key, item] of Object.entries(value)) {
    const normalizedKey = key.replace(/[^a-z0-9]/gi, '').toLowerCase();
    if (CODE_FIELD_NAMES.has(normalizedKey)) {
      collectReferenceCodes(item, output);
      continue;
    }

    if (Array.isArray(item) || (item && typeof item === 'object')) {
      collectReferenceCodes(item, output);
    }
  }

  return output;
}

function codesFromJsonArray(value) {
  if (!Array.isArray(value)) return [];
  return collectReferenceCodes(value, []);
}

function codesFromJsonObject(value) {
  if (!value || Array.isArray(value) || typeof value !== 'object') return [];
  return collectReferenceCodes(value, []);
}

function productReferenceSet(product) {
  return new Set([
    product.sku,
    product.codigo_base,
    ...codesFromJsonArray(product.oem_codes),
    ...codesFromJsonArray(product.competitor_codes),
    ...codesFromJsonObject(product.brand_crossrefs)
  ].map(normalizeReference).filter(Boolean));
}

function exactReferenceMatch(product, references) {
  const available = productReferenceSet(product);
  return references.some(reference => available.has(normalizeReference(reference)));
}

function dedupeProducts(products) {
  const seen = new Set();
  return products.filter(product => {
    const key = String(product.id || product.sku || product.codigo_base || '').toUpperCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function referenceContainmentPayloads(reference) {
  const fields = ['code', 'reference', 'part_number', 'partNumber', 'partno', 'oem_code', 'oemCode', 'cross_reference', 'crossReference'];
  return fields.map(field => JSON.stringify([{ [field]: reference }]));
}

async function crossReferenceCandidatesFor(client, reference) {
  const normalizedReference = normalizeReference(reference);
  if (!normalizedReference) return [];

  const payloads = referenceContainmentPayloads(normalizedReference);
  const result = await client.query(
    `SELECT ${SELECT_FIELDS}, 'cross_reference'::text AS protocol_match_type
       FROM elimfilters_catalog c
      WHERE c.oem_codes @> ANY($1::jsonb[])
         OR c.competitor_codes @> ANY($1::jsonb[])
      ORDER BY is_primary DESC NULLS LAST, sku ASC
      LIMIT ${CROSSREF_CANDIDATE_LIMIT_PER_REFERENCE}`,
    [payloads]
  );
  return result.rows.map(normalizeProduct);
}

async function searchByReferences(references) {
  const normalized = [...new Set((references || []).map(normalizeReference).filter(Boolean))];
  if (!normalized.length) return { products: [], lookupStatus: 'not_required' };

  try {
    const products = await withProtocolClient(async client => {
      const direct = await client.query(
        `SELECT ${SELECT_FIELDS}, 'direct_reference'::text AS protocol_match_type
           FROM elimfilters_catalog c
          WHERE upper(regexp_replace(coalesce(c.sku, ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
             OR upper(regexp_replace(coalesce(c.codigo_base, ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
          ORDER BY is_primary DESC NULLS LAST, sku ASC
          LIMIT ${MAX_RESULTS * 2}`,
        [normalized]
      );

      const candidateGroups = [];
      for (const reference of normalized) {
        candidateGroups.push(await crossReferenceCandidatesFor(client, reference));
      }

      return dedupeProducts([
        ...direct.rows.map(normalizeProduct),
        ...candidateGroups.flat()
      ])
        .filter(product => exactReferenceMatch(product, normalized))
        .slice(0, MAX_RESULTS);
    }, { statementTimeoutMs: 30000 });

    const matchTypes = [...new Set(products.map(product => product.protocol_match_type).filter(Boolean))];
    return {
      products,
      lookupStatus: 'completed',
      matchType: matchTypes.length > 1 ? 'mixed_reference' : matchTypes[0] || null
    };
  } catch (error) {
    console.error('[bot-protocol-catalog] reference lookup failed', error.message);
    return { products: [], lookupStatus: 'error', error: error.message };
  }
}

function strongestApplicationToken(tokens) {
  return [...tokens].sort((a, b) => {
    const aScore = /\d/.test(a) ? a.length + 20 : a.length;
    const bScore = /\d/.test(b) ? b.length + 20 : b.length;
    return bScore - aScore;
  })[0] || null;
}

function applicationText(product) {
  return JSON.stringify([
    ...(product.equipment_applications || []),
    ...(product.vehicle_applications || [])
  ]).toUpperCase();
}

function normalizeApplicationYear(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n >= 1900 && n <= 2039) return n;
  if (n >= 0 && n <= 99) return n <= 39 ? 2000 + n : 1900 + n;
  return null;
}

function applicationYearValueMatches(value, year) {
  if (value == null) return false;
  if (typeof value === 'number') return normalizeApplicationYear(value) === year;
  const text = String(value).trim();
  if (/^\d{2,4}$/.test(text)) return normalizeApplicationYear(text) === year;
  const range = text.match(/^(\d{2,4})\s*[-/]\s*(\d{2,4})$/);
  if (!range) return false;
  const a = normalizeApplicationYear(range[1]);
  const b = normalizeApplicationYear(range[2]);
  if (!a || !b) return false;
  return year >= Math.min(a, b) && year <= Math.max(a, b);
}

function applicationYearMatches(product, year) {
  if (!year) return true;
  const apps = [...(product.equipment_applications || []), ...(product.vehicle_applications || [])];
  return apps.some(app => {
    if (!app || typeof app !== 'object') return applicationYearValueMatches(app, year);
    if (applicationYearValueMatches(app.year, year)) return true;
    const from = normalizeApplicationYear(app.year_from ?? app.start_year ?? app.yearStart);
    const to = normalizeApplicationYear(app.year_to ?? app.end_year ?? app.yearEnd);
    return Boolean(from && to && year >= Math.min(from, to) && year <= Math.max(from, to));
  });
}

function applicationMatches(product, terms, year) {
  const haystack = applicationText(product);
  const normalizedTerms = terms.map(term => String(term).toUpperCase());
  if (!normalizedTerms.every(term => haystack.includes(term))) return false;
  return applicationYearMatches(product, year);
}

const SYSTEM_FILTER_TYPE_PATTERNS = {
  oil: /\b(oil|lube|lubricant)\b/i,
  fuel: /\bfuel\b/i,
  coolant: /\bcoolant\b/i,
  hydraulic: /\bhydraulic\b/i,
  air: /\bair\b/i
};

function filterTypeMatchesSystem(filterType, system) {
  if (!system) return true;
  const pattern = SYSTEM_FILTER_TYPE_PATTERNS[system];
  if (!pattern) return true;
  const type = String(filterType || '');
  if (system === 'air' && /cabin/i.test(type)) return false;
  return pattern.test(type);
}

async function searchValidatedMaintenanceKit(brand, model, year) {
  if (!brand || !model || !year) return { products: [], lookupStatus: 'not_required', kit: null, ambiguous: false };

  try {
    return await withCatalogReadRetry(async client => {
      const kitResult = await client.query(
        `SELECT kit_sku, name AS kit_name, equipment_ref
           FROM maintenance_kits
          WHERE brand = $1
          ORDER BY kit_sku`,
        [brand]
      );

      const targetModel = String(model).toUpperCase();
      const targetYear = String(year);
      const matchingKits = kitResult.rows.filter(row => {
        const equipmentRef = String(row.equipment_ref || '').toUpperCase();
        return equipmentRef.includes(targetModel) && equipmentRef.includes(targetYear);
      });

      if (!matchingKits.length) {
        return { products: [], lookupStatus: 'completed', kit: null, ambiguous: false };
      }

      if (matchingKits.length > 1) {
        return {
          products: [],
          lookupStatus: 'completed',
          kit: null,
          ambiguous: true,
          kits: matchingKits.map(row => row.kit_sku)
        };
      }

      const kit = matchingKits[0];
      const componentResult = await client.query(
        `SELECT ${SELECT_FIELDS}, 'maintenance_kit'::text AS protocol_match_type
           FROM kit_components kc
           JOIN elimfilters_catalog c ON c.sku = kc.filter_sku
          WHERE kc.kit_sku = $1
          ORDER BY c.filter_type, c.sku`,
        [kit.kit_sku]
      );

      if (!componentResult.rows.length) {
        return { products: [], lookupStatus: 'completed', kit: null, ambiguous: false };
      }

      const componentSkus = componentResult.rows.map(row => row.sku);
      const appResult = await client.query(
        `SELECT elimfilters_sku, make, model_family, model_type, year, engine_code
           FROM ld_catalog.ld_vehicle_applications
          WHERE elimfilters_sku = ANY($1::text[])`,
        [componentSkus]
      );

      const targetBrand = String(brand).toUpperCase();
      const targetModelUpper = String(model).toUpperCase();
      const verifiedSkus = new Set(
        appResult.rows
          .filter(row => {
            const make = String(row.make || '').toUpperCase();
            const modelFamily = String(row.model_family || '').toUpperCase();
            const modelType = String(row.model_type || '').toUpperCase();
            return make === targetBrand
              && (modelFamily === targetModelUpper || modelType === targetModelUpper)
              && applicationYearValueMatches(row.year, year);
          })
          .map(row => row.elimfilters_sku)
      );

      const verifiedRows = componentResult.rows.filter(row => verifiedSkus.has(row.sku));
      if (!verifiedRows.length) {
        return { products: [], lookupStatus: 'completed', kit: null, ambiguous: false };
      }

      return {
        products: dedupeProducts(verifiedRows.map(normalizeProduct)),
        lookupStatus: 'completed',
        matchType: 'maintenance_kit_application_verified',
        ambiguous: false,
        kit: {
          kit_sku: kit.kit_sku,
          name: kit.kit_name,
          equipment_ref: kit.equipment_ref
        }
      };
    }, 4000);
  } catch (error) {
    console.error('[bot-protocol-catalog] maintenance kit lookup failed', error.message);
    return { products: [], lookupStatus: 'error', error: error.message, kit: null, ambiguous: false };
  }
}

async function searchByApplication(tokens, year = null, filterSystem = null) {
  const terms = [...new Set((tokens || []).map(value => String(value).trim()).filter(value => value.length >= 2))].slice(0, 8);
  if (!terms.length) return { products: [], lookupStatus: 'not_required' };

  try {
    const products = await withCatalogReadRetry(async client => {
      let resolved = [];

      if (terms.length >= 2) {
        const brand = terms[0];
        const modelOrEngine = terms[1];

        let appResult = await client.query(
          `SELECT elimfilters_sku, make, model_family, model_type, year, engine_code
             FROM ld_catalog.ld_vehicle_applications
            WHERE make = $1
              AND model_family = $2
            LIMIT ${APPLICATION_CANDIDATE_LIMIT * 8}`,
          [brand, modelOrEngine]
        );

        if (!appResult.rows.length) {
          appResult = await client.query(
            `SELECT elimfilters_sku, make, model_family, model_type, year, engine_code
               FROM ld_catalog.ld_vehicle_applications
              WHERE make = $1
                AND model_type = $2
              LIMIT ${APPLICATION_CANDIDATE_LIMIT * 8}`,
            [brand, modelOrEngine]
          );
        }

        if (!appResult.rows.length) {
          appResult = await client.query(
            `SELECT elimfilters_sku, make, model_family, model_type, year, engine_code
               FROM ld_catalog.ld_vehicle_applications
              WHERE make = $1
                AND engine_code = $2
              LIMIT ${APPLICATION_CANDIDATE_LIMIT * 8}`,
            [brand, modelOrEngine]
          );
        }

        const matchedApplications = appResult.rows.filter(row =>
          !year || applicationYearValueMatches(row.year, year)
        );
        const matchedSkus = [...new Set(matchedApplications.map(row => row.elimfilters_sku).filter(Boolean))];

        if (matchedSkus.length) {
          const catalogResult = await client.query(
            `SELECT ${SELECT_FIELDS}, 'application_ld'::text AS protocol_match_type
               FROM elimfilters_catalog c
              WHERE c.sku = ANY($1::text[])
              ORDER BY is_primary DESC NULLS LAST, filter_type ASC, sku ASC
              LIMIT ${APPLICATION_CANDIDATE_LIMIT}`,
            [matchedSkus]
          );
          resolved = dedupeProducts(catalogResult.rows.map(normalizeProduct));
        }
      }

      if (!resolved.length) {
        const patterns = terms.map(term => `%${term}%`);
        const applicationExpr = "coalesce(c.equipment_applications::text, '') || ' ' || coalesce(c.vehicle_applications::text, '')";
        const predicates = patterns.map((_, index) => `${applicationExpr} ILIKE $${index + 1}`).join('\n            AND ');

        const candidateResult = await client.query(
          `SELECT ${SELECT_FIELDS}, 'application'::text AS protocol_match_type
             FROM elimfilters_catalog c
            WHERE ${predicates}
            ORDER BY is_primary DESC NULLS LAST, filter_type ASC, sku ASC
            LIMIT ${APPLICATION_CANDIDATE_LIMIT}`,
          patterns
        );

        resolved = candidateResult.rows
          .map(normalizeProduct)
          .filter(product => applicationMatches(product, terms, year));
      }

      const bySystem = resolved.filter(product => filterTypeMatchesSystem(product.filter_type, filterSystem));
      return (bySystem.length ? bySystem : resolved).slice(0, MAX_RESULTS);
    }, 8000);

    return { products, lookupStatus: 'completed', matchType: products[0]?.protocol_match_type || null };
  } catch (error) {
    console.error('[bot-protocol-catalog] application lookup failed', error.message);
    return { products: [], lookupStatus: 'error', error: error.message };
  }
}

function isHousing(product) {
  return /housing/i.test(String(product?.filter_type || ''));
}

function racorHousingModel(product) {
  const values = [
    product?.codigo_base,
    product?.sku,
    product?.name,
    product?.description,
    ...codesFromJsonArray(product?.oem_codes),
    ...codesFromJsonArray(product?.competitor_codes),
    ...codesFromJsonObject(product?.brand_crossrefs)
  ].filter(Boolean).map(value => String(value).toUpperCase());

  for (const value of values) {
    const match = value.match(/(?:^|[^A-Z0-9])(1000|900|500)(FG|FH)(?:[^A-Z0-9]|$)/);
    if (match) return `${match[1]}${match[2]}`;
  }
  return null;
}

function compatibleSeriesFromProduct(product) {
  const explicit = product?.specs?.compatible_element_series || product?.enrichment_data?.compatible_element_series;
  if (explicit) return String(explicit).replace(/\D/g, '');

  const housingModel = racorHousingModel(product);
  if (housingModel && RACOR_TURBINE_COMPATIBILITY[housingModel]) {
    return RACOR_TURBINE_COMPATIBILITY[housingModel];
  }

  const text = [product?.description, product?.name].filter(Boolean).join(' ');
  return text.match(/accepts?\s+(\d{4})[-\s]*series/i)?.[1]
    || text.match(/bowl\s+class\s+(\d{4})/i)?.[1]
    || null;
}

async function searchCompatibleElements(housingProducts) {
  const housings = (housingProducts || []).filter(isHousing);
  const series = [...new Set(housings.map(compatibleSeriesFromProduct).filter(Boolean))];
  if (!series.length) return { products: [], housingProducts: housings, series: [], lookupStatus: 'not_required' };

  const skus = series.flatMap(value => [`ET9${value}P`, `ET9${value}T`, `ET9${value}S`]);
  try {
    const products = await withProtocolClient(async client => {
      const result = await client.query(
        `SELECT ${SELECT_FIELDS}, 'housing_compatible_element'::text AS protocol_match_type
           FROM elimfilters_catalog c
          WHERE upper(c.sku) = ANY($1::text[])
            AND c.filter_type ILIKE '%Cartridge%'
          ORDER BY CASE right(upper(c.sku), 1)
            WHEN 'P' THEN 1 WHEN 'T' THEN 2 WHEN 'S' THEN 3 ELSE 4 END,
            c.sku ASC`,
        [skus]
      );
      return result.rows.map(normalizeProduct);
    }, { statementTimeoutMs: 5000 });

    return {
      products,
      housingProducts: housings,
      series,
      lookupStatus: 'completed',
      matchType: products[0]?.protocol_match_type || null
    };
  } catch (error) {
    console.error('[bot-protocol-catalog] compatibility lookup failed', error.message);
    return { products: [], housingProducts: housings, series, lookupStatus: 'error', error: error.message };
  }
}

module.exports = {
  RACOR_TURBINE_COMPATIBILITY,
  normalizeReference,
  extractReferences,
  collectReferenceCodes,
  codesFromJsonArray,
  codesFromJsonObject,
  productReferenceSet,
  exactReferenceMatch,
  referenceContainmentPayloads,
  strongestApplicationToken,
  searchByReferences,
  searchValidatedMaintenanceKit,
  searchByApplication,
  searchCompatibleElements,
  compatibleSeriesFromProduct,
  racorHousingModel,
  isHousing,
  MAX_RESULTS
};
