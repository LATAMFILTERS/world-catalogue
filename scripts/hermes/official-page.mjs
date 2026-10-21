#!/usr/bin/env node
// HERMES — read one official catalogue page with the Lenovo's real Chrome.
//
// Donaldson and Parker block automated readers and headless browsers; with the
// Lenovo VPN on, a visible Chrome gets through. Prints JSON:
// { url, final_url, status, blocked, text, sha256 } where sha256 is the hash of
// the captured text (the evidence_sha256 of hermes.sku_research.v1).
// Usage: node scripts/hermes/official-page.mjs <https-url> [--wait "<regex>"] [--search "<text typed in the site's search box>"]
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const MAX_TEXT = 40_000;

export async function readOfficialPage(url, { wait = null, search = null, launch = null, timeoutMs = 60_000 } = {}) {
  if (!/^https:\/\//.test(String(url))) throw new Error('only https URLs are allowed');
  const chromium = launch ? null : (await import('patchright')).chromium;
  const start = launch || ((opts) => chromium.launch(opts));
  let browser;
  // Visible Chrome first (passes bot protection); headless if no desktop is available.
  try { browser = await start({ headless: process.env.HERMES_BROWSER_HEADLESS === 'true', channel: 'chrome' }); }
  catch { browser = await start({ headless: true }); }
  try {
    const page = await browser.newPage({ locale: 'en-US', viewport: { width: 1440, height: 1200 } });
    // OEM parts lists are often PDFs: download through the same browser session and extract the text.
    const head = await page.request.get(url, { timeout: timeoutMs });
    if (!search && (/application\/pdf/i.test(head.headers()['content-type'] || '') || /\.pdf(\?|$)/i.test(url))) {
      const { extractText, getDocumentProxy } = await import('unpdf');
      const pdf = await getDocumentProxy(new Uint8Array(await head.body()));
      const text = String((await extractText(pdf, { mergePages: true })).text).replace(/[ \t]+/g, ' ').trim().slice(0, MAX_TEXT);
      return { url, final_url: head.url(), status: head.status(), blocked: head.status() === 403, pdf: true, text, sha256: crypto.createHash('sha256').update(text).digest('hex') };
    }
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    // Sites like Fleetguard only search from their search box (search URLs redirect home): type the query like a person.
    if (search) {
      await page.waitForTimeout(5000);
      const boxes = page.locator('input[type="search"], input[placeholder*="earch" i], input[name*="search" i], input[aria-label*="earch" i]');
      let typed = false;
      for (let i = 0, n = await boxes.count(); i < n && !typed; i += 1) {
        const box = boxes.nth(i);
        if (await box.isVisible()) { await box.fill(search); await box.press('Enter'); typed = true; }
      }
      if (!typed) throw new Error('no visible search box on this page');
    }
    const ready = wait ? new RegExp(wait, 'i') : null;
    let text = '';
    // Catalogue sites render products with JavaScript: poll until the expected content shows (max ~30 s).
    for (let i = 0; i < 12; i += 1) {
      await page.waitForTimeout(2500);
      text = String(await page.evaluate(() => document.body?.innerText || '')).replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
      if (!ready || ready.test(text) || /Access Denied/i.test(text)) break;
    }
    text = text.slice(0, MAX_TEXT);
    return { url, final_url: page.url(), status: res?.status() ?? null, blocked: /Access Denied|You don't have permission to access/i.test(text), text, sha256: crypto.createHash('sha256').update(text).digest('hex') };
  } finally { await browser.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [url] = process.argv.slice(2);
  const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
  readOfficialPage(url, { wait: arg('--wait'), search: arg('--search') })
    .then((r) => console.log(JSON.stringify(r)))
    .catch((error) => { console.log(JSON.stringify({ url, error: error.message })); process.exit(1); });
}
