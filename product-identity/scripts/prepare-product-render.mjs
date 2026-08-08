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
const phase = String(args.phase || 'PHASE_2').toUpperCase();
if (!brand || !code || !productUrl) {
  throw new Error('Usage: --brand=<manufacturer> --code=<competitor-code> --product-url=<official-url> [--phase=PHASE_2]');
}

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

const source = runJson('product-identity/scripts/acquire-manufacturer-source.mjs', [
  `--brand=${brand}`,
  `--code=${code}`,
  `--product-url=${productUrl}`
]);
if (!source.verified_fresh_source || source.cache_used || source.previous_master_used) {
  throw new Error('STOP_FRESH_SOURCE_POLICY_FAILED');
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

const logoPath = 'frontend/public/assets/logo-elimfilters.png';
await fs.access(logoPath);
await fs.access(tech.technology_asset_path);
await fs.access(source.source_image_path);

const packet = {
  schema_version: '1.0',
  packet_type: 'ELIMFILTERS_AUTHORIZED_RENDER_PACKET',
  status: 'PASS',
  render_allowed: true,
  generated_at: new Date().toISOString(),
  phase,
  source: {
    manufacturer: brand,
    competitor_code: code,
    requested_product_url: productUrl,
    resolved_official_page_url: source.resolved_official_page_url,
    official_image_path: source.source_image_path,
    official_image_sha256: source.source_image_sha256 || await fileHash(source.source_image_path),
    source_evidence_path: source.evidence_path,
    cache_used: false,
    previous_master_used: false
  },
  identity: {
    elimfilters_sku: db.elimfilters_sku,
    filter_type: db.filter_type,
    technology: tech.technology,
    technology_asset_path: tech.technology_asset_path,
    technology_asset_sha256: await fileHash(tech.technology_asset_path),
    logo_asset_path: logoPath,
    logo_asset_sha256: await fileHash(logoPath)
  },
  artwork_lock: {
    body_color_hex: '#414141',
    lithography_color_hex: '#CBCBCB',
    positioning_line: 'TOTAL ASSET PROTECTION',
    descriptor: 'Powered Filtration',
    manufacturer_branding_allowed: false,
    secondary_colors_allowed: false,
    german_quality_allowed: false,
    arbitrary_technical_characters_allowed: false
  },
  geometry_lock: {
    source_of_truth: 'CURRENT_OFFICIAL_SOURCE_IMAGE',
    generic_geometry_allowed: false,
    other_sku_geometry_allowed: false,
    previous_render_geometry_allowed: false,
    preserve: [
      'silhouette', 'proportions', 'top_rim', 'baseplate_or_open_end', 'thread', 'gasket',
      'inlet_hole_or_support_pattern', 'central_support_or_perforation_pattern',
      'perspective', 'relative_scale', 'composition'
    ]
  },
  execution_guard: {
    single_authority: true,
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
