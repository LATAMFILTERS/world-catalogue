const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const total = await client.query(`
    SELECT COUNT(*) total
    FROM elimfilters_catalog
  `);

  const tech = await client.query(`
    SELECT COUNT(DISTINCT product_sku) total
    FROM kg_product_technologies
  `);

  const systems = await client.query(`
    SELECT COUNT(DISTINCT product_sku) total
    FROM kg_product_systems
  `);

  const equipment = await client.query(`
    SELECT COUNT(DISTINCT product_sku) total
    FROM kg_product_equipment
  `);

  console.log({
    catalog_products: total.rows[0].total,
    technology_mapped: tech.rows[0].total,
    system_mapped: systems.rows[0].total,
    equipment_mapped: equipment.rows[0].total
  });

  await client.end();
})();
