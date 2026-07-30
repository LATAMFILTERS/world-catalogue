/**
 * Conversation State Machine
 *
 * Manages multi-turn conversations with persistent session state.
 * Each contact/user has a session that tracks:
 * - Extracted entities (brand, motor, symptom)
 * - State transitions (extraction → verification → catalog lookup → response)
 * - Recommended products and context
 * - Session expiry (24 hours)
 */

export function createConversationState({ pool }) {
  return {
    // Initialize conversation tables
    async init() {
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

      // Create index for fast session lookups
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_conversation_sessions_contact
        ON conversation_sessions(contact_id, platform)
      `);
    },

    // Get or create session for a contact
    async getOrCreateSession(contactId, platform) {
      let session = await pool.query(
        `SELECT * FROM conversation_sessions
         WHERE contact_id = $1 AND platform = $2 AND expires_at > NOW()`,
        [contactId, platform]
      );

      if (session.rows.length) {
        // Update last activity
        await pool.query(
          `UPDATE conversation_sessions
           SET last_activity_at = NOW()
           WHERE session_id = $1`,
          [session.rows[0].session_id]
        );
        return session.rows[0];
      }

      // Create new session
      const sessionId = `${platform}_${contactId}_${Date.now()}`;
      const result = await pool.query(
        `INSERT INTO conversation_sessions (session_id, contact_id, platform)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [sessionId, contactId, platform]
      );

      return result.rows[0];
    },

    // Extract entities from message (NLU/regex)
    extractEntities(messageText) {
      const text = messageText.trim().toUpperCase();
      const entities = {};

      // Motor codes: DD60, C15, 6BT, ISX500, MP8, etc.
      const motorMatch = text.match(/\b(DD|C|6BT|ISX|MP8|S)\d{1,4}\b/i);
      if (motorMatch) entities.motor_code = motorMatch[0];

      // Brand detection (Freightliner, Mack, Volvo, Cummins, etc.)
      const brands = ['FREIGHTLINER', 'MACK', 'VOLVO', 'CUMMINS', 'DURAMAX', 'POWERSTROKE', 'FORD', 'CHEVROLET', 'DODGE', 'RAM'];
      for (const brand of brands) {
        if (text.includes(brand)) {
          entities.brand = brand;
          break;
        }
      }

      // OEM codes (P552100, K123456, etc.)
      const oemMatch = text.match(/[A-Z]\d{6,10}/);
      if (oemMatch) entities.oem_code = oemMatch[0];

      // SKU codes (EL82100, etc.)
      const skuMatch = text.match(/EL\d{3,10}/);
      if (skuMatch) entities.sku = skuMatch[0];

      // Symptom/need keywords
      const symptoms = {
        'PRESIÓN': 'low_pressure',
        'FUGAS': 'leaks',
        'RUIDO': 'noise',
        'HUMO': 'smoke',
        'MANTENIMIENTO': 'maintenance',
        'CAMBIO': 'replacement',
        'LIMPIEZA': 'cleaning',
        'CONTAMINACIÓN': 'contamination'
      };
      for (const [keyword, symptom] of Object.entries(symptoms)) {
        if (text.includes(keyword)) {
          entities.symptom = symptom;
          break;
        }
      }

      return entities;
    },

    // Update session state machine
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

      return await pool.query(
        `UPDATE conversation_sessions
         SET ${fields.join(', ')}
         WHERE session_id = $${paramCount}
         RETURNING *`,
        values
      );
    },

    // Log conversation turn for auditing
    async logConversationTurn(sessionId, turn) {
      return await pool.query(
        `INSERT INTO conversation_logs
         (session_id, message_text, extracted_entities, action, response_text, error_message)
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

    // Get conversation history for context
    async getConversationHistory(sessionId, limit = 10) {
      const result = await pool.query(
        `SELECT message_text, extracted_entities, response_text, timestamp
         FROM conversation_logs
         WHERE session_id = $1
         ORDER BY timestamp DESC
         LIMIT $2`,
        [sessionId, limit]
      );
      return result.rows.reverse();
    },

    // Clean up expired sessions
    async cleanupExpiredSessions() {
      const result = await pool.query(
        `DELETE FROM conversation_sessions
         WHERE expires_at < NOW()
         RETURNING session_id`
      );
      return result.rowCount;
    }
  };
}
