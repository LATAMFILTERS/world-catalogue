const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async()=>{

 await client.connect();

 const r = await client.query(`
   SELECT COUNT(*) total
   FROM mann_oem_clean
 `);

 console.table(r.rows);

 await client.end();

})();
