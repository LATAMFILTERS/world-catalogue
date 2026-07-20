/**
 * apply-turbine-competitor-matrix.js
 *
 * Creates ET92010P/T/S, ET92020P/T/S, ET92040P/T/S in the DB (if absent),
 * cloned from base ET92010/20/40 with micronage suffix in description,
 * then sets competitor_codes for each variant.
 *
 * Run:
 *   node scripts/apply-turbine-competitor-matrix.js
 *   node scripts/apply-turbine-competitor-matrix.js --dry
 */
'use strict';

const { Client } = require('pg');
const fs   = require('fs');
const path = require('path');

const DRY_RUN     = process.argv.includes('--dry');
const MATRIX_FILE = path.join(__dirname, 'turbine_competitor_matrix.json');

const DB_CONFIG = (() => {
  const raw = process.env.DATABASE_URL || '';
  if (raw) {
    const u = new URL(raw.split('?')[0]);
    return {
      host:     u.hostname,
      port:     parseInt(u.port) || 5432,
      database: u.pathname.slice(1),
      user:     decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      ssl:      { rejectUnauthorized: false },
    };
  }
  return {
    connectionString: process.env.LEGACY_DB_URL,
    ssl: { rejectUnauthorized: false },
  };
})();

const MICRON_LABEL = { P: '30 Micron', T: '10 Micron', S: '2 Micron' };

const BASE_PNUM = {
  ET92010: 'P552010',
  ET92020: 'P552020',
  ET92040: 'P552040',
};

async function run() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  APPLY turbine competitor matrix → DB');
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (!fs.existsSync(MATRIX_FILE)) {
    console.error('turbine_competitor_matrix.json not found.');
    process.exit(1);
  }

  const matrix = JSON.parse(fs.readFileSync(MATRIX_FILE, 'utf8'));
  console.log(`Matrix: ${Object.keys(matrix).length} turbine SKU variants\n`);

  const client = new Client(DB_CONFIG);
  await client.connect();
  console.log('Connected to DB ✓\n');

  let created = 0;
  let updated = 0;

  for (const [variantSku, refs] of Object.entries(matrix)) {
    const base   = variantSku.slice(0, -1);
    const suffix = variantSku.slice(-1);
    const micron = MICRON_LABEL[suffix] || suffix;

    // Check if variant already exists
    const existing = await client.query(
      'SELECT sku FROM elimfilters_catalog WHERE sku = $1',
      [variantSku]
    );

    if (existing.rows.length === 0) {
      // Clone from base SKU
      const baseRow = await client.query(
        'SELECT * FROM elimfilters_catalog WHERE sku = $1 LIMIT 1',
        [base]
      );
      if (baseRow.rows.length === 0) {
        console.log(`⚠  ${variantSku} — base ${base} not found, skipping`);
        continue;
      }
      const b = baseRow.rows[0];

      let descEn = b.description_en || b.description || '';
      let descEs = b.description_es || '';
      const tag = ` — ${micron} Turbine Element`;
      if (descEn && !descEn.includes('Micron')) descEn = descEn.replace(/\.$/, '') + tag + '.';
      if (descEs && !descEs.includes('Micrón')) descEs = descEs.replace(/\.$/, '') + tag + '.';

      if (!DRY_RUN) {
        await client.query(
          `INSERT INTO elimfilters_catalog
             (sku, filter_type, sub_type, installation_type, codigo_base,
              duty, description_en, description_es, oem_codes, competitor_codes,
              dimensions, weight, certifications, technology, created_at)
           SELECT
             $1, filter_type, sub_type, installation_type, $2,
             duty, $3, $4, oem_codes, $5::jsonb,
             dimensions, weight, certifications, technology, NOW()
           FROM elimfilters_catalog WHERE sku = $6
           ON CONFLICT (sku) DO NOTHING`,
          [
            variantSku,
            BASE_PNUM[base] || b.codigo_base,
            descEn || null,
            descEs || null,
            JSON.stringify(refs),
            base,
          ]
        );
      }
      console.log(`${DRY_RUN ? '[dry]' : '✅'} CREATED ${variantSku} (${micron}) → ${refs.length} refs`);
      created++;
    } else {
      if (!DRY_RUN) {
        await client.query(
          'UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE sku = $2',
          [JSON.stringify(refs), variantSku]
        );
      }
      console.log(`${DRY_RUN ? '[dry]' : '✅'} UPDATED ${variantSku} (${micron}) → ${refs.length} refs`);
      updated++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  COMPLETE — Created: ${created} | Updated: ${updated}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  await client.end();
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
