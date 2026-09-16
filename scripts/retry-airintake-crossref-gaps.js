/**
 * retry-airintake-crossref-gaps.js
 *
 * One-off retry for the 67 Air Intake (Donaldson) codes confirmed to be
 * real, unresolved brand_crossrefs gaps (D080187 excluded -- it was an
 * unpropagated alias of D080056, already fixed directly, no scrape needed).
 *
 * Source: https://www.airfilter-crossreference.com/convert/DONALDSON/{part}
 * (same domain map as build-competitor-matrix.js; parser fixed to read the
 * live <li><a href="/convert/BRAND/CODE"> list markup, per the fix applied
 * in retry-lube-crossref-gaps.js -- the site does not use <table>/<tr>/<td>.)
 *
 * Run (from world-catalogue/scripts, on the Lenovo, real internet access):
 *   node retry-airintake-crossref-gaps.js
 *   node retry-airintake-crossref-gaps.js --dry
 *
 * Effect: merges any newly-found crossrefs into
 *   donaldson_air-intake_crossref_progress.json   (per-code {BRAND: [codes]} cache)
 *   donaldson_air-intake_results.json             (brand_crossrefs field per product)
 * Never overwrites a code that already has crossrefs; never touches any
 * other category's files.
 */
'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry');
const DELAY_MS = 2500;
const SOURCE = 'https://www.airfilter-crossreference.com/convert/DONALDSON/';

const GAP_CODES = [
  'A110052', 'A150138', 'B100002', 'D080186', 'D080188', 'D090055',
  'D090266', 'D090270', 'D090278', 'D090285', 'D090287', 'D090357',
  'D090358', 'D090359', 'D100145', 'D100366', 'D100384', 'D100387',
  'D100390', 'D100391', 'D100394', 'D100397', 'D100398', 'D120320',
  'D120338', 'D120339', 'D120340', 'D140088', 'D140111', 'D140132',
  'G052685', 'G052686', 'G052741', 'G052742', 'G052828', 'G052829',
  'G065256', 'G065266', 'G065541', 'G065551', 'G080372', 'G080585',
  'G090245', 'G090250', 'G100395', 'G100398', 'G110120', 'G110214',
  'G110468', 'G110469', 'G110475', 'G130089', 'G130107', 'G130372',
  'G130374', 'G130375', 'G140261', 'G140523', 'G140526', 'G150049',
  'G160035', 'G200086', 'G200087', 'G200088', 'G290052', 'G290057',
  'P636065',
];

const ROOT = __dirname;
const PROGRESS_FILE = path.join(ROOT, 'donaldson_air-intake_crossref_progress.json');
const RESULTS_FILE = path.join(ROOT, 'donaldson_air-intake_results.json');

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

// The live page is a <li><a href="/convert/BRAND/CODE">...</a></li> list, not
// a <table>. Extract brand/code straight from the href slug, matching how
// donaldson_air-intake_crossref_progress.json's existing entries are keyed.
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

function loadJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

async function main() {
  console.log(`Reintento de crossref Air Intake — ${GAP_CODES.length} codigos, fuente: ${SOURCE}{part}`);
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
        console.log(`${prefix} -> pagina OK, 0 crossrefs (sigue sin match real en airfilter-crossreference.com)`);
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
  if (empty > 0) console.log('Los "sin match" no son fallas del scraper -- ese producto no aparece en airfilter-crossreference.com.');
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
