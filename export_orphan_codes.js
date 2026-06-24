const { Client } = require("pg");
const fs = require("fs");

const client = new Client({
  host: "dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com",
  port: 5432,
  database: "catalogo_elimfilters",
  user: "catalogo_elimfilters_user",
  password: "d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf",
  ssl: { rejectUnauthorized: false }
});

(async () => {

  await client.connect();

  const r = await client.query(`
    SELECT DISTINCT fleetguard_part
    FROM cross_reference_master
    WHERE fleetguard_part IS NOT NULL
      AND donaldson_part IS NULL
    ORDER BY fleetguard_part
  `);

  fs.writeFileSync(
    "fleetguard_orphans.txt",
    r.rows.map(x => x.fleetguard_part).join("\n")
  );

  console.log("Unique Fleetguard:", r.rows.length);

  await client.end();

})();
