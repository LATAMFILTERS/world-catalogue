'use strict';
/**
 * Dry-run by default: node scripts/migrations/run_053_repair_fleetguard_type_mismatch.js
 * Apply (writes changes): node scripts/migrations/run_053_repair_fleetguard_type_mismatch.js --apply
 *
 * Root cause (confirmed 2026-07-21): scripts/recover-competitor-codes.js
 * hardcoded manufacturer=DONALDSON when querying
 * oilfilter-crossreference.com using each SKU's codigo_base - but
 * codigo_base is NOT always a Donaldson code (e.g. EL80777's codigo_base
 * is "LF777", a Fleetguard code). The mismatched lookup returned wrong
 * cross-reference tables that got written wholesale via a full REPLACE
 * (SET competitor_codes = $1::jsonb) with no filter_type validation,
 * producing 35,731 codes catalog-wide that cross-reference SKUs of
 * incompatible filter_type (e.g. Fleetguard air-filter code AF25538
 * appearing on oil/fuel/hydraulic SKUs).
 *
 * This removes only entries where manufacturer=FLEETGUARD and the code's
 * prefix unambiguously implies a DIFFERENT filter_type than the SKU's
 * own (per Fleetguard's own nomenclature: AF=air, LF=lube/oil,
 * FF=fuel, HF=hydraulic, WF=water/coolant, CA=cabin). Ambiguous
 * prefixes (FS, ST, etc.) are left untouched to avoid false positives.
 * Nothing else in either array is touched.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');

const PREFIX_TO_TYPE = { AF: 'air', LF: 'oil', FF: 'fuel', HF: 'hydraulic', WF: 'water', CA: 'cabin' };
const PREFIX_RE = /^([A-Z]{2})\d/;

function impliedType(code) {
  const m = PREFIX_RE.exec(code.toUpperCase());
  return m ? PREFIX_TO_TYPE[m[1]] : null;
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();

  const { rows } = await client.query(`
    SELECT sku, filter_type, oem_codes, competitor_codes
      FROM elimfilters_catalog
     WHERE (oem_codes IS NOT NULL AND jsonb_array_length(oem_codes) > 0)
        OR (competitor_codes IS NOT NULL AND jsonb_array_length(competitor_codes) > 0)
  `);
  console.log(`Scanning ${rows.length} SKUs with non-empty oem_codes/competitor_codes...\n`);

  let skusAffected = 0, removedOem = 0, removedComp = 0, examplesShown = 0;

  for (const row of rows) {
    const type = (row.filter_type || '').toLowerCase();
    let touched = false;
    const keep = {};
    for (const field of ['oem_codes', 'competitor_codes']) {
      const arr = row[field] || [];
      const bad = [];
      const good = arr.filter(entry => {
        const mfr = (entry.manufacturer || entry.brand || '').toUpperCase();
        if (mfr !== 'FLEETGUARD') return true;
        const it = impliedType(entry.code || '');
        if (it && it !== type) {
          bad.push(entry);
          return false;
        }
        return true;
      });
      if (bad.length) {
        touched = true;
        keep[field] = good;
        if (field === 'oem_codes') removedOem += bad.length; else removedComp += bad.length;
        if (examplesShown < 25) {
          console.log(`  ${row.sku} (${type}) ${field}: removing ${bad.map(b => b.code).join(', ')}`);
          examplesShown++;
        }
      }
    }
    if (touched) {
      skusAffected++;
      if (APPLY) {
        const sets = [];
        const vals = [];
        let i = 1;
        for (const field of ['oem_codes', 'competitor_codes']) {
          if (keep[field] !== undefined) {
            sets.push(`${field} = $${i++}::jsonb`);
            vals.push(JSON.stringify(keep[field]));
          }
        }
        vals.push(row.sku);
        await client.query(`UPDATE elimfilters_catalog SET ${sets.join(', ')} WHERE sku = $${i}`, vals);
      }
    }
  }

  console.log(`\n${APPLY ? 'APPLIED' : 'DRY RUN (pass --apply to write changes)'}`);
  console.log(`SKUs affected: ${skusAffected}`);
  console.log(`Entries removed from oem_codes: ${removedOem}`);
  console.log(`Entries removed from competitor_codes: ${removedComp}`);

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
