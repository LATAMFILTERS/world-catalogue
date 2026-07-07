/**
 * assign_ld_technologies.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Populates the 'technology' and 'sub_type' columns for Light Duty filters
 * in the database to enable the premium technology badges (SYNTRAX™, etc.)
 * in the frontend.
 *
 * Mappings:
 * - Oil Filters  -> Technology: SYNTRAX™, Subtype: Cellulose (Genuine Media)
 * - Air Filters  -> Technology: MACROCORE™, Subtype: Cellulose (Genuine Media)
 * - Fuel Filters -> Technology: SYNTEPORE™, Subtype: Cellulose (Genuine Media)
 * - Cabin Filters-> Technology: MICROKAPPA™, Subtype: Cellulose (Genuine Media)
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
  console.log('🔌 Connected to PostgreSQL for technology assignment...');

  console.log('⏳ Updating Oil filters in Light Duty...');
  const resOil = await client.query(`
    UPDATE elimfilters_catalog 
    SET 
      technology = 'SYNTRAX™', 
      sub_type = 'Cellulose' 
    WHERE duty = 'LIGHT_DUTY' 
      AND filter_type = 'oil' 
      AND technology IS NULL;
  `);
  console.log(`   → Updated ${resOil.rowCount} Oil filters.`);

  console.log('⏳ Updating Air filters in Light Duty...');
  const resAir = await client.query(`
    UPDATE elimfilters_catalog 
    SET 
      technology = 'MACROCORE™', 
      sub_type = 'Cellulose' 
    WHERE duty = 'LIGHT_DUTY' 
      AND filter_type = 'air' 
      AND technology IS NULL;
  `);
  console.log(`   → Updated ${resAir.rowCount} Air filters.`);

  console.log('⏳ Updating Fuel filters in Light Duty...');
  const resFuel = await client.query(`
    UPDATE elimfilters_catalog 
    SET 
      technology = 'SYNTEPORE™', 
      sub_type = 'Cellulose' 
    WHERE duty = 'LIGHT_DUTY' 
      AND filter_type = 'fuel' 
      AND technology IS NULL;
  `);
  console.log(`   → Updated ${resFuel.rowCount} Fuel filters.`);

  console.log('⏳ Updating Cabin filters in Light Duty...');
  const resCabin = await client.query(`
    UPDATE elimfilters_catalog 
    SET 
      technology = 'MICROKAPPA™', 
      sub_type = 'Cellulose' 
    WHERE duty = 'LIGHT_DUTY' 
      AND filter_type = 'cabin' 
      AND technology IS NULL;
  `);
  console.log(`   → Updated ${resCabin.rowCount} Cabin filters.`);

  // Verify final counts
  const finalStats = await client.query(`
    SELECT technology, sub_type, COUNT(*) 
    FROM elimfilters_catalog 
    WHERE duty = 'LIGHT_DUTY' 
    GROUP BY technology, sub_type;
  `);
  console.log('\n📊 Final Light Duty Technology Distribution:');
  console.table(finalStats.rows);

  await client.end();
  console.log('🔌 Connection closed.');
}

main().catch(err => {
  console.error('💥 Error running technology assignment:', err);
  client.end().catch(() => {});
  process.exit(1);
});
