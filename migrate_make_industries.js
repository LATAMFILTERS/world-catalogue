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
