// Full database quality audit
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log('=== FULL DATABASE QUALITY AUDIT ===\n');

  // 1. Total counts by duty
  const totals = await pool.query(`
    SELECT duty, COUNT(*) as count FROM elimfilters_catalog GROUP BY duty ORDER BY duty
  `);
  console.log('--- Totales por duty ---');
  totals.rows.forEach(r => console.log(`  ${r.duty}: ${r.count} SKUs`));
  console.log('');

  // 2. Duplicate SKUs
  const dupes = await pool.query(`
    SELECT sku, COUNT(*) as cnt FROM elimfilters_catalog GROUP BY sku HAVING COUNT(*) > 1
  `);
  console.log(`--- SKUs duplicados: ${dupes.rows.length} ---`);
  if (dupes.rows.length > 0) dupes.rows.forEach(r => console.log(`  ${r.sku} (${r.cnt}x)`));
  console.log('');

  // 3. Missing description
  const noDesc = await pool.query(`
    SELECT COUNT(*) as cnt FROM elimfilters_catalog WHERE description IS NULL OR description = '' OR description = 'null'
  `);
  console.log(`--- Sin descripción: ${noDesc.rows[0].cnt} SKUs ---\n`);

  // 4. Descriptions still containing ™
  const tmDesc = await pool.query(`
    SELECT COUNT(*) as cnt FROM elimfilters_catalog WHERE description LIKE '%™%'
  `);
  console.log(`--- Descripciones aún con ™: ${tmDesc.rows[0].cnt} ---\n`);

  // 5. oem_codes with empty manufacturer or empty code
  const emptyOem = await pool.query(`
    SELECT sku, duty
    FROM elimfilters_catalog
    WHERE oem_codes IS NOT NULL AND jsonb_array_length(oem_codes) > 0
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(oem_codes) elem
      WHERE COALESCE(TRIM(elem->>'manufacturer'), '') = ''
         OR COALESCE(TRIM(elem->>'code'), '') = ''
    )
    LIMIT 20
  `);
  console.log(`--- oem_codes con manufacturer o code vacíos: ${emptyOem.rows.length}${emptyOem.rows.length === 20 ? '+' : ''} ---`);
  emptyOem.rows.slice(0, 5).forEach(r => console.log(`  ${r.sku} (${r.duty})`));
  console.log('');

  // 6. competitor_codes with empty manufacturer or empty code
  const emptyComp = await pool.query(`
    SELECT sku, duty
    FROM elimfilters_catalog
    WHERE competitor_codes IS NOT NULL AND jsonb_array_length(competitor_codes) > 0
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(competitor_codes) elem
      WHERE COALESCE(TRIM(elem->>'manufacturer'), '') = ''
         OR COALESCE(TRIM(elem->>'code'), '') = ''
    )
    LIMIT 20
  `);
  console.log(`--- competitor_codes con manufacturer o code vacíos: ${emptyComp.rows.length}${emptyComp.rows.length === 20 ? '+' : ''} ---`);
  emptyComp.rows.slice(0, 5).forEach(r => console.log(`  ${r.sku} (${r.duty})`));
  console.log('');

  // 7. oem_codes with ™ in codes
  const tmOem = await pool.query(`
    SELECT COUNT(DISTINCT sku) as cnt FROM elimfilters_catalog
    WHERE oem_codes::text LIKE '%™%'
  `);
  console.log(`--- oem_codes con ™: ${tmOem.rows[0].cnt} SKUs ---\n`);

  // 8. competitor_codes with ™ in codes
  const tmComp = await pool.query(`
    SELECT COUNT(DISTINCT sku) as cnt FROM elimfilters_catalog
    WHERE competitor_codes::text LIKE '%™%'
  `);
  console.log(`--- competitor_codes con ™: ${tmComp.rows[0].cnt} SKUs ---\n`);

  // 9. HD products with NULL oem_codes or empty array
  const hdNoOem = await pool.query(`
    SELECT COUNT(*) as cnt FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY' AND (oem_codes IS NULL OR jsonb_array_length(oem_codes) = 0)
  `);
  console.log(`--- HD sin oem_codes: ${hdNoOem.rows[0].cnt} ---\n`);

  // 10. LD products with NULL oem_codes or empty array
  const ldNoOem = await pool.query(`
    SELECT COUNT(*) as cnt FROM elimfilters_catalog
    WHERE duty = 'LIGHT_DUTY' AND (oem_codes IS NULL OR jsonb_array_length(oem_codes) = 0)
  `);
  console.log(`--- LD sin oem_codes: ${ldNoOem.rows[0].cnt} ---\n`);

  // 11. Codes with ™ in oem_codes.code field
  const tmOemCode = await pool.query(`
    SELECT sku, duty
    FROM elimfilters_catalog
    WHERE oem_codes IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(oem_codes) elem
      WHERE elem->>'code' LIKE '%™%' OR elem->>'manufacturer' LIKE '%™%'
    )
    LIMIT 10
  `);
  console.log(`--- SKUs con ™ en oem_codes.code/manufacturer: ${tmOemCode.rows.length}${tmOemCode.rows.length === 10 ? '+' : ''} ---`);
  tmOemCode.rows.forEach(r => console.log(`  ${r.sku}`));
  console.log('');

  // 12. vehicle_applications with ™
  const tmVeh = await pool.query(`
    SELECT COUNT(DISTINCT sku) as cnt FROM elimfilters_catalog
    WHERE vehicle_applications::text LIKE '%™%'
  `);
  console.log(`--- vehicle_applications con ™: ${tmVeh.rows[0].cnt} ---\n`);

  // 13. equipment_applications with ™
  const tmEquip = await pool.query(`
    SELECT COUNT(DISTINCT sku) as cnt FROM elimfilters_catalog
    WHERE equipment_applications::text LIKE '%™%'
  `);
  console.log(`--- equipment_applications con ™: ${tmEquip.rows[0].cnt} ---\n`);

  // 14. SKUs with wrong prefix for duty
  const wrongPrefix = await pool.query(`
    SELECT sku, duty, filter_type FROM elimfilters_catalog
    WHERE (duty = 'LIGHT_DUTY' AND (
      sku LIKE 'EL8%' OR sku LIKE 'EA1%' OR sku LIKE 'EH6%' OR sku LIKE 'EF9%'
    ))
    OR (duty = 'HEAVY_DUTY' AND (
      sku LIKE 'EL3%' OR sku LIKE 'EA3%' OR sku LIKE 'EC3%' OR sku LIKE 'EF3%'
    ))
    LIMIT 20
  `);
  console.log(`--- SKUs con prefijo incorrecto para su duty: ${wrongPrefix.rows.length} ---`);
  wrongPrefix.rows.forEach(r => console.log(`  ${r.sku} (${r.duty}, ${r.filter_type})`));
  console.log('');

  // 15. Null or invalid duty values
  const badDuty = await pool.query(`
    SELECT sku, duty FROM elimfilters_catalog
    WHERE duty NOT IN ('HEAVY_DUTY', 'LIGHT_DUTY') OR duty IS NULL
    LIMIT 10
  `);
  console.log(`--- duty inválido o NULL: ${badDuty.rows.length} ---`);
  badDuty.rows.forEach(r => console.log(`  ${r.sku}: "${r.duty}"`));
  console.log('');

  // 16. Descriptions that are JSON but stored as plain string (should still be valid)
  const jsonDescCount = await pool.query(`
    SELECT COUNT(*) as cnt FROM elimfilters_catalog
    WHERE description LIKE '{%' AND description NOT LIKE '%™%'
  `);
  console.log(`--- Descripciones en formato JSON: ${jsonDescCount.rows[0].cnt} ---\n`);

  // 17. oem_codes where same code appears twice
  const dupOem = await pool.query(`
    SELECT sku, COUNT(*) as total_codes,
      (SELECT COUNT(*) FROM (
        SELECT UPPER(elem->>'code') as code
        FROM jsonb_array_elements(oem_codes) elem
        GROUP BY 1 HAVING COUNT(*) > 1
      ) dups) as dup_codes
    FROM elimfilters_catalog
    WHERE oem_codes IS NOT NULL AND jsonb_array_length(oem_codes) > 1
    HAVING (SELECT COUNT(*) FROM (
      SELECT UPPER(elem->>'code') as code
      FROM jsonb_array_elements(oem_codes) elem
      GROUP BY 1 HAVING COUNT(*) > 1
    ) dups) > 0
    LIMIT 10
  `);
  console.log(`--- SKUs con oem_codes duplicados internamente: ${dupOem.rows.length}${dupOem.rows.length === 10 ? '+' : ''} ---`);
  dupOem.rows.forEach(r => console.log(`  ${r.sku}: ${r.dup_codes} códigos duplicados`));
  console.log('');

  // 18. competitor_codes with FRAM but manufacturer field is null/empty (no-manufacturer FRAM)
  const framNoMfr = await pool.query(`
    SELECT COUNT(DISTINCT sku) as cnt FROM elimfilters_catalog
    WHERE competitor_codes IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(competitor_codes) elem
      WHERE COALESCE(elem->>'manufacturer', '') = ''
      AND (
        UPPER(elem->>'code') LIKE 'PH%' OR UPPER(elem->>'code') LIKE 'XG%'
        OR UPPER(elem->>'code') LIKE 'TG%' OR UPPER(elem->>'code') LIKE 'DG%'
      )
    )
  `);
  console.log(`--- competitor_codes con FRAM LD sin manufacturer: ${framNoMfr.rows[0].cnt} ---\n`);

  // 19. Long/suspicious description content (HTML tags, etc.)
  const htmlDesc = await pool.query(`
    SELECT COUNT(*) as cnt FROM elimfilters_catalog
    WHERE description LIKE '%<br%' OR description LIKE '%<p>%' OR description LIKE '%&amp;%'
  `);
  console.log(`--- Descripciones con HTML tags: ${htmlDesc.rows[0].cnt} ---\n`);

  // 20. "About this item" scraper artifacts in descriptions
  const aboutItem = await pool.query(`
    SELECT COUNT(*) as cnt FROM elimfilters_catalog
    WHERE description LIKE '%About this item%' OR description LIKE '%Über dieses Produkt%'
  `);
  console.log(`--- Descripciones con "About this item" (Amazon scraper artifacts): ${aboutItem.rows[0].cnt} ---`);
  // Sample
  const aboutSample = await pool.query(`
    SELECT sku, LEFT(description, 120) as preview FROM elimfilters_catalog
    WHERE description LIKE '%About this item%' LIMIT 3
  `);
  aboutSample.rows.forEach(r => console.log(`  ${r.sku}: ${r.preview}`));
  console.log('');

  console.log('=== FIN DE AUDITORÍA ===');
  await pool.end();
}

main().catch(e => { console.error(e.message); pool.end(); });
