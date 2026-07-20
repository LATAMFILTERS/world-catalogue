const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
     table_name
 FROM information_schema.columns
 WHERE column_name ILIKE '%donaldson%'
 ORDER BY table_name

 `);

 console.table(r.rows);

 await client.end();

})();
