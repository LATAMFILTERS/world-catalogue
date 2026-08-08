#!/usr/bin/env node
import fs from 'node:fs/promises';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k,...v]=a.replace(/^--/,'').split('='); return [k,v.join('=')]; }));
if (!args.manifest) throw new Error('Usage: --manifest=<path>');
const manifest = JSON.parse(await fs.readFile(args.manifest, 'utf8'));
const required = ['phase','competitor_brand','competitor_code','manufacturer_product_url','manufacturer_screenshot_path','manufacturer_image_path','source_real','resolved_sku','resolved_from_database','filter_type','technology','technology_asset_path','logo_asset_path','container_color_hex','lithography_color_hex','target_view','protected_views','allowed_changes','immutable_elements','render_mode','render_inputs_verified','manifest_status'];
for (const k of required) if (!(k in manifest) || manifest[k] === '' || manifest[k] === null) throw new Error(`STOP_RENDER_MANIFEST_INCOMPLETE:${k}`);
if (manifest.source_real !== true) throw new Error('STOP_SOURCE_NOT_REAL');
if (manifest.resolved_from_database !== true) throw new Error('STOP_DB_NOT_VERIFIED');
if (manifest.render_mode !== 'EDIT_ONLY') throw new Error('STOP_RENDER_MODE_NOT_EDIT_ONLY');
if (manifest.render_inputs_verified !== true || manifest.manifest_status !== 'PASS') throw new Error('STOP_MANIFEST_NOT_PASS');
if (manifest.container_color_hex !== '#414141') throw new Error('STOP_CONTAINER_COLOR_AUTHORITY_MISMATCH');
if (manifest.lithography_color_hex !== '#CBCBCB') throw new Error('STOP_LITHOGRAPHY_COLOR_AUTHORITY_MISMATCH');
if (manifest.logo_asset_path !== 'frontend/public/assets/logo-elimfilters.png') throw new Error('STOP_LOGO_ASSET_AUTHORITY_MISMATCH');
if (!/^E[A-Z0-9]+$/.test(manifest.resolved_sku)) throw new Error('STOP_INVALID_RESOLVED_SKU');
if (!['PHASE_1','PHASE_2','PHASE_3'].includes(manifest.phase)) throw new Error('STOP_INVALID_PHASE');
if (!['VERTICAL_ONLY','HORIZONTAL_ONLY','BOTH'].includes(manifest.target_view)) throw new Error('STOP_INVALID_TARGET_VIEW');
if (manifest.phase !== 'PHASE_1' && !manifest.geometry_master_path) throw new Error('STOP_GEOMETRY_MASTER_MISSING');
if (manifest.phase === 'PHASE_3' && (!manifest.approved_master_path || !manifest.target_property)) throw new Error('STOP_PHASE3_SCOPE_MISSING');
if (manifest.target_view === 'VERTICAL_ONLY' && !manifest.protected_views.includes('HORIZONTAL_VIEW')) throw new Error('STOP_PROTECTED_VIEW_LOCK_MISSING');
if (manifest.target_view === 'HORIZONTAL_ONLY' && !manifest.protected_views.includes('VERTICAL_VIEW')) throw new Error('STOP_PROTECTED_VIEW_LOCK_MISSING');
const fileFields = ['manufacturer_screenshot_path','manufacturer_image_path','technology_asset_path','logo_asset_path'];
if (manifest.phase !== 'PHASE_1') fileFields.push('geometry_master_path');
if (manifest.phase === 'PHASE_3') fileFields.push('approved_master_path');
for (const k of fileFields) {
  const st = await fs.stat(manifest[k]).catch(() => null);
  if (!st?.isFile() || st.size === 0) throw new Error(`STOP_REQUIRED_FILE_MISSING:${k}:${manifest[k]}`);
}
console.log(JSON.stringify({ ok:true, manifest_status:'PASS', manifest_path:args.manifest, resolved_sku:manifest.resolved_sku, technology:manifest.technology }, null, 2));
