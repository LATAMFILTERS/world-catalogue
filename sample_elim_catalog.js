const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT *
 FROM elimfilters_catalog
 LIMIT 10

 `);

 console.table(r.rows);

 await client.end();

})();
