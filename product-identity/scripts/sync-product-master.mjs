#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const { Pool } = pg;

const FAMILY_MAP = {
  oil: { family: 'oil_filter', defaultTechnology: 'SYNTRAX' },
  lube: { family: 'oil_filter', defaultTechnology: 'SYNTRAX' },
  fuel: { family: 'fuel_filter', defaultTechnology: 'HYDROCORE' },
  'fuel/water separator': { family: 'fuel_water_separator', defaultTechnology: 'HYDROCORE' },
  'fuel water separator': { family: 'fuel_water_separator', defaultTechnology: 'HYDROCORE' },
  hydraulic: { family: 'hydraulic_filter', defaultTechnology: 'NANOFORCE' },
  coolant: { family: 'coolant_filter', defaultTechnology: 'THERMACORE' },
  air: { family: 'air_filter', defaultTechnology: 'MACROCORE' },
  cabin: { family: 'cabin_filter', defaultTechnology: 'MICROKAPPA' },
  'air dryer': { family: 'air_dryer', defaultTechnology: 'DRYCORE' },
  crankcase: { family: 'crankcase_ventilation_filter', defaultTechnology: null },
  ccv: { family: 'crankcase_ventilation_filter', defaultTechnology: null }
};

function normalizeFamily(filterType = '') {
  const normalized = String(filterType).trim().toLowerCase();
  for (const [key, value] of Object.entries(FAMILY_MAP)) {
    if (normalized.includes(key)) return value;
  }
  return { family: normalized.replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'unknown', defaultTechnology: null };
}

function normalizeTechnology(row, fallback) {
  const value = row.technology ? String(row.technology).trim() : null;
  return value || fallback || null;
}

function normalizeCrossrefs(row) {
  const merged = [];
  const seen = new Set();
  for (const source of [row.oem_codes, row.brand_crossrefs, row.competitor_codes]) {
    if (!Array.isArray(source)) continue;
    for (const item of source) {
      const code = typeof item === 'string' ? item : item?.code;
      const brand = typeof item === 'object' && item ? (item.brand || item.manufacturer || item.make || null) : null;
      if (!code) continue;
      const key = `${brand || ''}:${String(code).toUpperCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push({ brand, code: String(code), verified: true });
    }
  }
  return merged;
}

function deriveConstruction(row) {
  const text = `${row.installation_type || ''} ${row.attachment_type || ''} ${row.sub_type || ''}`.toLowerCase();
  if (text.includes('spin')) return 'spin_on';
  if (text.includes('panel')) return 'panel';
  if (text.includes('radial')) return 'radial';
  if (text.includes('cartridge')) return 'cartridge';
  if (text.includes('element')) return 'element';
  return null;
}

function buildMaster(row, existing = {}) {
  const familyInfo = normalizeFamily(row.filter_type);
  const crossrefs = normalizeCrossrefs(row);
  const applicableStandards = [row.iso_test_method].filter(Boolean);
  const construction = deriveConstruction(row) || existing.construction || null;
  const technology = normalizeTechnology(row, familyInfo.defaultTechnology);

  return {
    sku: row.sku,
    segment: String(row.duty || '').toUpperCase().includes('LIGHT') ? 'LD' : 'HD',
    family: familyInfo.family,
    construction,
    technology,
    technical_source: {
      source: 'world_catalogue.elimfilters_catalog',
      verified: true,
      height_mm: row.height_mm ?? null,
      outer_diameter_mm: row.outer_diameter_mm ?? null,
      inner_diameter_mm: row.inner_diameter_mm ?? null,
      thread: row.thread_size ?? null,
      gasket: {
        od_mm: row.gasket_od_mm ?? null,
        id_mm: row.gasket_id_mm ?? null
      },
      crossrefs,
      standards: applicableStandards,
      filter_media: row.filter_media ?? null,
      micron_rating: row.micron_rating ?? null,
      bypass_valve_psi: row.bypass_valve_psi ?? null,
      burst_pressure_psi: row.burst_pressure_psi ?? null,
      collapse_pressure_psi: row.collapse_pressure_psi ?? null,
      installation_type: row.installation_type ?? null,
      attachment_type: row.attachment_type ?? null,
      source_updated_at: new Date().toISOString()
    },
    production: {
      template_id: existing.production?.template_id ?? null,
      printable_area: existing.production?.printable_area ?? {
        height_mm: null,
        circumference_mm: null
      },
      qr_url: existing.production?.qr_url ?? null,
      factory_ready: false
    },
    lithography: {
      front: [
        'ELIMFILTERS',
        'Total Asset Protection',
        row.sku,
        row.filter_type || familyInfo.family,
        technology
      ].filter(Boolean),
      rear: [
        'E',
        'QR',
        'Equivalent to: up to 3 verified OEM references',
        'applicable verified standards'
      ]
    },
    media: {
      geometry_locked: true,
      source_image_required: true,
      approved_master_image: existing.media?.approved_master_image ?? null
    },
    gate: {
      missing_for_factory_release: [
        ...(row.height_mm == null ? ['height_mm'] : []),
        ...(row.outer_diameter_mm == null ? ['outer_diameter_mm'] : []),
        ...(construction === 'spin_on' && !row.thread_size ? ['thread_size'] : []),
        ...(existing.production?.printable_area?.height_mm == null ? ['printable_area.height_mm'] : []),
        ...(existing.production?.qr_url == null ? ['qr_url'] : [])
      ]
    }
  };
}

const SELECT_COLUMNS = `
  sku, filter_type, technology, duty, sub_type,
  thread_size, height_mm, outer_diameter_mm, inner_diameter_mm,
  gasket_od_mm, gasket_id_mm, micron_rating, bypass_valve_psi,
  iso_test_method, filter_media, burst_pressure_psi, collapse_pressure_psi,
  installation_type, attachment_type, oem_codes, competitor_codes, brand_crossrefs
`;

export async function syncProductMasters({
  connectionString = process.env.DATABASE_URL,
  sku = null,
  outputDir = 'product-identity/production-master',
  dryRun = false,
  poolFactory = (config) => new Pool(config)
} = {}) {
  if (!connectionString) throw new Error('DATABASE_URL is required');

  const pool = poolFactory({
    connectionString,
    application_name: 'product-identity-readonly-sync',
    options: '-c default_transaction_read_only=on'
  });

  try {
    const params = [];
    let where = `WHERE COALESCE(UPPER(duty), 'HD') NOT LIKE '%LIGHT%'`;
    if (sku) {
      params.push(sku);
      where += ` AND sku = $${params.length}`;
    }

    const result = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM elimfilters_catalog ${where} ORDER BY sku`,
      params
    );

    fs.mkdirSync(outputDir, { recursive: true });
    const report = { processed: 0, written: 0, dry_run: dryRun, products: [] };

    for (const row of result.rows) {
      const file = path.join(outputDir, `${row.sku}.json`);
      let existing = {};
      if (fs.existsSync(file)) {
        try { existing = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
      }
      const master = buildMaster(row, existing);
      report.processed += 1;
      report.products.push({ sku: row.sku, missing: master.gate.missing_for_factory_release });
      if (!dryRun) {
        fs.writeFileSync(file, `${JSON.stringify(master, null, 2)}\n`);
        report.written += 1;
      }
    }

    return report;
  } finally {
    await pool.end();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const skuArg = args.find((arg) => arg.startsWith('--sku='));
  const dryRun = args.includes('--dry-run');
  const sku = skuArg ? skuArg.split('=')[1] : null;
  const report = await syncProductMasters({ sku, dryRun });
  console.log(JSON.stringify(report, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(`[product-identity sync] ${error.message}`);
    process.exit(1);
  });
}
