const { Client } = require("pg");

const client = new Client({
 connectionString:process.env.DATABASE_URL
});

(async()=>{

 await client.connect();

 const r = await client.query(`

 SELECT
     COUNT(DISTINCT mann_part) mann_parts,
     COUNT(DISTINCT donaldson_part) donaldson_parts
 FROM mann_donaldson_matches

 `);

 console.table(r.rows);

 await client.end();

})();
