const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async()=>{

  await client.connect();

  const r = await client.query(`
    SELECT
      COUNT(DISTINCT m.sku) hd_total,
      COUNT(DISTINCT d.mann_part) hd_with_donaldson
    FROM (
      SELECT DISTINCT sku
      FROM mann_oem_clean
      WHERE segment='HD'
    ) m
    LEFT JOIN mann_donaldson_matches d
      ON d.mann_part = m.sku
  `);

  console.table(r.rows);

  await client.end();

})();
