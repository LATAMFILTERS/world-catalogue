const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized:false }
});

(async()=>{

  await client.connect();

  const r = await client.query(`
    SELECT
      COUNT(DISTINCT m.sku) total_ld,
      COUNT(DISTINCT c.mann_part) ld_with_crossrefs
    FROM (
      SELECT DISTINCT sku
      FROM mann_oem_clean
      WHERE segment='LD'
    ) m
    LEFT JOIN cross_reference_master c
      ON c.mann_part = m.sku
  `);

  console.table(r.rows);

  await client.end();

})();
