// Audit: detect real OEM manufacturer codes mixed into competitor_codes
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Known aftermarket filter brands (SHOULD be in competitor_codes)
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
  // HD-specific
  'CATERPILLAR','CAT',
  'CUMMINS',
  'KOMATSU',
  'JOHN DEERE','DEERE',
  'NEW HOLLAND',
  'CASE','CASE IH',
  'HITACHI',
  'VOLVO',
  'MERCEDES','MERCEDES-BENZ',
  'MAN',
  'SCANIA',
  'DAF',
  'IVECO',
  'RENAULT TRUCKS',
  'CLAAS',
  'AGCO',
  'MASSEY FERGUSON',
  'FENDT',
  'DEUTZ',
  'LIEBHERR',
  'PERKINS',
  'DETROIT DIESEL',
  'MACK',
  'KENWORTH','PETERBILT',
  'INTERNATIONAL','NAVISTAR',
  'FREIGHTLINER',
  'WESTERN STAR',
  'ISUZU',
  'HINO',
  'MITSUBISHI','MITSUBISHI FUSO',
  'UD TRUCKS','NISSAN DIESEL',
  'INGERSOLL-RAND','INGERSOLL RAND',
  'ATLAS COPCO',
  'SULLAIR',
  'GARDNER DENVER',
  'DOOSAN',
  'HYUNDAI',
  'SAMSUNG',
  'JCB',
  'TEREX',
  'GROVE',
  'MANITOWOC',
  'TADANO',
  'LINK-BELT',
  'ALLIS-CHALMERS',
  'FIAT','FIAT ALLIS','FIAT POWERTRAIN',
  'CNH',
  // LD OEM
  'VOLKSWAGEN','VW',
  'BMW',
  'AUDI',
  'OPEL','GM','GENERAL MOTORS',
  'FORD',
  'RENAULT',
  'PEUGEOT',
  'CITROEN',
  'TOYOTA',
  'HONDA',
  'NISSAN',
  'MAZDA',
  'SUBARU',
  'SUZUKI',
  'SEAT',
  'SKODA',
]);

async function main() {
  console.log('=== AUDIT: OEM codes in competitor_codes ===\n');

  // 1. Top manufacturers in HD competitor_codes
  console.log('--- 1. Top manufacturers in HD competitor_codes (top 50) ---');
  const hdTop = await pool.query(`
    SELECT
      UPPER(TRIM(COALESCE(elem->>'manufacturer','(sin manufacturer)'))) as mfr,
      COUNT(*) as entries,
      COUNT(DISTINCT sku) as skus
    FROM elimfilters_catalog, jsonb_array_elements(competitor_codes) elem
    WHERE duty = 'HEAVY_DUTY' AND competitor_codes IS NOT NULL
    GROUP BY 1 ORDER BY skus DESC LIMIT 50
  `);
  hdTop.rows.forEach(r => console.log(`  ${r.mfr}: ${r.entries} entries en ${r.skus} SKUs`));

  // 2. Top manufacturers in LD competitor_codes
  console.log('\n--- 2. Top manufacturers in LD competitor_codes (top 30) ---');
  const ldTop = await pool.query(`
    SELECT
      UPPER(TRIM(COALESCE(elem->>'manufacturer','(sin manufacturer)'))) as mfr,
      COUNT(*) as entries,
      COUNT(DISTINCT sku) as skus
    FROM elimfilters_catalog, jsonb_array_elements(competitor_codes) elem
    WHERE duty = 'LIGHT_DUTY' AND competitor_codes IS NOT NULL
    GROUP BY 1 ORDER BY skus DESC LIMIT 30
  `);
  ldTop.rows.forEach(r => console.log(`  ${r.mfr}: ${r.entries} entries en ${r.skus} SKUs`));

  // 3. Suspicious: competitor_codes entries that look like OEM vehicle/equipment codes
  //    Strategy: find entries WITHOUT a manufacturer field (raw codes) or with known OEM brand names
  console.log('\n--- 3. Entries in competitor_codes WITHOUT manufacturer field ---');
  const noMfr = await pool.query(`
    SELECT
      COALESCE(duty,'NULL') as duty,
      COUNT(*) as entries,
      COUNT(DISTINCT sku) as skus
    FROM elimfilters_catalog, jsonb_array_elements(competitor_codes) elem
    WHERE competitor_codes IS NOT NULL
      AND COALESCE(TRIM(elem->>'manufacturer'),'') = ''
    GROUP BY 1
  `);
  noMfr.rows.forEach(r => console.log(`  ${r.duty}: ${r.entries} entries en ${r.skus} SKUs sin manufacturer`));

  // 4. Sample entries without manufacturer in HD competitor_codes
  console.log('\n--- 4. Muestra de HD competitor_codes sin manufacturer (primeros 15) ---');
  const hdNoMfrSample = await pool.query(`
    SELECT sku, elem->>'code' as code, elem->>'manufacturer' as mfr
    FROM elimfilters_catalog, jsonb_array_elements(competitor_codes) elem
    WHERE duty = 'HEAVY_DUTY' AND competitor_codes IS NOT NULL
      AND COALESCE(TRIM(elem->>'manufacturer'),'') = ''
    LIMIT 15
  `);
  hdNoMfrSample.rows.forEach(r => console.log(`  ${r.sku}: code="${r.code}" mfr="${r.mfr}"`));

  // 5. Check for known OEM names that ended up in competitor_codes
  console.log('\n--- 5. Known OEM manufacturer names in competitor_codes ---');
  const oemInComp = await pool.query(`
    SELECT
      COALESCE(duty,'NULL') as duty,
      UPPER(TRIM(elem->>'manufacturer')) as mfr,
      COUNT(*) as entries,
      COUNT(DISTINCT sku) as skus
    FROM elimfilters_catalog, jsonb_array_elements(competitor_codes) elem
    WHERE competitor_codes IS NOT NULL
      AND UPPER(TRIM(COALESCE(elem->>'manufacturer',''))) = ANY(ARRAY[
        'CATERPILLAR','CAT','CUMMINS','KOMATSU','JOHN DEERE','DEERE',
        'NEW HOLLAND','CASE','CASE IH','HITACHI','LIEBHERR','PERKINS',
        'DETROIT DIESEL','MACK','INTERNATIONAL','NAVISTAR','FREIGHTLINER',
        'ISUZU','HINO','MITSUBISHI','DOOSAN','HYUNDAI','JCB',
        'VOLKSWAGEN','VW','BMW','AUDI','OPEL','FORD','RENAULT',
        'PEUGEOT','CITROEN','TOYOTA','HONDA','NISSAN','MAZDA',
        'VOLVO','SCANIA','DAF','IVECO','MAN','MERCEDES','MERCEDES-BENZ',
        'FIAT','SEAT','SKODA','SUBARU','SUZUKI','GM','GENERAL MOTORS'
      ])
    GROUP BY 1, 2 ORDER BY skus DESC
  `);
  if (oemInComp.rows.length === 0) {
    console.log('  LIMPIO — no se encontraron fabricantes OEM en competitor_codes');
  } else {
    console.log(`  Encontrados ${oemInComp.rows.length} fabricantes OEM en competitor_codes:`);
    oemInComp.rows.forEach(r => console.log(`  [${r.duty}] ${r.mfr}: ${r.entries} entries en ${r.skus} SKUs`));
  }

  console.log('\n=== FIN AUDIT ===');
  await pool.end();
}
main().catch(e => { console.error(e.message); pool.end(); });
