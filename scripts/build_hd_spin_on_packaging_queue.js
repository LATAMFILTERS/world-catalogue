'use strict';

require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');

const BATCH_SIZE = Math.max(1, Number(process.env.HD_PACKAGING_BATCH_SIZE || 25));
const OUTPUT_DIR = path.resolve(__dirname, 'hd_packaging_batches');

const FAMILY_ORDER = [
  'lube-oil',
  'fuel',
  'fuel-water-separator',
  'cooling',
  'hydraulic',
  'air-dryer',
  'unknown',
];

function normalize(value) {
  return String(value || '').trim().toLowerCase().replace(/_/g, '-');
}

function classifyFamily(row) {
  const filterType = normalize(row.filter_type);
  const technology = String(row.technology || '').toUpperCase();

  if (filterType.includes('air-dryer') || technology.includes('DRYCORE')) return 'air-dryer';
  if (filterType.includes('coolant') || filterType.includes('cooling') || technology.includes('THERMACORE')) return 'cooling';
  if (filterType.includes('hydraulic') || technology.includes('NANOFORCE')) return 'hydraulic';
  if (filterType.includes('separator') || technology.includes('HYDROCORE')) return 'fuel-water-separator';
  if (filterType.includes('fuel')) return 'fuel';
  if (filterType.includes('oil') || filterType.includes('lube') || technology.includes('SYNTRAX')) return 'lube-oil';
  return 'unknown';
}

function missingPackagingFields(row) {
  const required = [
    'unit_packaged_length_cm',
    'unit_packaged_width_cm',
    'unit_packaged_height_cm',
    'unit_packaged_weight_kg',
  ];

  return required.filter((field) => {
    const value = Number(row[field]);
    return !Number.isFinite(value) || value <= 0;
  });
}

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function safeJson(value) {
  if (value == null) return null;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return value; }
}

(async () => {
  const pool = new Pool({
    connectionString: process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const result = await pool.query(`
      SELECT
        sku,
        codigo_base,
        duty,
        filter_type,
        technology,
        style,
        product_name,
        description,
        unit_packaged_length_cm,
        unit_packaged_width_cm,
        unit_packaged_height_cm,
        unit_packaged_weight_kg,
        unit_packaged_volume_m3,
        units_per_case,
        packaging_source,
        packaging_validation_status,
        oem_codes,
        competitor_codes,
        brand_crossrefs
      FROM elimfilters_catalog
      WHERE duty = 'HEAVY_DUTY'
      ORDER BY sku
    `);

    const rows = result.rows
      .filter((row) => {
        const style = normalize(row.style);
        const type = normalize(row.filter_type);
        const name = normalize(row.product_name);
        const desc = normalize(row.description);
        return [style, type, name, desc].some((value) => value.includes('spin-on') || value.includes('spin on'));
      })
      .map((row) => ({
        ...row,
        family: classifyFamily(row),
        missing_fields: missingPackagingFields(row),
      }))
      .filter((row) => row.family !== 'air-dryer')
      .filter((row) => row.missing_fields.length > 0);

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const manifest = {
      generated_at: new Date().toISOString(),
      batch_size: BATCH_SIZE,
      total_incomplete_spin_on: rows.length,
      families: {},
      batches: [],
    };

    for (const family of FAMILY_ORDER) {
      if (family === 'air-dryer') continue;
      const familyRows = rows.filter((row) => row.family === family);
      if (!familyRows.length) continue;

      const familyBatches = chunk(familyRows, BATCH_SIZE);
      manifest.families[family] = {
        rows: familyRows.length,
        batches: familyBatches.length,
        missing_field_counts: familyRows.reduce((acc, row) => {
          for (const field of row.missing_fields) acc[field] = (acc[field] || 0) + 1;
          return acc;
        }, {}),
      };

      familyBatches.forEach((batchRows, index) => {
        const fileName = `${family}_batch_${String(index + 1).padStart(3, '0')}.json`;
        const payload = {
          family,
          batch_number: index + 1,
          batch_size: batchRows.length,
          rows: batchRows.map((row) => ({
            sku: row.sku,
            codigo_base: row.codigo_base,
            filter_type: row.filter_type,
            technology: row.technology,
            style: row.style,
            product_name: row.product_name,
            missing_fields: row.missing_fields,
            current_packaging: {
              unit_packaged_length_cm: row.unit_packaged_length_cm,
              unit_packaged_width_cm: row.unit_packaged_width_cm,
              unit_packaged_height_cm: row.unit_packaged_height_cm,
              unit_packaged_weight_kg: row.unit_packaged_weight_kg,
              unit_packaged_volume_m3: row.unit_packaged_volume_m3,
              units_per_case: row.units_per_case,
              packaging_source: row.packaging_source,
              packaging_validation_status: row.packaging_validation_status,
            },
            references: {
              oem_codes: safeJson(row.oem_codes),
              competitor_codes: safeJson(row.competitor_codes),
              brand_crossrefs: safeJson(row.brand_crossrefs),
            },
            evidence_required: {
              source_url: null,
              source_type: 'OFFICIAL_MANUFACTURER_OR_PRIMARY_DOCUMENTATION',
              unit_packaged_length_cm: null,
              unit_packaged_width_cm: null,
              unit_packaged_height_cm: null,
              unit_packaged_weight_kg: null,
              unit_packaged_volume_m3: null,
              notes: null,
            },
          })),
        };

        fs.writeFileSync(path.join(OUTPUT_DIR, fileName), JSON.stringify(payload, null, 2));
        manifest.batches.push({ family, batch_number: index + 1, file: fileName, rows: batchRows.length });
      });
    }

    fs.writeFileSync(path.join(OUTPUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
    console.log(JSON.stringify(manifest, null, 2));
  } finally {
    await pool.end();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
