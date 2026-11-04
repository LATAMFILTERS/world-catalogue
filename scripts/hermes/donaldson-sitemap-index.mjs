#!/usr/bin/env node
// READ-ONLY. Builds the code -> official product URL index of shop.donaldson.com from the product sitemaps that the
// site itself declares in robots.txt (Sitemap: https://shop.donaldson.com/sitemaps/siteindex.xml). Replaces guessing
// product ids or discovering URLs through search engines (lib/donaldson-url-discovery.js) for bulk work.
// Output: out/donaldson/sitemap-index.json  { generated_at, sitemaps, products: { NORMCODE: [url, ...] } }
// Usage: node scripts/hermes/donaldson-sitemap-index.mjs [--delay-ms 1500]

import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, cur, i, arr) => {
  if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return acc;
}, []));
const delayMs = Number(args['delay-ms'] || 1500);
const H = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', Accept: 'application/xml,text/xml,*/*' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const locs = (xml) => [...String(xml).matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);

async function get(url) {
  for (let a = 0; a < 3; a++) {
    try { const r = await fetch(url, { headers: H }); if (r.ok) return await r.text(); if (r.status === 404) return ''; } catch { /* retry */ }
    await sleep(delayMs * (a + 2));
  }
  throw new Error(`FETCH_FAILED ${url}`);
}

const index = locs(await get('https://shop.donaldson.com/sitemaps/siteindex.xml')).filter((u) => /productSitemap/i.test(u));
const products = {};
let urls = 0;
for (const [i, sm] of index.entries()) {
  await sleep(delayMs);
  for (const u of locs(await get(sm))) {
    const m = /\/store\/en-us\/product\/([^/]+)\/([^/?#]+)/i.exec(u);
    if (!m) continue;
    const code = norm(decodeURIComponent(m[1]));
    (products[code] ||= []).includes(u) || products[code].push(u);
    urls++;
  }
  if ((i + 1) % 10 === 0) console.log(`[${i + 1}/${index.length}] codes=${Object.keys(products).length}`);
}
const outDir = path.resolve('out', 'donaldson'); fs.mkdirSync(outDir, { recursive: true });
const file = path.join(outDir, 'sitemap-index.json');
fs.writeFileSync(file, JSON.stringify({ generated_at: new Date().toISOString(), source: 'https://shop.donaldson.com/sitemaps/siteindex.xml',
  sitemaps: index.length, en_us_urls: urls, products }, null, 1));
console.log(JSON.stringify({ sitemaps: index.length, en_us_urls: urls, codes: Object.keys(products).length,
  multi_url_codes: Object.values(products).filter((v) => v.length > 1).length, sample_P551000: products.P551000 || null, file }, null, 2));
