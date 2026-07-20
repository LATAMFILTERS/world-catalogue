const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
    filter_type,
    COUNT(*) qty
 FROM elimfilters_catalog
 GROUP BY 1
 ORDER BY 2 DESC

 `);

 console.table(r.rows);

 await client.end();

})();
