const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
    COUNT(*) total,
    COUNT(donaldson_url) with_donaldson_url
 FROM elimfilters_catalog

 `);

 console.table(r.rows);

 await client.end();

})();
