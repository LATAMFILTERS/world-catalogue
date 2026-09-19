#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.join('=')];
}));

const brand = String(args.brand || '').toUpperCase();
const code = String(args.code || '').toUpperCase();
const productUrl = args['product-url'];
const catalogUrl = args['catalog-url'];
const catalogPage = Number(args['catalog-page'] || 0);
const catalogPosition = Number(args['catalog-position'] || 0);
const geometryEvidencePath = args['geometry-evidence'];
const brandEvidencePath = args['brand-evidence'];
const phase = String(args.phase || 'PHASE_2').toUpperCase();
const PILOT_PLAN_PATH = 'product-identity/hd-standard/pilots/pilot-matrix-plan.v1.json';
if (!brand || !code || !productUrl || !catalogUrl || !catalogPage || !catalogPosition || !geometryEvidencePath || !brandEvidencePath) {
  throw new Error('Usage: --brand=<manufacturer> --code=<competitor-code> --product-url=<official-url> --catalog-url=<official-category-url> --catalog-page=<n> --catalog-position=<n> --geometry-evidence=<json> --brand-evidence=<json> [--phase=PHASE_2]');
}

const REQUIRED_GEOMETRY_FIELDS = [
  'vertical_filter_geometry',
  'horizontal_filter_geometry',
  'overall_silhouette',
  'body_proportions',
  'top_rim',
  'baseplate_or_open_end',
  'thread_geometry',
  'gasket_geometry',
  'inlet_hole_count_shape_and_positions',
  'support_pattern',
  'central_support_or_perforation_pattern',
  'camera_perspective',
  'relative_scale',
  'composition'
];

function runJson(script, argv) {
  const r = spawnSync(process.execPath, [script, ...argv], {
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 1024 * 1024 * 32
  });
  if (r.status !== 0) throw new Error((r.stderr || r.stdout || `FAILED:${script}`).trim());
  return JSON.parse(r.stdout);
}

async function fileHash(p) {
  const b = await fs.readFile(p);
  return crypto.createHash('sha256').update(b).digest('hex');
}

if (brand !== 'FLEETGUARD') throw new Error('STOP_UNSUPPORTED_MANUFACTURER');
if (catalogPage < 1) throw new Error('STOP_CATALOG_PAGE_OUT_OF_RANGE');
if (catalogPosition < 1) throw new Error('STOP_CATALOG_POSITION_OUT_OF_RANGE');

const pilotPlan = JSON.parse(await fs.readFile(PILOT_PLAN_PATH, 'utf8'));
const activePilot = pilotPlan.sequence?.find((item) => item.status === 'active');
if (!activePilot) throw new Error('STOP_NO_ACTIVE_PRODUCT_IMAGE_PILOT');
if (String(activePilot.manufacturer || '').toUpperCase() !== brand) throw new Error('STOP_ACTIVE_PILOT_MANUFACTURER_MISMATCH');
if (activePilot.category_url !== catalogUrl) throw new Error('STOP_WRONG_ACTIVE_PILOT_CATEGORY');

const geometryEvidenceRaw = await fs.readFile(geometryEvidencePath, 'utf8').catch(() => null);
if (!geometryEvidenceRaw) throw new Error('STOP_GEOMETRY_EVIDENCE_MISSING');
const geometry = JSON.parse(geometryEvidenceRaw);
if (String(geometry.manufacturer || '').toUpperCase() !== brand || String(geometry.competitor_code || '').toUpperCase() !== code) {
  throw new Error('STOP_GEOMETRY_EVIDENCE_SKU_MISMATCH');
}
if (geometry.status !== 'PASS') throw new Error('STOP_GEOMETRY_EVIDENCE_NOT_PASS');
if (geometry.product_page !== productUrl) throw new Error('STOP_GEOMETRY_PRODUCT_URL_MISMATCH');
if (!geometry.source_image_path || !geometry.screenshot_path || !geometry.source_image_sha256 || !geometry.screenshot_sha256) {
  throw new Error('STOP_GEOMETRY_SOURCE_BINDING_INCOMPLETE');
}
await fs.access(geometry.source_image_path);
await fs.access(geometry.screenshot_path);
if (await fileHash(geometry.source_image_path) !== geometry.source_image_sha256) {
  throw new Error('STOP_SOURCE_IMAGE_HASH_MISMATCH');
}
if (await fileHash(geometry.screenshot_path) !== geometry.screenshot_sha256) {
  throw new Error('STOP_SCREENSHOT_HASH_MISMATCH');
}
for (const field of REQUIRED_GEOMETRY_FIELDS) {
  const value = geometry[field];
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
    throw new Error(`STOP_GEOMETRY_FIELD_MISSING:${field}`);
  }
}

const db = runJson('product-identity/scripts/resolve-competitor-sku.mjs', [
  `--code=${code}`,
  `--brand=${brand}`,
  '--duty=HEAVY_DUTY'
]);
if (db.status !== 'RESOLVED' || !db.elimfilters_sku) throw new Error('STOP_DATABASE_SKU_NOT_RESOLVED');

const tech = runJson('product-identity/scripts/resolve-technology-asset.mjs', [
  `--filter-type=${db.filter_type || ''}`,
  `--technology=${db.catalog_technology || ''}`
]);
if (!tech.technology || !tech.technology_asset_path) throw new Error('STOP_TECHNOLOGY_NOT_RESOLVED');

const brandEvidenceRaw = await fs.readFile(brandEvidencePath, 'utf8').catch(() => null);
if (!brandEvidenceRaw) throw new Error('STOP_BRAND_EVIDENCE_MISSING');
const brandEvidence = JSON.parse(brandEvidenceRaw);
if (
  brandEvidence.status !== 'PASS'
  || brandEvidence.brand_identity_status !== 'PASS'
  || String(brandEvidence.manufacturer || '').toUpperCase() !== brand
  || String(brandEvidence.competitor_code || '').toUpperCase() !== code
) {
  throw new Error('STOP_BRAND_EVIDENCE_NOT_PASS');
}
if (!brandEvidence.canonical_sku_resolved) throw new Error('STOP_BRAND_EVIDENCE_SKU_NOT_RESOLVED');
if (!brandEvidence.candidate_skus?.includes(db.elimfilters_sku)) throw new Error('STOP_BRAND_EVIDENCE_SKU_MISMATCH');
if (String(brandEvidence.filter_type || '').toUpperCase() !== String(db.filter_type || '').toUpperCase()) {
  throw new Error('STOP_BRAND_EVIDENCE_FILTER_TYPE_MISMATCH');
}
if (brandEvidence.technology !== tech.technology) throw new Error('STOP_BRAND_EVIDENCE_TECHNOLOGY_MISMATCH');

const logoPath = brandEvidence.logo_asset_path;
const technologyAssetPath = brandEvidence.technology_asset_path;
await fs.access(logoPath);
await fs.access(technologyAssetPath);
if (await fileHash(logoPath) !== brandEvidence.logo_asset_sha256) throw new Error('STOP_LOGO_HASH_MISMATCH');
if (await fileHash(technologyAssetPath) !== brandEvidence.technology_asset_sha256) throw new Error('STOP_TECHNOLOGY_ASSET_HASH_MISMATCH');
if (technologyAssetPath !== tech.technology_asset_path) throw new Error('STOP_TECHNOLOGY_ASSET_PATH_MISMATCH');

const packet = {
  schema_version: '2.0',
  packet_type: 'ELIMFILTERS_AUTHORIZED_RENDER_PACKET',
  status: 'PASS',
  render_allowed: true,
  generated_at: new Date().toISOString(),
  phase,
  catalog: {
    pilot_id: activePilot.pilot_id,
    category_id: activePilot.category_id ?? null,
    category_url: catalogUrl,
    filter_type: activePilot.filter_type ?? db.filter_type,
    page: catalogPage,
    position: catalogPosition,
    competitor_code: code,
    expected_pages: null,
    page_count_source: 'DYNAMIC_FROM_CURRENT_CATEGORY'
  },
  source: {
    manufacturer: brand,
    competitor_code: code,
    requested_product_url: productUrl,
    resolved_official_page_url: geometry.resolved_official_page_url,
    official_image_path: geometry.source_image_path,
    official_image_sha256: geometry.source_image_sha256,
    screenshot_path: geometry.screenshot_path,
    screenshot_sha256: geometry.screenshot_sha256,
    geometry_evidence_path: geometryEvidencePath,
    cache_used: false,
    previous_master_used: false
  },
  geometry_lock: {
    source_of_truth: 'CURRENT_SKU_OFFICIAL_SOURCE_IMAGE',
    geometry_evidence_path: geometryEvidencePath,
    geometry_evidence_sha256: await fileHash(geometryEvidencePath),
    vertical_filter_geometry: geometry.vertical_filter_geometry,
    horizontal_filter_geometry: geometry.horizontal_filter_geometry,
    overall_silhouette: geometry.overall_silhouette,
    body_proportions: geometry.body_proportions,
    top_rim: geometry.top_rim,
    baseplate_or_open_end: geometry.baseplate_or_open_end,
    thread_geometry: geometry.thread_geometry,
    gasket_geometry: geometry.gasket_geometry,
    inlet_hole_count_shape_and_positions: geometry.inlet_hole_count_shape_and_positions,
    support_pattern: geometry.support_pattern,
    central_support_or_perforation_pattern: geometry.central_support_or_perforation_pattern,
    camera_perspective: geometry.camera_perspective,
    relative_scale: geometry.relative_scale,
    composition: geometry.composition,
    generic_geometry_allowed: false,
    other_sku_geometry_allowed: false,
    previous_render_geometry_allowed: false
  },
  identity: {
    elimfilters_sku: db.elimfilters_sku,
    sku_resolution_source: db.source,
    sku_resolution_method: db.match_method ?? 'EXACT_CROSS_REFERENCE',
    filter_type: db.filter_type,
    technology: tech.technology,
    technology_asset_path: technologyAssetPath,
    technology_asset_sha256: brandEvidence.technology_asset_sha256,
    logo_asset_path: logoPath,
    logo_asset_sha256: brandEvidence.logo_asset_sha256,
    brand_evidence_path: brandEvidencePath,
    brand_evidence_sha256: await fileHash(brandEvidencePath)
  },
  artwork_lock: {
    body_color_hex: brandEvidence.container_color_hex,
    lithography_color_hex: brandEvidence.lithography_color_hex,
    positioning_line: brandEvidence.brand_claim,
    descriptor: brandEvidence.technology_descriptor ?? tech.technology_descriptor,
    manufacturer_branding_allowed: false,
    secondary_colors_allowed: false,
    german_quality_allowed: false,
    arbitrary_technical_characters_allowed: false
  },
  execution_guard: {
    single_authority: true,
    catalog_discovery_required: true,
    screenshot_required: true,
    geometry_evidence_required: true,
    brand_evidence_required: true,
    sku_resolution_required: true,
    ad_hoc_prompt_values_forbidden: true,
    remembered_sku_forbidden: true,
    remembered_colors_forbidden: true,
    remembered_technology_forbidden: true,
    chat_generation_without_this_packet_forbidden: true
  }
};

const outDir = args['out-dir'] || 'product-identity/render-packets';
await fs.mkdir(outDir, { recursive: true });
const out = args.out || path.join(outDir, `${code}.${phase.toLowerCase()}.authorized.json`);
await fs.writeFile(out, JSON.stringify(packet, null, 2) + '\n');
console.log(JSON.stringify({ ok: true, packet_path: out, packet }, null, 2));
