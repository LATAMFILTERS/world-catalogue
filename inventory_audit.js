/**
 * AUDITORÍA DE INVENTARIO ACTUAL EN POSTGRESQL
 * Solo lectura.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DIR = __dirname;
const OUT_JSON = path.join(DIR, 'postgres_inventory_audit.json');
const OUT_TABLES_CSV = path.join(DIR, 'postgres_inventory_tables.csv');
const OUT_COLS_CSV = path.join(DIR, 'postgres_inventory_columns.csv');

function csvEsc(v) { return `"${String(v == null ? '' : v).replace(/"/g, '""')}"`; }
function writeCsv(file, header, data) {
  let content = header.map(csvEsc).join(',') + '\n';
  data.forEach(row => {
    content += header.map(k => csvEsc(row[k])).join(',') + '\n';
  });
  fs.writeFileSync(file, content);
}

async function runAudit() {
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL missing');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  await client.connect();

  const report = {
    generated_at: new Date().toISOString(),
    tables: [],
    top_20_largest: [],
    inventory_columns: [],
    identified_tables: {
      master_product_table: null,
      inventory_table: null,
      oem_table: null,
      competitor_cross_references_table: null,
      vehicle_applications_table: null
    },
    queries_used: []
  };

  // 1. Table sizes and row counts
  const queryTables = `
    SELECT 
      schemaname, 
      relname as tablename, 
      n_live_tup as row_count, 
      pg_total_relation_size(relid) as table_size_bytes,
      pg_size_pretty(pg_total_relation_size(relid)) as table_size_pretty
    FROM pg_stat_user_tables
    ORDER BY pg_total_relation_size(relid) DESC;
  `;
  report.queries_used.push(queryTables);

  const resTables = await client.query(queryTables);
  report.tables = resTables.rows.map(r => ({
    schema: r.schemaname,
    table: r.tablename,
    row_count: parseInt(r.row_count, 10),
    size_bytes: parseInt(r.table_size_bytes, 10),
    size_pretty: r.table_size_pretty
  }));

  report.top_20_largest = report.tables.slice(0, 20);

  // 2. Inventory columns
  const queryCols = `
    SELECT 
      table_schema as schema, 
      table_name as table, 
      column_name as column, 
      data_type 
    FROM information_schema.columns 
    WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
    AND (
      column_name ILIKE '%inventory%' OR
      column_name ILIKE '%stock%' OR
      column_name ILIKE '%quantity%' OR
      column_name ILIKE '%qty%' OR
      column_name ILIKE '%warehouse%' OR
      column_name ILIKE '%availability%'
    )
    ORDER BY table_schema, table_name, column_name;
  `;
  report.queries_used.push(queryCols);

  const resCols = await client.query(queryCols);
  report.inventory_columns = resCols.rows;

  // 3. Identify Key Tables
  for (const t of report.tables) {
    const name = t.table.toLowerCase();
    if (name.includes('catalog') && name.includes('product') && !name.includes('readiness')) {
      report.identified_tables.master_product_table = `${t.schema}.${t.table}`;
    }
    if (name.includes('inventory') || name.includes('stock')) {
      report.identified_tables.inventory_table = `${t.schema}.${t.table}`;
    }
    if (name.includes('oem')) {
      report.identified_tables.oem_table = `${t.schema}.${t.table}`;
    }
    if (name.includes('competitor') || name.includes('cross')) {
      report.identified_tables.competitor_cross_references_table = `${t.schema}.${t.table}`;
    }
    if (name.includes('vehicle') || name.includes('application')) {
      report.identified_tables.vehicle_applications_table = `${t.schema}.${t.table}`;
    }
  }

  // Generate CSVs
  writeCsv(OUT_TABLES_CSV, ['schema', 'table', 'row_count', 'size_bytes', 'size_pretty'], report.tables);
  writeCsv(OUT_COLS_CSV, ['schema', 'table', 'column', 'data_type'], report.inventory_columns);

  // Generate JSON
  fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2));

  console.log("AUDIT COMPLETED.");
  await client.end();
}

runAudit().catch(console.error);
