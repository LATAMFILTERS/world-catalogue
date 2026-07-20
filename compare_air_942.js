const fs = require("fs");
const { Client } = require("pg");

const codes = fs.readFileSync(
  "fleetguard_air_942.txt",
  "utf8"
)
.split(/\r?\n/)
.filter(Boolean);

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized:false }
});

(async()=>{

  await client.connect();

  const r = await client.query(`
    SELECT COUNT(*) total
    FROM elimfilters_catalog
    WHERE codigo_base = ANY($1)
  `,[codes]);

  console.table(r.rows);

  await client.end();

})();
