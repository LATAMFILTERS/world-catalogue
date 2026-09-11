#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { classifyFramLdFamily, isAllowedFramLdFamily } = require('../../lib/knowledge-governance/fram-ld-catalog-scope');

const ROOTS = ['https://www.fram.com/sitemap.xml','https://www.fram.com/sitemap_index.xml'];
const outIndex = process.argv.indexOf('--out');
const output = path.resolve(outIndex >= 0 && process.argv[outIndex + 1] ? process.argv[outIndex + 1] : 'hermes/fram-ld-product-seeds.json');
const maxSitemaps = Number(process.env.HERMES_FRAM_LD_MAX_SITEMAPS || 100);
const timeout = Number(process.env.HERMES_FRAM_LD_DISCOVERY_TIMEOUT_MS || 30000);
const visited = new Set();
const products = new Map();

function locs(xml='') { return [...String(xml).matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map(m => m[1].replace(/&amp;/g,'&').trim()); }
function isFram(url='') { try { return new URL(url).hostname === 'www.fram.com'; } catch { return false; } }
function isSitemap(url='') { return /sitemap|\.xml(?:\?|$)/i.test(url); }
function classifyProductUrl(url='') {
  if (!isFram(url)) return null;
  const u = url.toLowerCase();
  if (/\/media\/|\/resources\/|\.pdf(?:\?|$)|\/commercial|heavy-duty|heavy_duty|transmission|coolant|hydraulic/.test(u)) return null;
  const family = classifyFramLdFamily(u);
  return isAllowedFramLdFamily(family) ? family : null;
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
      const family = classifyProductUrl(loc);
      if (family) products.set(loc,{url:loc,family});
      else if (isSitemap(loc) && isFram(loc) && !visited.has(loc)) queue.push(loc);
    }
    console.log(`[FRAM LD discovery] sitemap OK ${url}`);
  } catch (error) {
    console.error(`[FRAM LD discovery] sitemap ERROR ${url}: ${error.message}`);
  }
}

const seeds = [...products.values()].sort((a,b)=>a.url.localeCompare(b.url));
const familyCounts = Object.fromEntries(['LUBE','AIR','CABIN','FUEL'].map(f => [f,seeds.filter(s=>s.family===f).length]));
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify({
  schema_version:'2.0.0',
  source:'FRAM_OFFICIAL_SITEMAP_DISCOVERY',
  knowledge_domain:'LIGHT_DUTY_KNOWLEDGE_DOMAIN',
  industry:'Automotive',
  allowed_families:['LUBE','AIR','CABIN','FUEL'],
  europe_promotion_allowed:false,
  europe_nomenclature_authority:'MANN_FILTER',
  private_evidence_only:true,
  catalog_auto_update:false,
  discovered_at:new Date().toISOString(),
  sitemap_count:visited.size,
  url_count:seeds.length,
  family_counts:familyCounts,
  seeds,
  urls:seeds.map(s=>s.url)
},null,2)+'\n');
console.log(`[FRAM LD discovery] sitemaps=${visited.size} product_urls=${seeds.length} families=${JSON.stringify(familyCounts)} output=${output}`);
if (!seeds.length) process.exitCode = 1;
