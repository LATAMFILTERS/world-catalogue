#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.join('=')];
}));
const sku = String(args.sku || '').toUpperCase();
if (!sku) throw new Error('Usage: --sku=<ELIMFILTERS-SKU> [--master=<json>] [--out=<json>]');

const masterPath = args.master || `product-identity/production-master/${sku}.json`;
const master = JSON.parse(await fs.readFile(masterPath, 'utf8'));
if (String(master.sku || '').toUpperCase() !== sku) throw new Error('STOP_MASTER_SKU_MISMATCH');
if (master.media?.geometry_locked !== true) throw new Error('STOP_GEOMETRY_NOT_LOCKED');
if (master.media?.approval_status !== 'APPROVED') throw new Error('STOP_MASTER_NOT_APPROVED');
if (master.lithography?.preserve_layout_from_approved_master !== true) throw new Error('STOP_APPROVED_LAYOUT_NOT_LOCKED');

const approvedMaster = master.media?.approved_master_image;
if (!approvedMaster) throw new Error('STOP_APPROVED_MASTER_BINARY_NOT_PERSISTED');
async function hashFile(file) {
  const bytes = await fs.readFile(file);
  return crypto.createHash('sha256').update(bytes).digest('hex');
}
await fs.access(approvedMaster);
const actualMasterHash = await hashFile(approvedMaster);
if (master.media?.approved_master_sha256 && master.media.approved_master_sha256 !== actualMasterHash) {
  throw new Error('STOP_APPROVED_MASTER_HASH_MISMATCH');
}

const logoAsset = master.media?.official_logo_asset_required;
const techAsset = master.lithography?.technology_asset;
if (!logoAsset || !techAsset) throw new Error('STOP_OFFICIAL_ASSET_REFERENCE_MISSING');
await fs.access(logoAsset);
await fs.access(techAsset);

if (master.lithography?.container_color_hex !== '#414141') throw new Error('STOP_BODY_COLOR_AUTHORITY_MISMATCH');
if (master.lithography?.print_color_hex !== '#CBCBCB') throw new Error('STOP_LITHOGRAPHY_COLOR_AUTHORITY_MISMATCH');

const packet = {
  schema_version: '1.0',
  packet_type: 'ELIMFILTERS_APPROVED_MASTER_REGENERATION',
  status: 'PASS',
  render_allowed: true,
  mode: 'EDIT_APPROVED_MASTER_ONLY',
  sku,
  master_json_path: masterPath,
  edit_target: approvedMaster,
  approved_master_sha256: actualMasterHash,
  source_geometry: master.source_geometry || null,
  identity: {
    product_type: master.family,
    technology: master.technology,
    technology_descriptor: master.technology_descriptor,
    logo_asset_path: logoAsset,
    technology_asset_path: techAsset
  },
  artwork_lock: {
    body_color_hex: master.lithography.container_color_hex,
    lithography_color_hex: master.lithography.print_color_hex,
    elements: master.lithography.elements,
    preserve_layout_from_approved_master: true
  },
  immutable_elements: ['GEOMETRY','PROPORTIONS','THREAD','BASEPLATE','GASKET','PERSPECTIVE','COMPOSITION','LITHOGRAPHY_POSITIONS']
};
const out = args.out || path.join('product-identity', 'render-packets', `${sku}.approved-master-regeneration.json`);
await fs.mkdir(path.dirname(out), { recursive: true });
await fs.writeFile(out, JSON.stringify(packet, null, 2) + '\n');
console.log(JSON.stringify({ ok: true, packet_path: out, packet }, null, 2));
