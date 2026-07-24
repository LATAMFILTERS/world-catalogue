/**
 * propagate_hd_crossref_applications.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Batched cross-reference application inheritance engine for Heavy Duty SKUs.
 * Propagates equipment fitment applications across matching OEM and competitor codes.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

let connectionString = process.env.DATABASE_URL || 'postgresql://catalogo_elimfilters_user:d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf@dpg-d86ju1p9rddc739lc230.oregon-postgres.render.com/catalogo_elimfilters?ssl=true';

if (connectionString.includes('-a.oregon-postgres.render.com')) {
  connectionString = connectionString.replace('-a.oregon-postgres.render.com', '.oregon-postgres.render.com');
}

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false },
  statement_timeout: 60000,
  query_timeout: 60000
});

async function main() {
  await client.connect();
  console.log('🔌 Connected to PostgreSQL for HD Application Propagation Engine...\n');

  // 1. Audit pre-propagation coverage
  const initialAudit = await client.query(`
    SELECT 
      COUNT(*) AS total_hd_skus,
      COUNT(CASE WHEN equipment_applications IS NOT NULL AND jsonb_array_length(equipment_applications) > 0 THEN 1 END) AS with_apps,
      ROUND(100.0 * COUNT(CASE WHEN equipment_applications IS NOT NULL AND jsonb_array_length(equipment_applications) > 0 THEN 1 END) / COUNT(*), 2) AS coverage_pct
    FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY';
  `);

  console.log(`📊 Initial Heavy Duty Coverage: ${initialAudit.rows[0].with_apps} / ${initialAudit.rows[0].total_hd_skus} SKUs (${initialAudit.rows[0].coverage_pct}%)\n`);

  // 2. Propagate equipment applications from matched competitor and OEM cross-references
  console.log('⚡ Executing Cross-Reference Fitment Propagation...');

  const propagationQuery = `
    WITH crossref_fitments AS (
      SELECT DISTINCT
        c1.sku AS target_sku,
        app_elem AS inherited_app
      FROM elimfilters_catalog c1
      JOIN elimfilters_catalog c2 ON (
        c1.oem_codes && c2.oem_codes 
        OR c1.competitor_codes && c2.competitor_codes
      )
      CROSS JOIN LATERAL jsonb_array_elements(c2.equipment_applications) AS app_elem
      WHERE c1.duty = 'HEAVY_DUTY'
        AND (c1.equipment_applications IS NULL OR jsonb_array_length(c1.equipment_applications) = 0)
        AND c2.equipment_applications IS NOT NULL 
        AND jsonb_array_length(c2.equipment_applications) > 0
    ),
    aggregated_fitments AS (
      SELECT 
        target_sku,
        jsonb_agg(inherited_app) AS new_applications
      FROM crossref_fitments
      GROUP BY target_sku
    )
    UPDATE elimfilters_catalog c
    SET equipment_applications = af.new_applications
    FROM aggregated_fitments af
    WHERE c.sku = af.target_sku;
  `;

  const result = await client.query(propagationQuery);
  console.log(`✅ Propagated fitment applications to ${result.rowCount} Heavy Duty SKUs.\n`);

  // 3. Audit post-propagation coverage
  const finalAudit = await client.query(`
    SELECT 
      COUNT(*) AS total_hd_skus,
      COUNT(CASE WHEN equipment_applications IS NOT NULL AND jsonb_array_length(equipment_applications) > 0 THEN 1 END) AS with_apps,
      ROUND(100.0 * COUNT(CASE WHEN equipment_applications IS NOT NULL AND jsonb_array_length(equipment_applications) > 0 THEN 1 END) / COUNT(*), 2) AS coverage_pct
    FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY';
  `);

  console.log(`🚀 Final Heavy Duty Coverage: ${finalAudit.rows[0].with_apps} / ${finalAudit.rows[0].total_hd_skus} SKUs (${finalAudit.rows[0].coverage_pct}%)\n`);

  await client.end();
}

main().catch(err => {
  console.error('❌ Propagation Error:', err);
  client.end().catch(() => {});
});
