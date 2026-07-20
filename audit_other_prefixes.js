const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
    LEFT(codigo_base,3) prefijo,
    COUNT(*) total
 FROM elimfilters_catalog
 WHERE codigo_base !~ '^P'
   AND codigo_base !~ '^(LF|FF|HF|AF|FS)'
 GROUP BY 1
 ORDER BY total DESC

 `);

 console.table(r.rows);

 await client.end();

})();
