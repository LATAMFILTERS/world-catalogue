const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {

  await client.connect();

  await client.query(`

    CREATE TABLE IF NOT EXISTS kg_problem_systems (
      problem_id INTEGER NOT NULL REFERENCES kg_problems(id),
      system_id INTEGER NOT NULL REFERENCES kg_systems(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),

      PRIMARY KEY(problem_id, system_id)
    );

  `);

  console.log("kg_problem_systems created");

  await client.end();

})();
