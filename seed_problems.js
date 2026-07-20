const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {

  await client.connect();

  await client.query(`
    INSERT INTO kg_problems
    (slug, display_name, severity)
    VALUES
    ('water-contamination','Water Contamination','critical'),
    ('fuel-contamination','Fuel Contamination','critical'),
    ('hydraulic-contamination','Hydraulic Contamination','critical'),
    ('dust-ingestion','Dust Ingestion','high'),
    ('air-restriction','Air Restriction','high'),
    ('oil-degradation','Oil Degradation','high'),
    ('coolant-degradation','Coolant Degradation','high'),
    ('particle-ingress','Particle Ingress','critical'),
    ('premature-wear','Premature Wear','critical'),
    ('corrosion','Corrosion','high'),
    ('cavitation','Cavitation','high'),
    ('filter-collapse','Filter Collapse','critical')
    ON CONFLICT (slug) DO NOTHING
  `);

  console.log("Problems loaded");

  await client.end();

})();
