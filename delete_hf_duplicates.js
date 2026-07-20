const { Client } = require("pg");

const deleteSkus = [
  'EH60497',
  'EH60507',
  'EH60827',
  'EH60837',
  'EH60877',
  'EH61307'
];

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  await client.query(`
    DELETE FROM alternative_group_member
    WHERE element_id IN (
      SELECT id FROM product_element
      WHERE elimfilters_sku = ANY($1)
    )
  `, [deleteSkus]);

  await client.query(`
    DELETE FROM product_element
    WHERE elimfilters_sku = ANY($1)
  `, [deleteSkus]);

  await client.query(`
    DELETE FROM elimfilters_catalog
    WHERE sku = ANY($1)
  `, [deleteSkus]);

  console.log('HF DUPLICADOS ELIMINADOS');

  await client.end();
})();
