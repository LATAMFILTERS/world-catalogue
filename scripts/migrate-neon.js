const { Client } = require("pg");

const RAILWAY = "postgresql://postgres:qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm@ballast.proxy.rlwy.net:18263/railway";
const NEON = "postgresql://neondb_owner:npg_XyYhUb91caZT@ep-fancy-mode-annt6f3k.c-6.us-east-1.aws.neon.tech/neondb";

async function migrate() {
  const src = new Client({
    connectionString: RAILWAY,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
    query_timeout: 120000
  });
  const dst = new Client({
    connectionString: NEON,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
    query_timeout: 120000
  });

  await src.connect();
  await dst.connect();
  console.log("✅ Conectado a Railway y Neon");

  // Crear tabla en Neon
  await dst.query(`
    CREATE TABLE IF NOT EXISTS elimfilters_catalog (
      id SERIAL PRIMARY KEY,
      sku TEXT UNIQUE NOT NULL,
      codigo_base TEXT,
      description TEXT,
      filter_type VARCHAR,
      technology VARCHAR,
      installation_type TEXT,
      thread_size VARCHAR,
      height_mm NUMERIC,
      outer_diameter_mm NUMERIC,
      gasket_od_mm NUMERIC,
      gasket_id_mm NUMERIC,
      iso_test_method VARCHAR,
      micron_rating VARCHAR,
      nominal_efficiency VARCHAR,
      burst_pressure_psi VARCHAR,
      collapse_pressure_psi VARCHAR,
      duty VARCHAR,
      oem_codes JSONB DEFAULT '[]',
      competitor_codes JSONB DEFAULT '[]',
      equipment_applications JSONB DEFAULT '[]',
      alternative_products JSONB DEFAULT '[]',
      name TEXT,
      image_url TEXT,
      donaldson_url TEXT,
      sub_type TEXT,
      vehicle_applications JSONB DEFAULT '[]',
      specs JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log("✅ Tabla creada en Neon");

  // Leer datos de Railway
  const { rows } = await src.query("SELECT * FROM elimfilters_catalog ORDER BY id");
  console.log(`📦 ${rows.length} registros encontrados en Railway`);

  // Insertar en Neon en batches
  let inserted = 0;
  for (const row of rows) {
    try {
      await dst.query(`
        INSERT INTO elimfilters_catalog (
          sku, codigo_base, description, filter_type, technology, installation_type,
          thread_size, height_mm, outer_diameter_mm, gasket_od_mm, gasket_id_mm,
          iso_test_method, micron_rating, nominal_efficiency, burst_pressure_psi,
          collapse_pressure_psi, duty, oem_codes, competitor_codes,
          equipment_applications, alternative_products, name, image_url,
          donaldson_url, sub_type, vehicle_applications, specs, created_at
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28
        ) ON CONFLICT (sku) DO NOTHING
      `, [
        row.sku, row.codigo_base, row.description, row.filter_type, row.technology,
        row.installation_type, row.thread_size, row.height_mm, row.outer_diameter_mm,
        row.gasket_od_mm, row.gasket_id_mm, row.iso_test_method, row.micron_rating,
        row.nominal_efficiency, row.burst_pressure_psi, row.collapse_pressure_psi,
        row.duty, JSON.stringify(row.oem_codes || []), JSON.stringify(row.competitor_codes || []),
        JSON.stringify(row.equipment_applications || []), JSON.stringify(row.alternative_products || []),
        row.name, row.image_url, row.donaldson_url, row.sub_type,
        JSON.stringify(row.vehicle_applications || []), JSON.stringify(row.specs || {}),
        row.created_at
      ]);
      inserted++;
      if (inserted % 500 === 0) console.log(`   ${inserted}/${rows.length}...`);
    } catch (e) {
      console.error(`❌ Error en SKU ${row.sku}: ${e.message}`);
    }
  }

  console.log(`\n✅ MIGRACIÓN COMPLETA: ${inserted}/${rows.length} registros`);
  await src.end();
  await dst.end();
}

migrate().catch(console.error);
