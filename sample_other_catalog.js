const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
    codigo_base,
    sku,
    description
 FROM elimfilters_catalog
 WHERE codigo_base !~ '^(P|AF|FF|FS|LF|HF)'
 LIMIT 100

 `);

 console.table(r.rows);

 await client.end();

})();
