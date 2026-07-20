const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async()=>{

 await client.connect();

 const r = await client.query(`
   SELECT
      COUNT(DISTINCT codigo_base) total
   FROM elimfilters_catalog
   WHERE codigo_base ~ '^(AF|LF|FF|HF|WF|FS)'
 `);

 console.table(r.rows);

 await client.end();

})();
