/**
 * setup_b2b_leads_table.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Migration script to create the b2b_distributor_leads table in PostgreSQL.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

let connectionString = process.env.DATABASE_URL || 'postgresql://catalogo_elimfilters_user:d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf@dpg-d86ju1p9rddc739lc230.oregon-postgres.render.com/catalogo_elimfilters?ssl=true';

if (connectionString.includes('-a.oregon-postgres.render.com')) {
  connectionString = connectionString.replace('-a.oregon-postgres.render.com', '.oregon-postgres.render.com');
}

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('🔌 Connected to PostgreSQL for b2b_distributor_leads Migration...\n');

  const createTableQuery = `
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
  console.log('✅ Table b2b_distributor_leads is ready in PostgreSQL database.');

  await client.end();
}

main().catch(err => {
  console.error('❌ Migration Error:', err);
  client.end().catch(() => {});
});
