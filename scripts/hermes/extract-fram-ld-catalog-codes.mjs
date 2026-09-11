#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import axios from 'axios';

const ROOTS = ['https://www.fram.com/sitemap.xml','https://www.fram.com/sitemap_index.xml'];
const outRoot = path.resolve(process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : 'elimfilters-vault/91-private-evidence/fram-ld-catalog-codes');
const maxSitemaps = Number(process.env.HERMES_FRAM_CATALOG_MAX_SITEMAPS || 150);
const timeoutMs = Number(process.env.HERMES_FRAM_CATALOG_TIMEOUT_MS || 30000);
const pageConcurrency = Math.max(1, Math.min(10, Number(process.env.HERMES_FRAM_CATALOG_CONCURRENCY || 4)));
const limit = Number(process.argv.includes('--limit') ? process.argv[process.argv.indexOf('--limit') + 1] : 0);

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const uniq = (values) => [...new Set(values.filter(Boolean).map(v => String(v).trim()).filter(Boolean))];
const normalizeCode = (value='') => String(value).toUpperCase().replace(/[^A-Z0-9]/g,'');
const locs = (xml='') => [...String(xml).matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map(m => m[1].replace(/&amp;/g,'&').trim());

function isFram(url='') { try { return new URL(url).hostname === 'www.fram.com'; } catch { return false; } }
function isSitemap(url='') { return /sitemap|\.xml(?:\?|$)/i.test(url); }
function isLikelyLdProduct(url='') {
  if (!isFram(url)) return false;
  const u = url.toLowerCase();
  if (/\/media\/|\/resources\/|\.pdf(?:\?|$)|commercial|heavy-duty|heavy_duty/.test(u)) return false;
  return /cabin-air-filter|engine-air-filter|oil-filter|air-filter|transmission-filter|fuel-filter|fram-(?:drive|fresh-breeze|extra-guard|tough-guard|ultra-synthetic|force|titanium)|\/products\//.test(u);
}

async function get(url, accept='text/html,application/xhtml+xml,application/xml,text/xml,*/*') {
  const r = await axios.get(url,{timeout:timeoutMs,responseType:'arraybuffer',maxContentLength:10_000_000,maxBodyLength:10_000_000,headers:{'user-agent':'ELIMFILTERS-HERMES/1.0 (+private catalog census)','accept':accept}});
  return { body:Buffer.from(r.data), contentType:String(r.headers['content-type']||''), effectiveUrl:r.request?.res?.responseUrl || url };
}

async function discoverProductUrls() {
  const visited = new Set(), products = new Set(), queue = [...ROOTS], errors = [];
  while (queue.length && visited.size < maxSitemaps) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);
    try {
      const { body } = await get(url,'application/xml,text/xml,text/plain,*/*');
      for (const loc of locs(body.toString('utf8'))) {
        if (isLikelyLdProduct(loc)) products.add(loc);
        else if (isSitemap(loc) && isFram(loc) && !visited.has(loc)) queue.push(loc);
      }
    } catch (error) { errors.push({url,error:error.message}); }
  }
  return { urls:[...products].sort(), sitemap_count:visited.size, errors };
}

function jsonScripts(html='') {
  const values = [];
  for (const re of [/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/gi]) {
    let m; while ((m = re.exec(html))) { try { values.push(JSON.parse(m[1])); } catch {} }
  }
  return values;
}
function walk(node, fn) { if (Array.isArray(node)) return node.forEach(v=>walk(v,fn)); if (!node || typeof node !== 'object') return; fn(node); for (const v of Object.values(node)) walk(v,fn); }

function extractCodesFromPage(url, html) {
  const candidates = [];
  for (const root of jsonScripts(html)) walk(root, obj => {
    for (const [k,v] of Object.entries(obj)) {
      const key = k.toLowerCase();
      if (['sku','partnumber','part_number','productcode','product_code','mpn','model'].includes(key) && ['string','number'].includes(typeof v)) candidates.push(String(v));
    }
  });
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '';
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '';
  const pathText = decodeURIComponent(new URL(url).pathname).replace(/[\/_-]+/g,' ');
  for (const text of [title,h1,pathText]) candidates.push(...(String(text).match(/\b[A-Z]{1,6}[A-Z0-9-]{2,20}\d[A-Z0-9-]*\b/gi)||[]));

  const reject = /^(FRAM|FILTER|FILTERS|ENGINE|CABIN|DRIVE|GUARD|TITANIUM|PRODUCT|PRODUCTS|AUTOMOTIVE|SYNTHETIC|FRESH|ULTRA|TOUGH|EXTRA|FORCE)$/i;
  return uniq(candidates.map(v=>String(v).replace(/<[^>]+>/g,' ').trim()).filter(v=>/\d/.test(v) && v.length >= 3 && v.length <= 28 && !reject.test(v)))
    .map(raw => ({ raw_code:raw, normalized_code:normalizeCode(raw) }))
    .filter(v=>v.normalized_code.length >= 3);
}

async function mapLimit(items, concurrency, fn) {
  const out = new Array(items.length); let cursor = 0;
  async function worker() { while (true) { const i = cursor++; if (i >= items.length) return; out[i] = await fn(items[i],i); } }
  await Promise.all(Array.from({length:Math.min(concurrency,items.length)},()=>worker())); return out;
}

const discovery = await discoverProductUrls();
let urls = discovery.urls;
if (limit > 0) urls = urls.slice(0,limit);
if (!urls.length) { console.error('[FRAM catalog census] no LD product URLs discovered'); process.exit(2); }

fs.mkdirSync(outRoot,{recursive:true});
const capturedAt = new Date().toISOString();
const pageResults = await mapLimit(urls,pageConcurrency,async (url,index) => {
  try {
    const { body, contentType, effectiveUrl } = await get(url);
    if (!/html|xhtml/i.test(contentType)) throw new Error(`unsupported content-type ${contentType || 'unknown'}`);
    const html = body.toString('utf8');
    const codes = extractCodesFromPage(effectiveUrl,html);
    console.log(`[FRAM catalog census] ${index+1}/${urls.length} codes=${codes.length} ${url}`);
    return {url,effective_url:effectiveUrl,status:'OK',snapshot_sha256:sha256(body),codes};
  } catch (error) {
    console.error(`[FRAM catalog census] ${index+1}/${urls.length} ERROR ${url}: ${error.message}`);
    return {url,status:'ERROR',error:error.message,codes:[]};
  }
});

const codeMap = new Map();
for (const page of pageResults) for (const code of page.codes || []) {
  const key = code.normalized_code;
  if (!codeMap.has(key)) codeMap.set(key,{code:code.raw_code,normalized_code:key,knowledge_domain:'LIGHT_DUTY_KNOWLEDGE_DOMAIN',industry:'Automotive',status:'observed',source_urls:[],source_snapshot_sha256:[]});
  const rec = codeMap.get(key); rec.source_urls.push(page.effective_url || page.url); if (page.snapshot_sha256) rec.source_snapshot_sha256.push(page.snapshot_sha256);
}
const codes = [...codeMap.values()].map(r=>({...r,source_urls:uniq(r.source_urls),source_snapshot_sha256:uniq(r.source_snapshot_sha256)})).sort((a,b)=>a.normalized_code.localeCompare(b.normalized_code));
const runId = `fram-ld-catalog-${capturedAt.replace(/[:.]/g,'-')}`;
const manifest = {
  schema_version:'1.0.0',run_id:runId,source:'FRAM_OFFICIAL_ONLINE_CATALOG_SURFACES',captured_at:capturedAt,
  knowledge_domain:'LIGHT_DUTY_KNOWLEDGE_DOMAIN',industry:'Automotive',private_evidence_only:true,
  catalog_auto_update:false,cross_auto_confirmation:false,application_auto_confirmation:false,
  sitemap_count:discovery.sitemap_count,product_url_count:urls.length,page_ok:pageResults.filter(r=>r.status==='OK').length,page_errors:pageResults.filter(r=>r.status==='ERROR').length,
  unique_code_count:codes.length,sitemap_errors:discovery.errors
};
fs.writeFileSync(path.join(outRoot,'latest-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(outRoot,'fram-ld-codes.json'),JSON.stringify({manifest,codes},null,2)+'\n');
fs.writeFileSync(path.join(outRoot,'fram-ld-product-pages.json'),JSON.stringify({captured_at:capturedAt,pages:pageResults},null,2)+'\n');
const csv = ['code,normalized_code,status,source_count',...codes.map(r=>[r.code,r.normalized_code,r.status,r.source_urls.length].map(v=>`"${String(v).replaceAll('"','""')}"`).join(','))].join('\n')+'\n';
fs.writeFileSync(path.join(outRoot,'fram-ld-codes.csv'),csv);
console.log(`[FRAM catalog census] COMPLETE product_urls=${urls.length} unique_codes=${codes.length} output=${outRoot}`);
if (!codes.length) process.exitCode = 1;
