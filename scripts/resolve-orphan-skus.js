#!/usr/bin/env node
/**
 * resolve-orphan-skus.js
 *
 * Assigns ELIMFILTERS SKUs to the 374 orphaned HD cross-reference records
 * in fleetguard_orphans.json.
 *
 * Logic:
 *   1. For each orphan, determine filter type from Fleetguard or MANN prefix.
 *   2. Look up the OEM code in elimfilters_catalog (oem_codes array).
 *      If found → reuse existing SKU (no duplicate created).
 *   3. If NOT found → generate new SKU = type_prefix + next_available_number.
 *      Next number = MAX existing suffix for that prefix + 1.
 *   4. Upsert into elimfilters_catalog with all cross-reference data.
 *   5. Write updated fleetguard_orphans.json with elimfilters_sku filled.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." node scripts/resolve-orphan-skus.js
 *
 * Dry run (no DB writes, just prints assignments):
 *   DRY_RUN=1 DATABASE_URL="postgresql://..." node scripts/resolve-orphan-skus.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DRY_RUN = process.env.DRY_RUN === '1';
const ORPHANS_FILE = path.join(__dirname, '..', 'fleetguard_orphans.json');

// ─── Filter type mapping ──────────────────────────────────────────────────────
const FG_PREFIX_TO_TYPE = {
  LF: 'oil', FF: 'fuel', HF: 'hydraulic', FS: 'fuel', WF: 'water',
};
const MANN_PREFIX_TO_TYPE = {
  WP: 'oil', HU: 'oil', W: 'oil',
  WK: 'fuel', WD: 'fuel', WDK: 'fuel',
  H: 'hydraulic', HD: 'hydraulic',
  P: 'air', C: 'air', AU: 'air',
  PU: 'cabin', PF: 'cabin', CF: 'cabin',
};
const TYPE_TO_PREFIX = {
  oil: 'EL8', fuel: 'EF9', hydraulic: 'EH6',
  air: 'EA1', cabin: 'EC1', water: 'EL8', // water maps to lube prefix for now
};
const TYPE_TO_FILTER_TYPE = {
  oil: 'oil', fuel: 'fuel', hydraulic: 'hydraulic',
  air: 'air', cabin: 'cabin', water: 'oil',
};

function getFilterType(record) {
  const fgPfx = (record.fleetguard_part || '').match(/^[A-Z]+/)?.[0];
  if (fgPfx && FG_PREFIX_TO_TYPE[fgPfx]) return FG_PREFIX_TO_TYPE[fgPfx];
  const mannClean = (record.mann_part || '').replace('_MANN-FILTER', '');
  const mannPfx = mannClean.match(/^[A-Z]+/)?.[0];
  if (mannPfx && MANN_PREFIX_TO_TYPE[mannPfx]) return MANN_PREFIX_TO_TYPE[mannPfx];
  return null;
}

function getMannCode(mannPart) {
  return (mannPart || '').replace('_MANN-FILTER', '').trim();
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable required');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
  });

  console.log('Connecting to database...');
  // Render free tier can reset first connection — retry up to 3 times
  let connected = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await pool.query('SELECT 1');
      connected = true;
      break;
    } catch (e) {
      console.log(`  Attempt ${attempt}/3 failed: ${e.message} — retrying in 3s...`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  if (!connected) throw new Error('Could not connect after 3 attempts');
  console.log('Connected ✓\n');

  const orphans = JSON.parse(fs.readFileSync(ORPHANS_FILE, 'utf8'));
  console.log(`Loaded ${orphans.length} orphan records\n`);

  // ── Step 1: Get current max suffix per prefix ─────────────────────────────
  const maxQuery = await pool.query(`
    SELECT sku FROM elimfilters_catalog
    WHERE sku ~ '^E[A-Z][0-9][0-9]+$'
    ORDER BY sku
  `);
  const maxByPrefix = {};
  for (const { sku } of maxQuery.rows) {
    const prefix = sku.slice(0, 3); // e.g. "EL8"
    const suffix = parseInt(sku.slice(3), 10);
    if (!isNaN(suffix)) {
      if (!maxByPrefix[prefix] || suffix > maxByPrefix[prefix]) {
        maxByPrefix[prefix] = suffix;
      }
    }
  }
  console.log('Max existing suffixes by prefix:');
  Object.entries(maxByPrefix).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  console.log();

  // ── Step 2: Process each orphan ────────────────────────────────────────────
  let resolved = 0, reused = 0, created = 0, skipped = 0;
  const assignments = [];

  for (const record of orphans) {
    if (record.elimfilters_sku) {
      // Already assigned in a previous run
      resolved++;
      continue;
    }

    const filterType = getFilterType(record);
    if (!filterType) {
      console.warn(`SKIP (unknown type): ${record.fleetguard_part} / ${record.mann_part}`);
      skipped++;
      continue;
    }

    const elPrefix = TYPE_TO_PREFIX[filterType];
    const mannCode = getMannCode(record.mann_part);

    // ── Check if OEM code already in catalog ──────────────────────────────
    let existingSku = null;
    if (record.oem_normalized) {
      const existing = await pool.query(`
        SELECT sku FROM elimfilters_catalog
        WHERE oem_codes @> $1::jsonb
        LIMIT 1
      `, [JSON.stringify([record.oem_normalized])]);
      if (existing.rows.length > 0) {
        existingSku = existing.rows[0].sku;
      }
    }

    // ── Also check by MANN code in competitor_codes or oem_codes ──────────
    if (!existingSku && mannCode) {
      const existing = await pool.query(`
        SELECT sku FROM elimfilters_catalog
        WHERE oem_codes @> $1::jsonb OR competitor_codes @> $1::jsonb
        LIMIT 1
      `, [JSON.stringify([mannCode])]);
      if (existing.rows.length > 0) {
        existingSku = existing.rows[0].sku;
      }
    }

    // ── Also check by Fleetguard part in competitor_codes ─────────────────
    if (!existingSku && record.fleetguard_part) {
      const existing = await pool.query(`
        SELECT sku FROM elimfilters_catalog
        WHERE competitor_codes @> $1::jsonb
        LIMIT 1
      `, [JSON.stringify([record.fleetguard_part])]);
      if (existing.rows.length > 0) {
        existingSku = existing.rows[0].sku;
      }
    }

    let assignedSku;
    let isNew = false;

    if (existingSku) {
      assignedSku = existingSku;
      reused++;
    } else {
      // Generate new SKU
      const currentMax = maxByPrefix[elPrefix] || 0;
      const newSuffix = currentMax + 1;
      maxByPrefix[elPrefix] = newSuffix;
      assignedSku = `${elPrefix}${String(newSuffix).padStart(4, '0')}`;
      created++;
      isNew = true;
    }

    record.elimfilters_sku = assignedSku;
    resolved++;

    assignments.push({
      sku: assignedSku,
      isNew,
      filterType,
      oem: record.oem_normalized,
      oem_brand: record.oem_brand,
      mann: mannCode,
      fleetguard: record.fleetguard_part,
    });

    if (!DRY_RUN && isNew) {
      // Insert new product into catalog
      const oem_codes = [];
      if (record.oem_normalized) oem_codes.push(record.oem_normalized);

      const competitor_codes = [];
      if (record.fleetguard_part) competitor_codes.push(record.fleetguard_part);

      const brand_crossrefs = {};
      if (mannCode) brand_crossrefs['MANN'] = mannCode;
      if (record.fleetguard_part) brand_crossrefs['FLEETGUARD'] = record.fleetguard_part;

      const equipment_applications = record.oem_brand
        ? [{ brand: record.oem_brand, part: record.oem_normalized }]
        : [];

      await pool.query(`
        INSERT INTO elimfilters_catalog (
          sku, codigo_base, filter_type, oem_codes, competitor_codes,
          brand_crossrefs, equipment_applications
        ) VALUES (
          $1, $2, $3,
          $4::jsonb, $5::jsonb,
          $6::jsonb, $7::jsonb
        )
        ON CONFLICT (sku) DO UPDATE SET
          oem_codes        = CASE WHEN jsonb_array_length(EXCLUDED.oem_codes) > 0
                               THEN EXCLUDED.oem_codes
                               ELSE elimfilters_catalog.oem_codes END,
          competitor_codes = CASE WHEN jsonb_array_length(EXCLUDED.competitor_codes) > 0
                               THEN EXCLUDED.competitor_codes
                               ELSE elimfilters_catalog.competitor_codes END,
          brand_crossrefs  = CASE WHEN EXCLUDED.brand_crossrefs <> '{}'::jsonb
                               THEN EXCLUDED.brand_crossrefs
                               ELSE elimfilters_catalog.brand_crossrefs END,
          equipment_applications = CASE WHEN jsonb_array_length(EXCLUDED.equipment_applications) > 0
                               THEN EXCLUDED.equipment_applications
                               ELSE elimfilters_catalog.equipment_applications END
      `, [
        assignedSku,
        assignedSku, // codigo_base = same as sku for new HD records
        TYPE_TO_FILTER_TYPE[filterType],
        JSON.stringify(oem_codes),
        JSON.stringify(competitor_codes),
        JSON.stringify(brand_crossrefs),
        JSON.stringify(equipment_applications),
      ]);
    }
  }

  // ── Step 3: Write updated orphans file ──────────────────────────────────
  if (!DRY_RUN) {
    fs.writeFileSync(ORPHANS_FILE, JSON.stringify(orphans, null, 2));
    console.log(`\nUpdated ${ORPHANS_FILE}`);
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════');
  console.log(`  RESULTS ${DRY_RUN ? '(DRY RUN — no writes)' : ''}`);
  console.log('═══════════════════════════════════════════════');
  console.log(`  Total orphans:     ${orphans.length}`);
  console.log(`  Resolved:          ${resolved}`);
  console.log(`  Reused existing:   ${reused}`);
  console.log(`  New SKUs created:  ${created}`);
  console.log(`  Skipped:           ${skipped}`);
  console.log('═══════════════════════════════════════════════\n');

  console.log('New max suffixes after run:');
  Object.entries(maxByPrefix).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

  if (DRY_RUN) {
    console.log('\nFirst 20 assignments:');
    assignments.slice(0, 20).forEach(a =>
      console.log(`  [${a.isNew ? 'NEW' : 'REUSE'}] ${a.sku} | ${a.filterType} | OEM:${a.oem}(${a.oem_brand}) MANN:${a.mann} FG:${a.fleetguard}`)
    );
  }

  await pool.end();
  console.log('\nDone.');
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
