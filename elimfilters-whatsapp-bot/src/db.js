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
        CREATE TABLE IF NOT EXISTS whatsapp_messages (
          event_id TEXT PRIMARY KEY,
          type TEXT NOT NULL DEFAULT 'message',
          phone_number_id TEXT,
          from_number TEXT NOT NULL,
          message_text TEXT NOT NULL,
          message_timestamp BIGINT,
          status TEXT NOT NULL DEFAULT 'pending',
          attempts INTEGER NOT NULL DEFAULT 0,
          response_text TEXT,
          error_text TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          processed_at TIMESTAMPTZ
        )
      `);

      // Create conversation state tables
      await pool.query(`
        CREATE TABLE IF NOT EXISTS conversation_sessions (
          session_id TEXT PRIMARY KEY,
          contact_id TEXT NOT NULL,
          platform TEXT NOT NULL,
          state TEXT NOT NULL DEFAULT 'extraction',
          brand TEXT,
          motor_code TEXT,
          symptom TEXT,
          last_recommended_sku TEXT,
          extracted_entities JSONB,
          context JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          last_activity_at TIMESTAMPTZ DEFAULT NOW(),
          expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
          UNIQUE(contact_id, platform)
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS conversation_logs (
          id SERIAL PRIMARY KEY,
          session_id TEXT NOT NULL REFERENCES conversation_sessions(session_id),
          message_text TEXT,
          extracted_entities JSONB,
          action TEXT,
          response_text TEXT,
          error_message TEXT,
          timestamp TIMESTAMPTZ DEFAULT NOW(),
          FOREIGN KEY (session_id) REFERENCES conversation_sessions(session_id) ON DELETE CASCADE
        )
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_conversation_sessions_contact
        ON conversation_sessions(contact_id, platform)
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
        `INSERT INTO whatsapp_messages (event_id, type, phone_number_id, from_number, message_text, message_timestamp)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (event_id) DO NOTHING`,
        [e.event_id, e.type || 'message', e.phone_number_id, e.from_number, e.message_text, e.message_timestamp]
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
           SELECT event_id FROM whatsapp_messages
           WHERE status = 'pending' AND attempts < 3
           ORDER BY created_at
           FOR UPDATE SKIP LOCKED
           LIMIT $1
         )
         UPDATE whatsapp_messages j
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
        `UPDATE whatsapp_messages
         SET status = 'completed', response_text = $2, processed_at = NOW(), error_text = NULL
         WHERE event_id = $1`,
        [id, response]
      );
    },

    async fail(id, error) {
      await pool.query(
        `UPDATE whatsapp_messages
         SET status = CASE WHEN attempts >= 3 THEN 'failed' ELSE 'pending' END,
             error_text = $2
         WHERE event_id = $1`,
        [id, String(error).slice(0, 1000)]
      );
    },

    async status() {
      const r = await pool.query("SELECT status, COUNT(*)::int AS count FROM whatsapp_messages GROUP BY status");
      return Object.fromEntries(r.rows.map(x => [x.status, x.count]));
    },

    async recentDrafts(limit = 10) {
      const r = await pool.query(
        `SELECT response_text, processed_at FROM whatsapp_messages
         WHERE status = 'completed' AND response_text IS NOT NULL
         ORDER BY processed_at DESC LIMIT $1`,
        [limit]
      );
      return r.rows;
    },

    // ===== PRODUCT SEARCH =====

    async searchByMotor(motorCode) {
      const result = await pool.query(
        `SELECT DISTINCT c.sku, c.product_name, c.filter_type, c.oem_codes, c.competitor_codes,
                c.description, c.media_cdn_url, c.duty, c.beta_ratio, c.micron_rating
         FROM elimfilters_catalog c
         WHERE c.equipment_applications::text ILIKE $1
         LIMIT 5`,
        [`%${motorCode}%`]
      );
      return result.rows;
    },

    async searchByOemCode(oemCode) {
      const result = await pool.query(
        `SELECT DISTINCT c.sku, c.product_name, c.filter_type, c.oem_codes, c.competitor_codes,
                c.description, c.media_cdn_url, c.duty, c.beta_ratio, c.micron_rating
         FROM elimfilters_catalog c
         WHERE c.oem_codes::text ILIKE $1
         LIMIT 5`,
        [`%${oemCode}%`]
      );
      return result.rows;
    },

    async searchByCompetitorCode(competitorCode) {
      const result = await pool.query(
        `SELECT DISTINCT c.sku, c.product_name, c.filter_type, c.oem_codes, c.competitor_codes,
                c.description, c.media_cdn_url, c.duty, c.beta_ratio, c.micron_rating
         FROM elimfilters_catalog c
         WHERE c.competitor_codes::text ILIKE $1
         LIMIT 5`,
        [`%${competitorCode}%`]
      );
      return result.rows;
    },

    async searchBySku(sku) {
      const result = await pool.query(
        `SELECT c.sku, c.product_name, c.filter_type, c.oem_codes, c.competitor_codes,
                c.description, c.media_cdn_url, c.duty, c.beta_ratio, c.micron_rating, c.equipment_applications
         FROM elimfilters_catalog c
         WHERE c.sku = $1
         LIMIT 1`,
        [sku]
      );
      return result.rows[0] || null;
    },

    async searchByKeyword(keyword) {
      const searchTerm = `%${keyword}%`;
      const result = await pool.query(
        `SELECT c.sku, c.product_name, c.filter_type, c.oem_codes, c.competitor_codes,
                c.description, c.media_cdn_url, c.duty, c.beta_ratio, c.micron_rating
         FROM elimfilters_catalog c
         WHERE c.product_name ILIKE $1 OR c.description ILIKE $1 OR c.filter_type ILIKE $1
         LIMIT 5`,
        [searchTerm]
      );
      return result.rows;
    },

    // ===== CONVERSATION STATE =====

    async getOrCreateSession(contactId, platform) {
      let session = await pool.query(
        `SELECT * FROM conversation_sessions
         WHERE contact_id = $1 AND platform = $2 AND expires_at > NOW()`,
        [contactId, platform]
      );

      if (session.rows.length) {
        await pool.query(
          `UPDATE conversation_sessions SET last_activity_at = NOW() WHERE session_id = $1`,
          [session.rows[0].session_id]
        );
        return session.rows[0];
      }

      const sessionId = `${platform}_${contactId}_${Date.now()}`;
      const result = await pool.query(
        `INSERT INTO conversation_sessions (session_id, contact_id, platform)
         VALUES ($1, $2, $3) RETURNING *`,
        [sessionId, contactId, platform]
      );
      return result.rows[0];
    },

    async updateSession(sessionId, updates) {
      const fields = [];
      const values = [];
      let paramCount = 1;

      for (const [key, value] of Object.entries(updates)) {
        if (key === 'extracted_entities' || key === 'context') {
          fields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }

      fields.push('last_activity_at = NOW()');
      values.push(sessionId);

      const result = await pool.query(
        `UPDATE conversation_sessions SET ${fields.join(', ')} WHERE session_id = $${paramCount} RETURNING *`,
        values
      );
      return result.rows[0];
    },

    async logConversationTurn(sessionId, turn) {
      return await pool.query(
        `INSERT INTO conversation_logs (session_id, message_text, extracted_entities, action, response_text, error_message)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          sessionId,
          turn.messageText || null,
          JSON.stringify(turn.extractedEntities || {}),
          turn.action || null,
          turn.responseText || null,
          turn.errorMessage || null
        ]
      );
    },

    async getConversationHistory(sessionId, limit = 10) {
      const result = await pool.query(
        `SELECT message_text, extracted_entities, response_text, timestamp
         FROM conversation_logs WHERE session_id = $1 ORDER BY timestamp DESC LIMIT $2`,
        [sessionId, limit]
      );
      return result.rows.reverse();
    },

    async cleanupExpiredSessions() {
      const result = await pool.query(
        `DELETE FROM conversation_sessions WHERE expires_at < NOW() RETURNING session_id`
      );
      return result.rowCount;
    }
  };
}
