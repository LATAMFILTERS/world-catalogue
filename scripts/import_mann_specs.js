/**
 * import_mann_specs.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Connects directly to the PostgreSQL database (via DATABASE_URL)
 * Reads scripts/mann_specs_patch.jsonl
 * Updates the specs of existing LIGHT_DUTY filters.
 *
 * Usage:
 *   $env:DATABASE_URL="your-render-db-url"
 *   node scripts/import_mann_specs.js
 *
 * Dry Run (no DB writes):
 *   node scripts/import_mann_specs.js --dry
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const PATCH_FILE = path.join(__dirname, 'mann_specs_patch.jsonl');
const DRY_RUN    = process.argv.includes('--dry');

let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/);
    if (match && match[1]) {
      connectionString = match[1].trim();
      // Auto-convert internal host to external host if running locally (not on Render)
      if (!process.env.RENDER && connectionString.includes('-a.oregon-postgres.render.com')) {
        connectionString = connectionString.replace('-a.oregon-postgres.render.com', '.oregon-postgres.render.com');
        console.log('📝 Loaded and converted DATABASE_URL from local .env file (internal -> external host)');
      } else {
        console.log('📝 Loaded DATABASE_URL');
      }
    }
  }
}

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL environment variable is not set and could not be loaded from .env');
  console.error('   Please run: $env:DATABASE_URL="your_connection_string"');
  process.exit(1);
}

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  if (!fs.existsSync(PATCH_FILE)) {
    console.error(`❌ Specs patch file not found: ${PATCH_FILE}`);
    console.error('   Please run: node scripts/generate_mann_specs_patch.js first.');
    process.exit(1);
  }

  const lines = fs.readFileSync(PATCH_FILE, 'utf8').split('\n').filter(Boolean);
  console.log(`📥 Read ${lines.length} spec patches from ${PATCH_FILE}`);

  console.log('🔌 Connecting to PostgreSQL...');
  await client.connect();
  console.log('✅ Connected.');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN — No updates will be written.');
  }

  let updated = 0;
  let notFound = 0;
  let skipped = 0;
  let index = 0;

  // Process in small sequential updates to track progress
  for (const line of lines) {
    let row;
    try {
      row = JSON.parse(line);
    } catch (e) {
      skipped++;
      continue;
    }

    const sku = (row.sku || '').trim().toUpperCase();
    if (!sku) {
      skipped++;
      continue;
    }

    index++;
    if (index % 200 === 0) {
      console.log(`⏳ Progress: processed ${index}/${lines.length}...`);
    }

    if (DRY_RUN) {
      updated++;
      continue;
    }

    try {
      // Overwrite technical specs directly so that corrected dimensions overwrite incorrect ones.
      const res = await client.query(
        `UPDATE elimfilters_catalog SET
          installation_type    = $2,
          thread_size          = $3,
          outer_diameter_mm    = $4,
          height_mm            = $5,
          gasket_od_mm         = $6,
          gasket_id_mm         = $7
        WHERE sku = $1`,
        [
          sku,
          row.installation_type || null,
          row.thread_size || null,
          row.outer_diameter_mm != null ? Number(row.outer_diameter_mm) : null,
          row.height_mm != null ? Number(row.height_mm) : null,
          row.gasket_od_mm != null ? Number(row.gasket_od_mm) : null,
          row.gasket_id_mm != null ? Number(row.gasket_id_mm) : null
        ]
      );

      if (res.rowCount > 0) {
        updated++;
      } else {
        notFound++;
      }
    } catch (err) {
      console.error(`❌ Error updating SKU ${sku}:`, err.message);
      skipped++;
    }
  }

  console.log('\n📊 Patch Execution Report:');
  console.log(`   Processed:  ${lines.length}`);
  console.log(`   Updated:    ${updated}`);
  console.log(`   Not Found:  ${notFound} (SKU doesn't exist in DB)`);
  console.log(`   Skipped:    ${skipped}`);

  await client.end();
  console.log('🔌 Connection closed.');
}

main().catch(err => {
  console.error('💥 Fatal error in main execution:', err);
  client.end().catch(() => {});
  process.exit(1);
});
