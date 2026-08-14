'use strict';

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const migrationPath = path.join(__dirname, '026_canonical_technology_purge.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');
const forbiddenHex = [
  '485944524f434f5245',
  '53594e5445504f5245',
  '53594e5445464f52',
  '434f4f4c54454348',
  '445552414354454348',
  '4e414e4f434f5245',
  '49534f4755415244',
  '50554c5345434f5245',
  '454c494d434f5245',
  '44494553454c434f5245',
];
const forbidden = forbiddenHex.map((hex) => Buffer.from(hex, 'hex').toString('utf8'));

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  console.log('Running canonical technology purge...');
  await client.query(sql);

  const columns = await client.query(`
    SELECT table_schema, table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type IN ('text', 'character varying', 'character', 'json', 'jsonb')
    ORDER BY table_name, ordinal_position
  `);

  const violations = [];
  for (const col of columns.rows) {
    const qTable = `"${col.table_schema.replaceAll('"', '""')}"."${col.table_name.replaceAll('"', '""')}"`;
    const qColumn = `"${col.column_name.replaceAll('"', '""')}"`;
    for (const token of forbidden) {
      const result = await client.query(
        `SELECT count(*)::int AS count FROM ${qTable} WHERE ${qColumn}::text ILIKE $1`,
        [`%${token}%`]
      );
      if (result.rows[0].count > 0) {
        violations.push(`${col.table_schema}.${col.table_name}.${col.column_name}`);
      }
    }
  }

  if (violations.length) {
    throw new Error(`Verification failed: retired identifiers remain in ${[...new Set(violations)].join(', ')}`);
  }

  console.log('Canonical technology purge verified: zero retired identifiers in public text/JSON columns.');
  await client.end();
})().catch(async (error) => {
  console.error('ERROR:', error.message);
  try { await client.end(); } catch {}
  process.exit(1);
});
