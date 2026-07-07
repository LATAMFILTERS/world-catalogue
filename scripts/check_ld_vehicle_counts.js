/**
 * check_ld_vehicle_counts.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Analyzes the counts of vehicle/equipment applications per SKU in the database.
 * Compares the JSONB columns with the relational Knowledge Graph tables.
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
  console.log('🔌 Connected to PostgreSQL for vehicle/equipment applications audit...\n');

  // 1. Check columns of elimfilters_catalog to see if vehicle_applications or equipment_applications is used
  const colsRes = await client.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'elimfilters_catalog' 
      AND column_name IN ('vehicle_applications', 'equipment_applications');
  `);
  const cols = colsRes.rows.map(c => c.column_name);
  console.log('📋 Columns present in database:', cols.join(', '));

  // 2. Count non-empty records for both columns
  for (const col of cols) {
    const stats = await client.query(`
      SELECT 
        duty,
        COUNT(*) AS total_skus,
        COUNT(*) FILTER (WHERE "${col}" IS NOT NULL AND jsonb_array_length("${col}") > 0) AS with_apps,
        AVG(jsonb_array_length("${col}")) FILTER (WHERE "${col}" IS NOT NULL AND jsonb_array_length("${col}") > 0) AS avg_apps_per_sku,
        MAX(jsonb_array_length("${col}")) FILTER (WHERE "${col}" IS NOT NULL) AS max_apps_per_sku
      FROM elimfilters_catalog
      GROUP BY duty;
    `);
    console.log(`\n📊 STATS FOR COLUMN [${col}] BY SEGMENT:`);
    console.table(stats.rows.map(r => ({
      duty: r.duty,
      total_skus: r.total_skus,
      skus_with_apps: r.with_apps,
      avg_apps_per_sku: r.avg_apps_per_sku ? Number(r.avg_apps_per_sku).toFixed(1) : '0.0',
      max_apps_per_sku: r.max_apps_per_sku || 0
    })));
  }

  // 3. Check the relational Knowledge Graph fitments count
  const kgStats = await client.query(`
    SELECT 
      c.duty,
      COUNT(DISTINCT k.product_sku) AS skus_in_kg,
      COUNT(*) AS total_relations,
      AVG(sub.cnt) AS avg_relations_per_sku,
      MAX(sub.cnt) AS max_relations_per_sku
    FROM kg_product_equipment k
    JOIN elimfilters_catalog c ON c.sku = k.product_sku
    JOIN (
      SELECT product_sku, COUNT(*) as cnt
      FROM kg_product_equipment
      GROUP BY product_sku
    ) sub ON sub.product_sku = k.product_sku
    GROUP BY c.duty;
  `);

  console.log('\n🧠 STATS FOR RELATIONAL KNOWLEDGE GRAPH (kg_product_equipment):');
  console.table(kgStats.rows.map(r => ({
    duty: r.duty,
    skus_in_kg: r.skus_in_kg,
    total_relations: r.total_relations,
    avg_relations_per_sku: r.avg_relations_per_sku ? Number(r.avg_relations_per_sku).toFixed(1) : '0.0',
    max_relations_per_sku: r.max_relations_per_sku || 0
  })));

  // 4. Sample a few SKUs with low JSONB applications but check if they have more in the KG
  const sample = await client.query(`
    SELECT 
      c.sku, 
      c.duty,
      jsonb_array_length(c.equipment_applications) as jsonb_apps,
      (SELECT COUNT(*) FROM kg_product_equipment k WHERE k.product_sku = c.sku) as kg_apps
    FROM elimfilters_catalog c
    WHERE c.equipment_applications IS NOT NULL AND jsonb_array_length(c.equipment_applications) > 0
    LIMIT 10;
  `);
  console.log('\n🔍 SAMPLE COMPARISON (JSONB VS KNOWLEDGE GRAPH):');
  console.table(sample.rows);

  await client.end();
}

main().catch(err => {
  console.error(err);
  client.end().catch(() => {});
});
