/**
 * setup_b2b_leads_table.js
 * Migration script to create the b2b_distributor_leads table in PostgreSQL.
 */

'use strict';

const { Client } = require('pg');

let connectionString = String(process.env.DATABASE_URL || '').trim();
if (!connectionString) {
  throw new Error('DATABASE_URL is required; database credentials must come from the runtime secret store.');
}

if (connectionString.includes('-a.oregon-postgres.render.com')) {
  connectionString = connectionString.replace('-a.oregon-postgres.render.com', '.oregon-postgres.render.com');
}

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: String(process.env.DB_SSL_VERIFY || 'true').toLowerCase() !== 'false'
  }
});

async function main() {
  await client.connect();
  console.log('Connected to PostgreSQL for b2b_distributor_leads migration.');  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS b2b_distributor_leads (
      id SERIAL PRIMARY KEY,
      source_channel TEXT NOT NULL,
      company_name TEXT,
      contact_name TEXT,
      phone_or_email TEXT,
      country TEXT,
      city TEXT,
      estimated_volume TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await client.query(createTableQuery);
  console.log('Table b2b_distributor_leads is ready.');
  await client.end();
}

main().catch(async (err) => {
  console.error('Migration Error:', err.message);
  try { await client.end(); } catch (_) {}
  process.exitCode = 1;
});
