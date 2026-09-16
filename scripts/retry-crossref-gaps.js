/**
 * retry-crossref-gaps.js
 *
 * Generic retry scraper for real (non-alias) brand_crossrefs gaps in any
 * donaldson_<category>_results.json. Computes the gap list itself at
 * runtime (same false-gap/real-gap logic as classify-crossref-gaps.js /
 * propagate-crossref-aliases.js -- run those first so aliases are already
 * propagated and don't get wastefully re-scraped here).
 *
 * Domain per category matches build-competitor-matrix.js's DOMAIN_MAP.
 * Parser reads the live <li><a href="/convert/BRAND/CODE"> markup (fixed
 * in retry-lube-crossref-gaps.js -- these sites don't use <table>).
 *
 * Run (from world-catalogue/scripts, on the Lenovo, real internet access):
 *   node retry-crossref-gaps.js <category>
 *   node retry-crossref-gaps.js <category> --dry
 *
 * Effect: merges any newly-found crossrefs into
 *   donaldson_<category>_crossref_progress.json   (if that cache file exists)
 *   donaldson_<category>_results.json             (brand_crossrefs per product)
 * Never overwrites a code that already has crossrefs; never touches any
 * other category's files.
 */
'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');

const category = process.argv[2];
const DRY_RUN = process.argv.includes('--dry');
const DELAY_MS = 2500;

const DOMAIN_MAP = {
  air: 'https://www.airfilter-crossreference.com/convert/DONALDSON/',
  'air-intake': 'https://www.airfilter-crossreference.com/convert/DONALDSON/',
  cabin: 'https://www.airfilter-crossreference.com/convert/DONALDSON/',
  fuel: 'https://www.fuelfilter-crossreference.com/convert/DONALDSON/',
  'fuel-separator': 'https://www.fuelfilter-crossreference.com/convert/DONALDSON/',
  lube: 'https://www.oilfilter-crossreference.com/convert/DONALDSON/',
  hydraulic: 'https://www.oilfilter-crossreference.com/convert/DONALDSON/',
  coolant: 'https://www.oilfilter-crossreference.com/convert/DONALDSON/',
  'air-dryer': 'https://www.oilfilter-crossreference.com/convert/DONALDSON/',
  turbine: 'https://www.oilfilter-crossreference.com/convert/DONALDSON/',
};

if (!category || !DOMAIN_MAP[category]) {
  console.error('Usage: node retry-crossref-gaps.js <category> [--dry]');
  console.error('Known categories:', Object.keys(DOMAIN_MAP).join(', '));
  process.exit(1);
}

const SOURCE = DOMAIN_MAP[category];
const ROOT = __dirname;
const PROGRESS_FILE = path.join(ROOT, `donaldson_${category}_crossref_progress.json`);
const RESULTS_FILE = path.join(ROOT, `donaldson_${category}_results.json`);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function fetch(url, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    const opts = { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; research-bot/1.0)' } };
    const req = https.get(url, opts, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirectsLeft > 0) {
        const next = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).toString();
        res.resume();
        return resolve(fetch(next, redirectsLeft - 1));
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { body += c; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('timeout')); });
    req.on('error', reject);
  });
}

function parseCrossRefs(html) {
  const grouped = {};
  const linkPattern = /<a\s+href="\/convert\/([^\/"]+)\/([^"]+)"/gi;
  let m;
  while ((m = linkPattern.exec(html)) !== null) {
    const manufacturer = decodeURIComponent(m[1]).toUpperCase().trim();
    const code = decodeURIComponent(m[2]).toUpperCase().trim();
    if (!manufacturer || !code) continue;
    if (manufacturer === 'DONALDSON') continue;
    if (!grouped[manufacturer]) grouped[manufacturer] = [];
    if (!grouped[manufacturer].includes(code)) grouped[manufacturer].push(code);
  }
  return grouped;
}

function computeRealGaps(results) {
  const byCode = new Map(results.map((r) => [r.part_number, r]));
  const adj = new Map();
  function link(a, b) {
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a).add(b);
    adj.get(b).add(a);
  }
  for (const r of results) {
    for (const alt of (r.alternatives || [])) link(r.part_number, alt);
  }
  function hasNonEmpty(code) {
    const rec = byCode.get(code);
    return rec && rec.brand_crossrefs && Object.keys(rec.brand_crossrefs).length > 0;
  }
  const empty = results.filter((r) => !r.brand_crossrefs || Object.keys(r.brand_crossrefs).length === 0);
  return empty
    .filter((r) => {
      const neighbors = adj.get(r.part_number) || new Set();
      for (const n of neighbors) if (hasNonEmpty(n)) return false;
      return true;
    })
    .map((r) => r.part_number);
}

function loadJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

async function main() {
  const results = loadJson(RESULTS_FILE, null);
  if (!results) { console.error(`Cannot read ${RESULTS_FILE}`); process.exit(1); }

  const GAP_CODES = computeRealGaps(results);
  const hasProgressFile = fs.existsSync(PROGRESS_FILE);
  const progress = hasProgressFile ? loadJson(PROGRESS_FILE, {}) : null;
  const resultsByCode = new Map(results.map((r) => [r.part_number, r]));

  console.log(`Reintento de crossref ${category} — ${GAP_CODES.length} codigos reales, fuente: ${SOURCE}{part}`);
  console.log(`Modo: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\n`);

  let found = 0, empty = 0, errors = 0;

  for (let i = 0; i < GAP_CODES.length; i++) {
    const code = GAP_CODES[i];
    const prefix = `[${i + 1}/${GAP_CODES.length}] ${code}`;
    const url = `${SOURCE}${encodeURIComponent(code)}`;

    if (DRY_RUN) { console.log(`${prefix} -> ${url}`); continue; }

    try {
      const { status, body } = await fetch(url);
      if (status !== 200) {
        console.warn(`${prefix} -> HTTP ${status}, se reintenta en la proxima corrida`);
        errors++;
        if (i < GAP_CODES.length - 1) await sleep(DELAY_MS);
        continue;
      }

      const refs = parseCrossRefs(body);
      const brandCount = Object.keys(refs).length;

      if (brandCount > 0) {
        if (progress) progress[code] = refs;
        const rec = resultsByCode.get(code);
        if (rec) rec.brand_crossrefs = refs;
        console.log(`${prefix} -> ${brandCount} marcas: ${Object.keys(refs).slice(0, 3).join(', ')}${brandCount > 3 ? '...' : ''}`);
        found++;
      } else {
        console.log(`${prefix} -> pagina OK, 0 crossrefs (sigue sin match real en la fuente)`);
        empty++;
      }

      fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
      if (progress) fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
    } catch (err) {
      console.error(`${prefix} -> ERROR: ${err.message}`);
      errors++;
    }

    if (i < GAP_CODES.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\nCompleto (${category}). Con crossref nuevo: ${found} | Sin match: ${empty} | Errores: ${errors}`);
  if (empty > 0) console.log('Los "sin match" no son fallas del scraper -- ese producto no aparece en la fuente.');
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
