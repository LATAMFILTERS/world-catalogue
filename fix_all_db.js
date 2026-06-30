// Comprehensive database cleanup — all remaining issues
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log('=== COMPREHENSIVE DATABASE CLEANUP ===\n');

  // ── 1. Fix duty = 'heavy' → 'HEAVY_DUTY' ──────────────────────────────────
  console.log('--- 1. Fix duty lowercase variants ---');
  const dutyFix = await pool.query(`
    UPDATE elimfilters_catalog
    SET duty = CASE
      WHEN LOWER(duty) = 'heavy_duty' OR LOWER(duty) = 'heavy' THEN 'HEAVY_DUTY'
      WHEN LOWER(duty) = 'light_duty' OR LOWER(duty) = 'light' THEN 'LIGHT_DUTY'
      ELSE duty
    END
    WHERE duty NOT IN ('HEAVY_DUTY', 'LIGHT_DUTY')
      AND duty IS NOT NULL
      AND LOWER(duty) IN ('heavy_duty','heavy','light_duty','light')
    RETURNING sku, duty
  `);
  console.log(`  Corregidos: ${dutyFix.rows.length} SKUs`);
  dutyFix.rows.slice(0, 5).forEach(r => console.log(`  ${r.sku} → ${r.duty}`));
  console.log('');

  // ── 2. Investigate NULL duty SKUs ─────────────────────────────────────────
  console.log('--- 2. SKUs con duty NULL o string "null" ---');
  const nullDuty = await pool.query(`
    SELECT sku, duty, filter_type, LEFT(description, 60) as desc_preview
    FROM elimfilters_catalog
    WHERE duty IS NULL OR duty = 'null' OR duty NOT IN ('HEAVY_DUTY','LIGHT_DUTY')
    ORDER BY sku
  `);
  console.log(`  Total: ${nullDuty.rows.length}`);
  nullDuty.rows.forEach(r =>
    console.log(`  ${r.sku} | duty="${r.duty}" | type=${r.filter_type} | ${r.desc_preview||''}`)
  );
  console.log('');

  // Fix string 'null' → actual NULL
  const nullStrFix = await pool.query(`
    UPDATE elimfilters_catalog SET duty = NULL
    WHERE duty = 'null'
    RETURNING sku
  `);
  console.log(`  Convertidos string "null" → NULL: ${nullStrFix.rows.length}`);
  console.log('');

  // ── 3. Fix ™ in equipment_applications ────────────────────────────────────
  console.log('--- 3. Fix ™ in equipment_applications ---');
  const equipRows = await pool.query(`
    SELECT sku, equipment_applications FROM elimfilters_catalog
    WHERE equipment_applications::text LIKE '%™%'
  `);
  console.log(`  Encontrados: ${equipRows.rows.length}`);
  let equipFixed = 0;
  for (const row of equipRows.rows) {
    const apps = Array.isArray(row.equipment_applications) ? row.equipment_applications : [];
    const cleaned = apps.map(e => {
      const obj = {};
      for (const [k, v] of Object.entries(e)) {
        obj[k] = typeof v === 'string' ? v.replace(/™/g, '') : v;
      }
      return obj;
    });
    await pool.query(
      'UPDATE elimfilters_catalog SET equipment_applications = $1::jsonb WHERE sku = $2',
      [JSON.stringify(cleaned), row.sku]
    );
    equipFixed++;
  }
  console.log(`  Corregidos: ${equipFixed}`);
  console.log('');

  // ── 4. Fix URL-encoded codes in oem_codes and competitor_codes ────────────
  console.log('--- 4. Fix URL-encoded codes (%2F, %20, etc.) ---');
  const urlOem = await pool.query(`
    SELECT sku, oem_codes FROM elimfilters_catalog
    WHERE oem_codes::text LIKE '%25%' OR oem_codes::text LIKE '%2F%'
    AND oem_codes IS NOT NULL
  `);
  let urlFixed = 0;
  for (const row of urlOem.rows) {
    const orig = Array.isArray(row.oem_codes) ? row.oem_codes : [];
    const cleaned = orig.map(e => ({
      ...e,
      code: (e.code || '').replace(/%2F/gi, '/').replace(/%20/gi, ' ').replace(/%2C/gi, ','),
      manufacturer: (e.manufacturer || '').replace(/%2F/gi, '/').replace(/%20/gi, ' '),
    }));
    if (JSON.stringify(cleaned) !== JSON.stringify(orig)) {
      await pool.query('UPDATE elimfilters_catalog SET oem_codes = $1::jsonb WHERE sku = $2',
        [JSON.stringify(cleaned), row.sku]);
      console.log(`  ${row.sku}: oem_codes URL-decoded`);
      urlFixed++;
    }
  }
  const urlComp = await pool.query(`
    SELECT sku, competitor_codes FROM elimfilters_catalog
    WHERE competitor_codes::text LIKE '%25%' OR competitor_codes::text LIKE '%2F%'
    AND competitor_codes IS NOT NULL
  `);
  for (const row of urlComp.rows) {
    const orig = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
    const cleaned = orig.map(e => ({
      ...e,
      code: (e.code || '').replace(/%2F/gi, '/').replace(/%20/gi, ' ').replace(/%2C/gi, ','),
      manufacturer: (e.manufacturer || '').replace(/%2F/gi, '/').replace(/%20/gi, ' '),
    }));
    if (JSON.stringify(cleaned) !== JSON.stringify(orig)) {
      await pool.query('UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE sku = $2',
        [JSON.stringify(cleaned), row.sku]);
      console.log(`  ${row.sku}: competitor_codes URL-decoded`);
      urlFixed++;
    }
  }
  console.log(`  Total URL-decoded: ${urlFixed}`);
  console.log('');

  // ── 5. Remove oem_codes entries with BOTH empty manufacturer AND empty code ─
  console.log('--- 5. Remove blank entries in oem_codes/competitor_codes ---');
  const blankOem = await pool.query(`
    SELECT sku, oem_codes FROM elimfilters_catalog
    WHERE oem_codes IS NOT NULL AND jsonb_array_length(oem_codes) > 0
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(oem_codes) elem
      WHERE COALESCE(TRIM(elem->>'manufacturer'), '') = ''
        AND COALESCE(TRIM(elem->>'code'), '') = ''
    )
  `);
  let blankFixed = 0;
  for (const row of blankOem.rows) {
    const orig = Array.isArray(row.oem_codes) ? row.oem_codes : [];
    const cleaned = orig.filter(e =>
      !((!e.manufacturer || e.manufacturer.trim() === '') && (!e.code || e.code.trim() === ''))
    );
    if (cleaned.length < orig.length) {
      await pool.query('UPDATE elimfilters_catalog SET oem_codes = $1::jsonb WHERE sku = $2',
        [JSON.stringify(cleaned), row.sku]);
      blankFixed++;
    }
  }
  const blankComp = await pool.query(`
    SELECT sku, competitor_codes FROM elimfilters_catalog
    WHERE competitor_codes IS NOT NULL AND jsonb_array_length(competitor_codes) > 0
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(competitor_codes) elem
      WHERE COALESCE(TRIM(elem->>'manufacturer'), '') = ''
        AND COALESCE(TRIM(elem->>'code'), '') = ''
    )
  `);
  for (const row of blankComp.rows) {
    const orig = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
    const cleaned = orig.filter(e =>
      !((!e.manufacturer || e.manufacturer.trim() === '') && (!e.code || e.code.trim() === ''))
    );
    if (cleaned.length < orig.length) {
      await pool.query('UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE sku = $2',
        [JSON.stringify(cleaned), row.sku]);
      blankFixed++;
    }
  }
  console.log(`  Entries blank removidas en: ${blankFixed} SKUs`);
  console.log('');

  // ── 6. Clean "About this item" / Amazon scraper prefix from LD descriptions ─
  console.log('--- 6. Clean Amazon scraper artifacts from descriptions ---');
  const aboutRows = await pool.query(`
    SELECT sku, description FROM elimfilters_catalog
    WHERE description LIKE 'About this item%'
       OR description LIKE 'Über dieses Produkt%'
       OR description LIKE 'About this item %'
  `);
  console.log(`  Encontrados: ${aboutRows.rows.length}`);
  let aboutFixed = 0;
  for (const row of aboutRows.rows) {
    let cleaned = row.description;
    cleaned = cleaned.replace(/^About this item\s*/i, '').trim();
    cleaned = cleaned.replace(/^Über dieses Produkt\s*/i, '').trim();
    if (cleaned !== row.description) {
      await pool.query('UPDATE elimfilters_catalog SET description = $1 WHERE sku = $2',
        [cleaned, row.sku]);
      aboutFixed++;
    }
  }
  console.log(`  Limpiados: ${aboutFixed}`);
  console.log('');

  // ── 7. Check for duplicate internal codes in oem_codes ────────────────────
  console.log('--- 7. Detect duplicate codes within oem_codes ---');
  const dupCheck = await pool.query(`
    SELECT sku FROM (
      SELECT sku,
        (SELECT COUNT(*) FROM (
          SELECT UPPER(TRIM(elem->>'code')) as code, COUNT(*)
          FROM jsonb_array_elements(oem_codes) elem
          WHERE TRIM(elem->>'code') <> ''
          GROUP BY 1 HAVING COUNT(*) > 1
        ) dups) as dup_count
      FROM elimfilters_catalog
      WHERE oem_codes IS NOT NULL AND jsonb_array_length(oem_codes) > 1
    ) sub
    WHERE dup_count > 0
    LIMIT 20
  `);
  console.log(`  SKUs con oem_codes duplicados internamente: ${dupCheck.rows.length}${dupCheck.rows.length === 20 ? '+' : ''}`);
  if (dupCheck.rows.length > 0) {
    console.log('  ' + dupCheck.rows.map(r => r.sku).join(', '));
  }
  console.log('');

  // ── 8. Final summary ──────────────────────────────────────────────────────
  console.log('--- RESUMEN FINAL ---');
  const finalDuty = await pool.query(`
    SELECT COALESCE(duty, 'NULL') as duty, COUNT(*) as count
    FROM elimfilters_catalog GROUP BY 1 ORDER BY 1
  `);
  finalDuty.rows.forEach(r => console.log(`  duty=${r.duty}: ${r.count} SKUs`));

  const finalTm = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM elimfilters_catalog WHERE description LIKE '%™%') as desc_tm,
      (SELECT COUNT(*) FROM elimfilters_catalog WHERE equipment_applications::text LIKE '%™%') as equip_tm,
      (SELECT COUNT(*) FROM elimfilters_catalog WHERE oem_codes::text LIKE '%™%') as oem_tm,
      (SELECT COUNT(*) FROM elimfilters_catalog WHERE competitor_codes::text LIKE '%™%') as comp_tm
  `);
  const t = finalTm.rows[0];
  console.log(`  ™ restantes — desc:${t.desc_tm} equip:${t.equip_tm} oem:${t.oem_tm} comp:${t.comp_tm}`);

  console.log('\n=== LIMPIEZA COMPLETADA ===');
  await pool.end();
}

main().catch(e => { console.error(e.message); pool.end(); });
