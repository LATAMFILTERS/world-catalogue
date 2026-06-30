// Audit: identify aftermarket brand codes (MANN, Donaldson) mixed in oem_codes
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Known aftermarket filter brands that should be in competitor_codes, not oem_codes
const AFTERMARKET_MANUFACTURERS = new Set([
  'MANN', 'MANN-HUMMEL', 'MANN HUMMEL', 'MANN+HUMMEL',
  'DONALDSON',
  'FLEETGUARD', 'NELSON', 'NELSON FLEETGUARD',
  'BALDWIN', 'BALDWIN FILTERS',
  'FRAM', 'CHAMPION LABS',
  'BOSCH', 'BOSCH REXROTH',
  'MAHLE', 'MAHLE KNECHT', 'KNECHT',
  'PUROLATOR',
  'WIX', 'WIX FILTERS',
  'HENGST',
  'SOFIMA',
  'LUBER-FINER', 'LUBERFINER',
  'AC DELCO', 'ACDELCO',
  'MOTORCRAFT',
  'HASTINGS',
  'NAPA',
  'DEUTSCH',
  'PARKER', 'PARKER HANNIFIN',
  'PALL', 'PALL CORPORATION',
  'HYDAC',
  'UFI', 'UFI FILTERS',
  'FIAAM', 'FILTRON',
  'SAKURA',
  'NIPPON DENSO', 'DENSO',
  'COOPERS FIAAM',
]);

// Donaldson part number patterns (P followed by 5-7 digits)
const DONALDSON_CODE = /^P\d{5,7}$/i;
// Also DBA prefix (Donaldson Blue Air)
const DONALDSON_ALT = /^(DBA|DBL|DT|RS|P)\d/i;

async function main() {
  console.log('=== AUDIT: Aftermarket codes in oem_codes ===\n');

  // 1. Count HD oem_codes entries by manufacturer category
  console.log('--- 1. Top manufacturers in HD oem_codes ---');
  const hdMfrs = await pool.query(`
    SELECT
      UPPER(TRIM(COALESCE(elem->>'manufacturer', '(sin manufacturer)'))) as mfr,
      COUNT(*) as entries,
      COUNT(DISTINCT sku) as skus
    FROM elimfilters_catalog, jsonb_array_elements(oem_codes) elem
    WHERE duty = 'HEAVY_DUTY' AND oem_codes IS NOT NULL
    GROUP BY 1 ORDER BY entries DESC LIMIT 40
  `);
  hdMfrs.rows.forEach(r => console.log(`  ${r.mfr}: ${r.entries} entries en ${r.skus} SKUs`));
  console.log('');

  // 2. HD oem_codes entries with manufacturer = aftermarket brand
  console.log('--- 2. HD oem_codes con manufacturer = aftermarket brand ---');
  const hdAftermarket = await pool.query(`
    SELECT
      UPPER(TRIM(elem->>'manufacturer')) as mfr,
      COUNT(*) as entries,
      COUNT(DISTINCT sku) as skus
    FROM elimfilters_catalog, jsonb_array_elements(oem_codes) elem
    WHERE duty = 'HEAVY_DUTY' AND oem_codes IS NOT NULL
      AND UPPER(TRIM(COALESCE(elem->>'manufacturer',''))) = ANY(ARRAY[
        'MANN','MANN-HUMMEL','MANN HUMMEL','MANN+HUMMEL',
        'DONALDSON','FLEETGUARD','NELSON','NELSON FLEETGUARD',
        'BALDWIN','BALDWIN FILTERS','FRAM','CHAMPION LABS',
        'BOSCH','MAHLE','MAHLE KNECHT','KNECHT','PUROLATOR',
        'WIX','WIX FILTERS','HENGST','SOFIMA','LUBER-FINER',
        'PARKER','PARKER HANNIFIN','PALL','HYDAC','UFI','UFI FILTERS',
        'FIAAM','FILTRON','SAKURA','DENSO','NIPPON DENSO'
      ])
    GROUP BY 1 ORDER BY skus DESC
  `);
  console.log(`  Total marcas aftermarket encontradas: ${hdAftermarket.rows.length}`);
  hdAftermarket.rows.forEach(r => console.log(`  ${r.mfr}: ${r.entries} entries en ${r.skus} SKUs`));
  console.log('');

  // 3. HD oem_codes entries WITHOUT manufacturer but code matches Donaldson pattern
  console.log('--- 3. HD oem_codes sin manufacturer, código = Donaldson (P#####) ---');
  const donaldsonNoMfr = await pool.query(`
    SELECT COUNT(*) as entries, COUNT(DISTINCT sku) as skus
    FROM elimfilters_catalog, jsonb_array_elements(oem_codes) elem
    WHERE duty = 'HEAVY_DUTY' AND oem_codes IS NOT NULL
      AND COALESCE(TRIM(elem->>'manufacturer'),'') = ''
      AND elem->>'code' ~* '^P[0-9]{5,7}$'
  `);
  console.log(`  Donaldson P-codes sin manufacturer: ${donaldsonNoMfr.rows[0].entries} entries en ${donaldsonNoMfr.rows[0].skus} SKUs`);

  // 4. HD oem_codes entries WITHOUT manufacturer, code matches MANN patterns
  console.log('\n--- 4. HD oem_codes sin manufacturer, código = MANN patterns ---');
  const mannNoMfr = await pool.query(`
    SELECT COUNT(*) as entries, COUNT(DISTINCT sku) as skus
    FROM elimfilters_catalog, jsonb_array_elements(oem_codes) elem
    WHERE duty = 'HEAVY_DUTY' AND oem_codes IS NOT NULL
      AND COALESCE(TRIM(elem->>'manufacturer'),'') = ''
      AND (
        elem->>'code' ~* '^(ML|CF|WK|CU|WD)[\\s]?[0-9]'
        OR elem->>'code' ~* '^W[0-9]'
        OR elem->>'code' ~* '^C[0-9]'
      )
  `);
  console.log(`  MANN codes sin manufacturer: ${mannNoMfr.rows[0].entries} entries en ${mannNoMfr.rows[0].skus} SKUs`);
  console.log('');

  // 5. HD oem_codes entries that are REAL OEM (not aftermarket, not Donaldson/MANN pattern)
  console.log('--- 5. Muestra de OEM REALES en HD oem_codes ---');
  const realOem = await pool.query(`
    SELECT UPPER(TRIM(COALESCE(elem->>'manufacturer','(sin mfr)'))) as mfr,
      COUNT(DISTINCT sku) as skus
    FROM elimfilters_catalog, jsonb_array_elements(oem_codes) elem
    WHERE duty = 'HEAVY_DUTY' AND oem_codes IS NOT NULL
      AND UPPER(TRIM(COALESCE(elem->>'manufacturer',''))) NOT IN (
        'MANN','MANN-HUMMEL','MANN HUMMEL','MANN+HUMMEL',
        'DONALDSON','FLEETGUARD','NELSON','BALDWIN','FRAM',
        'BOSCH','MAHLE','MAHLE KNECHT','KNECHT','WIX','HENGST',
        'PARKER','HYDAC','UFI','FILTRON','SAKURA','DENSO'
      )
      AND COALESCE(TRIM(elem->>'manufacturer'),'') != ''
      AND elem->>'code' !~* '^P[0-9]{5,7}$'
      AND elem->>'code' !~* '^(ML|CF|WK|CU|WD)[\\s]?[0-9]'
    GROUP BY 1 ORDER BY skus DESC LIMIT 30
  `);
  console.log('  Fabricantes OEM reales en HD:');
  realOem.rows.forEach(r => console.log(`    ${r.mfr}: ${r.skus} SKUs`));
  console.log('');

  // 6. Same for LD - verify LD oem_codes are clean (only real OEM)
  console.log('--- 6. Top manufacturers en LD oem_codes (verificación) ---');
  const ldMfrs = await pool.query(`
    SELECT
      UPPER(TRIM(COALESCE(elem->>'manufacturer', '(sin manufacturer)'))) as mfr,
      COUNT(*) as entries,
      COUNT(DISTINCT sku) as skus
    FROM elimfilters_catalog, jsonb_array_elements(oem_codes) elem
    WHERE duty = 'LIGHT_DUTY' AND oem_codes IS NOT NULL
    GROUP BY 1 ORDER BY skus DESC LIMIT 20
  `);
  ldMfrs.rows.forEach(r => console.log(`  ${r.mfr}: ${r.skus} SKUs`));

  console.log('\n=== FIN AUDIT ===');
  await pool.end();
}
main().catch(e => { console.error(e.message); pool.end(); });
