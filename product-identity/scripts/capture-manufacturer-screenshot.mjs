#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k,...v]=a.replace(/^--/,'').split('='); return [k,v.join('=')]; }));
if (!args.url || !args.code) throw new Error('Usage: --url=<manufacturer-url> --code=<part-code> [--out=<path>]');
const out = args.out || `product-identity/source-assets/${String(args.code).toUpperCase()}-page.png`;
await fs.mkdir(path.dirname(out), { recursive: true });
let chromium;
try { ({ chromium } = await import('playwright')); } catch { throw new Error('STOP_SOURCE_SCREENSHOT_TOOL_MISSING: install playwright; synthetic screenshot fallback forbidden'); }
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const response = await page.goto(args.url, { waitUntil: 'networkidle', timeout: 60000 });
  if (!response || !response.ok()) throw new Error(`STOP_SOURCE_SCREENSHOT_HTTP_${response?.status() ?? 'NO_RESPONSE'}`);
  await page.screenshot({ path: out, fullPage: true });
  const stat = await fs.stat(out);
  if (stat.size < 10000) throw new Error('STOP_SOURCE_SCREENSHOT_INVALID');
  console.log(JSON.stringify({ ok: true, gate: 'SOURCE_SCREENSHOT_REQUIRED', screenshot_path: out, bytes: stat.size }, null, 2));
} finally { await browser.close(); }
