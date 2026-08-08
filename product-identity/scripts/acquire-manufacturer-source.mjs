#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k,...v]=a.replace(/^--/,'').split('='); return [k,v.join('=')]; }));
const code = String(args.code || '').toUpperCase();
const brand = String(args.brand || '').toUpperCase();
const productUrl = args['product-url'];
if (!code || !brand || !productUrl) throw new Error('Usage: --brand=<manufacturer> --code=<part-code> --product-url=<official-product-url> [--out-dir=<dir>]');

const host = new URL(productUrl).hostname.toLowerCase();
const brandHosts = { FLEETGUARD: ['fleetguard.com','www.fleetguard.com'] };
const allowedHosts = brandHosts[brand] || [];
if (!allowedHosts.some(h => host === h || host.endsWith(`.${h}`))) throw new Error(`STOP_MANUFACTURER_HOST_MISMATCH:${host}`);

const outDir = args['out-dir'] || `product-identity/source-assets/${code}`;
await fs.mkdir(outDir, { recursive: true });

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { throw new Error('STOP_SOURCE_BROWSER_TOOL_MISSING: install playwright'); }

const browser = await chromium.launch({ headless: true });
let page;
try {
  page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const response = await page.goto(productUrl, { waitUntil: 'networkidle', timeout: 60000 });
  if (!response || !response.ok()) throw new Error(`STOP_PRODUCT_PAGE_HTTP_${response?.status() ?? 'NO_RESPONSE'}`);

  const pageText = (await page.locator('body').innerText()).toUpperCase();
  if (!pageText.includes(code)) throw new Error('STOP_PRODUCT_PAGE_PART_NUMBER_MISMATCH');

  const candidates = await page.evaluate((partCode) => {
    const vals = [];
    const push = (url, evidence) => { if (url) vals.push({ url, evidence }); };
    for (const img of document.images) {
      const alt = (img.alt || '').toUpperCase();
      const src = img.currentSrc || img.src || '';
      if (alt.includes(partCode) || src.toUpperCase().includes(partCode)) push(src, alt.includes(partCode) ? 'IMG_ALT_PART_MATCH' : 'IMG_SRC_PART_MATCH');
    }
    const og = document.querySelector('meta[property="og:image"]')?.content;
    if (og && og.toUpperCase().includes(partCode)) push(og, 'OG_IMAGE_PART_MATCH');
    for (const r of performance.getEntriesByType('resource')) {
      const u = r.name || '';
      if (/\.(png|jpe?g|webp)(\?|$)/i.test(u) && u.toUpperCase().includes(partCode)) push(u, 'NETWORK_RESOURCE_PART_MATCH');
    }
    return vals;
  }, code);

  const unique = [...new Map(candidates.map(x => [x.url, x])).values()];
  if (!unique.length) throw new Error('STOP_OFFICIAL_PRODUCT_IMAGE_NOT_RESOLVED');

  let selected = null;
  let bytes = null;
  let contentType = '';
  for (const c of unique) {
    try {
      const u = new URL(c.url, productUrl);
      const res = await fetch(u, { redirect: 'follow', headers: { 'user-agent': 'ELIMFILTERS-product-identity/2.6' } });
      const type = res.headers.get('content-type') || '';
      if (!res.ok || !type.startsWith('image/')) continue;
      const b = Buffer.from(await res.arrayBuffer());
      if (b.length < 10000) continue;
      selected = { ...c, url: u.toString(), final_url: res.url };
      bytes = b;
      contentType = type;
      break;
    } catch {}
  }
  if (!selected || !bytes) throw new Error('STOP_OFFICIAL_PRODUCT_IMAGE_DOWNLOAD_FAILED');

  const ext = contentType.includes('png') ? '.png' : contentType.includes('webp') ? '.webp' : '.jpg';
  const imagePath = path.join(outDir, `${code}-official-source${ext}`);
  const screenshotPath = path.join(outDir, `${code}-official-page.png`);
  await fs.writeFile(imagePath, bytes);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const imageHash = crypto.createHash('sha256').update(bytes).digest('hex');
  const screenshotBytes = await fs.readFile(screenshotPath);
  const screenshotHash = crypto.createHash('sha256').update(screenshotBytes).digest('hex');
  const evidence = {
    ok: true,
    acquisition_mode: 'AUTOMATED_OFFICIAL_SOURCE',
    manufacturer: brand,
    part_number: code,
    product_url: productUrl,
    product_host: host,
    product_page_part_match: true,
    source_image_url: selected.url,
    source_image_final_url: selected.final_url,
    source_image_match_evidence: selected.evidence,
    source_image_path: imagePath,
    source_image_sha256: imageHash,
    source_image_bytes: bytes.length,
    screenshot_path: screenshotPath,
    screenshot_sha256: screenshotHash,
    screenshot_role: 'AUTOMATED_AUDIT_EVIDENCE_NOT_MANUAL_GATE',
    cache_used: false,
    previous_master_used: false,
    verified_fresh_source: true
  };
  const evidencePath = path.join(outDir, `${code}-source-evidence.json`);
  await fs.writeFile(evidencePath, JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify({ ...evidence, evidence_path: evidencePath }, null, 2));
} finally {
  await browser.close();
}
