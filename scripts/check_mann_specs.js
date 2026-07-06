/**
 * check_mann_specs.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Verification script to inspect Light Duty products after specs patch.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/);
    if (match && match[1]) {
      connectionString = match[1].trim();
      if (connectionString.includes('-a.oregon-postgres.render.com')) {
        connectionString = connectionString.replace('-a.oregon-postgres.render.com', '.oregon-postgres.render.com');
      }
    }
  }
}

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL not set.');
  process.exit(1);
}

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('🔌 Connected to Postgres for verification...');

  const stats = await client.query(`
    SELECT 
      COUNT(*) AS total_ld,
      COUNT(*) FILTER (WHERE height_mm IS NOT NULL) AS con_height,
      COUNT(*) FILTER (WHERE outer_diameter_mm IS NOT NULL) AS con_diameter,
      COUNT(*) FILTER (WHERE thread_size IS NOT NULL) AS con_rosca,
      COUNT(*) FILTER (WHERE gasket_od_mm IS NOT NULL) AS con_empaque_od,
      COUNT(*) FILTER (WHERE installation_type IS NOT NULL) AS con_tipo_instalacion
    FROM elimfilters_catalog
    WHERE duty = 'LIGHT_DUTY';
  `);

  const sample = await client.query(`
    SELECT sku, filter_type, installation_type, outer_diameter_mm, height_mm, thread_size, gasket_od_mm
    FROM elimfilters_catalog
    WHERE duty = 'LIGHT_DUTY' AND height_mm IS NOT NULL
    LIMIT 5;
  `);

  console.log('\n📊 VERIFICATION STATS (LIGHT DUTY):');
  console.table(stats.rows);

  console.log('\n🔍 SAMPLE RECORD DETAILS:');
  console.table(sample.rows);

  await client.end();
}

main().catch(err => {
  console.error(err);
  client.end().catch(() => {});
});
