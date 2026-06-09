/**
 * build-hydraulic-competitor-matrix.js
 *
 * Builds competitor_codes matrix for EH (hydraulic) filters from the local
 * donaldson_hydraulic_results.json file.  No web scraping, no DB required.
 *
 * Hydraulic JSON uses cross_references[] (not oem_codes[]).
 * Includes hydraulic-specific filter brands + general aftermarket brands.
 * Excludes equipment OEMs (CAT, JD, Komatsu, etc.).
 *
 * Output: scripts/hydraulic_competitor_matrix.json
 *
 * Run:
 *   node scripts/build-hydraulic-competitor-matrix.js
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const SOURCE     = path.join(__dirname, 'donaldson_hydraulic_results.json');
const OUT_MATRIX = path.join(__dirname, 'hydraulic_competitor_matrix.json');

// ─── Filter brand whitelist ────────────────────────────────────────────────
// Hydraulic filter manufacturers + general aftermarket filter brands.
// Excludes equipment OEMs (CAT, JD, Komatsu, Bosch-Rexroth as OEM, etc.)
// Note: BOSCH-REXROTH appears as a hydraulic filter brand (they make
// replacement elements), so it's included.
const FILTER_BRANDS = new Set([
  // Hydraulic-specific filter brands
  'ARGO', 'ARGO-HYTOS',
  'BEHRINGER',
  'DIAGNETICS',
  'DMIC',
  'EPPENSTEINER',
  'FILPRO',
  'FLOW EZY',
  'FPC',
  'GRESEN',
  'HILCO',
  'LHA',
  'MODINA',
  'OMT',
  'PTI',
  'SWIFT',
  'VICKERS',
  'DENISON',
  'BOSCH-REXROTH',
  // General aftermarket filter brands
  'AC DELCO', 'ACDELCO',
  'AMERICAN PARTS',
  'BIG A',
  'LOESING',
  'VMC',
  'ALCO',
  'GPC',
  'KRALINATOR',
  'COOPERS',
  'NELSON',
  'CHAMP',
  'FIAAM',
  'WESFIL',
  'PURFLUX',
  'KNECHT', 'KNECHT-MAHLE',
  'CROSLAND',
  'GREYFRIARS',
  'GUD',
  'GUARDIAN',
  'ARMAFILT',
  'FIL',
  'EXMAN',
  'CASITE',
  'PRONTO',
  'SERVICE CHAMP',
]);

function run() {
  if (!fs.existsSync(SOURCE)) {
    console.error('donaldson_hydraulic_results.json not found in scripts/');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
  console.log(`\nLoaded ${data.length} Donaldson hydraulic items`);

  const matrix = {};
  let totalRefs = 0;

  for (const item of data) {
    const pnums = (item.alternatives || []).filter(p => /^P[0-9]/.test(p));
    if (pnums.length === 0) continue;

    const refs = [];
    const seen = new Set();

    for (const cr of (item.cross_references || [])) {
      const mfr  = (cr.manufacturer || '').toUpperCase().trim();
      const code = (cr.part_number  || cr.code || '').toUpperCase().trim();
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
  console.log(`\nSaved → scripts/hydraulic_competitor_matrix.json`);
  console.log('Next step: node scripts/apply-hydraulic-competitor-matrix.js\n');
}

run();
