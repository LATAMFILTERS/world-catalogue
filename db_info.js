const { Client } = require("pg");

const client = new Client({
  host: "ballast.proxy.rlwy.net",
  port: 18263,
  database: "railway",
  user: "postgres",
  password: "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  const r = await client.query(`
    SELECT current_database(),
           current_schema(),
           version()
  `);

  console.log(r.rows[0]);

  await client.end();
})();
