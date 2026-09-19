#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.join('=')];
}));

const required = [
  'sku','bucket','key','cdn-url','sha256',
  'manifest-key','manifest-url'
];
for (const k of required) {
  if (!args[k]) throw new Error(`MISSING_ARGUMENT:${k}`);
}

const sku = String(args.sku).toUpperCase();
const masterPath = `product-identity/production-master/${sku}.json`;
const approvalPath = `product-identity/approved-masters/${sku}/approval-record.json`;
const storage = {
  provider: 'CLOUDFLARE_R2',
  bucket: args.bucket,
  image_key: args.key,
  image_url: args['cdn-url'],
  image_sha256: args.sha256,
  manifest_key: args['manifest-key'],
  manifest_url: args['manifest-url'],
  catalog_json_url: args['manifest-url'],
  publication_status: 'PUBLISHED_VERIFIED',
  published_at: new Date().toISOString()
};

async function updateJson(file) {
  let data;
  try {
    data = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return false;
    throw e;
  }
  data.storage = storage;

  if (data.media && typeof data.media === 'object') {
    data.media.approved_master_image = storage.image_url;
    data.media.approved_master_sha256 = storage.image_sha256;
    data.media.r2_publication_status = storage.publication_status;
    data.media.r2_image_url = storage.image_url;
    data.media.r2_manifest_url = storage.manifest_url;
  }

  if (data.approved_render && typeof data.approved_render === 'object') {
    data.approved_render.storage = storage;
  }
  if (data.visualMaster && typeof data.visualMaster === 'object') {
    data.visualMaster.storage = storage;
  }

  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n');
  return true;
}
const updated = [];
if (await updateJson(masterPath)) updated.push(masterPath);
if (await updateJson(approvalPath)) updated.push(approvalPath);

if (!updated.length) throw new Error(`NO_MASTER_RECORD_FOUND:${sku}`);

console.log(JSON.stringify({
  ok: true,
  sku,
  updated,
  storage
}, null, 2));
