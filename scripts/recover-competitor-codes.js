/**
 * recover-competitor-codes.js
 *
 * Recovers competitor_codes for products where the upsert bug wiped them.
 * Scrapes oilfilter-crossreference.com for each Donaldson P-number that
 * currently has an empty competitor_codes array.
 *
 * Run locally:
 *   node scripts/recover-competitor-codes.js
 *
 * Resume after interruption: re-run same command (progress saved to recover_progress.json)
 * Dry run (no DB writes):    node scripts/recover-competitor-codes.js --dry
 * Single part:               node scripts/recover-competitor-codes.js --sku EL84004
 */
'use strict';

const { Client } = require('pg');
const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────
const DB_CONFIG = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined } }
  : {
      host: 'ballast.proxy.rlwy.net', port: 18263,
      database: 'railway', user: 'postgres',
      password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
      ssl: { rejectUnauthorized: false },
    };

const DELAY_MS     = 2500;   // polite crawl delay
const PROGRESS_FILE = path.join(__dirname, 'recover_progress.json');

const DRY_RUN      = process.argv.includes('--dry');
const TARGET_SKU   = (() => { const i = process.argv.indexOf('--sku'); return i > -1 ? process.argv[i+1] : null; })();

// ─── HTTP fetch with redirect follow ─────────────────────────────────────────
function fetch(url, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    const mod    = url.startsWith('https') ? https : http;
    const opts   = { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; research-bot/1.0)' } };

    const req = mod.get(url, opts, (res) => {
      // follow redirects
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirectsLeft > 0) {
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

// ─── HTML parser for oilfilter-crossreference.com ───────────────────────────
// The results page contains a table where each row has: Brand | Part number | Description
// Example row: <td>MANN</td><td>W940/25</td><td>Oil filter</td>
function parseCrossRefs(html) {
  const refs = [];
  const seen = new Set();

  // Strip HTML tags helper
  const strip = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();

  // Find all <tr> blocks
  const trPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;
  while ((trMatch = trPattern.exec(html)) !== null) {
    const cells = [];
    const tdPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let td;
    while ((td = tdPattern.exec(trMatch[1])) !== null) {
      cells.push(strip(td[1]));
    }

    // Need at least 2 cells: brand + part number
    if (cells.length < 2) continue;

    const manufacturer = cells[0].toUpperCase().trim();
    const code         = cells[1].toUpperCase().trim();

    // Skip empty, header rows, or Donaldson itself (those are oem_codes)
    if (!manufacturer || !code) continue;
    if (manufacturer === 'MANUFACTURER' || manufacturer === 'BRAND' ||
        manufacturer === 'MAKE' || manufacturer === 'MARCA') continue;
    if (manufacturer === 'DONALDSON') continue;

    const key = `${manufacturer}:${code}`;
    if (seen.has(key)) continue;
    seen.add(key);

    refs.push({ manufacturer, code });
  }

  return refs;
}

// ─── Sleep ───────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── Load / save progress ────────────────────────────────────────────────────
function loadProgress() {
  try { return new Set(JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8')).done || []); }
  catch { return new Set(); }
}
function saveProgress(done) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ done: [...done] }, null, 2));
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  RECOVER competitor_codes from oilfilter-crossreference.com');
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`);
  if (TARGET_SKU) console.log(`  Target SKU: ${TARGET_SKU}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  const client = new Client(DB_CONFIG);
  await client.connect();
  console.log('Connected to DB ✓\n');

  // ── 1. Find affected products ─────────────────────────────────────────────
  let query = `
    SELECT sku, codigo_base
    FROM elimfilters_catalog
    WHERE codigo_base IS NOT NULL
      AND codigo_base ~ '^P[0-9]'
      AND (competitor_codes IS NULL OR jsonb_array_length(competitor_codes) = 0)
    ORDER BY sku
  `;
  const params = [];
  if (TARGET_SKU) {
    query = `
      SELECT sku, codigo_base
      FROM elimfilters_catalog
      WHERE sku = $1
    `;
    params.push(TARGET_SKU);
  }

  const { rows: products } = await client.query(query, params);
  console.log(`Products with empty competitor_codes: ${products.length}`);

  // ── 2. Load progress and filter ──────────────────────────────────────────
  const done    = loadProgress();
  const pending = TARGET_SKU
    ? products
    : products.filter(p => !done.has(p.sku));

  console.log(`Already processed:  ${done.size}`);
  console.log(`Remaining to check: ${pending.length}\n`);

  if (pending.length === 0) {
    console.log('Nothing to do. Delete recover_progress.json to restart from scratch.');
    await client.end();
    return;
  }

  // ── 3. Process each product ───────────────────────────────────────────────
  let updated = 0, noData = 0, errors = 0;

  for (let i = 0; i < pending.length; i++) {
    const { sku, codigo_base } = pending[i];
    const prefix = `[${i+1}/${pending.length}] ${sku} (${codigo_base})`;

    try {
      const url = `https://www.oilfilter-crossreference.com/convert/DONALDSON/${encodeURIComponent(codigo_base)}`;
      const { status, body } = await fetch(url);

      if (status === 404 || status === 410) {
        console.log(`${prefix} → not in database (${status})`);
        noData++;
        done.add(sku);
        saveProgress(done);
        if (i < pending.length - 1) await sleep(DELAY_MS);
        continue;
      }

      if (status !== 200) {
        console.warn(`${prefix} → HTTP ${status}, will retry next run`);
        errors++;
        if (i < pending.length - 1) await sleep(DELAY_MS);
        continue;
      }

      const refs = parseCrossRefs(body);

      if (refs.length === 0) {
        console.log(`${prefix} → page OK but 0 cross-refs found`);
        noData++;
        done.add(sku);
        saveProgress(done);
        if (i < pending.length - 1) await sleep(DELAY_MS);
        continue;
      }

      console.log(`${prefix} → ${refs.length} refs: ${refs.slice(0,3).map(r => r.manufacturer+':'+r.code).join(', ')}${refs.length > 3 ? '...' : ''}`);

      if (!DRY_RUN) {
        await client.query(
          `UPDATE elimfilters_catalog
           SET competitor_codes = $1::jsonb
           WHERE sku = $2`,
          [JSON.stringify(refs), sku]
        );
        console.log(`  ✅ Updated DB`);
      } else {
        console.log(`  (dry run — no DB write)`);
      }

      updated++;
      done.add(sku);
      saveProgress(done);

    } catch (err) {
      console.error(`${prefix} → ERROR: ${err.message}`);
      errors++;
    }

    if (i < pending.length - 1) await sleep(DELAY_MS);
  }

  // ── 4. Summary ────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  RECOVERY COMPLETE');
  console.log(`  Updated  : ${updated}`);
  console.log(`  No data  : ${noData} (not found on site)`);
  console.log(`  Errors   : ${errors} (will retry on next run)`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (errors > 0) {
    console.log('Run script again to retry failed items (progress is saved).');
  }
  if (!DRY_RUN && updated > 0) {
    console.log(`${updated} products now have restored competitor_codes.`);
  }

  await client.end();
}

run().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
