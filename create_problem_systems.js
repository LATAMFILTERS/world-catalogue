const { Client } = require("pg");

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
