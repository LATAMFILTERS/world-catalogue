#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.join('=')];
}));

const required = ['sku', 'bucket', 'key', 'cdn-url', 'sha256'];
for (const k of required) {
  if (!args[k]) throw new Error(`MISSING_ARGUMENT:${k}`);
}

const sku = String(args.sku).toUpperCase();
const masterPath = `product-identity/production-master/${sku}.json`;
const sourcePath = `product-identity/source-images/${sku}.json`;

async function updateJson(file) {
  let data;
  try {
    data = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return false;
    throw e;
  }

  const storage = {
    provider: 'CLOUDFLARE_R2',
    bucket: args.bucket,
    key: args.key,
    cdn_url: args['cdn-url'],
    object_sha256: args.sha256,
    publication_status: 'PUBLISHED_VERIFIED',
    published_at: new Date().toISOString()
  };

  data.storage = storage;
  if (data.approved_render && typeof data.approved_render === 'object') {
    data.approved_render.storage = storage;
  }
  if (data.visualMaster && typeof data.visualMaster === 'object') {
    data.visualMaster.storage = storage;
  }
  if (data.approvedRender && typeof data.approvedRender === 'object') {
    data.approvedRender.storage = storage;
  }

  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n');
  return true;
}

const updated = [];
if (await updateJson(masterPath)) updated.push(masterPath);
if (await updateJson(sourcePath)) updated.push(sourcePath);

if (!updated.length) throw new Error(`NO_MASTER_RECORD_FOUND:${sku}`);
console.log(JSON.stringify({ ok: true, sku, updated, bucket: args.bucket, key: args.key, cdn_url: args['cdn-url'] }, null, 2));
