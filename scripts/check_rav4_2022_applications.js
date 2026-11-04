'use strict';
const { Client } = require('pg');
const connectionString = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL missing');
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
(async () => {
  await client.connect();
  const skus = ['EA37063','EC31919','EL36006','EF34421'];
  const apps = await client.query(
    `SELECT elimfilters_sku, source_sku, make, model_family, model_type, year, engine_code, source_origin
       FROM ld_catalog.ld_vehicle_applications
      WHERE elimfilters_sku = ANY($1::text[])
      ORDER BY elimfilters_sku, make, model_family, year`,
    [skus]
  );
  const kit = await client.query(
    `SELECT k.kit_sku, k.equipment_ref, kc.filter_sku
       FROM maintenance_kits k
       JOIN kit_components kc ON kc.kit_sku = k.kit_sku
      WHERE k.kit_sku = 'EK30001'
      ORDER BY kc.filter_sku`
  );
  console.log(JSON.stringify({ applications: apps.rows, kit: kit.rows }, null, 2));
  await client.end();
})().catch(async e => {
  console.error(e.message);
  try { await client.end(); } catch {}
  process.exit(1);
});
