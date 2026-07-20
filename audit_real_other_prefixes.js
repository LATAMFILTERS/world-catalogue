const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
    LEFT(codigo_base,3) pref,
    COUNT(*) qty
 FROM elimfilters_catalog
 WHERE codigo_base !~ '^(P|AF|FF|FS|LF|HF)'
 GROUP BY 1
 ORDER BY 2 DESC

 `);

 console.table(r.rows);

 await client.end();

})();
