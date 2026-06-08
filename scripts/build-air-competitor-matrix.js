/**
 * build-air-competitor-matrix.js
 *
 * Builds competitor_codes matrix for EA (air) filters from the local
 * donaldson_air_results.json file.  No web scraping, no DB required.
 *
 * Strategy:
 *   - Each DBA item has oem_codes[] that mixes equipment OEM codes with
 *     competitor filter brand codes.
 *   - We keep only entries from known filter manufacturer brands.
 *   - Map: P-number → [{manufacturer, code}, ...]
 *
 * Output: scripts/air_competitor_matrix.json
 *
 * Run:
 *   node scripts/build-air-competitor-matrix.js
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const SOURCE     = path.join(__dirname, 'donaldson_air_results.json');
const OUT_MATRIX = path.join(__dirname, 'air_competitor_matrix.json');

// ─── Filter brand whitelist ────────────────────────────────────────────────
// Companies that are primarily filter manufacturers (not equipment OEMs).
// Equipment OEMs (CAT, JD, Cummins, Volvo, Ford, etc.) are excluded —
// their part numbers belong in oem_codes, not competitor_codes.
const FILTER_BRANDS = new Set([
  'AC DELCO', 'ACDELCO',
  'ALCO',
  'AMSOIL',
  'ARMAFILT',
  'AUTO PRIDE',
  'A P PARTS', 'AP PARTS',
  'BIG A',
  'CARCARE',
  'CASITE',
  'CHAMP',
  'CLEAN',
  'COOPERS', 'COOPERS FIAAM',
  'CROSLAND',
  'DELUXE',
  'DONSSON',
  'DYNALIFE',
  'ECONOLUBE',
  'EXMAN',
  'FEDERATED',
  'FIL',
  'FIAAM',
  'GIF',
  'GPC',
  'GREYFRIARS',
  'GUD',
  'GUARDIAN',
  'INTRUPA',
  'KNECHT', 'KNECHT-MAHLE',
  'KRALINATOR',
  'LOESING',
  'MISFAT',
  'NELSON',
  'NELSON WINSLOW',
  'NUTECH',
  'PRONTO',
  'PRO MATCH',
  'PURFLUX',
  'QUAKER STATE',
  'REFILCO',
  'SERVICE CHAMP',
  'UNIPART',
  'VAPORMATIC',
  'WESFIL',
  'WISMET',
]);

function run() {
  if (!fs.existsSync(SOURCE)) {
    console.error('donaldson_air_results.json not found in scripts/');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
  console.log(`\nLoaded ${data.length} Donaldson air items`);

  // Build: pnum → [{manufacturer, code}]
  const matrix = {};
  let totalRefs = 0;

  for (const item of data) {
    const pnums = (item.alternatives || []).filter(p => /^P[0-9]/.test(p));
    if (pnums.length === 0) continue;

    const refs = [];
    const seen = new Set();

    for (const oc of (item.oem_codes || [])) {
      const mfr  = (oc.manufacturer || '').toUpperCase().trim();
      const code = (oc.part_number  || oc.code || '').toUpperCase().trim();
      if (!mfr || !code) continue;
      if (!FILTER_BRANDS.has(mfr)) continue;

      const key = `${mfr}:${code}`;
      if (seen.has(key)) continue;
      seen.add(key);
      refs.push({ manufacturer: mfr, code });
    }

    for (const p of pnums) {
      if (!matrix[p]) matrix[p] = [];
      for (const ref of refs) {
        const key = `${ref.manufacturer}:${ref.code}`;
        if (!matrix[p].some(r => `${r.manufacturer}:${r.code}` === key)) {
          matrix[p].push(ref);
        }
      }
    }

    if (refs.length > 0) totalRefs += refs.length;
  }

  const withRefs = Object.entries(matrix).filter(([, v]) => v.length > 0);
  console.log(`P-numbers in matrix  : ${Object.keys(matrix).length}`);
  console.log(`P-numbers with refs  : ${withRefs.length}`);
  console.log(`Total ref entries    : ${totalRefs}`);

  fs.writeFileSync(OUT_MATRIX, JSON.stringify(matrix, null, 2));
  console.log(`\nSaved → scripts/air_competitor_matrix.json`);
  console.log('Next step: node scripts/apply-air-competitor-matrix.js\n');
}

run();
