const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized:false }
});

(async()=>{

  await client.connect();

  const r = await client.query(`
    WITH hd AS (
      SELECT DISTINCT sku
      FROM mann_oem_clean
      WHERE segment='HD'
    ),
    matched AS (
      SELECT DISTINCT mann_part AS sku
      FROM mann_donaldson_matches
    )
    SELECT h.sku
    FROM hd h
    LEFT JOIN matched m
      ON m.sku = h.sku
    WHERE m.sku IS NULL
    ORDER BY h.sku
    LIMIT 10
  `);

  console.table(r.rows);

  await client.end();

})();
