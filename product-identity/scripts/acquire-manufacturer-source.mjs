#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k,...v]=a.replace(/^--/,'').split('='); return [k,v.join('=')]; }));
const code = String(args.code || '').toUpperCase();
const brand = String(args.brand || '').toUpperCase();
const productUrl = args['product-url'];
if (!code || !brand || !productUrl) throw new Error('Usage: --brand=<manufacturer> --code=<part-code> --product-url=<official-product-url> [--out-dir=<dir>]');

const brandHosts = { FLEETGUARD: ['fleetguard.com','www.fleetguard.com'] };
const allowedHosts = brandHosts[brand] || [];
function assertOfficial(url){
  const h = new URL(url).hostname.toLowerCase();
  if (!allowedHosts.some(x => h === x || h.endsWith(`.${x}`))) throw new Error(`STOP_MANUFACTURER_HOST_MISMATCH:${h}`);
  return h;
}
const originalHost = assertOfficial(productUrl);

const outDir = args['out-dir'] || `product-identity/source-assets/${code}`;
await fs.mkdir(outDir, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

function pageCandidates(){
  const urls = [productUrl];
  if (brand === 'FLEETGUARD') {
    urls.push(
      `https://www.fleetguard.com/product/${code}`,
      `https://www.fleetguard.com/product/${code.toLowerCase()}`,
      'https://www.fleetguard.com/category/products/lube-filtration/spinon-lube-filters/0ZGPL0000000FSv4AM',
      'https://www.fleetguard.com/es/category/SpinOnLubeFilters'
    );
  }
  return [...new Set(urls)].filter(u => { try { assertOfficial(u); return true; } catch { return false; } });
}

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { throw new Error('STOP_SOURCE_BROWSER_TOOL_MISSING: install playwright'); }

async function gotoResilient(page, url){
  let last = null;
  for (let i=0;i<3;i++) {
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      const status = response?.status() ?? 0;
      if (response?.ok()) {
        await page.waitForTimeout(1500);
        return { ok:true, status, url:page.url() };
      }
      last = new Error(`HTTP_${status}`);
      if (![408,429,500,502,503,504].includes(status)) break;
    } catch (e) { last = e; }
    await sleep(1200 * (i+1));
  }
  return { ok:false, error:String(last?.message || 'NO_RESPONSE') };
}

async function collectCandidates(page){
  return await page.evaluate((partCode) => {
    const vals = [];
    const push = (url, evidence) => { if (url) vals.push({ url, evidence }); };
    for (const img of document.images) {
      const alt = (img.alt || '').toUpperCase();
      const src = img.currentSrc || img.src || '';
      const parentText = (img.closest('article,li,section,div')?.textContent || '').toUpperCase();
      if (alt.includes(partCode)) push(src, 'IMG_ALT_PART_MATCH');
      else if (src.toUpperCase().includes(partCode)) push(src, 'IMG_SRC_PART_MATCH');
      else if (parentText.includes(partCode)) push(src, 'IMG_CONTAINER_PART_MATCH');
    }
    const og = document.querySelector('meta[property="og:image"]')?.content;
    if (og && (og.toUpperCase().includes(partCode) || document.body.innerText.toUpperCase().includes(partCode))) push(og, 'OG_IMAGE_PAGE_PART_MATCH');
    for (const r of performance.getEntriesByType('resource')) {
      const u = r.name || '';
      if (/\.(png|jpe?g|webp)(\?|$)/i.test(u) && u.toUpperCase().includes(partCode)) push(u, 'NETWORK_RESOURCE_PART_MATCH');
    }
    return vals;
  }, code);
}

async function downloadImage(candidate, baseUrl){
  try {
    const u = new URL(candidate.url, baseUrl);
    const res = await fetch(u, { redirect:'follow', headers:{ 'user-agent':'ELIMFILTERS-product-identity/2.7', 'cache-control':'no-cache' } });
    const type = res.headers.get('content-type') || '';
    if (!res.ok || !type.startsWith('image/')) return null;
    const b = Buffer.from(await res.arrayBuffer());
    if (b.length < 10000) return null;
    return { selected:{ ...candidate, url:u.toString(), final_url:res.url }, bytes:b, contentType:type };
  } catch { return null; }
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport:{ width:1440, height:1200 } });
  const attempts = [];
  let resolvedPage = null;
  let selectedDownload = null;
  let screenshotPath = null;

  for (const candidatePageUrl of pageCandidates()) {
    const nav = await gotoResilient(page, candidatePageUrl);
    attempts.push({ url:candidatePageUrl, ...nav });
    if (!nav.ok) continue;

    const pageText = (await page.locator('body').innerText().catch(()=>'' )).toUpperCase();
    if (!pageText.includes(code)) continue;

    const imageCandidates = [...new Map((await collectCandidates(page)).map(x => [x.url, x])).values()];
    for (const c of imageCandidates) {
      const d = await downloadImage(c, page.url());
      if (d) { selectedDownload = d; resolvedPage = page.url(); break; }
    }
    if (selectedDownload) {
      screenshotPath = path.join(outDir, `${code}-official-page.png`);
      try { await page.screenshot({ path:screenshotPath, fullPage:true }); }
      catch { screenshotPath = null; }
      break;
    }
  }

  if (!selectedDownload) throw new Error(`STOP_OFFICIAL_PRODUCT_IMAGE_NOT_RESOLVED_AFTER_FALLBACKS:${JSON.stringify(attempts)}`);

  const { selected, bytes, contentType } = selectedDownload;
  const ext = contentType.includes('png') ? '.png' : contentType.includes('webp') ? '.webp' : '.jpg';
  const imagePath = path.join(outDir, `${code}-official-source${ext}`);
  await fs.writeFile(imagePath, bytes);

  const imageHash = crypto.createHash('sha256').update(bytes).digest('hex');
  let screenshotHash = null;
  if (screenshotPath) {
    try { screenshotHash = crypto.createHash('sha256').update(await fs.readFile(screenshotPath)).digest('hex'); }
    catch { screenshotPath = null; }
  }

  const evidence = {
    ok:true,
    acquisition_mode:'AUTOMATED_OFFICIAL_SOURCE_RESILIENT',
    manufacturer:brand,
    part_number:code,
    requested_product_url:productUrl,
    requested_product_host:originalHost,
    resolved_official_page_url:resolvedPage,
    resolved_official_page_host:assertOfficial(resolvedPage),
    product_page_part_match:true,
    transient_http_fallback_used:resolvedPage !== productUrl,
    acquisition_attempts:attempts,
    source_image_url:selected.url,
    source_image_final_url:selected.final_url,
    source_image_match_evidence:selected.evidence,
    source_image_path:imagePath,
    source_image_sha256:imageHash,
    source_image_bytes:bytes.length,
    screenshot_path:screenshotPath,
    screenshot_sha256:screenshotHash,
    screenshot_role:'BEST_EFFORT_AUTOMATED_AUDIT_EVIDENCE_NOT_RENDER_GATE',
    cache_used:false,
    previous_master_used:false,
    verified_fresh_source:true
  };
  const evidencePath = path.join(outDir, `${code}-source-evidence.json`);
  await fs.writeFile(evidencePath, JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify({ ...evidence, evidence_path:evidencePath }, null, 2));
} finally {
  await browser.close();
}
