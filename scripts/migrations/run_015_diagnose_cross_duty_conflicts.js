'use strict';
/**
 * Run on Render Shell (read-only, makes no changes):
 *   node scripts/migrations/run_015_diagnose_cross_duty_conflicts.js
 *   node scripts/migrations/run_015_diagnose_cross_duty_conflicts.js LF3620
 *
 * Investigates why a single cross-reference code (e.g. "LF3620") can match
 * products in BOTH duty classes at once, forcing the "MULTIPLE EQUIPMENT
 * CLASSES FOUND" prompt in Part Search even when the user expects the code
 * to resolve to one specific product.
 *
 * Part 1: shows every catalog row (SKU, duty, description, technology) whose
 * oem_codes or competitor_codes contains the given code, so we can see
 * exactly which products are colliding and whether one of them looks
 * mis-tagged (wrong duty, wrong technology, implausible description) versus
 * a genuine case where the same part number is legitimately used on two
 * different products.
 *
 * Part 2 (only when no code arg is given): finds every code that appears on
 * at least one HEAVY_DUTY row AND at least one LIGHT_DUTY row, to show how
 * widespread this class of conflict is beyond the one code being reported.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const targetCode = (process.argv[2] || '').trim().toUpperCase().replace(/[-\s]/g, '');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();

  if (targetCode) {
    console.log(`\n=== Rows referencing code "${targetCode}" (normalized) ===\n`);
    const { rows } = await client.query(
      `SELECT sku, duty, technology, filter_type, description,
              oem_codes, competitor_codes
       FROM elimfilters_catalog c
       WHERE EXISTS (
         SELECT 1 FROM jsonb_array_elements(
           CASE WHEN jsonb_typeof(c.oem_codes) = 'array' THEN c.oem_codes ELSE '[]'::jsonb END
         ) AS ref
         WHERE UPPER(REPLACE(ref->>'code', '-', '')) = $1
       ) OR EXISTS (
         SELECT 1 FROM jsonb_array_elements(
           CASE WHEN jsonb_typeof(c.competitor_codes) = 'array' THEN c.competitor_codes ELSE '[]'::jsonb END
         ) AS ref
         WHERE UPPER(REPLACE(ref->>'code', '-', '')) = $1
       )
       ORDER BY duty, sku`,
      [targetCode]
    );

    if (!rows.length) {
      console.log('No rows found referencing that code.');
    } else {
      rows.forEach(r => {
        console.log(`SKU: ${r.sku}  |  duty: ${r.duty}  |  technology: ${r.technology}`);
        console.log(`  filter_type: ${r.filter_type}`);
        console.log(`  description: ${JSON.stringify(r.description).slice(0, 200)}`);
        const matchingOem = (r.oem_codes || []).filter(x =>
          String(x.code || '').toUpperCase().replace(/[-\s]/g, '') === targetCode
        );
        const matchingComp = (r.competitor_codes || []).filter(x =>
          String(x.code || '').toUpperCase().replace(/[-\s]/g, '') === targetCode
        );
        if (matchingOem.length) console.log('  matching oem_codes entries:', JSON.stringify(matchingOem));
        if (matchingComp.length) console.log('  matching competitor_codes entries:', JSON.stringify(matchingComp));
        console.log('');
      });
    }
  } else {
    console.log('\n=== Scanning for codes that match BOTH a HEAVY_DUTY and a LIGHT_DUTY row (this can take a moment) ===\n');
    const { rows } = await client.query(`
      WITH refs AS (
        SELECT c.sku, c.duty, UPPER(REPLACE(ref->>'code', '-', '')) AS code
        FROM elimfilters_catalog c,
             jsonb_array_elements(
               CASE WHEN jsonb_typeof(c.oem_codes) = 'array' THEN c.oem_codes ELSE '[]'::jsonb END
             ) AS ref
        WHERE ref->>'code' IS NOT NULL AND ref->>'code' <> ''
        UNION ALL
        SELECT c.sku, c.duty, UPPER(REPLACE(ref->>'code', '-', '')) AS code
        FROM elimfilters_catalog c,
             jsonb_array_elements(
               CASE WHEN jsonb_typeof(c.competitor_codes) = 'array' THEN c.competitor_codes ELSE '[]'::jsonb END
             ) AS ref
        WHERE ref->>'code' IS NOT NULL AND ref->>'code' <> ''
      )
      SELECT code,
             COUNT(*) FILTER (WHERE duty = 'HEAVY_DUTY') AS hd_rows,
             COUNT(*) FILTER (WHERE duty = 'LIGHT_DUTY') AS ld_rows,
             ARRAY_AGG(DISTINCT sku) AS skus
      FROM refs
      WHERE code <> ''
      GROUP BY code
      HAVING COUNT(*) FILTER (WHERE duty = 'HEAVY_DUTY') > 0
         AND COUNT(*) FILTER (WHERE duty = 'LIGHT_DUTY') > 0
      ORDER BY code
    `);

    console.log(`Total codes matching both HD and LD products: ${rows.length}\n`);
    rows.slice(0, 50).forEach(r => {
      console.log(`${r.code}  |  HD rows: ${r.hd_rows}  LD rows: ${r.ld_rows}  |  SKUs: ${r.skus.join(', ')}`);
    });
    if (rows.length > 50) console.log(`\n... and ${rows.length - 50} more. Re-run with a specific code to inspect one in detail.`);
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
