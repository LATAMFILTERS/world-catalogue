const { withProtocolClient } = require('./bot-protocol-db');

function normalizeQuery(value) {
  return String(value || '').trim().toUpperCase();
}

function installFastAutocomplete(app) {
  app.get('/api/autocomplete', async (req, res) => {
    const q = normalizeQuery(req.query.q);
    if (q.length < 2) return res.json([]);

    try {
      const rows = await withProtocolClient(async client => {
        const result = await client.query(
          `SELECT text, type
             FROM (
               SELECT sku AS text, 'ELIMFILTERS'::text AS type, 1 AS priority
                 FROM elimfilters_catalog
                WHERE sku >= $1 AND sku < $2
               UNION ALL
               SELECT codigo_base AS text, 'BASE'::text AS type, 2 AS priority
                 FROM elimfilters_catalog
                WHERE codigo_base >= $1 AND codigo_base < $2
             ) suggestions
            WHERE text IS NOT NULL AND text <> ''
            GROUP BY text, type, priority
            ORDER BY priority, length(text), text
            LIMIT 8`,
          [q, `${q}\uffff`]
        );
        return result.rows;
      }, { statementTimeoutMs: 700 });

      return res.json(rows.map(row => ({ text: row.text, type: row.type })));
    } catch (error) {
      console.error('[autocomplete-fast]', error.message);
      return res.json([]);
    }
  });
}

module.exports = { installFastAutocomplete, normalizeQuery };
