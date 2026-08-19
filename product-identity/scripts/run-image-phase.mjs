#!/usr/bin/env node
import fs from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k,...v]=a.replace(/^--/,'').split('='); return [k,v.join('=')]; }));
if (!args.manifest) throw new Error('Usage: --manifest=<path> [--approval-state=<state>]');
const { stdout } = await exec(process.execPath, ['product-identity/scripts/validate-render-manifest.mjs', `--manifest=${args.manifest}`]);
const validation = JSON.parse(stdout);
if (!validation.ok || validation.manifest_status !== 'PASS') throw new Error('IMAGE_GENERATION_DISABLED:MANIFEST_NOT_PASS');
const manifest = JSON.parse(await fs.readFile(args.manifest, 'utf8'));
const approvalState = args['approval-state'] || 'SOURCE_LOCKED';
if (manifest.phase === 'PHASE_2' && approvalState !== 'GEOMETRY_APPROVED') throw new Error('IMAGE_GENERATION_DISABLED:PHASE1_NOT_APPROVED');
if (manifest.phase === 'PHASE_3' && approvalState !== 'PAINT_LITHO_APPROVED') throw new Error('IMAGE_GENERATION_DISABLED:PHASE2_NOT_APPROVED');
const editTarget = manifest.phase === 'PHASE_1' ? manifest.manufacturer_image_path : manifest.phase === 'PHASE_2' ? manifest.geometry_master_path : manifest.approved_master_path;
if (!editTarget) throw new Error('IMAGE_GENERATION_DISABLED:EDIT_TARGET_MISSING');
const authorization = {
  authorized: true,
  mode: 'EDIT_ONLY',
  phase: manifest.phase,
  edit_target: editTarget,
  resolved_sku: manifest.resolved_sku,
  technology: manifest.technology,
  logo_asset_path: manifest.logo_asset_path,
  technology_asset_path: manifest.technology_asset_path,
  container_color_hex: manifest.container_color_hex,
  lithography_color_hex: manifest.lithography_color_hex,
  target_view: manifest.target_view,
  protected_views: manifest.protected_views,
  allowed_changes: manifest.allowed_changes,
  immutable_elements: manifest.immutable_elements,
  rule: 'Renderer MUST perform a source-image edit. A new generation/text-to-image call is forbidden.'
};
const out = args.out || args.manifest.replace(/\.json$/i, '.authorization.json');
await fs.writeFile(out, JSON.stringify(authorization, null, 2) + '\n');
console.log(JSON.stringify({ ok:true, authorization_path:out, authorization }, null, 2));
