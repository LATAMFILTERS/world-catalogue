// Move aftermarket brand codes from oem_codes → competitor_codes for HD products
// Leaves only real equipment/vehicle OEM codes in oem_codes
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const AFTERMARKET = new Set([
  'MANN','MANN-HUMMEL','MANN HUMMEL','MANN+HUMMEL',
  'DONALDSON',
  'FLEETGUARD','NELSON','NELSON FLEETGUARD',
  'BALDWIN','BALDWIN FILTERS',
  'FRAM','CHAMPION LABS',
  'BOSCH','BOSCH REXROTH',
  'MAHLE','MAHLE KNECHT','KNECHT',
  'PUROLATOR',
  'WIX','WIX FILTERS',
  'HENGST',
  'SOFIMA',
  'LUBER-FINER','LUBERFINER',
  'AC DELCO','ACDELCO',
  'MOTORCRAFT',
  'HASTINGS',
  'NAPA',
  'DEUTSCH',
  'PARKER','PARKER HANNIFIN',
  'PALL','PALL CORPORATION',
  'HYDAC',
  'UFI','UFI FILTERS',
  'FIAAM','FILTRON',
  'SAKURA',
  'NIPPON DENSO','DENSO',
  'COOPERS FIAAM',
]);

function isAftermarket(manufacturer) {
  if (!manufacturer) return false;
  return AFTERMARKET.has(manufacturer.toUpperCase().trim());
}

async function main() {
  console.log('=== FIX: Move aftermarket codes oem_codes → competitor_codes (HD) ===\n');

  // Fetch all HD products with oem_codes
  const rows = await pool.query(`
    SELECT sku, oem_codes, competitor_codes
    FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY'
      AND oem_codes IS NOT NULL
      AND jsonb_array_length(oem_codes) > 0
  `);

  console.log(`HD products con oem_codes: ${rows.rows.length}`);

  let skusFixed = 0;
  let entriesMoved = 0;

  for (const row of rows.rows) {
    const oem = row.oem_codes || [];
    const competitor = row.competitor_codes || [];

    const keepInOem = [];
    const moveToCompetitor = [];

    for (const entry of oem) {
      if (isAftermarket(entry.manufacturer)) {
        moveToCompetitor.push(entry);
      } else {
        keepInOem.push(entry);
      }
    }

    if (moveToCompetitor.length === 0) continue;

    // Merge with existing competitor_codes, deduplicating by manufacturer+code
    const existingKeys = new Set(
      competitor.map(e => `${(e.manufacturer||'').toUpperCase().trim()}|${(e.code||'').toUpperCase().trim()}`)
    );

    const newCompetitor = [...competitor];
    for (const entry of moveToCompetitor) {
      const key = `${(entry.manufacturer||'').toUpperCase().trim()}|${(entry.code||'').toUpperCase().trim()}`;
      if (!existingKeys.has(key)) {
        newCompetitor.push(entry);
        existingKeys.add(key);
      }
    }

    await pool.query(`
      UPDATE elimfilters_catalog
      SET oem_codes = $1::jsonb,
          competitor_codes = $2::jsonb
      WHERE sku = $3
    `, [JSON.stringify(keepInOem), JSON.stringify(newCompetitor), row.sku]);

    skusFixed++;
    entriesMoved += moveToCompetitor.length;

    if (skusFixed % 200 === 0) {
      console.log(`  Procesados: ${skusFixed} SKUs, ${entriesMoved} entradas movidas...`);
    }
  }

  console.log(`\n=== COMPLETADO ===`);
  console.log(`SKUs actualizados: ${skusFixed}`);
  console.log(`Entradas movidas a competitor_codes: ${entriesMoved}`);

  // Verify
  const verify = await pool.query(`
    SELECT
      UPPER(TRIM(elem->>'manufacturer')) as mfr,
      COUNT(*) as entries,
      COUNT(DISTINCT sku) as skus
    FROM elimfilters_catalog, jsonb_array_elements(oem_codes) elem
    WHERE duty = 'HEAVY_DUTY' AND oem_codes IS NOT NULL
      AND UPPER(TRIM(COALESCE(elem->>'manufacturer',''))) = ANY(ARRAY[
        'MANN','MANN-HUMMEL','MANN HUMMEL','MANN+HUMMEL',
        'DONALDSON','FLEETGUARD','NELSON','BALDWIN','FRAM',
        'BOSCH','MAHLE','WIX','HENGST','PARKER','HYDAC','UFI','PALL',
        'PUROLATOR','SOFIMA','KNECHT','FIAAM','FILTRON','SAKURA','DENSO'
      ])
    GROUP BY 1 ORDER BY skus DESC
  `);

  if (verify.rows.length === 0) {
    console.log('\nVerificacion: LIMPIO — no quedan marcas aftermarket en HD oem_codes');
  } else {
    console.log('\nVerificacion — marcas aftermarket que QUEDAN en HD oem_codes (revisar):');
    verify.rows.forEach(r => console.log(`  ${r.mfr}: ${r.entries} entries en ${r.skus} SKUs`));
  }

  await pool.end();
}

main().catch(e => { console.error(e.message); pool.end(); });
