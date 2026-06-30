// Audit MANN code crossover between HD and LD
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// MANN LD prefixes (passenger car / light duty)
// ML = lube LD, C = air LD, CU/CF = cabin LD, WK = fuel LD
const MANN_LD_PREFIXES = /^(ML|CU|CF|WK)\s*\d/i;
// MANN air LD: codes like "C 1040", "C 2595" — single C followed by space+digits
const MANN_AIR_LD = /^C\s+\d/i;

// MANN HD prefixes (industrial / heavy duty)
// W = lube HD (W940, W1020, W1110), WD = hydraulic HD
const MANN_HD_PREFIXES = /^(WD)\s*\d/i;
const MANN_LUBE_HD = /^W\s*\d/i; // W followed by digit (not WD, WK)

async function main() {
  console.log('=== AUDIT: MANN Code Crossover HD/LD ===\n');

  // 1. MANN LD codes en productos HD (oem_codes)
  console.log('--- 1. MANN LD codes (ML, C, CU, CF, WK) en HD oem_codes ---');
  const hdWithMannLD = await pool.query(`
    SELECT sku, filter_type,
      (SELECT jsonb_agg(elem) FROM jsonb_array_elements(oem_codes) elem
       WHERE elem->>'code' ~* '^(ML|CU|CF|WK)\\s*[0-9]'
          OR elem->>'code' ~* '^C\\s+[0-9]'
      ) as mann_ld_codes
    FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY'
      AND oem_codes IS NOT NULL
      AND (
        EXISTS (SELECT 1 FROM jsonb_array_elements(oem_codes) e
                WHERE e->>'code' ~* '^(ML|CU|CF|WK)\\s*[0-9]'
                   OR e->>'code' ~* '^C\\s+[0-9]')
      )
    ORDER BY sku
  `);
  console.log(`  HD con MANN LD codes: ${hdWithMannLD.rows.length}`);
  hdWithMannLD.rows.forEach(r => {
    const codes = (r.mann_ld_codes || []).map(e => e.code).join(', ');
    console.log(`  ${r.sku} (${r.filter_type}): ${codes}`);
  });
  console.log('');

  // 2. MANN LD codes en productos HD (competitor_codes)
  console.log('--- 2. MANN LD codes en HD competitor_codes ---');
  const hdWithMannLDComp = await pool.query(`
    SELECT sku, filter_type,
      (SELECT jsonb_agg(elem) FROM jsonb_array_elements(competitor_codes) elem
       WHERE elem->>'code' ~* '^(ML|CU|CF|WK)\\s*[0-9]'
          OR elem->>'code' ~* '^C\\s+[0-9]'
      ) as mann_ld_codes
    FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY'
      AND competitor_codes IS NOT NULL
      AND (
        EXISTS (SELECT 1 FROM jsonb_array_elements(competitor_codes) e
                WHERE e->>'code' ~* '^(ML|CU|CF|WK)\\s*[0-9]'
                   OR e->>'code' ~* '^C\\s+[0-9]')
      )
    ORDER BY sku
  `);
  console.log(`  HD con MANN LD codes en competitor_codes: ${hdWithMannLDComp.rows.length}`);
  hdWithMannLDComp.rows.slice(0, 10).forEach(r => {
    const codes = (r.mann_ld_codes || []).map(e => e.code).join(', ');
    console.log(`  ${r.sku} (${r.filter_type}): ${codes}`);
  });
  console.log('');

  // 3. MANN HD codes (W-series lube, WD-series hydraulic) en productos LD
  console.log('--- 3. MANN HD codes (W-lube, WD-hydraulic) en LD oem_codes ---');
  const ldWithMannHD = await pool.query(`
    SELECT sku, filter_type,
      (SELECT jsonb_agg(elem) FROM jsonb_array_elements(oem_codes) elem
       WHERE (elem->>'code' ~* '^W[0-9]' OR elem->>'code' ~* '^W\\s+[0-9]' OR elem->>'code' ~* '^WD')
         AND elem->>'code' !~* '^WK'
      ) as mann_hd_codes
    FROM elimfilters_catalog
    WHERE duty = 'LIGHT_DUTY'
      AND oem_codes IS NOT NULL
      AND (
        EXISTS (SELECT 1 FROM jsonb_array_elements(oem_codes) e
                WHERE (e->>'code' ~* '^W[0-9]' OR e->>'code' ~* '^W\\s+[0-9]' OR e->>'code' ~* '^WD')
                  AND e->>'code' !~* '^WK')
      )
    ORDER BY sku
    LIMIT 20
  `);
  console.log(`  LD con MANN HD codes en oem_codes: ${ldWithMannHD.rows.length}${ldWithMannHD.rows.length===20?'+':''}`);
  ldWithMannHD.rows.forEach(r => {
    const codes = (r.mann_hd_codes || []).map(e => e.code).join(', ');
    console.log(`  ${r.sku} (${r.filter_type}): ${codes}`);
  });
  console.log('');

  // 4. Todos los MANN codes en HD oem_codes (listado completo con manufacturer=MANN o sin mfr)
  console.log('--- 4. Todos los códigos con manufacturer=MANN en HD products ---');
  const hdMannMfr = await pool.query(`
    SELECT sku, filter_type,
      (SELECT jsonb_agg(elem) FROM jsonb_array_elements(oem_codes) elem
       WHERE UPPER(COALESCE(elem->>'manufacturer','')) = 'MANN'
          OR UPPER(COALESCE(elem->>'manufacturer','')) LIKE '%MANN%'
      ) as mann_codes
    FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY'
      AND oem_codes IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(oem_codes) e
        WHERE UPPER(COALESCE(e->>'manufacturer','')) LIKE '%MANN%'
      )
    ORDER BY sku
    LIMIT 10
  `);
  console.log(`  HD con manufacturer=MANN en oem_codes: ${hdMannMfr.rows.length}${hdMannMfr.rows.length===10?'+':''}`);
  hdMannMfr.rows.forEach(r => {
    const codes = (r.mann_codes || []).map(e => `${e.manufacturer}:${e.code}`).join(', ');
    console.log(`  ${r.sku} (${r.filter_type}): ${codes}`);
  });
  console.log('');

  // 5. MANN codes en LD con manufacturer field
  console.log('--- 5. manufacturer=MANN en LD oem_codes (esperado: todos) ---');
  const ldMannMfr = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM jsonb_array_elements(oem_codes) e
        WHERE UPPER(COALESCE(e->>'manufacturer','')) LIKE '%MANN%'
      )) as with_mann_mfr,
      COUNT(*) as total_with_oem
    FROM elimfilters_catalog
    WHERE duty = 'LIGHT_DUTY' AND oem_codes IS NOT NULL AND jsonb_array_length(oem_codes) > 0
  `);
  console.log(`  LD con manufacturer=MANN: ${ldMannMfr.rows[0].with_mann_mfr} / ${ldMannMfr.rows[0].total_with_oem} total con oem`);

  // 6. Muestra de LD oem_codes para ver estructura
  console.log('\n--- 6. Muestra de oem_codes en LD (estructura real) ---');
  const ldOemSample = await pool.query(`
    SELECT sku, filter_type, oem_codes
    FROM elimfilters_catalog
    WHERE duty = 'LIGHT_DUTY'
      AND oem_codes IS NOT NULL
      AND jsonb_array_length(oem_codes) > 0
    LIMIT 5
  `);
  ldOemSample.rows.forEach(r => {
    const codes = (r.oem_codes || []).slice(0, 3);
    console.log(`  ${r.sku} (${r.filter_type}):`);
    codes.forEach(c => console.log(`    ${JSON.stringify(c)}`));
  });

  console.log('\n=== FIN AUDIT MANN ===');
  await pool.end();
}
main().catch(e => { console.error(e.message); pool.end(); });
