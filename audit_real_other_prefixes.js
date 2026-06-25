const { Client } = require("pg");

const client = new Client({
 connectionString:"postgresql://catalogo_elimfilters_user:d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf@dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com/catalogo_elimfilters?sslmode=require"
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
