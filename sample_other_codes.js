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
    descripcion
 FROM elimfilters_catalog
 WHERE codigo_base !~ '^P'
   AND codigo_base !~ '^(LF|FF|HF|AF|FS)'
 LIMIT 100

 `);

 console.table(r.rows);

 await client.end();

})();
