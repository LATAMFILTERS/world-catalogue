/**
 * FASE 3B — EXTERNAL CROSS REFERENCE HARVEST (LD)
 * 
 * Input:  cross_reference_candidates_ld.csv (TIER_E only)
 * Output: external_cross_reference_master_ld.csv
 *         external_vehicle_applications_ld.csv
 *         external_specs_ld.csv
 *         external_recovery_summary.json
 * 
 * No modificar PostgreSQL, frontend, APIs, ni código de aplicación.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const INPUT_CSV      = path.join(__dirname, 'cross_reference_candidates_ld.csv');
const CHECKPOINT     = path.join(__dirname, 'phase3b_checkpoint.json');
const LOG_FILE       = path.join(__dirname, 'phase3b_scraper.log');

const OUT_CROSS      = path.join(__dirname, 'external_cross_reference_master_ld.csv');
const OUT_APPS       = path.join(__dirname, 'external_vehicle_applications_ld.csv');
const OUT_SPECS      = path.join(__dirname, 'external_specs_ld.csv');
const OUT_SUMMARY    = path.join(__dirname, 'external_recovery_summary.json');

const DELAY_MS       = 1500;   // delay between requests
const DELAY_ERROR_MS = 8000;   // delay after error
const MAX_RETRIES    = 2;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Connection': 'keep-alive'
};

// ─── LOGGING ─────────────────────────────────────────────────────────────────
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

// ─── CSV HELPERS ─────────────────────────────────────────────────────────────
function csvEsc(v) {
  v = String(v == null ? '' : v).replace(/"/g, '""');
  return `"${v}"`;
}

function writeCsvRow(file, fields) {
  fs.appendFileSync(file, fields.map(csvEsc).join(',') + '\n');
}

// ─── URL BUILDER ─────────────────────────────────────────────────────────────
function buildUrls(segment, sku) {
  const seg = (segment || '').toLowerCase();
  const cleanSku = sku.trim();

  if (seg.includes('oil')) {
    return [
      `https://www.oilfilter-crossreference.com/convert/MANN-FILTER/${cleanSku}`,
      `https://www.oilfilter-crossreference.com/convert/MANN/${cleanSku}`
    ];
  }
  if (seg.includes('fuel')) {
    return [
      `https://www.fuelfilter-crossreference.com/convert/MANN/${cleanSku}`,
      `https://www.fuelfilter-crossreference.com/convert/MANN-FILTER/${cleanSku}`
    ];
  }
  // Air + Cabin
  return [
    `https://www.airfilter-crossreference.com/convert/MANN/${cleanSku}`,
    `https://www.airfilter-crossreference.com/convert/MANN-HUMMEL/${cleanSku}`
  ];
}

// ─── PARSERS ─────────────────────────────────────────────────────────────────

/**
 * Parse specs from air/cabin/fuel page (spec-item divs)
 */
function parseSpecsAirFuel(html) {
  const specs = {};
  const re = /<div class="spec-item"[^>]*>([\s\S]*?)<\/div>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    // "Length: 277 mm" → { Length: "277 mm" }
    const colon = text.indexOf(':');
    if (colon > -1) {
      const key = text.slice(0, colon).trim();
      const val = text.slice(colon + 1).trim();
      if (key && val) specs[key] = val;
    }
  }
  return specs;
}

/**
 * Parse specs from oil page (dt/dd pairs)
 */
function parseSpecsOil(html) {
  const specs = {};
  const re = /<dt>([^<]+)<\/dt>\s*<dd>([^<]+)<\/dd>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const key = m[1].trim();
    // Remove HTML entities and trailing units in parens
    const val = m[2].replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim();
    if (key && val) specs[key] = val;
  }
  return specs;
}

/**
 * Parse cross-references from /convert/BRAND/CODE hrefs
 * Used by all sites
 */
function parseCrossRefs(html, selfSku) {
  const re = /href="\/convert\/([A-Za-z0-9_%-]+)\/([^"?]+)"/g;
  const seen = new Set();
  const refs = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const brand = decodeURIComponent(m[1]).toUpperCase().trim();
    const code  = decodeURIComponent(m[2]).trim();
    // Skip MANN and MANN-HUMMEL and MANN-FILTER (self)
    if (brand === 'MANN' || brand === 'MANN-HUMMEL' || brand === 'MANN-FILTER') continue;
    // Skip if code looks like the same SKU
    if (code.toUpperCase() === selfSku.toUpperCase()) continue;
    const key = brand + '|' + code;
    if (!seen.has(key)) {
      seen.add(key);
      refs.push({ brand, code });
    }
  }
  return refs;
}

/**
 * Parse vehicle application rows from <tbody><tr><td>... table
 * Columns (air/cabin/fuel/oil): Make, Model, Engine Size, HP, KW, Year, Engine
 */
function parseAppRows(html) {
  // Extract first tbody
  const tbodyRe = /<tbody>([\s\S]*?)<\/tbody>/g;
  const tbodyM = tbodyRe.exec(html);
  if (!tbodyM) return [];

  const tbody = tbodyM[1];
  const rows = [];
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  const cellRe = /<td[^>]*>([\s\S]*?)<\/td>/g;

  let rowM;
  while ((rowM = rowRe.exec(tbody)) !== null) {
    const cells = [];
    let cellM;
    const cellReCopy = new RegExp(cellRe.source, 'g');
    while ((cellM = cellReCopy.exec(rowM[1])) !== null) {
      cells.push(cellM[1].replace(/[\s\n\r]+/g, ' ').trim());
    }
    if (cells.length >= 4 && cells[0] && cells[0] !== 'Brand' && cells[0] !== 'Make') {
      rows.push({
        make:        cells[0] || '',
        model:       cells[1] || '',
        engine_size: cells[2] || '',
        hp:          cells[3] || '',
        kw:          cells[4] || '',
        year:        cells[5] || '',
        engine:      cells[6] || ''
      });
    }
  }
  return rows;
}

// ─── FETCH WITH RETRY ─────────────────────────────────────────────────────────
async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (res.status === 200) return await res.text();
      if (res.status === 404) return null;
      if (attempt < retries) {
        log(`  HTTP ${res.status} — retrying (${attempt + 1}/${retries})...`);
        await sleep(3000);
      } else {
        log(`  HTTP ${res.status} — giving up`);
        return null;
      }
    } catch (e) {
      if (attempt < retries) {
        log(`  Fetch error: ${e.message} — retrying (${attempt + 1}/${retries})...`);
        await sleep(3000);
      } else {
        log(`  Fetch error: ${e.message} — giving up`);
        return null;
      }
    }
  }
  return null;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── PROCESS ONE SKU ─────────────────────────────────────────────────────────
async function processSku(elimSku, sourceSku, segment) {
  const urls = buildUrls(segment, sourceSku);
  const isOil = segment.toLowerCase().includes('oil');

  let html = null;
  let usedUrl = null;

  for (const url of urls) {
    const result = await fetchWithRetry(url);
    if (result && result.length > 10000) {
      // Verify it's a product page (not a home/error page)
      const isProduct = result.includes(sourceSku) || result.includes(sourceSku.toLowerCase());
      if (isProduct) {
        html = result;
        usedUrl = url;
        break;
      }
    }
    await sleep(500);
  }

  if (!html) return { crossRefs: [], apps: [], specs: {}, found: false };

  // Parse
  const specs    = isOil ? parseSpecsOil(html) : parseSpecsAirFuel(html);
  const crossRefs = parseCrossRefs(html, sourceSku);
  const apps     = parseAppRows(html);

  return { crossRefs, apps, specs, found: true, url: usedUrl };
}

// ─── READ INPUT ───────────────────────────────────────────────────────────────
function readTierE(csvPath) {
  const lines = fs.readFileSync(csvPath, 'utf8').split(/\r?\n/).filter(Boolean);
  const header = lines[0].split(',');
  const idxElim    = header.indexOf('elimfilters_sku');
  const idxSource  = header.indexOf('source_sku');
  const idxSegment = header.indexOf('segment');
  const idxTier    = header.indexOf('recovery_tier');

  const skus = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols[idxTier] && cols[idxTier].trim() === 'TIER_E') {
      skus.push({
        elimSku:   cols[idxElim]   ? cols[idxElim].trim()   : '',
        sourceSku: cols[idxSource] ? cols[idxSource].trim() : '',
        segment:   cols[idxSegment]? cols[idxSegment].trim(): ''
      });
    }
  }
  return skus;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  log('=== FASE 3B SCRAPER START ===');

  const skus = readTierE(INPUT_CSV);
  log(`TIER_E SKUs to process: ${skus.length}`);

  // Load checkpoint
  let startIndex = 0;
  if (fs.existsSync(CHECKPOINT)) {
    const cp = JSON.parse(fs.readFileSync(CHECKPOINT, 'utf8'));
    startIndex = cp.nextIndex || 0;
    log(`Resuming from checkpoint: index ${startIndex}`);
  }

  // Init output files (only if starting fresh)
  if (startIndex === 0) {
    fs.writeFileSync(OUT_CROSS, [
      'elimfilters_sku','source_sku','segment','ref_brand','ref_code','source_url'
    ].map(csvEsc).join(',') + '\n');

    fs.writeFileSync(OUT_APPS, [
      'elimfilters_sku','source_sku','segment','make','model','engine_size','hp','kw','year','engine','source_url'
    ].map(csvEsc).join(',') + '\n');

    fs.writeFileSync(OUT_SPECS, [
      'elimfilters_sku','source_sku','segment',
      'spec_key','spec_value','source_url'
    ].map(csvEsc).join(',') + '\n');

    fs.writeFileSync(LOG_FILE, '');
    log('Output files initialized');
  }

  // Counters
  let found = 0;
  let notFound = 0;
  let totalCrossRefs = 0;
  let totalApps = 0;
  let totalSpecs = 0;

  const skuResults = {};

  // Process
  for (let i = startIndex; i < skus.length; i++) {
    const { elimSku, sourceSku, segment } = skus[i];

    if (!sourceSku) {
      log(`[${i+1}/${skus.length}] SKIP — no source_sku for ${elimSku}`);
      notFound++;
      continue;
    }

    log(`[${i+1}/${skus.length}] ${elimSku} (${sourceSku}) — ${segment}`);

    let result;
    try {
      result = await processSku(elimSku, sourceSku, segment);
    } catch (e) {
      log(`  ERROR: ${e.message}`);
      await sleep(DELAY_ERROR_MS);
      // Save checkpoint and continue
      fs.writeFileSync(CHECKPOINT, JSON.stringify({ nextIndex: i + 1, lastSku: sourceSku }));
      notFound++;
      continue;
    }

    if (!result.found) {
      log(`  NOT FOUND`);
      notFound++;
    } else {
      found++;
      log(`  FOUND — crossRefs:${result.crossRefs.length} apps:${result.apps.length} specs:${Object.keys(result.specs).length}`);

      // Write cross refs
      for (const ref of result.crossRefs) {
        writeCsvRow(OUT_CROSS, [elimSku, sourceSku, segment, ref.brand, ref.code, result.url]);
        totalCrossRefs++;
      }

      // Write vehicle apps
      for (const app of result.apps) {
        writeCsvRow(OUT_APPS, [
          elimSku, sourceSku, segment,
          app.make, app.model, app.engine_size, app.hp, app.kw, app.year, app.engine,
          result.url
        ]);
        totalApps++;
      }

      // Write specs
      for (const [key, val] of Object.entries(result.specs)) {
        writeCsvRow(OUT_SPECS, [elimSku, sourceSku, segment, key, val, result.url]);
        totalSpecs++;
      }

      skuResults[elimSku] = {
        sourceSku,
        segment,
        crossRefs: result.crossRefs.length,
        apps: result.apps.length,
        specs: Object.keys(result.specs).length
      };
    }

    // Save checkpoint every 10 SKUs
    if ((i + 1) % 10 === 0) {
      fs.writeFileSync(CHECKPOINT, JSON.stringify({ nextIndex: i + 1, lastSku: sourceSku }));
    }

    await sleep(DELAY_MS);
  }

  // Final checkpoint
  fs.writeFileSync(CHECKPOINT, JSON.stringify({ nextIndex: skus.length, done: true }));

  // Write summary
  const summary = {
    run_timestamp: new Date().toISOString(),
    tier_e_total: skus.length,
    skus_processed: found + notFound,
    skus_found: found,
    skus_not_found: notFound,
    total_cross_refs: totalCrossRefs,
    total_vehicle_apps: totalApps,
    total_specs: totalSpecs,
    recovery_rate_pct: found > 0 ? ((found / skus.length) * 100).toFixed(2) : '0.00'
  };
  fs.writeFileSync(OUT_SUMMARY, JSON.stringify(summary, null, 2));

  log('=== DONE ===');
  log(JSON.stringify(summary, null, 2));
}

main().catch(e => {
  log('FATAL: ' + e.message);
  process.exit(1);
});
