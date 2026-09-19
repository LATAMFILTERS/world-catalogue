#!/usr/bin/env node
import pg from 'pg';
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const { Pool } = pg;

function normalizeItems(value) {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === 'string') return { code: item, brand: null };
      if (!item || typeof item !== 'object') return null;
      return {
        code: item.code || item.part_number || item.partNumber || null,
        brand: item.brand || item.manufacturer || item.make || null
      };
    }).filter(Boolean);
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([brand, codes]) => {
      const list = Array.isArray(codes) ? codes : [codes];
      return list.map((code) => {
        if (typeof code === 'string') return { code, brand };
        if (!code || typeof code !== 'object') return null;
        return {
          code: code.code || code.part_number || code.partNumber || null,
          brand: code.brand || code.manufacturer || code.make || brand
        };
      }).filter(Boolean);
    });
  }
  return [];
}

function exactMatches(row, sourceCode, sourceBrand) {
  const code = String(sourceCode).trim().toUpperCase();
  const brand = sourceBrand ? String(sourceBrand).trim().toUpperCase() : null;
  const items = [
    ...normalizeItems(row.competitor_codes),
    ...normalizeItems(row.brand_crossrefs),
    ...normalizeItems(row.oem_codes)
  ];
  return items.some((item) => {
    if (!item.code || String(item.code).trim().toUpperCase() !== code) return false;
    if (!brand) return true;
    return item.brand && String(item.brand).trim().toUpperCase() === brand;
  });
}

function isVerifiedCanonical(row, brand) {
  return String(row?.canonical_source_brand || '').trim().toUpperCase() === String(brand).toUpperCase()
    && String(row?.canonical_source_status || '').trim().toUpperCase() === 'VERIFIED'
    && Boolean(String(row?.canonical_source_code || '').trim());
}

function hasDonaldsonNotManufacturedEvidence(row) {
  const evidence = row?.canonical_evidence;
  if (!evidence || typeof evidence !== 'object') return false;
  if (evidence.donaldson_not_manufactured === true) return true;
  const values = [
    evidence.donaldson_status,
    evidence.donaldson_resolution,
    evidence.donaldson_cross_reference_status
  ].map((value) => String(value || '').trim().toUpperCase());
  return values.includes('NOT_MANUFACTURED') || values.includes('DONALDSON_NOT_MANUFACTURED');
}

function hdPrefixFor(filterType) {
  const key = String(filterType || '').trim().toUpperCase();
  const map = {
    AIR: 'EA1',
    LUBE: 'EL8',
    LUBE_OIL: 'EL8',
    OIL: 'EL8',
    FUEL: 'EF9',
    FUEL_FILTER: 'EF9',
    HYDRAULIC: 'EH6',
    CABIN: 'EC1',
    CABIN_AIR: 'EC1',
    SEPARATOR: 'ES9',
    FUEL_WATER_SEPARATOR: 'ES9'
  };
  return map[key] || null;
}

function deriveHdSkuFromBaseCode(baseCode, filterType) {
  const prefix = hdPrefixFor(filterType);
  const digits = String(baseCode || '').replace(/\D/g, '');
  if (!prefix || digits.length < 4) return null;
  return `${prefix}${digits.slice(-4)}`;
}

export async function resolveDonaldsonCrossFromHomologation(sourceCode, matrixPath = 'scripts/homologation_matrix.json') {
  const raw = await fs.readFile(matrixPath, 'utf8').catch(() => null);
  if (!raw) return { status: 'UNAVAILABLE', source: matrixPath };
  const rows = JSON.parse(raw);
  const code = String(sourceCode || '').trim().toUpperCase();
  const matches = rows.filter((row) =>
    String(row?.fg_pn || '').trim().toUpperCase() === code
    && String(row?.method || '').trim().toUpperCase() === 'DON_CROSSREF_TO_FG'
    && String(row?.don_pn || '').trim()
  );
  const unique = [...new Set(matches.map((row) => String(row.don_pn).trim().toUpperCase()))];
  if (unique.length === 0) return { status: 'NOT_FOUND', source: matrixPath };
  if (unique.length > 1) return { status: 'AMBIGUOUS', source: matrixPath, donaldson_codes: unique };
  return {
    status: 'RESOLVED',
    source: matrixPath,
    method: 'DON_CROSSREF_TO_FG',
    donaldson_code: unique[0]
  };
}

function sslConfigFor(connectionString) {
  try {
    const url = new URL(connectionString);
    const host = url.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') return undefined;
    return { rejectUnauthorized: false };
  } catch {
    return { rejectUnauthorized: false };
  }
}

export async function resolveCompetitorSku({
  sourceCode,
  sourceBrand = null,
  duty = 'HEAVY_DUTY',
  connectionString = process.env.DATABASE_URL,
  poolFactory = (config) => new Pool(config),
  homologationResolver = resolveDonaldsonCrossFromHomologation
} = {}) {
  if (!sourceCode) throw new Error('sourceCode is required');
  if (!connectionString) throw new Error('DATABASE_URL is required');

  const pool = poolFactory({
    connectionString,
    application_name: 'product-identity-exact-crossref-resolver',
    options: '-c default_transaction_read_only=on',
    ssl: sslConfigFor(connectionString)
  });

  try {
    const like = `%${String(sourceCode).trim()}%`;
    const { rows } = await pool.query(`
      SELECT
        sku,
        codigo_base,
        filter_type,
        duty,
        technology,
        competitor_codes,
        brand_crossrefs,
        oem_codes,
        canonical_source_brand,
        canonical_source_code,
        canonical_source_status,
        canonical_evidence,
        donaldson_url,
        catalog_active
      FROM elimfilters_catalog
      WHERE COALESCE(UPPER(duty), 'HEAVY_DUTY') = UPPER($1)
        AND catalog_active IS DISTINCT FROM FALSE
        AND (
          UPPER(COALESCE(codigo_base, '')) = UPPER($3)
          OR competitor_codes::text ILIKE $2
          OR brand_crossrefs::text ILIKE $2
          OR oem_codes::text ILIKE $2
        )
      ORDER BY sku
    `, [duty, like, String(sourceCode).trim()]);

    const normalizedSourceBrand = String(sourceBrand || '').trim().toUpperCase();
    const normalizedDuty = String(duty || '').trim().toUpperCase();
    const baseMatches = rows.filter((row) => String(row.codigo_base || '').trim().toUpperCase() === String(sourceCode).trim().toUpperCase());
    const exact = rows.filter((row) => exactMatches(row, sourceCode, sourceBrand));

    if (normalizedSourceBrand === 'FLEETGUARD' && normalizedDuty === 'HEAVY_DUTY') {
      const homologation = await homologationResolver(sourceCode);
      if (homologation?.status === 'AMBIGUOUS') {
        return {
          status: 'STOP_REVIEW',
          reason: 'AMBIGUOUS_DONALDSON_HOMOLOGATION',
          source_code: sourceCode,
          source_brand: sourceBrand,
          donaldson_codes: homologation.donaldson_codes,
          cross_reference_source: homologation.source
        };
      }

      let donaldsonMatches = exact.filter((row) => isVerifiedCanonical(row, 'DONALDSON'));
      if (homologation?.status === 'RESOLVED') {
        const expectedDonaldson = String(homologation.donaldson_code).trim().toUpperCase();
        donaldsonMatches = donaldsonMatches.filter((row) =>
          String(row.canonical_source_code || row.codigo_base || '').trim().toUpperCase() === expectedDonaldson
        );
        if (donaldsonMatches.length === 0) {
          const direct = await pool.query(`
            SELECT
              sku, codigo_base, filter_type, duty, technology, competitor_codes, brand_crossrefs, oem_codes,
              canonical_source_brand, canonical_source_code, canonical_source_status, canonical_evidence,
              donaldson_url, catalog_active
            FROM elimfilters_catalog
            WHERE COALESCE(UPPER(duty), 'HEAVY_DUTY') = UPPER($1)
              AND catalog_active IS DISTINCT FROM FALSE
              AND (
                UPPER(COALESCE(canonical_source_code, '')) = UPPER($2)
                OR UPPER(COALESCE(codigo_base, '')) = UPPER($2)
              )
            ORDER BY sku
          `, [duty, expectedDonaldson]);
          donaldsonMatches = direct.rows.filter((row) => isVerifiedCanonical(row, 'DONALDSON'));
        }
      }
      if (donaldsonMatches.length > 1) {
        return {
          status: 'STOP_REVIEW',
          reason: 'AMBIGUOUS_VERIFIED_DONALDSON_MATCH',
          source_code: sourceCode,
          source_brand: sourceBrand,
          matches: donaldsonMatches.map((row) => ({
            sku: row.sku,
            codigo_base: row.codigo_base,
            canonical_source_code: row.canonical_source_code,
            filter_type: row.filter_type,
            duty: row.duty,
            catalog_technology: row.technology ?? null
          }))
        };
      }
      if (donaldsonMatches.length === 1) {
        const row = donaldsonMatches[0];
        const baseCode = String(row.canonical_source_code || row.codigo_base || '').trim().toUpperCase();
        const derivedSku = deriveHdSkuFromBaseCode(baseCode, row.filter_type);
        if (!derivedSku) {
          return {
            status: 'STOP_REVIEW',
            reason: 'DONALDSON_BASE_CANNOT_DERIVE_HD_SKU',
            source_code: sourceCode,
            source_brand: sourceBrand,
            base_code: baseCode
          };
        }
        if (String(row.sku || '').trim().toUpperCase() !== derivedSku) {
          return {
            status: 'STOP_REVIEW',
            reason: 'DONALDSON_DERIVED_SKU_CATALOG_MISMATCH',
            source_code: sourceCode,
            source_brand: sourceBrand,
            base_origin: 'DONALDSON',
            base_code: baseCode,
            derived_sku: derivedSku,
            catalog_sku: row.sku
          };
        }
        return {
          status: 'RESOLVED',
          source_code: sourceCode,
          source_brand: sourceBrand,
          elimfilters_sku: derivedSku,
          filter_type: row.filter_type,
          duty: row.duty,
          catalog_technology: row.technology ?? null,
          base_origin: 'DONALDSON',
          base_code: baseCode,
          donaldson_status: 'VERIFIED',
          match_method: homologation?.status === 'RESOLVED'
            ? 'FLEETGUARD_TO_DONALDSON_HOMOLOGATED_VERIFIED'
            : 'FLEETGUARD_TO_DONALDSON_VERIFIED',
          cross_reference_source: homologation?.status === 'RESOLVED' ? homologation.source : 'world_catalogue.elimfilters_catalog',
          source: 'world_catalogue.elimfilters_catalog'
        };
      }

      const verifiedFleetguardFallback = baseMatches.filter((row) =>
        isVerifiedCanonical(row, 'FLEETGUARD')
        && hasDonaldsonNotManufacturedEvidence(row)
      );
      if (verifiedFleetguardFallback.length === 1) {
        const row = verifiedFleetguardFallback[0];
        return {
          status: 'RESOLVED',
          source_code: sourceCode,
          source_brand: sourceBrand,
          elimfilters_sku: row.sku,
          filter_type: row.filter_type,
          duty: row.duty,
          catalog_technology: row.technology ?? null,
          base_origin: 'FLEETGUARD',
          base_code: String(row.canonical_source_code || row.codigo_base || sourceCode).trim().toUpperCase(),
          donaldson_status: 'NOT_MANUFACTURED',
          match_method: 'FLEETGUARD_VERIFIED_FALLBACK_NO_DONALDSON',
          source: 'world_catalogue.elimfilters_catalog'
        };
      }
      if (verifiedFleetguardFallback.length > 1) {
        return {
          status: 'STOP_REVIEW',
          reason: 'AMBIGUOUS_FLEETGUARD_FALLBACK_MATCH',
          source_code: sourceCode,
          source_brand: sourceBrand
        };
      }

      return {
        status: 'STOP_REVIEW',
        reason: 'DONALDSON_CROSS_REFERENCE_REQUIRED',
        source_code: sourceCode,
        source_brand: sourceBrand,
        matches: exact.map((row) => ({
          sku: row.sku,
          codigo_base: row.codigo_base,
          canonical_source_brand: row.canonical_source_brand,
          canonical_source_code: row.canonical_source_code,
          canonical_source_status: row.canonical_source_status
        }))
      };
    }

    if (baseMatches.length === 1) {
      const row = baseMatches[0];
      return {
        status: 'RESOLVED',
        source_code: sourceCode,
        source_brand: sourceBrand,
        elimfilters_sku: row.sku,
        filter_type: row.filter_type,
        duty: row.duty,
        catalog_technology: row.technology ?? null,
        match_method: 'CODIGO_BASE_EXACT',
        source: 'world_catalogue.elimfilters_catalog'
      };
    }
    if (baseMatches.length > 1) {
      return {
        status: 'STOP_REVIEW',
        reason: 'AMBIGUOUS_CODIGO_BASE_MATCH',
        source_code: sourceCode,
        source_brand: sourceBrand,
        matches: baseMatches.map((row) => ({
          sku: row.sku,
          filter_type: row.filter_type,
          duty: row.duty,
          catalog_technology: row.technology ?? null
        }))
      };
    }

    if (exact.length === 0) {
      return { status: 'STOP_REVIEW', reason: 'NO_EXACT_CATALOG_MATCH', source_code: sourceCode, source_brand: sourceBrand, matches: [] };
    }
    if (exact.length > 1) {
      return {
        status: 'STOP_REVIEW',
        reason: 'AMBIGUOUS_EXACT_CATALOG_MATCH',
        source_code: sourceCode,
        source_brand: sourceBrand,
        matches: exact.map((row) => ({
          sku: row.sku,
          filter_type: row.filter_type,
          duty: row.duty,
          catalog_technology: row.technology ?? null
        }))
      };
    }

    const row = exact[0];
    return {
      status: 'RESOLVED',
      source_code: sourceCode,
      source_brand: sourceBrand,
      elimfilters_sku: row.sku,
      filter_type: row.filter_type,
      duty: row.duty,
      catalog_technology: row.technology ?? null,
      source: 'world_catalogue.elimfilters_catalog'
    };
  } finally {
    await pool.end();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const codeArg = args.find((arg) => arg.startsWith('--code='));
  const brandArg = args.find((arg) => arg.startsWith('--brand='));
  const dutyArg = args.find((arg) => arg.startsWith('--duty='));
  if (!codeArg) throw new Error('Usage: node product-identity/scripts/resolve-competitor-sku.mjs --code=LF670 --brand=FLEETGUARD --duty=HEAVY_DUTY');
  const result = await resolveCompetitorSku({
    sourceCode: codeArg.split('=')[1],
    sourceBrand: brandArg ? brandArg.split('=')[1] : null,
    duty: dutyArg ? dutyArg.split('=')[1] : 'HEAVY_DUTY'
  });
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== 'RESOLVED') process.exitCode = 2;
}

const isDirectRun = process.argv[1] ? import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href : false;
if (isDirectRun) main().catch((error) => { console.error(`[crossref resolver] ${error.message}`); process.exit(1); });
