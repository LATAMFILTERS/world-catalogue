const { Client } = require("pg");
const fs = require("fs");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {

  await client.connect();

  const r = await client.query(`
    SELECT *
    FROM cross_reference_master
    WHERE fleetguard_part IS NOT NULL
      AND donaldson_part IS NULL
  `);

  fs.writeFileSync(
    "fleetguard_orphans.json",
    JSON.stringify(r.rows,null,2)
  );

  console.log("Exported:", r.rows.length);

  await client.end();

})();
