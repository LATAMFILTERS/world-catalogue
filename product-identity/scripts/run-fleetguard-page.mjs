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
    return {
      ok: false,
      status: r.status,
      error: (r.stderr || r.stdout || `FAILED:${script}`).trim()
    };
  }
  try { return { ok: true, value: JSON.parse(r.stdout) }; }
  catch { return { ok: false, status: r.status, error: `INVALID_JSON:${r.stdout.slice(0, 4000)}` }; }
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const step = 700;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        total += step;
        if (total >= document.body.scrollHeight + 2500) {
          clearInterval(timer);
          resolve();
        }
      }, 180);
    });
  });
  await page.waitForTimeout(1200);
}

async function collectFleetguardProducts() {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    const response = await page.goto(categoryUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (!response?.ok()) throw new Error(`Fleetguard category HTTP ${response?.status() || 0}`);
    await page.waitForTimeout(1800);
    await autoScroll(page);

    const rows = await page.evaluate(() => {
      const out = [];
      const seen = new Set();
      for (const a of document.querySelectorAll('a[href]')) {
        const href = a.href || '';
        const text = (a.textContent || '').trim().toUpperCase();
        const m = href.match(/\/product\/([A-Z0-9_-]+)/i);
        const part = m?.[1]?.toUpperCase() || (text.match(/\bLF\d+[A-Z0-9-]*\b/) || [])[0];
        if (!part || !/^LF[A-Z0-9-]+$/i.test(part)) continue;
        const key = part.toUpperCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ part_number: key, product_url: href });
      }
      return out;
    });

    if (rows.length < count) {
      throw new Error(`Only ${rows.length} unique Fleetguard product links were discovered; requested ${count}`);
    }

    return rows.slice(0, count);
  } finally {
    await browser.close();
  }
}

await fs.mkdir(outDir, { recursive: true });

const products = await collectFleetguardProducts();
const batch = {
  schema: 'elimfilters.fleetguard-page-batch.v1',
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
    batch.products.push({
      position,
      competitor_sku: product.part_number,
      product_url: product.product_url,
      status: 'STOP_REVIEW',
      error: prep.error
    });
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
