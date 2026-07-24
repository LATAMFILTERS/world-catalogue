import pg from "pg";

export function createStore(databaseUrl) {
  const pool = databaseUrl ? new pg.Pool({connectionString: databaseUrl, ssl: {rejectUnauthorized: false}}) : null;

  return {
    async init() {
      if (!pool) return;
      await pool.query(`CREATE TABLE IF NOT EXISTS facebook_bot_events (
        event_id text PRIMARY KEY,
        event_type text NOT NULL,
        sender_id text,
        source_text text NOT NULL,
        reply_text text,
        status text NOT NULL DEFAULT 'received',
        error_text text,
        created_at timestamptz NOT NULL DEFAULT now(),
        processed_at timestamptz
      )`);
    },
    async claim(event) {
      if (!pool) return true;
      const result = await pool.query(
        `INSERT INTO facebook_bot_events(event_id,event_type,sender_id,source_text)
         VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING RETURNING event_id`,
        [event.eventId, event.type || "comment", event.senderId, event.text]
      );
      return result.rowCount === 1;
    },
    async complete(eventId, replyText, status = "sent") {
      if (!pool) return;
      await pool.query(
        `UPDATE facebook_bot_events SET reply_text=$2,status=$3,processed_at=now() WHERE event_id=$1`,
        [eventId, replyText, status]
      );
    },
    async fail(eventId, error) {
      if (!pool) return;
      await pool.query(
        `UPDATE facebook_bot_events SET status='failed',error_text=$2,processed_at=now() WHERE event_id=$1`,
        [eventId, String(error).slice(0, 2000)]
      );
    },
    async status() {
      if (!pool) return {enabled: false};
      await pool.query("SELECT 1");
      return {enabled: true, connected: true};
    }
  };
}
