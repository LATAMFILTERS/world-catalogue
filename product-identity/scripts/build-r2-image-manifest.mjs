#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.join('=')];
}));

const required = [
  'sku','image-url','image-key','sha256',
  'manifest-url','manifest-key','out'
];
for (const k of required) {
  if (!args[k]) throw new Error(`MISSING_ARGUMENT:${k}`);
}

const sku = String(args.sku).toUpperCase();
const approvedAt = args['approved-at'] || null;
const manifest = {
  schema_version: '1.0',
  sku,
  status: 'APPROVED_GOLDEN_MASTER',
  image: {
    url: args['image-url'],
    r2_key: args['image-key'],
    sha256: args.sha256,
    content_type: 'image/png'
  },
  json_url: args['manifest-url'],
  r2_manifest_key: args['manifest-key'],
  approved_at: approvedAt,
  published_at: new Date().toISOString()
};

await fs.mkdir(path.dirname(args.out), { recursive: true });
await fs.writeFile(args.out, JSON.stringify(manifest, null, 2) + '\n');

console.log(JSON.stringify({
  ok: true,
  sku,
  out: args.out,
  image_url: manifest.image.url,
  manifest_url: manifest.json_url,
  sha256: manifest.image.sha256
}, null, 2));
