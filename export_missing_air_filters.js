const fs = require("fs");
const { Client } = require("pg");

const air = fs.readFileSync(
  "fleetguard_air_942.txt",
  "utf8"
)
.split(/\r?\n/)
.map(x => x.trim())
.filter(Boolean);

const client = new Client({
  host: "dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com",
  port: 5432,
  database: "catalogo_elimfilters",
  user: "catalogo_elimfilters_user",
  password: "d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf",
  ssl: { rejectUnauthorized: false }
});

(async()=>{

  await client.connect();

  const r = await client.query(`
    SELECT codigo_base
    FROM elimfilters_catalog
    WHERE codigo_base = ANY($1)
  `,[air]);

  const existing = new Set(
    r.rows.map(x => x.codigo_base.toUpperCase())
  );

  const missing = air.filter(
    x => !existing.has(x.toUpperCase())
  );

  fs.writeFileSync(
    "fleetguard_air_missing.txt",
    missing.join("\n")
  );

  console.log("SCRAPER:", air.length);
  console.log("CATALOGO:", existing.size);
  console.log("MISSING:", missing.length);

  await client.end();

})();
