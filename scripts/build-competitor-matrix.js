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
const MATRIX_FILE   = path.join(__dirname, 'competitor_matrix.json');
const SOURCE_FILES  = ['donaldson_lube_results.json', 'donaldson_fuel_results.json'];

// ─── Collect all unique P-numbers from local JSON files ──────────────────────
function collectPNumbers() {
  const pnums = new Set();
  for (const f of SOURCE_FILES) {
    const fpath = path.join(__dirname, f);
    if (!fs.existsSync(fpath)) { console.warn(`  WARN: ${f} not found, skipping`); continue; }
    const data = JSON.parse(fs.readFileSync(fpath, 'utf8'));
    for (const item of data) {
      for (const p of (item.alternatives || [])) {
        if (/^P[0-9]/.test(p)) pnums.add(p);
      }
    }
  }
  return [...pnums].sort();
}

// ─── Load / save matrix ───────────────────────────────────────────────────────
function loadMatrix() {
  try { return JSON.parse(fs.readFileSync(MATRIX_FILE, 'utf8')); }
  catch { return {}; }
}
function saveMatrix(matrix) {
  fs.writeFileSync(MATRIX_FILE, JSON.stringify(matrix, null, 2));
}

// ─── HTTP fetch with redirect follow ─────────────────────────────────────────
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

// ─── HTML parser ─────────────────────────────────────────────────────────────
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

// ─── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  BUILD competitor matrix from oilfilter-crossreference.com');
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  const allPNumbers = collectPNumbers();
  console.log(`P-numbers found in source files: ${allPNumbers.length}`);

  const matrix = loadMatrix();
  const done   = new Set(Object.keys(matrix));
  const pending = allPNumbers.filter(p => !done.has(p));

  console.log(`Already fetched : ${done.size}`);
  console.log(`Remaining       : ${pending.length}\n`);

  if (pending.length === 0) {
    console.log('Matrix complete. Delete competitor_matrix.json to rebuild from scratch.');
    console.log(`Total entries: ${Object.keys(matrix).length}`);
    return;
  }

  let fetched = 0, noData = 0, errors = 0;

  for (let i = 0; i < pending.length; i++) {
    const pnum   = pending[i];
    const prefix = `[${i+1}/${pending.length}] ${pnum}`;

    if (DRY_RUN) {
      console.log(`${prefix} → https://www.oilfilter-crossreference.com/convert/DONALDSON/${pnum}`);
      matrix[pnum] = [];
      continue;
    }

    try {
      const url = `https://www.oilfilter-crossreference.com/convert/DONALDSON/${encodeURIComponent(pnum)}`;
      const { status, body } = await fetch(url);

      if (status === 404 || status === 410) {
        console.log(`${prefix} → not found (${status})`);
        matrix[pnum] = [];
        noData++;
        saveMatrix(matrix);
        if (i < pending.length - 1) await sleep(DELAY_MS);
        continue;
      }

      if (status !== 200) {
        console.warn(`${prefix} → HTTP ${status}, retry next run`);
        errors++;
        if (i < pending.length - 1) await sleep(DELAY_MS);
        continue;
      }

      const refs = parseCrossRefs(body);
      matrix[pnum] = refs;
      saveMatrix(matrix);

      if (refs.length > 0) {
        console.log(`${prefix} → ${refs.length} refs: ${refs.slice(0,3).map(r => r.manufacturer+':'+r.code).join(', ')}${refs.length > 3 ? '...' : ''}`);
        fetched++;
      } else {
        console.log(`${prefix} → page OK, 0 refs`);
        noData++;
      }

    } catch (err) {
      console.error(`${prefix} → ERROR: ${err.message}`);
      errors++;
    }

    if (i < pending.length - 1) await sleep(DELAY_MS);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  MATRIX BUILD COMPLETE');
  console.log(`  With refs : ${fetched}`);
  console.log(`  No data   : ${noData}`);
  console.log(`  Errors    : ${errors} (retry next run)`);
  console.log(`  Matrix file: scripts/competitor_matrix.json`);
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('Next step: node scripts/apply-competitor-matrix.js');
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
