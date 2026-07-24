import pg from 'pg';

const { Pool } = pg;

export function createDatabase(config) {
  if (!config.databaseUrl) {
    return {
      enabled: false,
      async init() {},
      async claim() { return true; },
      async complete() {},
      async fail() {},
      async ping() { return false; },
    };
  }

  const pool = new Pool({ connectionString: config.databaseUrl, ssl: { rejectUnauthorized: false } });

  return {
    enabled: true,
    async init() {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS facebook_bot_events (
          event_id TEXT PRIMARY KEY,
          event_type TEXT NOT NULL,
          sender_id TEXT,
          input_text TEXT NOT NULL,
          reply_text TEXT,
          status TEXT NOT NULL DEFAULT 'processing',
          error TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
    },
    async claim(event) {
      const result = await pool.query(
        `INSERT INTO facebook_bot_events(event_id,event_type,sender_id,input_text)
         VALUES($1,$2,$3,$4)
         ON CONFLICT(event_id) DO NOTHING
         RETURNING event_id`,
        [event.eventId, event.type, event.senderId, event.text],
      );
      return result.rowCount === 1;
    },
    async complete(eventId, reply) {
      await pool.query(
        `UPDATE facebook_bot_events SET status='completed', reply_text=$2, updated_at=NOW() WHERE event_id=$1`,
        [eventId, reply],
      );
    },
    async fail(eventId, error) {
      await pool.query(
        `UPDATE facebook_bot_events SET status='failed', error=$2, updated_at=NOW() WHERE event_id=$1`,
        [eventId, String(error).slice(0, 2000)],
      );
    },
    async ping() {
      await pool.query('SELECT 1');
      return true;
    },
  };
}
