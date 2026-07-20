/**
 * apply-donaldson-lube-v2.js
 *
 * Reads donaldson_lube_crossref_progress.json and applies all cross-references
 * to EL (lube oil) HD SKUs in the DB.
 *
 * Key difference from v1: also adds {"manufacturer":"DONALDSON","code":"P169071"}
 * so parts are searchable by Donaldson part number. Merges into existing
 * competitor_codes instead of skipping already-populated rows.
 *
 * Source format: { "P169071": { "HIFI": ["SO10086"], "FLEETGUARD": ["LF3487"], ... } }
 * DB competitor_codes: [{ "manufacturer": "DONALDSON", "code": "P169071" }, ...]
 *
 * Run on Render Shell:
 *   node scripts/apply-donaldson-lube-v2.js
 *   node scripts/apply-donaldson-lube-v2.js --dry
 */
'use strict';

const { Client } = require('pg');
const fs         = require('fs');
const path       = require('path');

const DRY_RUN     = process.argv.includes('--dry');
const MATRIX_FILE = path.join(__dirname, 'donaldson_lube_crossref_progress.json');

const DB_CONFIG = (() => {
  const raw = process.env.DATABASE_URL || '';
  if (raw) {
    const u = new URL(raw.replace(/\?.*$/, ''));
    return {
      host:     u.hostname,
      port:     parseInt(u.port) || 5432,
      database: u.pathname.slice(1),
      user:     decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      ssl:      { rejectUnauthorized: false },
    };
  }
  return {
    connectionString: process.env.LEGACY_DB_URL,
    ssl: { rejectUnauthorized: false },
  };
})();

// Filter brands only (not vehicle/equipment OEMs)
const FILTER_BRANDS = new Set([
  'HIFI','LUBERFINER','FRAM','BALDWIN','WIX','MANN','UFI','FLEETGUARD',
  'FILTREC','HENGST','MAHLE','KNECHT','PURFLUX','NAPA','CARQUEST',
  'MOTORCRAFT','FACET','RYCO','HASTINGS','AC-DELCO','COOPERS','CHAMPION',
  'BOSCH','PUROLATOR','K-N','TECNOCAR','SOFIMA','FILTRON','MICROGARD',
  'KRALINATOR','SCT','SAKURA','FEBI-BILSTEIN','FIAAM','FLEETRITE',
  'FLEETLIFE','CROSLAND','PAI','STP','PALL','CAM2','PENNZOIL','CASTROL',
  'MOBIL','SHELL','QUAKER-STATE','VALVOLINE','GULF','CITGO','TEXACO',
  'AUTOCRAFT','QUALITY','PARTS-MASTER','PARTS-PLUS','NEOPART','NIPPARTS',
  'MEYLE','MAXGEAR','JAPANPARTS','JAPKO','BLUE-PRINT','STELLOX','TOPRAN',
  'SWAG','MASTER-SPORT','VAPORMATIC','GUD','REPCO','RYCO','MISFAT',
  'PROMATCH','CHAMPION-CONSTRUCTION-EQUIPMENT','FILTRATION-LTD',
  'DONALDSON','LUBERFINER','MISFAT','SOFIMA','TECAFILTRES','TECNOCAR',
  'UFI','UNIFLUX-FILTERS','UNIPART','WFZ','WESFIL','WILMINK-GROUP',
]);

function buildRefs(donaldsonCode, brandMap) {
  const seen  = new Set();
  const refs  = [];

  // Always add DONALDSON code itself first
  const dKey = `DONALDSON:${donaldsonCode}`;
  seen.add(dKey);
  refs.push({ manufacturer: 'DONALDSON', code: donaldsonCode });

  for (const [brand, codes] of Object.entries(brandMap)) {
    if (!FILTER_BRANDS.has(brand)) continue; // skip vehicle OEMs
    for (const code of codes) {
      if (!code) continue;
      const key = `${brand}:${code}`;
      if (!seen.has(key)) {
        seen.add(key);
        refs.push({ manufacturer: brand, code });
      }
    }
  }
  return refs;
}

function mergeRefs(existing, incoming) {
  const seen = new Set((existing || []).map(r => `${r.manufacturer}:${r.code}`));
  const merged = [...(existing || [])];
  for (const r of incoming) {
    const key = `${r.manufacturer}:${r.code}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(r);
    }
  }
  return merged;
}

async function run() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  APPLY Donaldson lube competitor matrix v2 → DB  (EL SKUs)');
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (!fs.existsSync(MATRIX_FILE)) {
    console.error('donaldson_lube_crossref_progress.json not found.');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(MATRIX_FILE, 'utf8'));
  const allCodes = Object.keys(raw);
  console.log(`Matrix: ${allCodes.length} Donaldson codes\n`);

  const client = new Client(DB_CONFIG);
  await client.connect();
  console.log('Connected to DB ✓\n');

  // Fetch all matching EL SKUs with their current competitor_codes
  const placeholders = allCodes.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await client.query(
    `SELECT sku, codigo_base, competitor_codes
     FROM elimfilters_catalog
     WHERE codigo_base IN (${placeholders})
       AND sku LIKE 'EL%'
     ORDER BY sku`,
    allCodes
  );

  console.log(`EL SKUs found: ${rows.length}\n`);

  if (rows.length === 0) {
    console.log('No EL SKUs matched — check that HD lube products are imported first.');
    await client.end();
    return;
  }

  let updated = 0, skipped = 0;
  for (const { sku, codigo_base, competitor_codes } of rows) {
    const brandMap = raw[codigo_base];
    if (!brandMap || typeof brandMap !== 'object') { skipped++; continue; }

    const incoming = buildRefs(codigo_base, brandMap);
    const existing = Array.isArray(competitor_codes) ? competitor_codes : [];
    const merged   = mergeRefs(existing, incoming);

    // Only update if something new was added
    if (merged.length === existing.length) {
      skipped++;
      continue;
    }

    if (!DRY_RUN) {
      await client.query(
        `UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE sku = $2`,
        [JSON.stringify(merged), sku]
      );
    }

    const newCount = merged.length - existing.length;
    const hasFG = incoming.some(r => r.manufacturer === 'FLEETGUARD');
    console.log(`${DRY_RUN ? '[dry]' : '✅'} ${sku} (${codigo_base}) +${newCount} refs${hasFG ? ' [FG✓]' : ''}`);
    updated++;
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  SKUs updated : ${updated}`);
  console.log(`  SKUs skipped : ${skipped} (already complete or no match)`);
  console.log('═══════════════════════════════════════════════════════════\n');

  await client.end();
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
