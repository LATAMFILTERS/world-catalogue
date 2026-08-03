const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 2,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 3000
    });
  }
  return pool;
}

function normalizeQuery(value) {
  return String(value || '').trim().toUpperCase().replace(/[-\s]/g, '');
}

function installFastAutocomplete(app) {
  app.get('/api/autocomplete', async (req, res) => {
    const q = normalizeQuery(req.query.q);
    if (q.length < 2) return res.json([]);

    try {
      const { rows } = await getPool().query(
        `SELECT text, type
           FROM (
             SELECT sku AS text, 'ELIMFILTERS'::text AS type, 1 AS priority
               FROM elimfilters_catalog
              WHERE sku IS NOT NULL
                AND upper(replace(replace(sku, '-', ''), ' ', '')) LIKE $1
             UNION ALL
             SELECT codigo_base AS text, 'BASE'::text AS type, 2 AS priority
               FROM elimfilters_catalog
              WHERE codigo_base IS NOT NULL
                AND upper(replace(replace(codigo_base, '-', ''), ' ', '')) LIKE $1
           ) suggestions
          WHERE text IS NOT NULL AND text <> ''
          GROUP BY text, type, priority
          ORDER BY priority, length(text), text
          LIMIT 8`,
        [`${q}%`]
      );

      return res.json(rows.map(row => ({ text: row.text, type: row.type })));
    } catch (error) {
      console.error('[autocomplete-fast]', error.message);
      return res.json([]);
    }
  });
}

module.exports = { installFastAutocomplete, normalizeQuery };
