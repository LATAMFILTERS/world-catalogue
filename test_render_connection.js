const { Client } = require("pg");

const client = new Client({
  host: "dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com",
  port: 5432,
  database: "catalogo_elimfilters",
  user: "catalogo_elimfilters_user",
  password: "d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf",
  ssl: false,
  connectionTimeoutMillis: 15000
});

(async()=>{

  try {

    await client.connect();

    const r = await client.query(`
      SELECT NOW()
    `);

    console.table(r.rows);

  } catch(err){

    console.error(err);

  } finally {

    await client.end().catch(()=>{});

  }

})();
