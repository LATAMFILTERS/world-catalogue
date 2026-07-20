const fs = require("fs");
const { Client } = require("pg");

console.log("START");

const input = fs.readFileSync("fleetguard_air_942.txt","utf8")
  .split(/\r?\n/)
  .map(x => x.trim().toUpperCase())
  .filter(Boolean);

console.log("INPUT", input.length);

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized:false },
  connectionTimeoutMillis: 15000,
  query_timeout: 60000
});

(async()=>{

  try {
    console.log("CONNECTING");
    await client.connect();
    console.log("CONNECTED");

    const r = await client.query(`
      WITH input(code) AS (
        SELECT unnest($1::text[])
      ),
      missing AS (
        SELECT i.code
        FROM input i
        LEFT JOIN elimfilters_catalog e
          ON UPPER(e.codigo_base) = i.code
        WHERE e.codigo_base IS NULL
      )
      SELECT
        COUNT(*) missing_total
      FROM missing
    `,[input]);

    console.table(r.rows);

    await client.end();
    console.log("DONE");
  } catch (err) {
    console.error("ERROR:", err.message);
    console.error(err);
    try { await client.end(); } catch(e) {}
    process.exit(1);
  }

})();
