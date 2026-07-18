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
 * (CLAUDE.md "LD SKU Generation Rules"): prefix + last 4 digits of the
 * source part number with all non-digit characters stripped.
 *   OEM 77024-42110 -> digits 7702442110 -> last 4 = 2110
 *   Prefix EF3 (Fuel Filter LD) -> EF32110
 *
 * Technical specs (dimensions, thread size, media, micron rating) are
 * NOT yet known - ELIMFILTERS has not manufactured/measured this part.
 * This creates a minimal, correct stub: SKU, OEM cross-reference,
 * filter_type, duty, technology (SYNTEPORE - matches the fuel filter
 * technology used consistently across both HD and LD in this catalog,
 * confirmed against existing EF3 rows below). Dimensional fields stay
 * NULL until real engineering data is available - this is intentional,
 * not an oversight, and must be filled in before this SKU is sellable.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');
const NEW_SKU = 'EF32110';
const OEM_CODE = '77024-42110';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN (pass --apply to write changes)'}`);

  // Collision check
  const existing = await client.query('SELECT sku, codigo_base FROM elimfilters_catalog WHERE sku = $1', [NEW_SKU]);
  if (existing.rows.length) {
    console.log(`\n❌ COLLISION: ${NEW_SKU} already exists (codigo_base=${existing.rows[0].codigo_base}). Aborting - manual review required.`);
    await client.end();
    return;
  }
  console.log(`\n✅ No collision: ${NEW_SKU} is free.`);

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
  const technology = techCounts[0]?.technology || 'SYNTEPORE™';
  console.log(`\nUsing technology: ${technology}`);

  if (APPLY) {
    await client.query(
      `INSERT INTO elimfilters_catalog (sku, codigo_base, filter_type, duty, technology, oem_codes, competitor_codes, description)
       VALUES ($1, $2, 'Fuel Filter', 'LIGHT_DUTY', $3, $4::jsonb, '[]'::jsonb, $5)`,
      [
        NEW_SKU,
        OEM_CODE,
        technology,
        JSON.stringify([{ manufacturer: 'TOYOTA', code: OEM_CODE }]),
        `ELIMFILTERS® ${NEW_SKU} Fuel filter for the Toyota RAV4 2.5L (2022+). First aftermarket equivalent to OEM ${OEM_CODE} - no prior cross-reference existed. Technical specifications pending engineering data.`,
      ]
    );
    console.log(`\n✅ Created ${NEW_SKU}. Dimensional specs (OD, length, thread, micron rating, media) still need to be filled in before this is sellable.`);
  } else {
    console.log('\nNo changes written. Re-run with --apply to commit.');
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
