const { Client } = require("pg");

const client = new Client({
  host: "dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com",
  port: 5432,
  database: "catalogo_elimfilters",
  user: "catalogo_elimfilters_user",
  password: "d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf",
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
