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
          "from" TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          attempts INTEGER NOT NULL DEFAULT 0,
          response_text TEXT,
          error_text TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          processed_at TIMESTAMPTZ
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS elimfilters_catalog (
          sku TEXT PRIMARY KEY,
          product_name TEXT NOT NULL,
          filter_type TEXT,
          oem_codes JSONB,
          competitor_codes JSONB,
          description TEXT,
          duty TEXT,
          equipment_applications JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS conversation_history (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          platform TEXT NOT NULL,
          role TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          INDEX idx_user_platform (user_id, platform, created_at DESC)
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
        `INSERT INTO linkedin_jobs (event_id, event_type, message_text, author_urn, author_name, target_urn, "from")
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (event_id) DO NOTHING`,
        [e.id, e.type || 'comment', e.text, e.authorUrn || e.from, e.authorName || e.fromName, e.targetUrn, e.from]
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
    },

    async searchByOemCode(oemCode) {
      console.log(`[DB] Searching OEM code: ${oemCode}`);
      const r = await pool.query(
        `SELECT sku, product_name, filter_type, oem_codes, competitor_codes, description
         FROM elimfilters_catalog
         WHERE LOWER(oem_codes::text) LIKE LOWER($1)
         LIMIT 5`,
        [`%${oemCode}%`]
      );
      console.log(`[DB] Found ${r.rows.length} results for OEM code ${oemCode}`);
      return r.rows;
    },

    async searchByCompetitorCode(competitorCode) {
      console.log(`[DB] Searching competitor code: ${competitorCode}`);
      const r = await pool.query(
        `SELECT sku, product_name, filter_type, oem_codes, competitor_codes, description
         FROM elimfilters_catalog
         WHERE LOWER(competitor_codes::text) LIKE LOWER($1)
         LIMIT 5`,
        [`%${competitorCode}%`]
      );
      console.log(`[DB] Found ${r.rows.length} results for competitor code ${competitorCode}`);
      return r.rows;
    },

    async searchBySku(sku) {
      const r = await pool.query(
        `SELECT sku, product_name, filter_type, oem_codes, competitor_codes, description
         FROM elimfilters_catalog
         WHERE sku = $1`,
        [sku]
      );
      return r.rows[0] || null;
    },

    async searchByKeyword(keyword) {
      console.log(`[DB] Keyword search: ${keyword}`);
      const r = await pool.query(
        `SELECT sku, product_name, filter_type, oem_codes, competitor_codes, description, equipment_applications
         FROM elimfilters_catalog
         WHERE product_name ILIKE $1
            OR description ILIKE $1
            OR equipment_applications::text ILIKE $2
         LIMIT 5`,
        [`%${keyword}%`, `%${keyword}%`]
      );
      console.log(`[DB] Keyword search found ${r.rows.length} results`);
      return r.rows;
    },

    async searchByMotor(motorCode) {
      console.log(`[DB] Searching motor/application: ${motorCode}`);

      // Map common motor codes to full names
      const motorMap = {
        'DD60': 'DETROIT DIESEL SERIES 60',
        'DD50': 'DETROIT DIESEL SERIES 50',
        'DD12': 'DETROIT DIESEL 12',
        'C15': 'CATERPILLAR C15',
        'C13': 'CATERPILLAR C13',
        'C12': 'CATERPILLAR C12',
        'CUMMINS': 'CUMMINS',
        'MERCEDES': 'MERCEDES-BENZ'
      };

      // Extract potential motor codes from text
      let searchTerms = [motorCode];
      for (const [abbrev, fullName] of Object.entries(motorMap)) {
        if (motorCode.toUpperCase().includes(abbrev)) {
          searchTerms.push(fullName);
        }
      }

      console.log(`[DB] Motor search terms: ${searchTerms.join(', ')}`);

      // Build OR conditions for each search term
      const conditions = searchTerms.map((_, i) => `equipment_applications::text ILIKE $${i + 1}`).join(' OR ');
      const query = `SELECT sku, product_name, filter_type, oem_codes, competitor_codes, description, equipment_applications
                     FROM elimfilters_catalog
                     WHERE ${conditions}
                     LIMIT 5`;

      const r = await pool.query(query, searchTerms.map(term => `%${term}%`));
      console.log(`[DB] Found ${r.rows.length} results for motor ${motorCode}`);
      return r.rows;
    },

    async saveConversation(userId, platform, role, message) {
      await pool.query(
        `INSERT INTO conversation_history (user_id, platform, role, message)
         VALUES ($1, $2, $3, $4)`,
        [userId, platform, role, message]
      );
    },

    async getConversationHistory(userId, platform, limit = 10) {
      const r = await pool.query(
        `SELECT role, message, created_at FROM conversation_history
         WHERE user_id = $1 AND platform = $2
         ORDER BY created_at DESC
         LIMIT $3`,
        [userId, platform, limit]
      );
      return r.rows.reverse();
    }
  };
}
