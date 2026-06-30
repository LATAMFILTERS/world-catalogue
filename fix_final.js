// Final cleanup: NULL duty assignment + deduplicate internal oem_codes
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log('=== FINAL CLEANUP ===\n');

  // ── 1. Assign duty based on SKU prefix for NULL-duty products ─────────────
  console.log('--- 1. Assign duty from SKU prefix (NULL duty SKUs) ---');

  // First show them
  const nullDuty = await pool.query(`
    SELECT sku, filter_type FROM elimfilters_catalog
    WHERE duty IS NULL ORDER BY sku
  `);
  console.log(`  Total NULL duty: ${nullDuty.rows.length}`);

  // Assign by SKU prefix convention:
  // EL8xxx → lube HD, EL3xxx → lube LD
  // EA1xxx → air HD, EA3xxx → air LD
  // EH6xxx → hydraulic HD
  // EF9xxx → fuel HD, EF3xxx → fuel LD
  // EC1xxx → cabin HD, EC3xxx → cabin LD
  // EW7xxx → coolant HD
  // ED4xxx → air dryer HD
  // EM9xxx → marine HD
  // ES9xxx → fuel/water sep HD
  const assigned = await pool.query(`
    UPDATE elimfilters_catalog
    SET duty = CASE
      WHEN sku ~ '^(EL8|EA1|EH6|EF9|EC1|EW7|ED4|EM9|ES9)' THEN 'HEAVY_DUTY'
      WHEN sku ~ '^(EL3|EA3|EC3|EF3)'                       THEN 'LIGHT_DUTY'
      ELSE NULL
    END
    WHERE duty IS NULL
      AND sku ~ '^(EL8|EA1|EH6|EF9|EC1|EW7|ED4|EM9|ES9|EL3|EA3|EC3|EF3)'
    RETURNING sku, duty
  `);
  console.log(`  Asignados: ${assigned.rows.length}`);

  const byDuty = {};
  assigned.rows.forEach(r => { byDuty[r.duty] = (byDuty[r.duty] || 0) + 1; });
  Object.entries(byDuty).forEach(([d, c]) => console.log(`    ${d}: ${c}`));

  // Check remaining NULL
  const stillNull = await pool.query(`SELECT COUNT(*) as cnt FROM elimfilters_catalog WHERE duty IS NULL`);
  console.log(`  Restantes con duty NULL: ${stillNull.rows[0].cnt}`);
  if (parseInt(stillNull.rows[0].cnt) > 0) {
    const rem = await pool.query(`SELECT sku, filter_type FROM elimfilters_catalog WHERE duty IS NULL LIMIT 10`);
    rem.rows.forEach(r => console.log(`    ${r.sku} (${r.filter_type}) — no prefix match`));
  }
  console.log('');

  // ── 2. Deduplicate internal oem_codes ─────────────────────────────────────
  console.log('--- 2. Deduplicate internal oem_codes ---');

  // Find all SKUs with duplicate codes
  const dupSkus = await pool.query(`
    SELECT sku, oem_codes FROM elimfilters_catalog
    WHERE oem_codes IS NOT NULL AND jsonb_array_length(oem_codes) > 1
    AND (
      SELECT COUNT(*) FROM (
        SELECT UPPER(TRIM(elem->>'code')) as code
        FROM jsonb_array_elements(oem_codes) elem
        WHERE TRIM(COALESCE(elem->>'code','')) <> ''
        GROUP BY 1 HAVING COUNT(*) > 1
      ) dups
    ) > 0
  `);
  console.log(`  SKUs con duplicados: ${dupSkus.rows.length}`);

  let deduped = 0;
  for (const row of dupSkus.rows) {
    const orig = Array.isArray(row.oem_codes) ? row.oem_codes : [];
    const seen = new Set();
    const cleaned = orig.filter(e => {
      const key = `${(e.manufacturer||'').toUpperCase().trim()}|${(e.code||'').toUpperCase().trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (cleaned.length < orig.length) {
      await pool.query('UPDATE elimfilters_catalog SET oem_codes = $1::jsonb WHERE sku = $2',
        [JSON.stringify(cleaned), row.sku]);
      console.log(`  ${row.sku}: ${orig.length} → ${cleaned.length} entries`);
      deduped++;
    }
  }
  console.log(`  Total deduplicados: ${deduped}`);
  console.log('');

  // ── 3. Deduplicate internal competitor_codes ───────────────────────────────
  console.log('--- 3. Deduplicate internal competitor_codes ---');
  const dupComp = await pool.query(`
    SELECT sku, competitor_codes FROM elimfilters_catalog
    WHERE competitor_codes IS NOT NULL AND jsonb_array_length(competitor_codes) > 1
    AND (
      SELECT COUNT(*) FROM (
        SELECT UPPER(TRIM(elem->>'code')) as code
        FROM jsonb_array_elements(competitor_codes) elem
        WHERE TRIM(COALESCE(elem->>'code','')) <> ''
        GROUP BY 1 HAVING COUNT(*) > 1
      ) dups
    ) > 0
  `);
  console.log(`  SKUs con duplicados: ${dupComp.rows.length}`);
  let dedupedComp = 0;
  for (const row of dupComp.rows) {
    const orig = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
    const seen = new Set();
    const cleaned = orig.filter(e => {
      const key = `${(e.manufacturer||'').toUpperCase().trim()}|${(e.code||'').toUpperCase().trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (cleaned.length < orig.length) {
      await pool.query('UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE sku = $2',
        [JSON.stringify(cleaned), row.sku]);
      dedupedComp++;
    }
  }
  console.log(`  Total deduplicados: ${dedupedComp}`);
  console.log('');

  // ── 4. FINAL STATE ────────────────────────────────────────────────────────
  console.log('--- ESTADO FINAL DE LA BASE DE DATOS ---');
  const final = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM elimfilters_catalog WHERE duty = 'HEAVY_DUTY') as hd,
      (SELECT COUNT(*) FROM elimfilters_catalog WHERE duty = 'LIGHT_DUTY') as ld,
      (SELECT COUNT(*) FROM elimfilters_catalog WHERE duty IS NULL) as null_duty,
      (SELECT COUNT(*) FROM elimfilters_catalog WHERE duty NOT IN ('HEAVY_DUTY','LIGHT_DUTY') AND duty IS NOT NULL) as bad_duty,
      (SELECT COUNT(*) FROM elimfilters_catalog WHERE description LIKE '%™%') as tm_desc,
      (SELECT COUNT(*) FROM elimfilters_catalog WHERE equipment_applications::text LIKE '%™%') as tm_equip,
      (SELECT COUNT(*) FROM elimfilters_catalog WHERE oem_codes::text LIKE '%™%') as tm_oem,
      (SELECT COUNT(*) FROM elimfilters_catalog) as total
  `);
  const s = final.rows[0];
  console.log(`  Total SKUs:        ${s.total}`);
  console.log(`  HEAVY_DUTY:        ${s.hd}`);
  console.log(`  LIGHT_DUTY:        ${s.ld}`);
  console.log(`  duty NULL:         ${s.null_duty}`);
  console.log(`  duty inválido:     ${s.bad_duty}`);
  console.log(`  ™ en desc:         ${s.tm_desc}`);
  console.log(`  ™ en equip_apps:   ${s.tm_equip}`);
  console.log(`  ™ en oem_codes:    ${s.tm_oem}`);

  console.log('\n=== LIMPIEZA FINAL COMPLETADA ===');
  await pool.end();
}

main().catch(e => { console.error(e.message); pool.end(); });
