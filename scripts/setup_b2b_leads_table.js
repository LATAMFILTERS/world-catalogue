/**
 * setup_b2b_leads_table.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Migration script to create the b2b_distributor_leads table in PostgreSQL.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const connectionString = String(process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL || '').trim();
if (!connectionString) {
  throw new Error('CATALOG_DATABASE_URL or DATABASE_URL is required; database credentials must come from the runtime secret store.');
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
