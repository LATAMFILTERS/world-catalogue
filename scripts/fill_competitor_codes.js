/**
 * fill_competitor_codes.js
 * Popula competitor_codes desde brand_crossrefs de los JSON Donaldson.
 * Usa pg (ya instalado en Render) y DATABASE_URL env var.
 *
 * Uso en Render shell:
 *   node scripts/fill_competitor_codes.js [--dry-run]
 */

const { Pool } = require('pg');
const fs   = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const BATCH   = 100;
// JSON files live in the same directory as this script
const DIR     = process.cwd();

const DB_URL = process.env.DATABASE_URL;

const pool = DRY_RUN ? null : (DB_URL
  ? new Pool({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } })
  : new Pool({
      connectionString: process.env.LEGACY_DB_URL,
      ssl:      { rejectUnauthorized: false },
    })
);

function loadAllJson() {
  const rows = {};
  const files = fs.readdirSync(DIR)
    .filter(f => /^donaldson_.*_results\.json$/.test(f))
    .map(f => path.join(DIR, f))
    .sort();

  for (const fpath of files) {
    const cat = path.basename(fpath).replace('donaldson_', '').replace('_results.json', '');
    let data;
    try { data = JSON.parse(fs.readFileSync(fpath, 'utf8')); }
    catch (e) { console.warn(`[${cat}] No se pudo leer: ${e.message}`); continue; }

    let withBr = 0;
    for (const p of data) {
      const br  = p.brand_crossrefs || {};
      const sku = p.sku_elimfilters;
      if (!sku || !Object.keys(br).length) continue;

      const codes = [];
      for (const [brand, parts] of Object.entries(br)) {
        for (const pn of (parts || [])) {
          if (brand && pn) codes.push({ manufacturer: brand.toUpperCase(), code: String(pn).toUpperCase() });
        }
      }
      if (codes.length) { rows[sku] = codes; withBr++; }
    }
    console.log(`[${cat.padEnd(22)}] ${data.length} productos | ${withBr} con brand_crossrefs`);
  }
  return rows;
}

async function main() {
  const rowsMap = loadAllJson();
  const rows    = Object.entries(rowsMap); // [[sku, codes], ...]
  console.log(`\nTotal a actualizar: ${rows.length}`);

  if (DRY_RUN) {
    console.log('DRY RUN — sin escritura');
    if (rows.length) console.log('Ejemplo:', rows[0][0], '→', rows[0][1].slice(0, 3));
    return;
  }

  const client = await pool.connect();
  let totalUpdated = 0;

  try {
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      let batchUpdated = 0;

      await client.query('BEGIN');
      for (const [sku, codes] of batch) {
        const res = await client.query(`
          UPDATE elimfilters_catalog
          SET    competitor_codes = $1::jsonb
          WHERE  sku = $2
            AND  (competitor_codes IS NULL
                  OR jsonb_array_length(COALESCE(competitor_codes,'[]'::jsonb)) = 0)
        `, [JSON.stringify(codes), sku]);
        batchUpdated += res.rowCount;
      }
      await client.query('COMMIT');

      totalUpdated += batchUpdated;
      const pct = Math.round((i + batch.length) / rows.length * 100);
      console.log(`  Lote ${Math.floor(i/BATCH)+1}: ${batchUpdated} actualizados | ${pct}%`);
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('ERROR — ROLLBACK:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }

  console.log(`\nDONE: ${totalUpdated} productos actualizados`);
}

main().catch(err => { console.error(err); process.exit(1); });
