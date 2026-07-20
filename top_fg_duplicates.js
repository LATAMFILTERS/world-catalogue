const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
    codigo_base,
    COUNT(*) qty
 FROM elimfilters_catalog
 WHERE codigo_base ~ '^(LF|FF|HF|AF|FS)'
 GROUP BY codigo_base
 ORDER BY qty DESC
 LIMIT 20

 `);

 console.table(r.rows);

 await client.end();

})();
