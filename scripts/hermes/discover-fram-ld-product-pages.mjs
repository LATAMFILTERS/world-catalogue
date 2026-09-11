#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';

const ROOTS = ['https://www.fram.com/sitemap.xml','https://www.fram.com/sitemap_index.xml'];
const output = path.resolve(process.argv[process.argv.indexOf('--out') + 1] || 'hermes/fram-ld-product-seeds.json');
const maxSitemaps = Number(process.env.HERMES_FRAM_LD_MAX_SITEMAPS || 100);
const timeout = Number(process.env.HERMES_FRAM_LD_DISCOVERY_TIMEOUT_MS || 30000);
const visited = new Set();
const products = new Set();

function locs(xml='') { return [...String(xml).matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map(m => m[1].replace(/&amp;/g,'&').trim()); }
function isFram(url='') { try { return new URL(url).hostname === 'www.fram.com'; } catch { return false; } }
function isSitemap(url='') { return /sitemap|\.xml(?:\?|$)/i.test(url); }
function isLikelyLdProduct(url='') {
  if (!isFram(url)) return false;
  const u = url.toLowerCase();
  if (/\/media\/|\/resources\/|\.pdf(?:\?|$)|\/commercial|heavy-duty|heavy_duty/.test(u)) return false;
  return /cabin-air-filter|engine-air-filter|oil-filter|air-filter|transmission-filter|fuel-filter|fram-(?:drive|fresh-breeze|extra-guard|tough-guard|ultra-synthetic|force|titanium)|\/products\//.test(u);
}

async function fetchText(url) {
  const r = await axios.get(url,{timeout,responseType:'text',headers:{'user-agent':'ELIMFILTERS-HERMES/1.0 (+private source discovery)','accept':'application/xml,text/xml,text/plain,*/*'}});
  return String(r.data || '');
}

const queue = [...ROOTS];
while (queue.length && visited.size < maxSitemaps) {
  const url = queue.shift();
  if (visited.has(url)) continue;
  visited.add(url);
  try {
    const xml = await fetchText(url);
    for (const loc of locs(xml)) {
      if (isLikelyLdProduct(loc)) products.add(loc);
      else if (isSitemap(loc) && isFram(loc) && !visited.has(loc)) queue.push(loc);
    }
    console.log(`[FRAM LD discovery] sitemap OK ${url}`);
  } catch (error) {
    console.error(`[FRAM LD discovery] sitemap ERROR ${url}: ${error.message}`);
  }
}

const urls = [...products].sort();
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify({
  schema_version:'1.0.0',
  source:'FRAM_OFFICIAL_SITEMAP_DISCOVERY',
  knowledge_domain:'LIGHT_DUTY_KNOWLEDGE_DOMAIN',
  industry:'Automotive',
  private_evidence_only:true,
  catalog_auto_update:false,
  discovered_at:new Date().toISOString(),
  sitemap_count:visited.size,
  url_count:urls.length,
  urls
},null,2)+'\n');
console.log(`[FRAM LD discovery] sitemaps=${visited.size} product_urls=${urls.length} output=${output}`);
if (!urls.length) process.exitCode = 1;
