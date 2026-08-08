#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k,...v]=a.replace(/^--/,'').split('='); return [k,v.join('=')]; }));
if (!args.url || !args.code) throw new Error('Usage: --url=<direct-image-url> --code=<part-code> [--out=<path>]');
const ext = path.extname(new URL(args.url).pathname) || '.jpg';
const out = args.out || `product-identity/source-assets/${String(args.code).toUpperCase()}${ext}`;
await fs.mkdir(path.dirname(out), { recursive: true });
const res = await fetch(args.url, { redirect: 'follow', headers: { 'user-agent': 'ELIMFILTERS-product-identity/2.0' } });
if (!res.ok) throw new Error(`STOP_SOURCE_IMAGE_HTTP_${res.status}`);
const type = res.headers.get('content-type') || '';
if (!type.startsWith('image/')) throw new Error(`STOP_SOURCE_IMAGE_NOT_IMAGE:${type}`);
const bytes = Buffer.from(await res.arrayBuffer());
if (bytes.length < 10000) throw new Error('STOP_SOURCE_IMAGE_INVALID');
await fs.writeFile(out, bytes);
console.log(JSON.stringify({ ok: true, gate: 'SOURCE_IMAGE_REQUIRED', image_path: out, bytes: bytes.length, content_type: type }, null, 2));
