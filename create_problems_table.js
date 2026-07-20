const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {

  await client.connect();

  await client.query(`

    CREATE TABLE IF NOT EXISTS kg_problems (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(100) UNIQUE NOT NULL,
      display_name VARCHAR(150) NOT NULL,
      description TEXT,
      severity VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

  `);

  console.log("kg_problems created");

  await client.end();

})();
