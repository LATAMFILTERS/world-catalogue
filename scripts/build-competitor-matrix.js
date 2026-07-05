/**
 * build-competitor-matrix.js
 *
 * Phase 1: Scrape oilfilter-crossreference.com for all P-numbers found in
 * the donaldson lube + fuel JSON files.  No database required.
 *
 * Output: scripts/competitor_matrix.json
 *   { "P550832": [{manufacturer:"MANN", code:"W940/25"}, ...], ... }
 *
 * Run:
 *   node scripts/build-competitor-matrix.js
 *   node scripts/build-competitor-matrix.js --dry   (show URLs, no HTTP)
 *
 * Resume after interruption: re-run same command (progress saved).
 */
'use strict';

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

const DRY_RUN       = process.argv.includes('--dry');
const DELAY_MS      = 2500;

const DOMAIN_MAP = {
  air: "https://www.airfilter-crossreference.com/convert/DONALDSON/",
  "air-intake": "https://www.airfilter-crossreference.com/convert/DONALDSON/",
  cabin: "https://www.airfilter-crossreference.com/convert/DONALDSON/",
  fuel: "https://www.fuelfilter-crossreference.com/convert/DONALDSON/",
  "fuel-separator": "https://www.fuelfilter-crossreference.com/convert/DONALDSON/",
  lube: "https://www.oilfilter-crossreference.com/convert/DONALDSON/",
  hydraulic: "https://www.oilfilter-crossreference.com/convert/DONALDSON/",
  coolant: "https://www.oilfilter-crossreference.com/convert/DONALDSON/",
  "air-dryer": "https://www.oilfilter-crossreference.com/convert/DONALDSON/",
  turbine: "https://www.oilfilter-crossreference.com/convert/DONALDSON/"
};

const MATRIX_FILE   = path.join(__dirname, 'competitor_matrix.json');
const SOURCE_FILES = fs
  .readdirSync(__dirname)
  .filter(f => /^donaldson_.*_results\.json$/i.test(f))
  .sort();

// â”€â”€â”€ Collect all unique P-numbers from local JSON files â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function collectPNumbers() {
  const pnums = [];
  for (const f of SOURCE_FILES) {
  const category = path.basename(f)
    .replace(/^donaldson_/, "")
    .replace(/_results\.json$/i, "");
    const fpath = path.join(__dirname, f);
    if (!fs.existsSync(fpath)) { console.warn(`  WARN: ${f} not found, skipping`); continue; }
    const data = JSON.parse(fs.readFileSync(fpath, 'utf8'));
    for (const item of data) {
      for (const p of (item.alternatives || [])) {
        if (typeof p === "string" && p.trim().length >= 3) pnums.push({ category, part: p.trim().toUpperCase() });
      }
    }
  }
  return pnums.sort((a,b)=>a.part.localeCompare(b.part));
}

// â”€â”€â”€ Load / save matrix â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function loadMatrix() {
  try { return JSON.parse(fs.readFileSync(MATRIX_FILE, 'utf8')); }
  catch { return {}; }
}
function saveMatrix(matrix) {
  fs.writeFileSync(MATRIX_FILE, JSON.stringify(matrix, null, 2));
}

// â”€â”€â”€ HTTP fetch with redirect follow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function fetch(url, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    const mod  = url.startsWith('https') ? https : http;
    const opts = { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; research-bot/1.0)' } };
    const req  = mod.get(url, opts, (res) => {
      if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location && redirectsLeft > 0) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).toString();
        res.resume();
        return resolve(fetch(next, redirectsLeft - 1));
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('timeout')); });
    req.on('error', reject);
  });
}

// â”€â”€â”€ HTML parser â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function parseCrossRefs(html) {
  const refs = [];
  const seen = new Set();
  const strip = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
  const trPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;
  while ((trMatch = trPattern.exec(html)) !== null) {
    const cells = [];
    const tdPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let td;
    while ((td = tdPattern.exec(trMatch[1])) !== null) cells.push(strip(td[1]));
    if (cells.length < 2) continue;
    const manufacturer = cells[0].toUpperCase().trim();
    const code         = cells[1].toUpperCase().trim();
    if (!manufacturer || !code) continue;
    if (['MANUFACTURER','BRAND','MAKE','MARCA'].includes(manufacturer)) continue;
    if (manufacturer === 'DONALDSON') continue;
    const key = `${manufacturer}:${code}`;
    if (seen.has(key)) continue;
    seen.add(key);
    refs.push({ manufacturer, code });
  }
  return refs;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// â”€â”€â”€ Main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function run() {
  console.log('\nâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•');
  console.log('  BUILD competitor matrix from oilfilter-crossreference.com');
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log('â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n');

  const allPNumbers = collectPNumbers();
  console.log(`P-numbers found in source files: ${allPNumbers.length}`);

  const matrix = loadMatrix();
  const done   = new Set(Object.keys(matrix));
  const pending = allPNumbers.filter(x => !done.has(x.part));

  console.log(`Already fetched : ${done.size}`);
  console.log(`Remaining       : ${pending.length}\n`);

  if (pending.length === 0) {
    console.log('Matrix complete. Delete competitor_matrix.json to rebuild from scratch.');
    console.log(`Total entries: ${Object.keys(matrix).length}`);
    return;
  }

  let fetched = 0, noData = 0, errors = 0;

  for (let i = 0; i < pending.length; i++) {
    const { category, part: pnum } = pending[i];
    const prefix = `[${i+1}/${pending.length}] ${category}:${pnum}`;

    if (DRY_RUN) {
      console.log(`${prefix} â†’ ${DOMAIN_MAP[category] || DOMAIN_MAP.lube}${pnum}`);
      matrix[pnum] = [];
      continue;
    }

    try {
      const url = `${DOMAIN_MAP[category] || DOMAIN_MAP.lube}${encodeURIComponent(pnum)}`;
      const { status, body } = await fetch(url);

      if (status === 404 || status === 410) {
        console.log(`${prefix} â†’ not found (${status})`);
        matrix[pnum] = [];
        noData++;
        saveMatrix(matrix);
        if (i < pending.length - 1) await sleep(DELAY_MS);
        continue;
      }

      if (status !== 200) {
        console.warn(`${prefix} â†’ HTTP ${status}, retry next run`);
        errors++;
        if (i < pending.length - 1) await sleep(DELAY_MS);
        continue;
      }

      const refs = parseCrossRefs(body);
      matrix[pnum] = refs;
      saveMatrix(matrix);

      if (refs.length > 0) {
        console.log(`${prefix} â†’ ${refs.length} refs: ${refs.slice(0,3).map(r => r.manufacturer+':'+r.code).join(', ')}${refs.length > 3 ? '...' : ''}`);
        fetched++;
      } else {
        console.log(`${prefix} â†’ page OK, 0 refs`);
        noData++;
      }

    } catch (err) {
      console.error(`${prefix} â†’ ERROR: ${err.message}`);
      errors++;
    }

    if (i < pending.length - 1) await sleep(DELAY_MS);
  }

  console.log('\nâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•');
  console.log('  MATRIX BUILD COMPLETE');
  console.log(`  With refs : ${fetched}`);
  console.log(`  No data   : ${noData}`);
  console.log(`  Errors    : ${errors} (retry next run)`);
  console.log(`  Matrix file: scripts/competitor_matrix.json`);
  console.log('â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n');
  console.log('Next step: node scripts/apply-competitor-matrix.js');
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });









