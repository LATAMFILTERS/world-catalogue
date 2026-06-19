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

  const makes = await client.query(`
    SELECT COUNT(*) total
    FROM kg_equipment_makes
  `);

  const models = await client.query(`
    SELECT COUNT(*) total
    FROM kg_equipment_models
  `);

  const relations = await client.query(`
    SELECT COUNT(*) total
    FROM kg_product_equipment
  `);

  console.log({
    makes: makes.rows[0].total,
    models: models.rows[0].total,
    relations: relations.rows[0].total
  });

  await client.end();
})();
