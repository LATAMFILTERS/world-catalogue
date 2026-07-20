const { Client } = require("pg");
const fs = require("fs");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
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
