const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS kg_industries (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(100) UNIQUE NOT NULL,
      display_name VARCHAR(150) NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS kg_make_industries (
      make_id INTEGER NOT NULL REFERENCES kg_equipment_makes(id),
      industry_id INTEGER NOT NULL REFERENCES kg_industries(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (make_id, industry_id)
    );
  `);

  await client.query(`
    INSERT INTO kg_industries (slug, display_name)
    VALUES
      ('agriculture','Agriculture'),
      ('automotive','Automotive'),
      ('construction','Construction'),
      ('marine','Marine'),
      ('mining','Mining'),
      ('power-generation','Power Generation')
    ON CONFLICT (slug) DO NOTHING;
  `);

  console.log('Industries schema created successfully');

  await client.end();
})();
