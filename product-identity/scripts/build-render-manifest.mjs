#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k,...v]=a.replace(/^--/,'').split('='); return [k,v.join('=')]; }));
const required = ['code','brand','product-url','phase'];
for (const k of required) if (!args[k]) throw new Error(`STOP_RENDER_MANIFEST_INCOMPLETE:${k}`);
const phase = String(args.phase).toUpperCase();
if (!['PHASE_1','PHASE_2','PHASE_3'].includes(phase)) throw new Error(`STOP_INVALID_PHASE:${phase}`);
if (phase !== 'PHASE_1' && !args['geometry-master']) throw new Error('STOP_GEOMETRY_MASTER_MISSING');
if (phase === 'PHASE_3' && !args['approved-master']) throw new Error('STOP_APPROVED_MASTER_MISSING');

async function run(script, scriptArgs) {
  const { stdout } = await exec(process.execPath, [script, ...scriptArgs], { maxBuffer: 1024*1024*16, env: process.env });
  return JSON.parse(stdout);
}
const code = String(args.code).toUpperCase();
const brand = String(args.brand).toUpperCase();

const source = await run('product-identity/scripts/acquire-manufacturer-source.mjs', [
  `--brand=${brand}`,
  `--code=${code}`,
  `--product-url=${args['product-url']}`
]);
if (!source.verified_fresh_source || source.cache_used || source.previous_master_used) throw new Error('STOP_FRESH_SOURCE_POLICY_FAILED');
if (!source.source_image_sha256 || !source.resolved_official_page_url) throw new Error('STOP_SOURCE_EVIDENCE_INCOMPLETE');

const db = await run('product-identity/scripts/resolve-competitor-sku.mjs', [`--code=${code}`, `--brand=${brand}`, '--duty=HEAVY_DUTY']);
if (db.status !== 'RESOLVED') throw new Error(`STOP_DB_RESOLUTION_FAILED:${db.reason || 'UNKNOWN'}`);
const tech = await run('product-identity/scripts/resolve-technology-asset.mjs', [`--filter-type=${db.filter_type || ''}`, `--technology=${db.catalog_technology || ''}`]);
const logo = 'frontend/public/assets/logo-elimfilters.png';
const logoStat = await fs.stat(logo).catch(() => null);
if (!logoStat?.isFile() || logoStat.size === 0) throw new Error('STOP_LOGO_ASSET_MISSING');

const targetView = args['target-view'] || 'BOTH';
const protectedViews = targetView === 'VERTICAL_ONLY' ? ['HORIZONTAL_VIEW'] : targetView === 'HORIZONTAL_ONLY' ? ['VERTICAL_VIEW'] : [];
const allowed = phase === 'PHASE_1' ? ['GEOMETRY_PRESERVATION_ONLY'] : phase === 'PHASE_2' ? ['CONTAINER_PAINT','AUTHORIZED_LITHOGRAPHY'] : [args['target-property'] || 'EXPLICIT_MICRO_ADJUSTMENT'];
const immutable = ['SILHOUETTE','PROPORTIONS','SEAMS','BASEPLATE_OR_OPEN_END','THREAD','GASKET','INLET_HOLE_OR_SUPPORT_PATTERN','CENTRAL_SUPPORT_OR_PERFORATION_PATTERN','PERSPECTIVE','RELATIVE_SCALE','COMPOSITION'];

const manifest = {
  schema_version:'2.7',
  phase,
  competitor_brand:brand,
  competitor_code:code,
  requested_manufacturer_product_url:args['product-url'],
  resolved_manufacturer_page_url:source.resolved_official_page_url,
  source_acquisition_mode:source.acquisition_mode,
  transient_http_fallback_used:source.transient_http_fallback_used === true,
  acquisition_attempts:source.acquisition_attempts || [],
  manufacturer_source_evidence_path:source.evidence_path,
  manufacturer_screenshot_path:source.screenshot_path || null,
  manufacturer_screenshot_role:'BEST_EFFORT_AUTOMATED_AUDIT_EVIDENCE_NOT_RENDER_GATE',
  manufacturer_image_path:source.source_image_path,
  manufacturer_image_url:source.source_image_final_url || source.source_image_url,
  manufacturer_image_sha256:source.source_image_sha256,
  source_real:true,
  verified_fresh_source:true,
  cache_used:false,
  previous_master_used:false,
  resolved_sku:db.elimfilters_sku,
  resolved_from_database:true,
  filter_type:db.filter_type || 'UNKNOWN',
  technology:tech.technology,
  technology_asset_path:tech.technology_asset_path,
  logo_asset_path:logo,
  container_color_hex:'#414141',
  lithography_color_hex:'#CBCBCB',
  target_view:targetView,
  protected_views:protectedViews,
  geometry_master_path:args['geometry-master'] || null,
  approved_master_path:args['approved-master'] || null,
  target_property:args['target-property'] || null,
  allowed_changes:allowed,
  immutable_elements:immutable,
  render_mode:'SOURCE_REFERENCED_TRANSFORMATION',
  render_inputs_verified:true,
  manual_screenshot_required:false,
  manifest_status:'PASS'
};
const out = args.out || `product-identity/manifests/${code}.${phase.toLowerCase()}.json`;
await fs.mkdir(path.dirname(out), { recursive:true });
await fs.writeFile(out, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ ok:true, manifest_path:out, manifest }, null, 2));
