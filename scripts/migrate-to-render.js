const { Client } = require('pg');

async function migrate() {
  const destUrl = process.env.DATABASE_URL;
  if (!destUrl) {
    console.log('[migrate] DATABASE_URL is not set. Skipping migration.');
    return;
  }
  
  // Do not migrate if connecting to Railway!
  if (destUrl.includes('rlwy.net')) {
    console.log('[migrate] DATABASE_URL points to Railway. Skipping migration.');
    return;
  }

  console.log('[migrate] Connecting to destination (Render)...');
  const destClient = new Client({
    connectionString: destUrl,
    ssl: { rejectUnauthorized: false }
  });
  await destClient.connect();

  console.log('[migrate] Creating tables on destination...');
  await destClient.query(`
    CREATE TABLE IF NOT EXISTS maintenance_kits (
      kit_sku    VARCHAR(7) PRIMARY KEY,
      name       TEXT NOT NULL,
      equipment_ref TEXT,
      duty       VARCHAR(2) CHECK (duty IN ('HD','LD')),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await destClient.query(`
    CREATE TABLE IF NOT EXISTS elimfilters_catalog (
      id SERIAL PRIMARY KEY,
      sku VARCHAR(100) UNIQUE NOT NULL,
      codigo_base VARCHAR(100),
      description JSONB,
      filter_type VARCHAR(100),
      sub_type VARCHAR(100),
      technology VARCHAR(100),
      installation_type VARCHAR(100),
      thread_size VARCHAR(100),
      outer_diameter_mm NUMERIC,
      height_mm NUMERIC,
      gasket_od_mm NUMERIC,
      gasket_id_mm NUMERIC,
      iso_test_method VARCHAR(100),
      micron_rating NUMERIC,
      nominal_efficiency VARCHAR(100),
      burst_pressure_psi NUMERIC,
      collapse_pressure_psi NUMERIC,
      duty VARCHAR(50),
      oem_codes JSONB,
      competitor_codes JSONB,
      equipment_applications JSONB,
      brand_crossrefs JSONB,
      alternatives JSONB
    )
  `);

  await destClient.query(`
    CREATE TABLE IF NOT EXISTS kit_components (
      kit_sku    VARCHAR(7) REFERENCES maintenance_kits(kit_sku) ON DELETE CASCADE,
      filter_sku VARCHAR(100) REFERENCES elimfilters_catalog(sku),
      PRIMARY KEY (kit_sku, filter_sku)
    )
  `);
  
  await destClient.query(`
    CREATE INDEX IF NOT EXISTS idx_kit_components_filter
    ON kit_components(filter_sku)
  `);

  const destCount = await destClient.query('SELECT count(*) FROM elimfilters_catalog');
  if (parseInt(destCount.rows[0].count) > 0) {
    console.log('[migrate] Destination database is already populated. Skipping migration.');
    await destClient.end();
    return;
  }

  const srcUrl = process.env.RAILWAY_DB_URL;
  if (!srcUrl) {
    console.log('[migrate] RAILWAY_DB_URL not set. Cannot migrate from source. Skipping.');
    await destClient.end();
    return;
  }
  console.log('[migrate] Connecting to source (Railway)...');
  const srcClient = new Client({ connectionString: srcUrl, ssl: { rejectUnauthorized: false } });
  await srcClient.connect();

  async function copyTable(tableName) {
    console.log(`[migrate] Reading from ${tableName}...`);
    const data = await srcClient.query(`SELECT * FROM ${tableName}`);
    console.log(`[migrate] Found ${data.rows.length} rows in ${tableName}.`);
    
    if (data.rows.length === 0) return;

    const cols = Object.keys(data.rows[0]);
    for (const row of data.rows) {
      const values = cols.map(c => row[c]);
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(',');
      
      try {
        await destClient.query(
          `INSERT INTO ${tableName} (${cols.join(',')}) VALUES (${placeholders})`,
          values
        );
      } catch (err) {
        if (!err.message.includes('duplicate key')) {
          console.error(`[migrate] Error inserting into ${tableName}:`, err.message);
        }
      }
    }
    console.log(`[migrate] Copied ${tableName} successfully.`);
  }

  // Need to copy in correct dependency order
  await copyTable('elimfilters_catalog');
  await copyTable('maintenance_kits');
  await copyTable('kit_components');

  console.log('[migrate] Migration complete!');
  await srcClient.end();
  await destClient.end();
}

migrate().catch(err => {
  console.error('[migrate] MIGRATION FAILED:', err);
  process.exit(1);
});
