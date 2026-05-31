'use strict';
/**
 * DB connectivity check — run on Render Shell: node check-db.js
 * Requires DATABASE_URL env var (injected automatically by Render).
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set. Run this on the Render shell.');
  process.exit(1);
}

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
};

function parseRefs(arr) {
  if (!arr) return [];
  if (typeof arr === 'string') {
    try { arr = JSON.parse(arr); } catch { return []; }
  }
  if (!Array.isArray(arr)) return [];
  return arr.map(item => ({
    manufacturer: item.manufacturer || item.brand || 'UNKNOWN',
    code: item.code,
  }));
}

function extractText(val, lang = 'en') {
  if (!val) return null;
  if (typeof val === 'object') return val[lang] || val.en || val.es || Object.values(val)[0] || null;
  if (typeof val === 'string') {
    try { const p = JSON.parse(val); return p[lang] || p.en || p.es || Object.values(p)[0] || val; } catch { return val; }
  }
  return String(val);
}

function buildFilterData(row, lang = 'en') {
  return {
    elimfilters_sku:   row.sku,
    description:       extractText(row.description, lang),
    filter_type:       extractText(row.filter_type, lang),
    filter_subtype:    row.sub_type || null,
    technology:        row.technology || null,
    nominal_efficiency: row.nominal_efficiency || null,
    burst_pressure_psi: row.burst_pressure_psi || null,
    collapse_pressure_psi: row.collapse_pressure_psi || null,
    duty:              row.duty || null,
    oem_codes:         parseRefs(row.oem_codes),
    competitor_codes:  parseRefs(row.competitor_codes),
    equipment_applications: row.equipment_applications || [],
  };
}

async function run() {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    console.log('Connected to Render DB successfully!');

    const columnsRes = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'elimfilters_catalog'
      ORDER BY ordinal_position
    `);
    console.log('\n--- Columns of elimfilters_catalog ---');
    columnsRes.rows.forEach(col => console.log(`  ${col.column_name}: ${col.data_type}`));

    console.log('\n--- Querying SKU EL82100 ---');
    const rowRes = await client.query(`SELECT * FROM elimfilters_catalog WHERE sku = 'EL82100'`);
    if (rowRes.rows.length > 0) {
      const row = rowRes.rows[0];
      const preview = { ...row };
      delete preview.equipment_applications;
      console.log('Row (without equipment_applications):', JSON.stringify(preview, null, 2));
      const fd = buildFilterData(row, 'es');
      delete fd.equipment_applications;
      console.log('\nbuildFilterData result:', JSON.stringify(fd, null, 2));
    } else {
      console.log('EL82100 not found in catalog.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
