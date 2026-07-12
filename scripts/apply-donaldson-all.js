/**
 * apply-donaldson-all.js
 *
 * Applies all Donaldson cross-reference matrices to the DB in one pass.
 * NO scraping — reads from pre-built JSON files in scripts/.
 *
 * Matrices loaded:
 *   donaldson_lube_crossref_progress.json     → EL% SKUs  (351 codes, 268 w/ FG)
 *   donaldson_air-intake_crossref_progress.json → EA% SKUs  (243 codes,  81 w/ FG)
 *   donaldson_cabin_crossref_progress.json    → EC% SKUs  (122 codes,  76 w/ FG)
 *   donaldson_hydraulic_crossref_progress.json → EH% SKUs (1962 codes, 632 w/ FG)
 *
 * For each Donaldson code → SKU:
 *   - Adds {"manufacturer":"DONALDSON","code":"P169071"} (enables search by Donaldson #)
 *   - Adds all filter brand cross-refs (HIFI, LUBERFINER, FLEETGUARD, etc.)
 *   - FLEETGUARD codes enable fitment import from hd_fitment_fleetguard.jsonl
 *   - Merges into existing competitor_codes (never overwrites what's there)
 *
 * Run on Render Shell:
 *   node scripts/apply-donaldson-all.js
 *   node scripts/apply-donaldson-all.js --dry
 *   node scripts/apply-donaldson-all.js --type lube    # only lube
 *   node scripts/apply-donaldson-all.js --type air
 *   node scripts/apply-donaldson-all.js --type cabin
 *   node scripts/apply-donaldson-all.js --type hydraulic
 */
'use strict';

const { Client } = require('pg');
const fs         = require('fs');
const path       = require('path');

const DRY_RUN = process.argv.includes('--dry');
const typeArg  = (() => {
  const i = process.argv.indexOf('--type');
  return i !== -1 ? process.argv[i + 1] : null;
})();

const TYPES = [
  { name: 'lube',      file: 'donaldson_lube_crossref_progress.json',        skuLike: 'EL%' },
  { name: 'air',       file: 'donaldson_air-intake_crossref_progress.json',   skuLike: 'EA%' },
  { name: 'cabin',     file: 'donaldson_cabin_crossref_progress.json',        skuLike: 'EC%' },
  { name: 'hydraulic', file: 'donaldson_hydraulic_crossref_progress.json',    skuLike: 'EH%' },
];

// Known filter/lubricant brands (not vehicle/equipment OEMs)
const FILTER_BRANDS = new Set([
  'DONALDSON','HIFI','LUBERFINER','FRAM','BALDWIN','WIX','MANN','UFI',
  'FLEETGUARD','FILTREC','HENGST','MAHLE','KNECHT','PURFLUX','NAPA',
  'CARQUEST','MOTORCRAFT','FACET','RYCO','HASTINGS','AC-DELCO','COOPERS',
  'CHAMPION','BOSCH','PUROLATOR','K-N','TECNOCAR','SOFIMA','FILTRON',
  'MICROGARD','KRALINATOR','SCT','SAKURA','FEBI-BILSTEIN','FIAAM',
  'FLEETRITE','FLEETLIFE','CROSLAND','PAI','STP','PALL','DAVEY',
  'ATLAS-COPCO','INGERSOLL-RAND','CAMOCO','MEYLE','MAXGEAR','JAPANPARTS',
  'JAPKO','BLUE-PRINT','STELLOX','TOPRAN','SWAG','MASTER-SPORT',
  'VAPORMATIC','GUD','REPCO','MISFAT','PROMATCH','TECAFILTRES',
  'UNIFLUX-FILTERS','UNIPART','WFZ','WESFIL','WILMINK-GROUP','ALCO',
  'CHAMPION-CONSTRUCTION-EQUIPMENT','FILTRATION-LTD','FIL','FILT',
  'FILTRAUTO-UK','FILITRONIC','FILTER-CENTER','FILTERS-INCORPORATED',
  'UFI','LUGLI','KOLBENSCHMIDT','AUTOCROFT','QUALITY','PARTS-MASTER',
  'PARTS-PLUS','NEOPART','NIPPARTS','NIPPON','NIPPON-ELEMENT','MECAFILTER',
  'MULTIPART','MANN','KNECHT','MAHLE','VOKES','MP-FILTRI','PARKER','STAUFF',
  'RACOR','TURBINE','TITAN','TJ-FILTERS','EUROFILTER','ARMAFILT','JC-PREMIUM',
  'BIGAFILTER','IACOVOU','DIFA','CAM2','PENNZOIL','CASTROL','MOBIL','SHELL',
  'QUAKER-STATE','VALVOLINE','GULF','CITGO','TEXACO','AUTOCRAFT','DONIT',
  'GIESSE','DIESEL-TECHNIC','IPD','ROKA','LUBER-FINER',
]);

function buildRefs(donaldsonCode, brandMap) {
  const seen = new Set();
  const refs = [];

  // Donaldson code itself always goes first
  seen.add(`DONALDSON:${donaldsonCode}`);
  refs.push({ manufacturer: 'DONALDSON', code: donaldsonCode });

  for (const [brand, codes] of Object.entries(brandMap)) {
    if (!FILTER_BRANDS.has(brand)) continue;
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
  const seen   = new Set((existing || []).map(r => `${r.manufacturer}:${r.code}`));
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

async function applyType(client, typeDef) {
  const { name, file, skuLike } = typeDef;
  const matrixPath = path.join(__dirname, file);

  if (!fs.existsSync(matrixPath)) {
    console.log(`  ⚠  ${file} not found — skip`);
    return { updated: 0, skipped: 0 };
  }

  const raw       = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
  const allCodes  = Object.keys(raw);
  const withFG    = allCodes.filter(k => raw[k] && raw[k]['FLEETGUARD']).length;
  console.log(`  ${allCodes.length} codes (${withFG} w/ FLEETGUARD cross-ref)`);

  if (allCodes.length === 0) return { updated: 0, skipped: 0 };

  const placeholders = allCodes.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await client.query(
    `SELECT sku, codigo_base, competitor_codes
     FROM elimfilters_catalog
     WHERE codigo_base IN (${placeholders})
       AND sku LIKE '${skuLike}'
     ORDER BY sku`,
    allCodes
  );

  console.log(`  ${rows.length} ${skuLike} SKUs in DB`);

  let updated = 0, skipped = 0;
  for (const { sku, codigo_base, competitor_codes } of rows) {
    const brandMap = raw[codigo_base];
    if (!brandMap || typeof brandMap !== 'object') { skipped++; continue; }

    const incoming = buildRefs(codigo_base, brandMap);
    const existing = Array.isArray(competitor_codes) ? competitor_codes : [];
    const merged   = mergeRefs(existing, incoming);

    if (merged.length === existing.length) { skipped++; continue; }

    if (!DRY_RUN) {
      await client.query(
        `UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE sku = $2`,
        [JSON.stringify(merged), sku]
      );
    }

    const hasFG = incoming.some(r => r.manufacturer === 'FLEETGUARD');
    console.log(`  ${DRY_RUN ? '[dry]' : '✅'} ${sku} (${codigo_base}) +${merged.length - existing.length} refs${hasFG ? ' FG✓' : ''}`);
    updated++;
  }

  return { updated, skipped };
}

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
    host: 'ballast.proxy.rlwy.net', port: 18263,
    database: 'railway', user: 'postgres',
    password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
    ssl: { rejectUnauthorized: false },
  };
})();

async function run() {
  const activeTypes = typeArg
    ? TYPES.filter(t => t.name === typeArg)
    : TYPES;

  if (activeTypes.length === 0) {
    console.error(`Unknown --type "${typeArg}". Valid: lube, air, cabin, hydraulic`);
    process.exit(1);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  APPLY Donaldson competitor matrix (all types) → DB');
  console.log(`  Types: ${activeTypes.map(t => t.name).join(', ')}`);
  console.log(`  Mode : ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  const client = new Client(DB_CONFIG);
  await client.connect();
  console.log('Connected to DB ✓\n');

  let totalUpdated = 0, totalSkipped = 0;

  for (const typeDef of activeTypes) {
    console.log(`\n── ${typeDef.name.toUpperCase()} (${typeDef.skuLike}) ──────────────────────────`);
    const { updated, skipped } = await applyType(client, typeDef);
    totalUpdated += updated;
    totalSkipped += skipped;
    console.log(`  → updated=${updated} skipped=${skipped}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  TOTAL updated : ${totalUpdated}`);
  console.log(`  TOTAL skipped : ${totalSkipped}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  await client.end();
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
