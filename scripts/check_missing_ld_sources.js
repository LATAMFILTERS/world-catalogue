/**
 * check_missing_ld_sources.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Inspects a sample of the Light Duty products that are missing specs (height_mm IS NULL)
 * and determines their brand origins (from oem_codes or competitor_codes).
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
  console.log('🔌 Connected to Postgres for missing LD source analysis...');

  // 1. Get counts of missing vs present specs
  const counts = await client.query(`
    SELECT 
      COUNT(*) AS total_ld,
      COUNT(*) FILTER (WHERE height_mm IS NULL AND outer_diameter_mm IS NULL) AS missing_specs,
      COUNT(*) FILTER (WHERE height_mm IS NOT NULL) AS with_height
    FROM elimfilters_catalog
    WHERE duty = 'LIGHT_DUTY';
  `);
  console.log('\n📊 SPEC STATUS IN LIGHT DUTY:');
  console.table(counts.rows);

  // 2. Sample 25 records that are missing specs to inspect their codes and names
  const sample = await client.query(`
    SELECT 
      sku, 
      codigo_base, 
      filter_type,
      (SELECT jsonb_agg(elem) FROM (
        SELECT jsonb_array_elements(oem_codes) AS elem LIMIT 3
      ) t) AS sample_oem,
      (SELECT jsonb_agg(elem) FROM (
        SELECT jsonb_array_elements(competitor_codes) AS elem LIMIT 3
      ) t) AS sample_competitors
    FROM elimfilters_catalog
    WHERE duty = 'LIGHT_DUTY' AND height_mm IS NULL
    LIMIT 25;
  `);
  console.log('\n🔍 SAMPLE OF 25 SKUs MISSING SPECS:');
  console.table(sample.rows.map(r => ({
    sku: r.sku,
    codigo_base: r.codigo_base,
    filter_type: r.filter_type,
    oem_sample: r.sample_oem ? JSON.stringify(r.sample_oem) : '[]',
    comp_sample: r.sample_competitors ? JSON.stringify(r.sample_competitors) : '[]'
  })));

  // 3. Analyze what prefixes the missing SKUs have
  const prefixes = await client.query(`
    SELECT LEFT(sku, 3) AS prefix, COUNT(*) 
    FROM elimfilters_catalog
    WHERE duty = 'LIGHT_DUTY' AND height_mm IS NULL
    GROUP BY LEFT(sku, 3)
    ORDER BY count DESC;
  `);
  console.log('\n🏷️ MISSING SPEC SKUs BY PREFIX (EL3=Oil, EA3=Air, EC3=Cabin, EF3=Fuel):');
  console.table(prefixes.rows);

  await client.end();
}

main().catch(err => {
  console.error(err);
  client.end().catch(() => {});
});
