const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
    COUNT(*) total_fleetguard
 FROM elimfilters_catalog
 WHERE codigo_base ~ '^(AF|LF|FF|HF|FS)'

 `);

 console.table(r.rows);

 await client.end();

})();
