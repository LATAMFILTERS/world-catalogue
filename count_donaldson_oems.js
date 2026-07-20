const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async()=>{

 await client.connect();

 const r = await client.query(`
   SELECT COUNT(DISTINCT oem_normalized) total
   FROM oem_codes_clean
 `);

 console.table(r.rows);

 await client.end();

})();
