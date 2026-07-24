import pg from "pg";

export function createDb(connectionString) {
  const pool = new pg.Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false }
  });

  return {
    pool,
    async init() {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS linkedin_jobs (
          event_id TEXT PRIMARY KEY,
          event_type TEXT NOT NULL DEFAULT 'comment',
          message_text TEXT NOT NULL,
          author_urn TEXT,
          author_name TEXT,
          target_urn TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          attempts INTEGER NOT NULL DEFAULT 0,
          response_text TEXT,
          error_text TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          processed_at TIMESTAMPTZ
        )
      `);
    },

    async enqueue(e) {
      const r = await pool.query(
        `INSERT INTO linkedin_jobs (event_id, event_type, message_text, author_urn, author_name, target_urn)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (event_id) DO NOTHING`,
        [e.id, e.type || 'comment', e.text, e.authorUrn, e.authorName, e.targetUrn]
      );
      return r.rowCount === 1;
    },

    async claim(limit = 3) {
      const r = await pool.query(
        `WITH selected AS (
           SELECT event_id FROM linkedin_jobs
           WHERE status = 'pending' AND attempts < 3
           ORDER BY created_at
           FOR UPDATE SKIP LOCKED
           LIMIT $1
         )
         UPDATE linkedin_jobs j
         SET status = 'processing', attempts = attempts + 1
         FROM selected
         WHERE j.event_id = selected.event_id
         RETURNING j.*`,
        [limit]
      );
      return r.rows;
    },

    async complete(id, response) {
      await pool.query(
        `UPDATE linkedin_jobs
         SET status = 'completed', response_text = $2, processed_at = NOW(), error_text = NULL
         WHERE event_id = $1`,
        [id, response]
      );
    },

    async fail(id, error) {
      await pool.query(
        `UPDATE linkedin_jobs
         SET status = CASE WHEN attempts >= 3 THEN 'failed' ELSE 'pending' END,
             error_text = $2
         WHERE event_id = $1`,
        [id, String(error).slice(0, 1000)]
      );
    },

    async status() {
      const r = await pool.query("SELECT status, COUNT(*)::int AS count FROM linkedin_jobs GROUP BY status");
      return Object.fromEntries(r.rows.map(x => [x.status, x.count]));
    },

    async recentDrafts(limit = 10) {
      const r = await pool.query(
        `SELECT response_text, processed_at FROM linkedin_jobs
         WHERE status = 'completed' AND response_text IS NOT NULL AND response_text <> 'NO_REPLY'
         ORDER BY processed_at DESC LIMIT $1`,
        [limit]
      );
      return r.rows;
    }
  };
}
