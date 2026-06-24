const fs = require("fs");
const { Client } = require("pg");

console.log("START");

const input = fs.readFileSync("fleetguard_air_942.txt","utf8")
  .split(/\r?\n/)
  .map(x => x.trim().toUpperCase())
  .filter(Boolean);

console.log("INPUT", input.length);

const client = new Client({
  host: "dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com",
  port: 5432,
  database: "catalogo_elimfilters",
  user: "catalogo_elimfilters_user",
  password: "d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf",
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
