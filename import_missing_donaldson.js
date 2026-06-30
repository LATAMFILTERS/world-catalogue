const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const { rows } = await pool.query('SELECT sku FROM elimfilters_catalog');
  const inDB = new Set(rows.map(r => r.sku));
  console.log('SKUs currently in DB:', inDB.size);

  const lines = fs.readFileSync('/opt/render/project/src/scripts/donaldson_import_ready.jsonl', 'utf8').trim().split('\n');
  const toInsert = lines.map(l => JSON.parse(l)).filter(p => !inDB.has(p.sku));
  console.log('Products to insert:', toInsert.length);

  const SQL = `INSERT INTO elimfilters_catalog (
    sku, codigo_base, description, filter_type, sub_type, technology,
    installation_type, thread_size, outer_diameter_mm, height_mm,
    gasket_od_mm, gasket_id_mm, micron_rating, nominal_efficiency,
    burst_pressure_psi, collapse_pressure_psi, duty, oem_codes, competitor_codes
  ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18::jsonb,$19::jsonb)
  ON CONFLICT (sku) DO NOTHING`;

  let inserted = 0;
  let errors = 0;

  for (const p of toInsert) {
    try {
      await pool.query(SQL, [
        p.sku,
        p.codigo_base,
        p.description || '',
        p.filter_type || null,
        p.sub_type || null,
        p.technology || null,
        p.installation_type || null,
        p.thread_size || null,
        p.outer_diameter_mm || null,
        p.height_mm || null,
        p.gasket_od_mm || null,
        p.gasket_id_mm || null,
        p.micron_rating || null,
        p.nominal_efficiency || null,
        p.burst_pressure_psi || null,
        p.collapse_pressure_psi || null,
        p.duty || 'HEAVY_DUTY',
        JSON.stringify(p.oem_codes || []),
        JSON.stringify(p.competitor_codes || []),
      ]);
      inserted++;
      if (inserted % 20 === 0) process.stdout.write('.');
    } catch (e) {
      console.error('\nError on', p.sku, ':', e.message);
      errors++;
    }
  }

  console.log('\nDone. Inserted:', inserted, '| Errors:', errors);
  await pool.end();
}
main().catch(e => { console.error(e.message); pool.end(); });
