// Final integrity audit: duplicate SKUs, prefix validation, orphan Fleetguard codes
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Valid SKU prefixes per duty
const HD_PREFIXES = ['EA1','EA2','ED4','EH6','EL8','EM9','ES9','EC1','EF9','EW7','ET9'];
const LD_PREFIXES = ['EL3','EA3','EC3','EF3'];

async function main() {
  console.log('=== AUDIT FINAL: Integridad de la base de datos ===\n');

  // ─── 1. DUPLICATE SKUs ───────────────────────────────────────────────────
  console.log('--- 1. SKUs duplicados ---');
  const dupes = await pool.query(`
    SELECT sku, COUNT(*) as cnt
    FROM elimfilters_catalog
    GROUP BY sku
    HAVING COUNT(*) > 1
    ORDER BY cnt DESC
  `);
  if (dupes.rows.length === 0) {
    console.log('  LIMPIO — no hay SKUs duplicados');
  } else {
    console.log(`  PROBLEMA — ${dupes.rows.length} SKUs duplicados:`);
    dupes.rows.forEach(r => console.log(`  ${r.sku}: ${r.cnt} filas`));
  }

  // ─── 2. TOTAL POR DUTY ────────────────────────────────────────────────────
  console.log('\n--- 2. Totales por duty ---');
  const totals = await pool.query(`
    SELECT COALESCE(duty,'NULL') as duty, COUNT(*) as cnt
    FROM elimfilters_catalog GROUP BY duty ORDER BY duty
  `);
  totals.rows.forEach(r => console.log(`  ${r.duty}: ${r.cnt} SKUs`));

  // ─── 3. HD PREFIX VALIDATION ──────────────────────────────────────────────
  console.log('\n--- 3. HD SKUs con prefijo incorrecto ---');
  const hdBadPrefix = await pool.query(`
    SELECT sku, duty, filter_type
    FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY'
      AND SUBSTRING(sku,1,3) NOT IN (${HD_PREFIXES.map((_,i)=>'$'+(i+1)).join(',')})
    ORDER BY sku
  `, HD_PREFIXES);
  if (hdBadPrefix.rows.length === 0) {
    console.log('  LIMPIO — todos los HD tienen prefijo correcto');
  } else {
    console.log(`  PROBLEMA — ${hdBadPrefix.rows.length} HD con prefijo incorrecto:`);
    hdBadPrefix.rows.forEach(r => console.log(`  ${r.sku} (${r.filter_type})`));
  }

  // ─── 4. LD PREFIX VALIDATION ──────────────────────────────────────────────
  console.log('\n--- 4. LD SKUs con prefijo incorrecto ---');
  const ldBadPrefix = await pool.query(`
    SELECT sku, duty, filter_type
    FROM elimfilters_catalog
    WHERE duty = 'LIGHT_DUTY'
      AND SUBSTRING(sku,1,3) NOT IN (${LD_PREFIXES.map((_,i)=>'$'+(i+1)).join(',')})
    ORDER BY sku
  `, LD_PREFIXES);
  if (ldBadPrefix.rows.length === 0) {
    console.log('  LIMPIO — todos los LD tienen prefijo correcto');
  } else {
    console.log(`  PROBLEMA — ${ldBadPrefix.rows.length} LD con prefijo incorrecto:`);
    ldBadPrefix.rows.forEach(r => console.log(`  ${r.sku} (${r.filter_type})`));
  }

  // ─── 5. SKUs CON PREFIJO HD PERO duty=LD y viceversa ─────────────────────
  console.log('\n--- 5. Prefijo HD con duty=LD o prefijo LD con duty=HD ---');
  const mismatch = await pool.query(`
    SELECT sku, duty, filter_type
    FROM elimfilters_catalog
    WHERE (
      duty = 'LIGHT_DUTY' AND SUBSTRING(sku,1,3) = ANY(ARRAY['EA1','EA2','ED4','EH6','EL8','EM9','ES9','EC1','EF9','EW7'])
    ) OR (
      duty = 'HEAVY_DUTY' AND SUBSTRING(sku,1,3) = ANY(ARRAY['EL3','EA3','EC3','EF3'])
    )
    ORDER BY sku
  `);
  if (mismatch.rows.length === 0) {
    console.log('  LIMPIO — no hay cruces de prefijo vs duty');
  } else {
    console.log(`  PROBLEMA — ${mismatch.rows.length} SKUs con prefijo/duty cruzados:`);
    mismatch.rows.forEach(r => console.log(`  ${r.sku} duty=${r.duty} (${r.filter_type})`));
  }

  // ─── 6. SKUs SIN DUTY ────────────────────────────────────────────────────
  console.log('\n--- 6. SKUs sin duty asignado ---');
  const noDuty = await pool.query(`
    SELECT sku, filter_type FROM elimfilters_catalog
    WHERE duty IS NULL OR duty NOT IN ('HEAVY_DUTY','LIGHT_DUTY')
    ORDER BY sku
  `);
  if (noDuty.rows.length === 0) {
    console.log('  LIMPIO — todos los SKUs tienen duty válido');
  } else {
    console.log(`  PROBLEMA — ${noDuty.rows.length} SKUs sin duty:`);
    noDuty.rows.forEach(r => console.log(`  ${r.sku} duty=NULL (${r.filter_type})`));
  }

  // ─── 7. FLEETGUARD CODES VAGOS / SIN CODIGO BASE ─────────────────────────
  console.log('\n--- 7. Fleetguard codes vagos o sin código base en competitor_codes ---');

  // Codes without a proper code value
  const fgEmpty = await pool.query(`
    SELECT sku, duty, filter_type,
      elem->>'code' as fg_code,
      elem->>'manufacturer' as fg_mfr
    FROM elimfilters_catalog, jsonb_array_elements(competitor_codes) elem
    WHERE competitor_codes IS NOT NULL
      AND UPPER(TRIM(COALESCE(elem->>'manufacturer',''))) IN ('FLEETGUARD','NELSON FLEETGUARD','NELSON')
      AND (
        COALESCE(TRIM(elem->>'code'),'') = ''
        OR elem->>'code' IS NULL
        OR LENGTH(TRIM(elem->>'code')) < 3
      )
    ORDER BY sku
  `);
  console.log(`\n  7a. Fleetguard entries con code vacío o muy corto: ${fgEmpty.rows.length}`);
  fgEmpty.rows.slice(0,20).forEach(r =>
    console.log(`  ${r.sku} [${r.duty}] (${r.filter_type}): code="${r.fg_code}" mfr="${r.fg_mfr}"`)
  );

  // Codes that don't match Fleetguard naming patterns (AF/LF/FF/HF/WF/RS + digits)
  const fgWrong = await pool.query(`
    SELECT sku, duty, filter_type,
      elem->>'code' as fg_code
    FROM elimfilters_catalog, jsonb_array_elements(competitor_codes) elem
    WHERE competitor_codes IS NOT NULL
      AND UPPER(TRIM(COALESCE(elem->>'manufacturer',''))) IN ('FLEETGUARD','NELSON FLEETGUARD','NELSON')
      AND COALESCE(TRIM(elem->>'code'),'') != ''
      AND LENGTH(TRIM(elem->>'code')) >= 3
      AND elem->>'code' !~* '^(AF|LF|FF|HF|WF|RS|FS|BF|ST|CC|CV|SA|DCA|ES|SY|FP|FE|SG|AH|PF)[0-9]'
    ORDER BY sku
    LIMIT 60
  `);
  console.log(`\n  7b. Fleetguard entries con código fuera de patrón (AF/LF/FF/HF/WF...): ${fgWrong.rows.length}${fgWrong.rows.length===60?'+':''}`);
  fgWrong.rows.forEach(r =>
    console.log(`  ${r.sku} [${r.duty}] (${r.filter_type}): "${r.fg_code}"`)
  );

  // All Fleetguard codes for LD (suspicious — Fleetguard is HD brand)
  const fgLD = await pool.query(`
    SELECT sku, filter_type,
      elem->>'code' as fg_code,
      elem->>'manufacturer' as fg_mfr
    FROM elimfilters_catalog, jsonb_array_elements(competitor_codes) elem
    WHERE duty = 'LIGHT_DUTY'
      AND competitor_codes IS NOT NULL
      AND UPPER(TRIM(COALESCE(elem->>'manufacturer',''))) IN ('FLEETGUARD','NELSON FLEETGUARD','NELSON')
    ORDER BY sku
  `);
  console.log(`\n  7c. Fleetguard entries en productos LD: ${fgLD.rows.length}`);
  fgLD.rows.forEach(r =>
    console.log(`  ${r.sku} (${r.filter_type}): code="${r.fg_code}" mfr="${r.fg_mfr}"`)
  );

  // Distribution of Fleetguard code prefixes
  console.log('\n  7d. Distribución de prefijos Fleetguard en HD competitor_codes:');
  const fgPrefixes = await pool.query(`
    SELECT
      UPPER(SUBSTRING(TRIM(elem->>'code'),1,2)) as prefix,
      COUNT(*) as entries,
      COUNT(DISTINCT sku) as skus
    FROM elimfilters_catalog, jsonb_array_elements(competitor_codes) elem
    WHERE duty = 'HEAVY_DUTY'
      AND competitor_codes IS NOT NULL
      AND UPPER(TRIM(COALESCE(elem->>'manufacturer',''))) IN ('FLEETGUARD','NELSON FLEETGUARD','NELSON')
      AND COALESCE(TRIM(elem->>'code'),'') != ''
    GROUP BY 1 ORDER BY skus DESC
  `);
  fgPrefixes.rows.forEach(r => console.log(`  ${r.prefix}: ${r.entries} entries en ${r.skus} SKUs`));

  console.log('\n=== FIN AUDIT FINAL ===');
  await pool.end();
}
main().catch(e => { console.error(e.message); pool.end(); });
