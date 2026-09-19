#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolveCompetitorSku } from './resolve-competitor-sku.mjs';
import { resolveTechnologyAsset } from './resolve-technology-asset.mjs';

const BRAND_DNA_PATH = 'product-identity/brand-dna/elimfilters-brand.v1.json';
const IMAGE_RULES_PATH = 'product-identity/ai-media/image-generation-rules.v1.json';
const PRINT_AUTHORITY_PATH = 'data/product-identity/authorities/cylindrical-print-layout-authority.json';

function normalize(value) {
  return String(value || '').toUpperCase().replace(/[®™]/g, '').trim();
}

async function sha256(filePath) {
  return crypto.createHash('sha256').update(await fs.readFile(filePath)).digest('hex');
}

export function catalogCandidates(result) {
  if (result?.status === 'RESOLVED') {
    return [{
      sku: result.elimfilters_sku,
      filter_type: result.filter_type,
      duty: result.duty,
      catalog_technology: result.catalog_technology
    }];
  }  if (result?.reason === 'AMBIGUOUS_EXACT_CATALOG_MATCH' && Array.isArray(result.matches)) {
    return result.matches;
  }
  throw new Error(`STOP_BRAND_ASSET_CATALOG_REFERENCE_UNRESOLVED:${result?.reason || result?.status || 'UNKNOWN'}`);
}

export async function resolveBrandConsensus(candidates, assetResolver = resolveTechnologyAsset) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    throw new Error('STOP_BRAND_ASSET_NO_CATALOG_CANDIDATES');
  }

  const filterTypes = [...new Set(candidates.map((row) => normalize(row.filter_type)).filter(Boolean))];
  if (filterTypes.length !== 1) {
    throw new Error(`STOP_BRAND_ASSET_FILTER_TYPE_CONFLICT:${filterTypes.join(',')}`);
  }

  const resolved = [];
  for (const row of candidates) {
    resolved.push(await assetResolver({
      filterType: row.filter_type,
      catalogTechnology: row.catalog_technology
    }));
  }
  const technologyKeys = [...new Set(resolved.map((item) => item.technology_key))];
  if (technologyKeys.length !== 1) {
    throw new Error(`STOP_BRAND_ASSET_TECHNOLOGY_CONFLICT:${technologyKeys.join(',')}`);
  }

  return {
    filter_type: filterTypes[0],
    technology: resolved[0].technology,
    technology_key: resolved[0].technology_key,
    technology_asset_path: resolved[0].technology_asset_path
  };
}
export async function buildBrandAssetEvidence({
  manufacturer,
  competitorCode,
  catalogResolution,
  consensus,
  identityAuthority = 'LIVE_POSTGRES_WORLD_CATALOGUE'
}) {
  const brandDna = JSON.parse(await fs.readFile(BRAND_DNA_PATH, 'utf8'));
  const imageRules = JSON.parse(await fs.readFile(IMAGE_RULES_PATH, 'utf8'));
  const printAuthority = JSON.parse(await fs.readFile(PRINT_AUTHORITY_PATH, 'utf8'));

  const logoPath = brandDna.required_assets?.official_logo;
  if (!logoPath || logoPath !== imageRules.brand_asset_policy?.logo_asset) {
    throw new Error('STOP_BRAND_ASSET_LOGO_AUTHORITY_CONFLICT');
  }
  if (logoPath !== printAuthority.brandArtworkAuthority?.officialLogoAsset) {
    throw new Error('STOP_BRAND_ASSET_PRINT_LOGO_AUTHORITY_CONFLICT');
  }

  const logoStat = await fs.stat(logoPath).catch(() => null);
  const techStat = await fs.stat(consensus.technology_asset_path).catch(() => null);
  if (!logoStat?.isFile() || logoStat.size === 0) throw new Error('STOP_BRAND_ASSET_LOGO_MISSING');
  if (!techStat?.isFile() || techStat.size === 0) throw new Error('STOP_BRAND_ASSET_TECHNOLOGY_MISSING');

  const bodyHex = brandDna.cylindrical_product_colors?.container?.hex;
  const lithographyHex = brandDna.cylindrical_product_colors?.lithography?.hex;
  if (bodyHex !== imageRules.color_policy?.container?.hex || bodyHex !== '#414141') {
    throw new Error('STOP_BRAND_ASSET_CONTAINER_COLOR_CONFLICT');
  }
  if (lithographyHex !== imageRules.color_policy?.lithography?.hex || lithographyHex !== '#CBCBCB') {
    throw new Error('STOP_BRAND_ASSET_LITHOGRAPHY_COLOR_CONFLICT');
  }

  const candidateSkus = catalogResolution?.status === 'RESOLVED'
    ? [catalogResolution.elimfilters_sku].filter(Boolean)
    : Array.isArray(catalogResolution?.matches)
      ? catalogResolution.matches.map((row) => row.sku).filter(Boolean)
      : [];
  return {
    schema_version: '1.0',
    evidence_type: 'ELIMFILTERS_BRAND_ASSET_EVIDENCE',
    status: 'PASS',
    manufacturer,
    competitor_code: competitorCode,
    catalog_identity_status: catalogResolution.status,
    catalog_identity_reason: catalogResolution.reason ?? null,
    candidate_skus: candidateSkus,
    canonical_sku_resolved: catalogResolution.status === 'RESOLVED',
    brand_identity_source: identityAuthority,
    filter_type: consensus.filter_type,
    technology: consensus.technology,
    technology_key: consensus.technology_key,
    brand_claim: brandDna.identity?.tagline,
    technology_descriptor: 'Powered Filtration',
    logo_asset_path: logoPath,
    logo_asset_sha256: await sha256(logoPath),
    logo_asset_bytes: logoStat.size,
    technology_asset_path: consensus.technology_asset_path,
    technology_asset_sha256: await sha256(consensus.technology_asset_path),
    technology_asset_bytes: techStat.size,
    container_color_hex: bodyHex,
    lithography_color_hex: lithographyHex,
    logo_usage: imageRules.brand_asset_policy?.logo_asset_usage,
    technology_asset_usage: imageRules.brand_asset_policy?.technology_asset_usage,
    brand_identity_status: 'PASS'
  };
}
async function main() {
  const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
    const [key, ...value] = arg.replace(/^--/, '').split('=');
    return [key, value.join('=')];
  }));
  const manufacturer = String(args.brand || '').toUpperCase();
  const competitorCode = String(args.code || '').toUpperCase();
  if (!manufacturer || !competitorCode) {
    throw new Error('Usage: --brand=<manufacturer> --code=<competitor-code> [--duty=HEAVY_DUTY]');
  }

  const catalogResolution = await resolveCompetitorSku({
    sourceCode: competitorCode,
    sourceBrand: manufacturer,
    duty: args.duty || 'HEAVY_DUTY'
  });

  let consensus;
  let identityAuthority = 'LIVE_POSTGRES_WORLD_CATALOGUE';
  if (catalogResolution.status === 'RESOLVED' || catalogResolution.reason === 'AMBIGUOUS_EXACT_CATALOG_MATCH') {
    consensus = await resolveBrandConsensus(catalogCandidates(catalogResolution));
  } else if (catalogResolution.reason === 'NO_EXACT_CATALOG_MATCH' && args['filter-type']) {
    consensus = await resolveBrandConsensus([{
      sku: null,
      filter_type: args['filter-type'],
      duty: args.duty || 'HEAVY_DUTY',
      catalog_technology: null
    }]);
    identityAuthority = 'ACTIVE_PILOT_FILTER_TYPE_AUTHORITY';
  } else {
    throw new Error(`STOP_BRAND_ASSET_CATALOG_REFERENCE_UNRESOLVED:${catalogResolution.reason || catalogResolution.status}`);
  }

  const evidence = await buildBrandAssetEvidence({
    manufacturer,
    competitorCode,
    catalogResolution,
    consensus,
    identityAuthority
  });

  const outDir = args['out-dir'] || path.join('product-identity', 'brand-evidence');
  await fs.mkdir(outDir, { recursive: true });
  const evidencePath = args.out || path.join(outDir, `${competitorCode}.json`);
  await fs.writeFile(evidencePath, JSON.stringify(evidence, null, 2) + '\n');

  console.log(JSON.stringify({
    ...evidence,
    ok: true,
    status: 'BRAND_ASSETS_VALIDATED',
    evidence_status: evidence.status,
    evidence_path: evidencePath
  }, null, 2));
}
const direct = process.argv[1]
  ? import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
  : false;

if (direct) main().catch((error) => {
  console.error(JSON.stringify({
    ok: false,
    status: 'STOP_REVIEW',
    reason: error.message
  }, null, 2));
  process.exit(2);
});