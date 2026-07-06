/**
 * database_inventory.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Queries all tables in the database, retrieves their row counts,
 * and prints a beautiful inventory of your production database.
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
  console.log('🔌 Connected to PostgreSQL for full database inventory...\n');

  // 1. Get all public tables
  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  const inventory = [];

  for (const row of tablesRes.rows) {
    const tableName = row.table_name;
    try {
      const countRes = await client.query(`SELECT COUNT(*) AS total FROM "${tableName}"`);
      const rowCount = parseInt(countRes.rows[0].total, 10);
      inventory.push({
        table_name: tableName,
        rows_count: rowCount
      });
    } catch (e) {
      inventory.push({
        table_name: tableName,
        rows_count: 'Error'
      });
    }
  }

  // 2. Get views count
  const viewsRes = await client.query(`
    SELECT viewname 
    FROM pg_views 
    WHERE schemaname = 'public'
    ORDER BY viewname;
  `);

  console.log('📦 === PRODUCTION DATABASE INVENTORY (TABLES) ===');
  console.table(inventory);

  console.log('\n👁️  === ACTIVE VIEWS (VIEW ENGINE) ===');
  console.log(viewsRes.rows.map(v => v.viewname).join(', '));

  await client.end();
}

main().catch(err => {
  console.error(err);
  client.end().catch(() => {});
});
