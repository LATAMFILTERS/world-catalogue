#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import pg from 'pg';

const { Pool } = pg;

export function normalizeCatalogueRow(row) {
  return {
    sku: row.sku,
    brand: 'ELIMFILTERS',
    part_number: row.sku,
    duty: row.duty ?? null,
    product_family: row.filter_type ?? null,
    description: row.description ?? null,
    status: row.status ?? null,
    dimensions: row.dimensions ?? {},
    applications: [
      ...(Array.isArray(row.vehicle_applications) ? row.vehicle_applications : []),
      ...(Array.isArray(row.equipment_applications) ? row.equipment_applications : [])
    ],
    vehicle_applications: row.vehicle_applications ?? [],
    equipment_applications: row.equipment_applications ?? [],
    oem_codes: row.oem_codes ?? [],
    competitor_codes: row.competitor_codes ?? [],
    cross_references: [
      ...(Array.isArray(row.oem_codes) ? row.oem_codes : []),
      ...(Array.isArray(row.competitor_codes) ? row.competitor_codes : [])
    ],
    source_updated_at: row.updated_at ?? null
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

export async function exportCatalogueSnapshot({
  connectionString = process.env.DATABASE_URL,
  outputDir = 'hermes/catalogue-snapshots',
  limit = null,
  poolFactory = (config) => new Pool(config)
} = {}) {
  if (!connectionString) throw new Error('DATABASE_URL is required');

  const pool = poolFactory({
    connectionString,
    application_name: 'hermes-catalogue-readonly-export',
    options: '-c default_transaction_read_only=on'
  });

  try {
    await pool.query('BEGIN READ ONLY');
    const params = [];
    let sql = `
      SELECT
        sku,
        duty,
        filter_type,
        description,
        status,
        dimensions,
        vehicle_applications,
        equipment_applications,
        oem_codes,
        competitor_codes,
        updated_at
      FROM elimfilters_catalog
      ORDER BY sku
    `;
    if (Number.isInteger(limit) && limit > 0) {
      params.push(limit);
      sql += ' LIMIT $1';
    }
    const result = await pool.query(sql, params);
    await pool.query('COMMIT');

    const snapshot = buildSnapshot(result.rows, { limit: limit ?? null });
    fs.mkdirSync(outputDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const output = path.join(outputDir, `elimfilters-catalogue-${stamp}.json`);
    fs.writeFileSync(output, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
    return { output, snapshot };
  } catch (error) {
    try { await pool.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
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

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(`[HERMES catalogue snapshot] ${error.message}`);
    process.exit(1);
  });
}
