const { Client } = require("pg");

const client = new Client({
  host: "dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com",
  port: 5432,
  database: "catalogo_elimfilters",
  user: "catalogo_elimfilters_user",
  password: "d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf",
  ssl: { rejectUnauthorized: false }
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
   COUNT(DISTINCT m.sku) mann_with_don

 FROM mann_oem_clean m

 JOIN oem_codes_clean d
   ON d.code = m.oem_normalized

 `);

 console.table(r.rows);

 await client.end();

})();
