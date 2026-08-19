#!/usr/bin/env node
import pg from 'pg';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const { Pool } = pg;

function normalizeItems(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (typeof item === 'string') return { code: item, brand: null };
    if (!item || typeof item !== 'object') return null;
    return {
      code: item.code || item.part_number || item.partNumber || null,
      brand: item.brand || item.manufacturer || item.make || null
    };
  }).filter(Boolean);
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
  poolFactory = (config) => new Pool(config)
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
      SELECT sku, filter_type, duty, technology, competitor_codes, brand_crossrefs, oem_codes
      FROM elimfilters_catalog
      WHERE COALESCE(UPPER(duty), 'HEAVY_DUTY') = UPPER($1)
        AND (
          competitor_codes::text ILIKE $2
          OR brand_crossrefs::text ILIKE $2
          OR oem_codes::text ILIKE $2
        )
      ORDER BY sku
    `, [duty, like]);

    const exact = rows.filter((row) => exactMatches(row, sourceCode, sourceBrand));

    if (exact.length === 0) {
      return { status: 'STOP_REVIEW', reason: 'NO_EXACT_CATALOG_MATCH', source_code: sourceCode, source_brand: sourceBrand, matches: [] };
    }
    if (exact.length > 1) {
      return {
        status: 'STOP_REVIEW',
        reason: 'AMBIGUOUS_EXACT_CATALOG_MATCH',
        source_code: sourceCode,
        source_brand: sourceBrand,
        matches: exact.map((row) => ({ sku: row.sku, filter_type: row.filter_type, duty: row.duty }))
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
