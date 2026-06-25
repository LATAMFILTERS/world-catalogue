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
      filter_type,
      COUNT(*) total
    FROM elimfilters_catalog
    WHERE codigo_base LIKE 'LF%'
       OR codigo_base LIKE 'FF%'
       OR codigo_base LIKE 'HF%'
       OR codigo_base LIKE 'AF%'
       OR codigo_base LIKE 'WF%'
    GROUP BY filter_type
    ORDER BY total DESC
  `);

  console.table(r.rows);

  await client.end();

})();
