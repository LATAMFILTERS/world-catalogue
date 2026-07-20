const { Client } = require('pg');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

// DATABASE_URL is preferred; falls back to discrete PG* fields if it isn't
// set. No credentials are hardcoded — the process exits before attempting a
// connection if neither form is fully configured.
function resolveConnectionConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 20000,
    };
  }

  const required = ['PGHOST', 'PGPORT', 'PGDATABASE', 'PGUSER', 'PGPASSWORD'];
  const missing = required.filter(name => !process.env[name]);
  if (missing.length > 0) {
    return null;
  }

  return {
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20000,
  };
}

const connectionConfig = resolveConnectionConfig();

if (!connectionConfig) {
  console.error(
    "Missing database configuration. Set DATABASE_URL, or all of PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD."
  );
  process.exit(1);
}

const sql = `
-- PASO 1 — FIX BASE (OBLIGATORIO)
DROP VIEW IF EXISTS v_learning_signals;

CREATE VIEW v_learning_signals AS
SELECT
  code,
  sku,
  manufacturer,
  status,
  score,
  CASE
    WHEN status IN ('RESOLVED_SINGLE','RESOLVED_TOP') THEN 1
    ELSE 0
  END AS is_positive,
  CASE
    WHEN status IN ('TRUE_COMPETING','WEAK_COMPETITION') THEN 1
    ELSE 0
  END AS is_negative
FROM v_api_resolver_v4;

-- PASO 2 — RECONSTRUIR V5 SIN CAMPOS INVENTADOS
DROP VIEW IF EXISTS v_api_resolver_v5;

CREATE VIEW v_api_resolver_v5 AS
WITH base AS (
  SELECT
    c.*,
    COALESCE(lw.weight, 0.5) AS learned_weight
  FROM v_api_resolver_v4 c
  LEFT JOIN manufacturer_learning_weights lw
    ON lw.manufacturer = c.manufacturer
),

scored AS (
  SELECT
    *,
    score * learned_weight AS adaptive_score
  FROM base
),

ranked AS (
  SELECT
    *,
    MAX(adaptive_score) OVER (PARTITION BY code) AS top_score,
    COUNT(*) OVER (PARTITION BY code) AS total_matches,
    AVG(adaptive_score) OVER (PARTITION BY code) AS avg_score
  FROM scored
)

SELECT
  code,
  sku,
  manufacturer,
  adaptive_score AS score,

  CASE
    WHEN total_matches = 1 THEN 'RESOLVED_SINGLE'
    WHEN adaptive_score >= 0.90 * top_score THEN 'RESOLVED_TOP'
    WHEN adaptive_score >= 0.70 * top_score THEN 'NEAR_MATCH'
    WHEN total_matches <= 2 THEN 'WEAK_COMPETITION'
    ELSE 'TRUE_COMPETING'
  END AS status

FROM ranked;
`;

async function main() {
  const client = new Client(connectionConfig);

  try {
    console.log("Connecting to database...");
    await client.connect();
    console.log("Connected successfully.");

    // Execute each statement separately to avoid multi-statement parse issues
    console.log("Step 1: Dropping v_learning_signals...");
    await client.query('DROP VIEW IF EXISTS v_learning_signals;');

    console.log("Step 1: Creating v_learning_signals...");
    await client.query(`
      CREATE VIEW v_learning_signals AS
      SELECT
        code,
        sku,
        manufacturer,
        status,
        score,
        CASE
          WHEN status IN ('RESOLVED_SINGLE','RESOLVED_TOP') THEN 1
          ELSE 0
        END AS is_positive,
        CASE
          WHEN status IN ('TRUE_COMPETING','WEAK_COMPETITION') THEN 1
          ELSE 0
        END AS is_negative
      FROM v_api_resolver_v4;
    `);
    console.log("v_learning_signals created OK.");

    console.log("Step 2: Dropping v_api_resolver_v5...");
    await client.query('DROP VIEW IF EXISTS v_api_resolver_v5;');

    console.log("Step 2: Creating v_api_resolver_v5...");
    await client.query(`
      CREATE VIEW v_api_resolver_v5 AS
      WITH base AS (
        SELECT
          c.*,
          COALESCE(lw.weight, 0.5) AS learned_weight
        FROM v_api_resolver_v4 c
        LEFT JOIN manufacturer_learning_weights lw
          ON lw.manufacturer = c.manufacturer
      ),
      scored AS (
        SELECT
          *,
          score * learned_weight AS adaptive_score
        FROM base
      ),
      ranked AS (
        SELECT
          *,
          MAX(adaptive_score) OVER (PARTITION BY code) AS top_score,
          COUNT(*) OVER (PARTITION BY code) AS total_matches,
          AVG(adaptive_score) OVER (PARTITION BY code) AS avg_score
        FROM scored
      )
      SELECT
        code,
        sku,
        manufacturer,
        adaptive_score AS score,
        CASE
          WHEN total_matches = 1 THEN 'RESOLVED_SINGLE'
          WHEN adaptive_score >= 0.90 * top_score THEN 'RESOLVED_TOP'
          WHEN adaptive_score >= 0.70 * top_score THEN 'NEAR_MATCH'
          WHEN total_matches <= 2 THEN 'WEAK_COMPETITION'
          ELSE 'TRUE_COMPETING'
        END AS status
      FROM ranked;
    `);
    console.log("v_api_resolver_v5 created OK.");

    // Verify both views exist
    const verify = await client.query(`
      SELECT viewname FROM pg_views
      WHERE viewname IN ('v_learning_signals', 'v_api_resolver_v5')
      ORDER BY viewname;
    `);
    console.log("\nVerification — views confirmed in database:");
    console.table(verify.rows);

  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();

