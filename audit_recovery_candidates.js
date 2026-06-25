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

  const r = await client.query(`
    SELECT
      fleetguard_part,
      COUNT(*) oems,
      STRING_AGG(DISTINCT oem_brand, ', ') brands
    FROM cross_reference_master
    WHERE fleetguard_part IS NOT NULL
      AND donaldson_part IS NULL
    GROUP BY fleetguard_part
    ORDER BY COUNT(*) DESC
  `);

  console.table(r.rows);

  await client.end();

})();
