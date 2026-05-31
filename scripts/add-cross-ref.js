/**
 * One-time script: add a competitor cross-reference to a catalog product.
 * Run on Render Shell: node scripts/add-cross-ref.js
 */
'use strict';

const { Client } = require('pg');

const dbConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      host: 'ballast.proxy.rlwy.net',
      port: 18263,
      database: 'railway',
      user: 'postgres',
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
    };

// ── EDIT THESE BEFORE RUNNING ──────────────────────────────────────────────
const CODIGO_BASE   = 'P554004';          // codigo_base to target
const MANUFACTURER  = 'BALDWIN';          // competitor brand
const CODE          = 'B76';             // competitor part number
// ───────────────────────────────────────────────────────────────────────────

async function main() {
  const client = new Client(dbConfig);
  await client.connect();
  console.log('Connected to DB');

  // 1. Find the row
  const find = await client.query(
    `SELECT id, sku, competitor_codes
     FROM elimfilters_catalog
     WHERE UPPER(codigo_base) = $1
     LIMIT 1`,
    [CODIGO_BASE.toUpperCase()]
  );

  if (!find.rows.length) {
    console.error(`ERROR: No product found with codigo_base = ${CODIGO_BASE}`);
    await client.end();
    process.exit(1);
  }

  const row = find.rows[0];
  console.log(`Found: id=${row.id} sku=${row.sku}`);

  // 2. Parse existing competitor_codes
  let codes = [];
  if (row.competitor_codes) {
    codes = typeof row.competitor_codes === 'string'
      ? JSON.parse(row.competitor_codes)
      : row.competitor_codes;
  }

  // 3. Check for duplicate
  const exists = codes.some(
    c => (c.manufacturer || '').toUpperCase() === MANUFACTURER.toUpperCase()
      && (c.code || '').toUpperCase() === CODE.toUpperCase()
  );

  if (exists) {
    console.log(`Already present: ${MANUFACTURER} ${CODE} — nothing to do.`);
    await client.end();
    return;
  }

  // 4. Append new entry
  codes.push({ manufacturer: MANUFACTURER, code: CODE });

  // 5. Update
  await client.query(
    `UPDATE elimfilters_catalog
     SET competitor_codes = $1::jsonb
     WHERE id = $2`,
    [JSON.stringify(codes), row.id]
  );

  console.log(`SUCCESS: Added ${MANUFACTURER} ${CODE} to ${row.sku} (codigo_base ${CODIGO_BASE})`);
  await client.end();
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
