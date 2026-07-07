/**
 * check_ld_technology.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Queries the database to find the distinct values of the 'technology' column
 * for Light Duty products.
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
  console.log('🔌 Connected to PostgreSQL for technology column audit...\n');

  const res = await client.query(`
    SELECT technology, COUNT(*) 
    FROM elimfilters_catalog 
    WHERE duty = 'LIGHT_DUTY' 
    GROUP BY technology
    ORDER BY count DESC;
  `);

  console.log('📊 DISTINCT TECHNOLOGY VALUES IN LIGHT_DUTY:');
  console.table(res.rows);

  await client.end();
}

main().catch(err => {
  console.error(err);
  client.end().catch(() => {});
});
