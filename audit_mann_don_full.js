const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async()=>{

  await client.connect();

  const r = await client.query(`
    SELECT
      COUNT(*) total_rows,
      COUNT(DISTINCT mann_part) mann_parts,
      COUNT(DISTINCT donaldson_part) don_parts
    FROM mann_donaldson_matches
  `);

  console.table(r.rows);

  await client.end();

})();
