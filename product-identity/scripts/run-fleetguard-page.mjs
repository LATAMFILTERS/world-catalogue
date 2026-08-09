#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.join('=')];
}));

const pageNumber = Number(args.page || 1);
const count = Number(args.count || 20);
const categoryUrl = args['category-url'] || 'https://www.fleetguard.com/es/category/productos/filtraci%C3%B3n-de-lubricante/filtros-de-lubricante-giratorios/0ZGPL0000000FSv4AM';
const outDir = args['out-dir'] || `product-identity/batches/fleetguard/page-${pageNumber}`;

if (!Number.isInteger(pageNumber) || pageNumber < 1) throw new Error('--page must be a positive integer');
if (!Number.isInteger(count) || count < 1 || count > 100) throw new Error('--count must be between 1 and 100');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { throw new Error('Playwright is required. Run: npm install --no-save playwright && npx playwright install chromium'); }

function runJson(script, argv) {
  const r = spawnSync(process.execPath, [script, ...argv], {
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 1024 * 1024 * 64
  });
  if (r.status !== 0) {
    return { ok: false, status: r.status, error: (r.stderr || r.stdout || `FAILED:${script}`).trim() };
  }
  try { return { ok: true, value: JSON.parse(r.stdout) }; }
  catch { return { ok: false, status: r.status, error: `INVALID_JSON:${r.stdout.slice(0, 4000)}` }; }
}

async function autoScroll(page) {
  for (let i = 0; i < 18; i++) {
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(350);
  }
  await page.waitForTimeout(1500);
}

async function collectFleetguardProducts() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    const observed = [];

    page.on('response', async (response) => {
      const type = response.request().resourceType();
      if (!['xhr', 'fetch', 'document'].includes(type)) return;
      const ct = (response.headers()['content-type'] || '').toLowerCase();
      if (!ct.includes('json') && !ct.includes('text')) return;
      try {
        const text = await response.text();
        const matches = text.match(/\bLF\d+[A-Z0-9-]*\b/gi) || [];
        for (const m of matches) observed.push(m.toUpperCase());
      } catch {}
    });

    const response = await page.goto(categoryUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (!response?.ok()) throw new Error(`Fleetguard category HTTP ${response?.status() || 0}`);
    await page.waitForTimeout(2500);
    await autoScroll(page);

    const domCodes = await page.evaluate(() => {
      const ordered = [];
      const pushMatches = (value) => {
        if (!value) return;
        const ms = String(value).match(/\bLF\d+[A-Z0-9-]*\b/gi) || [];
        for (const m of ms) ordered.push(m.toUpperCase());
      };

      for (const el of document.querySelectorAll('a[href], img, [data-product-code], [data-part-number], article, li')) {
        pushMatches(el.getAttribute?.('href'));
        pushMatches(el.getAttribute?.('src'));
        pushMatches(el.getAttribute?.('alt'));
        pushMatches(el.getAttribute?.('data-product-code'));
        pushMatches(el.getAttribute?.('data-part-number'));
        pushMatches(el.textContent);
      }
      pushMatches(document.body?.innerText || '');
      for (const r of performance.getEntriesByType('resource')) pushMatches(r.name || '');
      return ordered;
    });

    const all = [...domCodes, ...observed];
    const seen = new Set();
    const rows = [];
    for (const code of all) {
      const part = String(code).toUpperCase();
      if (!/^LF\d+[A-Z0-9-]*$/.test(part) || seen.has(part)) continue;
      seen.add(part);
      rows.push({ part_number: part, product_url: `https://www.fleetguard.com/product/${part}` });
      if (rows.length >= count) break;
    }

    if (rows.length < count) {
      const debugDir = path.join(outDir, 'debug');
      await fs.mkdir(debugDir, { recursive: true });
      await page.screenshot({ path: path.join(debugDir, 'category-page.png'), fullPage: true }).catch(() => {});
      await fs.writeFile(path.join(debugDir, 'category-text.txt'), await page.locator('body').innerText().catch(() => ''));
      await fs.writeFile(path.join(debugDir, 'observed-codes.json'), JSON.stringify({ domCodes, observed }, null, 2));
      throw new Error(`Only ${rows.length} unique Fleetguard LF codes were discovered; requested ${count}. Debug saved to ${debugDir}`);
    }

    return rows;
  } finally {
    await browser.close();
  }
}

await fs.mkdir(outDir, { recursive: true });

const products = await collectFleetguardProducts();
const batch = {
  schema: 'elimfilters.fleetguard-page-batch.v2',
  page: pageNumber,
  requested_count: count,
  category_url: categoryUrl,
  generated_at: new Date().toISOString(),
  products: []
};

for (let i = 0; i < products.length; i++) {
  const product = products[i];
  const position = i + 1;
  process.stdout.write(`[${position}/${count}] ${product.part_number} ... `);

  const packetOut = path.join('product-identity', 'render-packets', `${product.part_number}.phase_2.authorized.json`);
  const prep = runJson('product-identity/scripts/prepare-product-render.mjs', [
    '--brand=FLEETGUARD',
    `--code=${product.part_number}`,
    `--product-url=${product.product_url}`,
    '--phase=PHASE_2',
    `--out=${packetOut}`
  ]);

  if (prep.ok) {
    const packet = prep.value.packet || prep.value;
    batch.products.push({
      position,
      competitor_sku: product.part_number,
      product_url: product.product_url,
      status: 'AUTHORIZED_RENDER_PACKET_PASS',
      elimfilters_sku: packet?.identity?.elimfilters_sku || null,
      filter_type: packet?.identity?.filter_type || null,
      technology: packet?.identity?.technology || null,
      source_image_path: packet?.source?.official_image_path || null,
      source_image_sha256: packet?.source?.official_image_sha256 || null,
      screenshot_path: packet?.source?.source_evidence_path || null,
      packet_path: prep.value.packet_path || packetOut
    });
    console.log('PASS');
  } else {
    batch.products.push({ position, competitor_sku: product.part_number, product_url: product.product_url, status: 'STOP_REVIEW', error: prep.error });
    console.log('STOP_REVIEW');
  }

  await fs.writeFile(path.join(outDir, 'batch.json'), JSON.stringify(batch, null, 2) + '\n');
}

const pass = batch.products.filter((x) => x.status === 'AUTHORIZED_RENDER_PACKET_PASS').length;
const stop = batch.products.length - pass;
batch.summary = { pass, stop_review: stop, total: batch.products.length };
await fs.writeFile(path.join(outDir, 'batch.json'), JSON.stringify(batch, null, 2) + '\n');

console.log(`\nFleetguard page ${pageNumber}: ${pass} PASS / ${stop} STOP_REVIEW / ${batch.products.length} total`);
console.log(`Manifest: ${path.join(outDir, 'batch.json')}`);
if (stop > 0) process.exitCode = 2;
