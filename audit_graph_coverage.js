const { Client } = require("pg");

const client = new Client({
  host: "dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com",
  port: 5432,
  database: "catalogo_elimfilters",
  user: "catalogo_elimfilters_user",
  password: "d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf",
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
