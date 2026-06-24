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
    SELECT sku
    FROM mann_oem_clean
    WHERE segment='HD'
      AND (
        sku LIKE 'C%'
        OR sku LIKE 'CF%'
        OR sku LIKE 'CU%'
        OR sku LIKE 'CUK%'
        OR sku LIKE 'WK%'
        OR sku LIKE 'PU%'
        OR sku LIKE 'HU%'
        OR sku LIKE 'W%'
        OR sku LIKE 'BF%'
        OR sku LIKE 'LB%'
      )
    ORDER BY sku
    LIMIT 20
  `);

  console.table(r.rows);

  await client.end();

})();
