#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import pg from 'pg';

const { Pool } = pg;

function compactObject(object) {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== null && value !== undefined));
}

export function normalizeCatalogueRow(row) {
  const dimensions = compactObject({
    thread_size: row.thread_size ?? null,
    height_mm: row.height_mm ?? null,
    outer_diameter_mm: row.outer_diameter_mm ?? null,
    inner_diameter_mm: row.inner_diameter_mm ?? null,
    gasket_od_mm: row.gasket_od_mm ?? null,
    gasket_id_mm: row.gasket_id_mm ?? null
  });

  const technical_specs = compactObject({
    micron_rating: row.micron_rating ?? null,
    bypass_valve_psi: row.bypass_valve_psi ?? null,
    iso_test_method: row.iso_test_method ?? null,
    anti_drainback_valve: row.anti_drainback_valve ?? null,
    nominal_efficiency: row.nominal_efficiency ?? null,
    filter_media: row.filter_media ?? null,
    burst_pressure_psi: row.burst_pressure_psi ?? null,
    collapse_pressure_psi: row.collapse_pressure_psi ?? null,
    installation_type: row.installation_type ?? null,
    attachment_type: row.attachment_type ?? null,
    is_primary: row.is_primary ?? null
  });

  const vehicleApplications = Array.isArray(row.vehicle_applications) ? row.vehicle_applications : [];
  const equipmentApplications = Array.isArray(row.equipment_applications) ? row.equipment_applications : [];
  const oemCodes = Array.isArray(row.oem_codes) ? row.oem_codes : [];
  const competitorCodes = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
  const brandCrossrefs = Array.isArray(row.brand_crossrefs) ? row.brand_crossrefs : [];

  return {
    id: row.id ?? null,
    sku: row.sku,
    codigo_base: row.codigo_base ?? null,
    brand: 'ELIMFILTERS',
    name: row.name ?? null,
    part_number: row.sku,
    duty: row.duty ?? null,
    product_family: row.filter_type ?? null,
    sub_type: row.sub_type ?? null,
    technology: row.technology ?? null,
    description: row.description ?? null,
    dimensions,
    technical_specs,
    specs: row.specs ?? {},
    applications: [...vehicleApplications, ...equipmentApplications],
    vehicle_applications: vehicleApplications,
    equipment_applications: equipmentApplications,
    oem_codes: oemCodes,
    competitor_codes: competitorCodes,
    brand_crossrefs: brandCrossrefs,
    cross_references: [...oemCodes, ...competitorCodes, ...brandCrossrefs],
    alternative_products: row.alternative_products ?? [],
    alternatives: row.alternatives ?? [],
    enrichment_data: row.enrichment_data ?? {},
    image_url: row.image_url ?? null,
    donaldson_url: row.donaldson_url ?? null,
    source_created_at: row.created_at ?? null
  };
}

export function buildSnapshot(rows, metadata = {}) {
  const products = rows.map(normalizeCatalogueRow);
  const canonical = JSON.stringify(products);
  return {
    schema_version: '1.0.0',
    generated_at: new Date().toISOString(),
    source: 'postgresql.elimfilters_catalog',
    read_only: true,
    publication_enabled: false,
    row_count: products.length,
    sha256: crypto.createHash('sha256').update(canonical).digest('hex'),
    metadata,
    products
  };
}

const SELECT_COLUMNS = `
  id, sku, codigo_base, filter_type, technology, thread_size,
  height_mm, outer_diameter_mm, inner_diameter_mm, gasket_od_mm, gasket_id_mm,
  micron_rating, bypass_valve_psi, iso_test_method, anti_drainback_valve,
  nominal_efficiency, filter_media, oem_codes, competitor_codes,
  equipment_applications, burst_pressure_psi, collapse_pressure_psi, created_at,
  alternative_products, description, enrichment_data, specs, duty, image_url,
  donaldson_url, sub_type, vehicle_applications, is_primary, name,
  installation_type, attachment_type, brand_crossrefs, alternatives
`;

export async function exportCatalogueSnapshot({
  connectionString = process.env.DATABASE_URL,
  outputDir = 'hermes/catalogue-snapshots',
  limit = null,
  batchSize = 500,
  poolFactory = (config) => new Pool(config)
} = {}) {
  if (!connectionString) throw new Error('DATABASE_URL is required');

  const pool = poolFactory({
    connectionString,
    application_name: 'hermes-catalogue-readonly-export',
    options: '-c default_transaction_read_only=on'
  });

  fs.mkdirSync(outputDir, { recursive: true });
  const generatedAt = new Date().toISOString();
  const stamp = generatedAt.replace(/[:.]/g, '-');
  const output = path.join(outputDir, `elimfilters-catalogue-${stamp}.json`);
  const fd = fs.openSync(output, 'w');
  const hash = crypto.createHash('sha256');
  let rowCount = 0;
  let offset = 0;
  let firstProduct = true;

  try {
    await pool.query('BEGIN READ ONLY');

    const header = {
      schema_version: '1.0.0',
      generated_at: generatedAt,
      source: 'postgresql.elimfilters_catalog',
      read_only: true,
      publication_enabled: false,
      metadata: { limit: limit ?? null, batch_size: batchSize }
    };
    const headerJson = JSON.stringify(header).slice(0, -1);
    fs.writeSync(fd, `${headerJson},"products":[`);
    hash.update('[');

    while (true) {
      const remaining = Number.isInteger(limit) && limit > 0 ? limit - rowCount : batchSize;
      if (remaining <= 0) break;
      const pageSize = Math.min(batchSize, remaining);
      const result = await pool.query(
        `SELECT ${SELECT_COLUMNS} FROM elimfilters_catalog ORDER BY sku, id LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      );

      if (result.rows.length === 0) break;

      for (const row of result.rows) {
        const productJson = JSON.stringify(normalizeCatalogueRow(row));
        const separator = firstProduct ? '' : ',';
        fs.writeSync(fd, `${separator}${productJson}`);
        hash.update(`${separator}${productJson}`);
        firstProduct = false;
        rowCount += 1;
      }

      offset += result.rows.length;
      if (result.rows.length < pageSize) break;
    }

    hash.update(']');
    const sha256 = hash.digest('hex');
    fs.writeSync(fd, `],"row_count":${rowCount},"sha256":"${sha256}"}\n`);
    await pool.query('COMMIT');

    return {
      output,
      snapshot: {
        schema_version: '1.0.0',
        generated_at: generatedAt,
        source: 'postgresql.elimfilters_catalog',
        read_only: true,
        publication_enabled: false,
        row_count: rowCount,
        sha256,
        metadata: { limit: limit ?? null, batch_size: batchSize }
      }
    };
  } catch (error) {
    try { await pool.query('ROLLBACK'); } catch {}
    try { fs.closeSync(fd); } catch {}
    try { fs.rmSync(output, { force: true }); } catch {}
    throw error;
  } finally {
    try { fs.closeSync(fd); } catch {}
    await pool.end();
  }
}

async function main() {
  const outputDir = process.argv[2] || 'hermes/catalogue-snapshots';
  const parsedLimit = process.argv[3] ? Number.parseInt(process.argv[3], 10) : null;
  const { output, snapshot } = await exportCatalogueSnapshot({
    outputDir,
    limit: Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : null
  });
  console.log(JSON.stringify({
    output,
    row_count: snapshot.row_count,
    sha256: snapshot.sha256,
    read_only: snapshot.read_only,
    publication_enabled: snapshot.publication_enabled
  }, null, 2));
}

const isDirectRun = process.argv[1]
  ? import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
  : false;

if (isDirectRun) {
  main().catch((error) => {
    console.error(`[HERMES catalogue snapshot] ${error.message}`);
    process.exit(1);
  });
}
