const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
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
