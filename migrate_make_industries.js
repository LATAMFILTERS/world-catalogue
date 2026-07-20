const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {

  await client.connect();

  const makes = await client.query(`
    SELECT id, industry_type
    FROM kg_equipment_makes
    WHERE industry_type IS NOT NULL
  `);

  let inserted = 0;

  for (const make of makes.rows) {

    const industries = make.industry_type
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);

    for (const slug of industries) {

      const industry = await client.query(`
        SELECT id
        FROM kg_industries
        WHERE slug = $1
      `,[slug]);

      if (industry.rows.length === 0) continue;

      await client.query(`
        INSERT INTO kg_make_industries
        (make_id, industry_id)
        VALUES ($1,$2)
        ON CONFLICT DO NOTHING
      `,[make.id, industry.rows[0].id]);

      inserted++;
    }
  }

  console.log("Relations created:", inserted);

  await client.end();

})();
