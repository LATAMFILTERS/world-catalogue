const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async()=>{

  await client.connect();

  const r = await client.query(`
    SELECT COUNT(*) total
    FROM elimfilters_catalog
    WHERE codigo_base LIKE 'LF%'
       OR codigo_base LIKE 'FF%'
       OR codigo_base LIKE 'HF%'
       OR codigo_base LIKE 'AF%'
       OR codigo_base LIKE 'WF%'
  `);

  console.table(r.rows);

  await client.end();

})();
