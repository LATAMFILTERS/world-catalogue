'use strict';
/**
 * Run on Render Shell:
 *   node scripts/migrations/run_026_rewrite_hd_descriptions.js           (dry run — no changes)
 *   node scripts/migrations/run_026_rewrite_hd_descriptions.js --apply   (writes changes)
 *
 * Full rewrite of HD product descriptions, approved by ELIMFILTERS. New
 * format: "ELIMFILTERS® {SKU} {narrative body}" — no dimensions, thread
 * size, burst/collapse pressure, micron rating, efficiency percentage, or
 * ISO test method in the text (all of that is already shown separately in
 * the results card's specs grid and badges). The body is technical,
 * professional, and explains what the filter is, how its technology
 * protects the system, and the practical consequence of that protection —
 * one fixed body per SKU prefix (technology/system combination).
 *
 * Source data side (scripts/donaldson_*_results.json,
 * scripts/parker_turbine_results.json, scripts/donaldson_import_ready.jsonl)
 * already rewritten with the same bodies. This applies the identical bodies
 * to the live DB, matched by SKU prefix. ES9 (generic Fuel/Water
 * Separator) has no local source data file, but is included here in case
 * live rows exist under that prefix.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');

const BODIES = [
  { prefix: 'EL8', label: 'Lube/Oil — SYNTRAX™', body: 'Full-flow oil filter for heavy-duty engines. SYNTRAX™ synthetic media traps wear particles before they reach bearings and cylinder walls, keeping oil clean and protecting critical engine surfaces throughout the full service interval.' },
  { prefix: 'EF9', label: 'Fuel — SYNTEPORE™', body: 'Fuel filter for diesel injection systems. SYNTEPORE™ media removes particulate and water contamination before fuel reaches high-pressure injectors, protecting against injector wear and stalling caused by dirty fuel.' },
  { prefix: 'ES9', label: 'Fuel/Water Separator — HYDROCORE™', body: 'Fuel/water separator for diesel fuel systems. HYDROCORE™ media coalesces and drains free water from fuel before it reaches the injection system, preventing injector corrosion and microbial growth in the fuel tank.' },
  { prefix: 'ET9', label: 'Turbine/FH — TURBOCORE™', body: 'Turbine-series fuel/water separator housing and element. TURBOCORE™ three-stage coalescing media removes water and fine particulate from diesel fuel before it reaches the engine, protecting injectors from corrosion and abrasive wear.' },
  { prefix: 'EA1', label: 'Air — MACROCORE™', body: 'Engine air filter for heavy-duty intake systems. MACROCORE™ progressive density media captures dust and airborne particles before they reach the combustion chamber, protecting cylinders, rings, and turbochargers from abrasive wear.' },
  { prefix: 'EA2', label: 'Air Intake Assembly — INTEKCORE™', body: 'Complete air intake housing assembly for heavy-duty and off-road equipment. INTEKCORE™ housing accepts MACROCORE™ primary and safety elements to give the engine a sealed, two-stage barrier against dust and debris before intake air reaches the turbocharger and cylinders.' },
  { prefix: 'EH6', label: 'Hydraulic — NANOFORCE™', body: 'Hydraulic filter for precision fluid power systems. NANOFORCE™ electrostatic synthetic media captures fine particles and free water before they reach proportional valves and seals, preventing the wear and leakage that follow contaminated hydraulic fluid.' },
  { prefix: 'EC1', label: 'Cabin — MICROKAPPA™', body: 'Cabin air filter for the operator compartment. MICROKAPPA™ media blocks dust, PM10, and airborne contaminants before they reach the cab, protecting operator health and visibility during long shifts.' },
  { prefix: 'EW7', label: 'Coolant — THERMACORE™', body: 'Coolant filter for engine cooling circuits. THERMACORE™ micro-filtration media removes particulate and helps maintain coolant additive balance, reducing corrosion, cavitation, and scale buildup in the cooling system.' },
  { prefix: 'ED4', label: 'Air Dryer — DRYCORE™', body: 'Air dryer cartridge for the compressed air system. DRYCORE™ integrated desiccant removes water vapor and oil aerosols from compressed air before it reaches tanks and valves, preventing corrosion and moisture-related failures in pneumatic components.' },
];

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN (pass --apply to write changes)'}`);

  let grandTotal = 0;

  for (const { prefix, label, body } of BODIES) {
    const { rows } = await client.query(
      `SELECT sku, description FROM elimfilters_catalog WHERE sku LIKE $1`,
      [prefix + '%']
    );

    console.log(`\n=== ${prefix} (${label}) — ${rows.length} rows ===`);
    if (rows.length) {
      console.log(`  sample: ${rows[0].sku}`);
      console.log(`  before: ${(rows[0].description || '').slice(0, 100)}...`);
      console.log(`  after:  ELIMFILTERS® ${rows[0].sku} ${body.slice(0, 80)}...`);
    }

    grandTotal += rows.length;

    if (APPLY && rows.length) {
      await client.query(
        `UPDATE elimfilters_catalog SET description = 'ELIMFILTERS® ' || sku || ' ' || $2 WHERE sku LIKE $1`,
        [prefix + '%', body]
      );
    }
  }

  console.log(`\nTotal rows affected: ${grandTotal}`);
  if (!APPLY) {
    console.log('\nNo changes written. Re-run with --apply to commit these changes.');
  } else {
    console.log('\n✅ Changes committed.');
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
