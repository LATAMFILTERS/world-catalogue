const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
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
