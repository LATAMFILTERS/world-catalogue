/**
 * survey_hd_technologies.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Analyzes the distinct values of 'technology' and 'sub_type' columns
 * for HEAVY_DUTY filters grouped by filter_type.
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
  console.log('🔌 Connected to PostgreSQL for Heavy Duty technology survey...\n');

  const res = await client.query(`
    SELECT filter_type, technology, sub_type, COUNT(*) 
    FROM elimfilters_catalog 
    WHERE duty = 'HEAVY_DUTY' 
    GROUP BY filter_type, technology, sub_type
    ORDER BY filter_type, count DESC;
  `);

  console.log('📊 DISTINCT TECHNOLOGY & SUB_TYPE VALUES IN HEAVY_DUTY:');
  console.table(res.rows);

  await client.end();
}

main().catch(err => {
  console.error(err);
  client.end().catch(() => {});
});
