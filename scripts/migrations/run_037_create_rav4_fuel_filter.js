'use strict';
/**
 * Run on Render Shell:
 *   node scripts/migrations/run_037_create_rav4_fuel_filter.js           (dry run — no changes)
 *   node scripts/migrations/run_037_create_rav4_fuel_filter.js --apply   (writes changes)
 *
 * No aftermarket fuel filter exists yet for the Toyota RAV4 2022 2.5L
 * (OEM 77024-42110, confirmed 100% OEM-only, no cross-reference found
 * by run_035). ELIMFILTERS is creating a new product to be first to
 * market with an equivalent.
 *
 * SKU generated with the same LD rule already used for MANN imports
 * (CLAUDE.md "LD SKU Generation Rules"): prefix + 4 digits from the
 * source part number with all non-digit characters stripped. The
 * straightforward "last 4 digits" (EF32110) collided with an unrelated
 * existing MANN-sourced product (run_039: a Dynapac/Ligier fuel
 * filter, codigo_base "2110" - a genuine coincidence, not the same
 * part). Per ELIMFILTERS direction: try a different 4-digit window
 * from the same OEM code instead of inventing an unrelated number.
 *
 * OEM 77024-42110 -> digits 7702442110 (10 digits). Slides a 4-digit
 * window backward from the end (skipping the already-taken last-4),
 * checking each for a collision, and uses the first free one:
 *   [6:10]="2110" (taken) -> [5:9]="4211" -> [4:8]="4421" ->
 *   [3:7]="2442" -> [2:6]="0244" -> [1:5]="7024" -> [0:4]="7702"
 *
 * Technical specs (dimensions, thread size, media, micron rating) are
 * NOT yet known - ELIMFILTERS has not manufactured/measured this part.
 * This creates a minimal, correct stub: SKU, OEM cross-reference,
 * filter_type, duty, technology (auto-detected from existing EF3
 * rows). Dimensional fields stay NULL until real engineering data is
 * available - this is intentional, not an oversight, and must be
 * filled in before this SKU is sellable.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');
const OEM_CODE = '77024-42110';
const PREFIX = 'EF3';

function candidateWindows(oemCode) {
  const digits = oemCode.replace(/\D/g, '');
  const windows = [];
  for (let start = digits.length - 4; start >= 0; start--) {
    windows.push(digits.slice(start, start + 4));
  }
  return windows;
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN (pass --apply to write changes)'}`);

  const windows = candidateWindows(OEM_CODE);
  console.log(`\nCandidate 4-digit windows from OEM ${OEM_CODE}: ${windows.join(', ')}`);

  let newSku = null;
  for (const w of windows) {
    const candidate = PREFIX + w;
    const existing = await client.query('SELECT sku FROM elimfilters_catalog WHERE sku = $1', [candidate]);
    if (!existing.rows.length) {
      console.log(`  ${candidate}: free -> using this`);
      newSku = candidate;
      break;
    }
    console.log(`  ${candidate}: taken, trying next`);
  }

  if (!newSku) {
    console.log('\n❌ All candidate windows are taken. Manual SKU choice required.');
    await client.end();
    return;
  }

  // Confirm the dominant technology label used by existing EF3 (LD Fuel) rows
  const { rows: techCounts } = await client.query(`
    SELECT technology, COUNT(*) AS n
    FROM elimfilters_catalog
    WHERE sku LIKE 'EF3%'
    GROUP BY technology
    ORDER BY n DESC
  `);
  console.log('\nExisting EF3 technology distribution:');
  techCounts.forEach(r => console.log(`  ${r.technology}  |  ${r.n}`));
  const technology = techCounts[0]?.technology || 'SYNTAPORE™';
  console.log(`\nUsing SKU: ${newSku}  |  technology: ${technology}`);

  if (APPLY) {
    await client.query(
      `INSERT INTO elimfilters_catalog (sku, codigo_base, filter_type, duty, technology, oem_codes, competitor_codes, description)
       VALUES ($1, $2, 'Fuel Filter', 'LIGHT_DUTY', $3, $4::jsonb, '[]'::jsonb, $5)`,
      [
        newSku,
        OEM_CODE,
        technology,
        JSON.stringify([{ manufacturer: 'TOYOTA', code: OEM_CODE }]),
        `ELIMFILTERS® ${newSku} Fuel filter for the Toyota RAV4 2.5L (2022+). First aftermarket equivalent to OEM ${OEM_CODE} - no prior cross-reference existed. Technical specifications pending engineering data.`,
      ]
    );
    console.log(`\n✅ Created ${newSku}. Dimensional specs (OD, length, thread, micron rating, media) still need to be filled in before this is sellable.`);
  } else {
    console.log('\nNo changes written. Re-run with --apply to commit.');
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
