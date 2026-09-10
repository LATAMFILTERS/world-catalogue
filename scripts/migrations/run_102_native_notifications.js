'use strict';

require('dotenv').config();
const { Pool } = require('pg');

async function installNativeNotifications() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.system_notifications (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        source_system text NOT NULL DEFAULT 'WORLD_CATALOGUE',
        notification_type text NOT NULL,
        priority text NOT NULL DEFAULT 'INFO' CHECK (priority IN ('INFO','WARNING','HIGH','CRITICAL')),
        module text NOT NULL,
        title text NOT NULL,
        message text NOT NULL,
        recipient_key text NOT NULL,
        entity_type text,
        entity_id text,
        deep_link text,
        status text NOT NULL DEFAULT 'UNREAD' CHECK (status IN ('UNREAD','READ','ACKNOWLEDGED','RESOLVED')),
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        dedupe_key text,
        created_at timestamptz NOT NULL DEFAULT now(),
        read_at timestamptz,
        acknowledged_at timestamptz,
        resolved_at timestamptz,
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS uq_system_notifications_dedupe
        ON public.system_notifications(dedupe_key) WHERE dedupe_key IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_system_notifications_recipient_status
        ON public.system_notifications(recipient_key,status,created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_system_notifications_priority
        ON public.system_notifications(priority,created_at DESC);
    `);
    return { migration: '102_NATIVE_NOTIFICATIONS', status: 'INSTALLED' };
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  installNativeNotifications().then(r => console.log(JSON.stringify(r))).catch(e => { console.error(e.code || e.name || 'ERROR'); process.exit(1); });
}

module.exports = { installNativeNotifications };
