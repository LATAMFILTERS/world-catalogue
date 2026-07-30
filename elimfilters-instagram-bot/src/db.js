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
        CREATE TABLE IF NOT EXISTS b2b_distributor_leads (
          id SERIAL PRIMARY KEY,
          source_channel TEXT NOT NULL,
          company_name TEXT,
          contact_name TEXT,
          phone_or_email TEXT,
          country TEXT,
          city TEXT,
          estimated_volume TEXT,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

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

      // Propagate Heavy Duty equipment applications across cross-references automatically
      try {
        await pool.query(`
          WITH crossref_fitments AS (
            SELECT DISTINCT
              c1.sku AS target_sku,
              app_elem AS inherited_app
            FROM elimfilters_catalog c1
            JOIN elimfilters_catalog c2 ON (
              c1.oem_codes && c2.oem_codes 
              OR c1.competitor_codes && c2.competitor_codes
            )
            CROSS JOIN LATERAL jsonb_array_elements(c2.equipment_applications) AS app_elem
            WHERE c1.duty = 'HEAVY_DUTY'
              AND (c1.equipment_applications IS NULL OR jsonb_array_length(c1.equipment_applications) = 0)
              AND c2.equipment_applications IS NOT NULL 
              AND jsonb_array_length(c2.equipment_applications) > 0
          ),
          aggregated_fitments AS (
            SELECT 
              target_sku,
              jsonb_agg(inherited_app) AS new_applications
            FROM crossref_fitments
            GROUP BY target_sku
          )
          UPDATE elimfilters_catalog c
          SET equipment_applications = af.new_applications
          FROM aggregated_fitments af
          WHERE c.sku = af.target_sku
        `);
      } catch (err) {
        console.error("HD application propagation error:", err.message);
      }
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

    async recordB2BLead(lead) {
      const r = await pool.query(
        `INSERT INTO b2b_distributor_leads (source_channel, company_name, contact_name, phone_or_email, country, city, estimated_volume, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          lead.sourceChannel || 'linkedin',
          lead.companyName || null,
          lead.contactName || null,
          lead.phoneOrEmail || null,
          lead.country || null,
          lead.city || null,
          lead.estimatedVolume || null,
          lead.notes || null
        ]
      );
      return r.rows[0].id;
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
