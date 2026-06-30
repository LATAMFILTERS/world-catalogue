// Move real OEM manufacturer codes from competitor_codes → oem_codes for HD products
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Real equipment/vehicle OEM manufacturers (should be in oem_codes)
const REAL_OEM = new Set([
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
  // General vehicle OEMs that appear in HD context
  'FORD',
  'TOYOTA',
  'NISSAN',
  'MAZDA',
  'HONDA',
  'SUBARU',
  'SUZUKI',
  'MITSUBISHI',
]);

function isRealOem(manufacturer) {
  if (!manufacturer) return false;
  return REAL_OEM.has(manufacturer.toUpperCase().trim());
}

async function main() {
  console.log('=== FIX: Move OEM codes competitor_codes → oem_codes (HD) ===\n');

  // Fetch all HD products with competitor_codes containing OEM entries
  const rows = await pool.query(`
    SELECT sku, oem_codes, competitor_codes
    FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY'
      AND competitor_codes IS NOT NULL
      AND jsonb_array_length(competitor_codes) > 0
      AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(competitor_codes) e
        WHERE UPPER(TRIM(COALESCE(e->>'manufacturer',''))) = ANY(ARRAY[
          'CATERPILLAR','CAT','CUMMINS','KOMATSU','JOHN DEERE','DEERE',
          'NEW HOLLAND','CASE','CASE IH','HITACHI','VOLVO','MERCEDES',
          'MERCEDES-BENZ','MAN','SCANIA','DAF','IVECO','RENAULT TRUCKS',
          'CLAAS','AGCO','MASSEY FERGUSON','FENDT','DEUTZ','LIEBHERR',
          'PERKINS','DETROIT DIESEL','MACK','KENWORTH','PETERBILT',
          'INTERNATIONAL','NAVISTAR','FREIGHTLINER','WESTERN STAR',
          'ISUZU','HINO','MITSUBISHI','MITSUBISHI FUSO','UD TRUCKS',
          'NISSAN DIESEL','INGERSOLL-RAND','INGERSOLL RAND','ATLAS COPCO',
          'SULLAIR','GARDNER DENVER','DOOSAN','HYUNDAI','SAMSUNG','JCB',
          'TEREX','GROVE','MANITOWOC','TADANO','LINK-BELT','ALLIS-CHALMERS',
          'FIAT','FIAT ALLIS','FIAT POWERTRAIN','CNH',
          'FORD','TOYOTA','NISSAN','MAZDA','HONDA','SUBARU','SUZUKI'
        ])
      )
  `);

  console.log(`HD products con OEM en competitor_codes: ${rows.rows.length}`);

  let skusFixed = 0;
  let entriesMoved = 0;

  for (const row of rows.rows) {
    const oem = row.oem_codes || [];
    const competitor = row.competitor_codes || [];

    const keepInCompetitor = [];
    const moveToOem = [];

    for (const entry of competitor) {
      if (isRealOem(entry.manufacturer)) {
        moveToOem.push(entry);
      } else {
        keepInCompetitor.push(entry);
      }
    }

    if (moveToOem.length === 0) continue;

    // Merge with existing oem_codes, deduplicating by manufacturer+code
    const existingKeys = new Set(
      oem.map(e => `${(e.manufacturer||'').toUpperCase().trim()}|${(e.code||'').toUpperCase().trim()}`)
    );

    const newOem = [...oem];
    for (const entry of moveToOem) {
      const key = `${(entry.manufacturer||'').toUpperCase().trim()}|${(entry.code||'').toUpperCase().trim()}`;
      if (!existingKeys.has(key)) {
        newOem.push(entry);
        existingKeys.add(key);
      }
    }

    await pool.query(`
      UPDATE elimfilters_catalog
      SET oem_codes = $1::jsonb,
          competitor_codes = $2::jsonb
      WHERE sku = $3
    `, [JSON.stringify(newOem), JSON.stringify(keepInCompetitor), row.sku]);

    skusFixed++;
    entriesMoved += moveToOem.length;
  }

  console.log(`\n=== COMPLETADO ===`);
  console.log(`SKUs actualizados: ${skusFixed}`);
  console.log(`Entradas movidas a oem_codes: ${entriesMoved}`);

  // Verify: no more OEM names in competitor_codes
  const verify = await pool.query(`
    SELECT
      UPPER(TRIM(elem->>'manufacturer')) as mfr,
      COUNT(DISTINCT sku) as skus
    FROM elimfilters_catalog, jsonb_array_elements(competitor_codes) elem
    WHERE duty = 'HEAVY_DUTY' AND competitor_codes IS NOT NULL
      AND UPPER(TRIM(COALESCE(elem->>'manufacturer',''))) = ANY(ARRAY[
        'CATERPILLAR','CAT','CUMMINS','KOMATSU','JOHN DEERE',
        'NEW HOLLAND','CASE','HITACHI','VOLVO','MERCEDES-BENZ',
        'MAN','SCANIA','DAF','IVECO','LIEBHERR','PERKINS',
        'DETROIT DIESEL','MACK','NAVISTAR','FREIGHTLINER',
        'ISUZU','HINO','DOOSAN','HYUNDAI','JCB','FIAT','CNH',
        'FORD','TOYOTA','NISSAN','MAZDA','SUBARU','SUZUKI'
      ])
    GROUP BY 1 ORDER BY skus DESC
  `);

  if (verify.rows.length === 0) {
    console.log('\nVerificacion: LIMPIO — no quedan fabricantes OEM en competitor_codes');
  } else {
    console.log('\nVerificacion — OEM que QUEDAN en competitor_codes (revisar):');
    verify.rows.forEach(r => console.log(`  ${r.mfr}: ${r.skus} SKUs`));
  }

  await pool.end();
}

main().catch(e => { console.error(e.message); pool.end(); });
