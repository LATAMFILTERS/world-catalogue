const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const { rows } = await pool.query('SELECT sku FROM elimfilters_catalog');
  const inDB = new Set(rows.map(r => r.sku));
  console.log('SKUs in DB:', inDB.size);

  const lines = fs.readFileSync('/opt/render/project/src/scripts/donaldson_import_ready.jsonl', 'utf8').trim().split('\n');
  const missing = [];
  for (const line of lines) {
    const p = JSON.parse(line);
    if (!inDB.has(p.sku)) {
      missing.push({ sku: p.sku, base: p.codigo_base, type: p.filter_type });
    }
  }
  console.log('Missing from DB:', missing.length);
  missing.forEach(p => console.log('  ' + p.sku + ' | ' + p.base + ' | ' + p.type));
  await pool.end();
}
main().catch(e => { console.error(e.message); pool.end(); });
