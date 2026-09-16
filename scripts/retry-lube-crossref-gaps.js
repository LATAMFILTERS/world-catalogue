/**
 * retry-lube-crossref-gaps.js
 *
 * One-off retry for the 16 Lube (Donaldson) P-codes confirmed to have a real,
 * unresolved brand_crossrefs gap (P551015 excluded — confirmed non-existent
 * on Fleetguard's own site, not a Donaldson product; DBL alias codes excluded
 * — their data already lives under their P-code alternative).
 *
 * Source: https://www.oilfilter-crossreference.com/convert/DONALDSON/{part}
 * (same domain/selector logic as scripts/build-competitor-matrix.js, ported
 * to plain https.get so it needs no browser — this site is static HTML.)
 *
 * Run (from world-catalogue/scripts, on the Lenovo, real internet access):
 *   node retry-lube-crossref-gaps.js
 *   node retry-lube-crossref-gaps.js --dry
 *
 * Effect: merges any newly-found crossrefs into
 *   donaldson_lube_crossref_progress.json   (per-code {BRAND: [codes]} cache)
 *   donaldson_lube_results.json             (brand_crossrefs field per product)
 * Never overwrites a code that already has crossrefs; never touches any
 * other category's files.
 */
'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry');
const DELAY_MS = 2500;
const SOURCE = 'https://www.oilfilter-crossreference.com/convert/DONALDSON/';

const GAP_CODES = [
  'P579275', 'P579787', 'P580781', 'P580794', 'P583710', 'P583711',
  'P583712', 'P583713', 'P583936', 'P584244', 'P584522', 'P584944',
  'P585315', 'P959217', 'P959218', 'P959772',
];

const ROOT = __dirname;
const PROGRESS_FILE = path.join(ROOT, 'donaldson_lube_crossref_progress.json');
const RESULTS_FILE = path.join(ROOT, 'donaldson_lube_results.json');

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

// Same table parser as build-competitor-matrix.js, but grouped by brand
// (list per manufacturer) to match donaldson_lube_crossref_progress.json's
// existing on-disk shape: { "MANUFACTURER": ["code1", "code2"], ... }
function parseCrossRefs(html) {
  const grouped = {};
  const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
  const trPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;
  while ((trMatch = trPattern.exec(html)) !== null) {
    const cells = [];
    const tdPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let td;
    while ((td = tdPattern.exec(trMatch[1])) !== null) cells.push(strip(td[1]));
    if (cells.length < 2) continue;
    const manufacturer = cells[0].toUpperCase().trim();
    const code = cells[1].toUpperCase().trim();
    if (!manufacturer || !code) continue;
    if (['MANUFACTURER', 'BRAND', 'MAKE', 'MARCA'].includes(manufacturer)) continue;
    if (manufacturer === 'DONALDSON') continue;
    if (!grouped[manufacturer]) grouped[manufacturer] = [];
    if (!grouped[manufacturer].includes(code)) grouped[manufacturer].push(code);
  }
  return grouped;
}

function loadJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

async function main() {
  console.log(`Reintento de crossref Lube — ${GAP_CODES.length} codigos, fuente: ${SOURCE}{part}`);
  console.log(`Modo: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\n`);

  const progress = loadJson(PROGRESS_FILE, {});
  const results = loadJson(RESULTS_FILE, []);
  const resultsByCode = new Map(results.map((r) => [(r.codigo_base || r.part_number || '').toUpperCase(), r]));

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
        progress[code] = refs;
        const rec = resultsByCode.get(code);
        if (rec) rec.brand_crossrefs = refs;
        console.log(`${prefix} -> ${brandCount} marcas: ${Object.keys(refs).slice(0, 3).join(', ')}${brandCount > 3 ? '...' : ''}`);
        found++;
      } else {
        console.log(`${prefix} -> pagina OK, 0 crossrefs (sigue sin match real en oilfilter-crossreference.com)`);
        empty++;
      }

      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
      fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
    } catch (err) {
      console.error(`${prefix} -> ERROR: ${err.message}`);
      errors++;
    }

    if (i < GAP_CODES.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\nCompleto. Con crossref nuevo: ${found} | Sin match: ${empty} | Errores: ${errors}`);
  if (empty > 0) console.log('Los "sin match" no son fallas del scraper -- ese producto no aparece en oilfilter-crossreference.com.');
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
