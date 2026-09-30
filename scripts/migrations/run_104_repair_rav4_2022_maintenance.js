'use strict';
const { Client } = require('pg');

if (!process.env.DATABASE_URL && !process.env.CATALOG_DATABASE_URL) {
  console.error('ERROR: DATABASE_URL or CATALOG_DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');
const connectionString = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

const BRAND = 'TOYOTA';
const MODEL = 'RAV4';
const YEAR = '22';
const KIT_REF = 'TOYOTA RAV4 2022 2.5L (gasoline)';
const VERIFIED_COMPONENTS = [
  { sku: 'EC31919', engine: '2.5L GASOLINE' },
  { sku: 'EL36006', engine: '2.5L GASOLINE' }
];
(async () => {
  await client.connect();
  console.log(APPLY ? 'APPLYING RAV4 2022 repair' : 'DRY RUN RAV4 2022 repair');

  const kit = await client.query(
    'SELECT kit_sku, equipment_ref FROM maintenance_kits WHERE brand=$1 AND equipment_ref=$2',
    [BRAND, KIT_REF]
  );
  if (kit.rows.length !== 1) throw new Error('Expected exactly one validated RAV4 2022 kit');
  const kitSku = kit.rows[0].kit_sku;

  const products = await client.query(
    'SELECT elimfilters_sku, source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku = ANY($1::text[])',
    [VERIFIED_COMPONENTS.map(x => x.sku)]
  );
  if (products.rows.length !== VERIFIED_COMPONENTS.length) {
    throw new Error('Missing normalized LD products for EC31919 and/or EL36006');
  }

  console.log({ kitSku, verifiedProducts: products.rows, removeFromKit: 'EF34421' });
  if (APPLY) {
    await client.query('BEGIN');

    for (const item of VERIFIED_COMPONENTS) {
      const product = products.rows.find(row => row.elimfilters_sku === item.sku);
      await client.query(
        `INSERT INTO ld_catalog.ld_vehicle_applications
          (elimfilters_sku, source_sku, make, model_family, model_type, year, engine_code, source_origin)
         VALUES ($1,$2,$3,$4,$4,$5,$6,$7)
         ON CONFLICT (elimfilters_sku, make, model_family, model_type, year) DO NOTHING`,
        [item.sku, product.source_sku, BRAND, MODEL, YEAR, item.engine, 'ELIMFILTERS_RAV4_2022_VALIDATED_KIT']
      );
    }

    await client.query(
      'DELETE FROM kit_components WHERE kit_sku=$1 AND filter_sku=$2',
      [kitSku, 'EF34421']
    );

    await client.query('COMMIT');
    console.log('RAV4 2022 maintenance data repaired.');
  } else {
    console.log('No changes written. Re-run with --apply.');
  }

  await client.end();
})().catch(async error => {
  try { await client.query('ROLLBACK'); } catch {}
  console.error('ERROR:', error.message);
  try { await client.end(); } catch {}
  process.exit(1);
});
