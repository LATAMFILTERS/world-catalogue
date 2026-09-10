'use strict';

const { Pool } = require('pg');

let pool;
function getPool() {
  if (!pool) {
    const connectionString = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
    if (!connectionString) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 3 });
  }
  return pool;
}

const PRIORITIES = new Set(['INFO','WARNING','HIGH','CRITICAL']);
const STATUSES = new Set(['UNREAD','READ','ACKNOWLEDGED','RESOLVED']);
const TYPES = new Set([
  'CATALOG_GAP','TECHNOLOGY_CONFLICT','CROSS_REFERENCE_WEAK','APPLICATION_GAP',
  'PART_SEARCH_ERROR','SITE_HEALTH','KNOWLEDGE_REVIEW','NODAL_REVIEW',
  'DEPLOY_FAILURE','ROLLBACK','HERMES_HEALTH','HERMES_RESEARCH','WORLD_EVENT'
]);

function clean(value, max = 3000) {
  if (value == null) return null;
  const s = String(value).trim();
  return s ? s.slice(0,max) : null;
}

async function createNotification(input = {}) {
  const db = getPool();
  const priority = (clean(input.priority,20) || 'INFO').toUpperCase();
  if (!PRIORITIES.has(priority)) throw new Error('invalid notification priority');
  const notificationType = (clean(input.notificationType,120) || 'WORLD_EVENT').toUpperCase();
  if (!TYPES.has(notificationType)) throw new Error('invalid notification type');
  const module = clean(input.module,120);
  const title = clean(input.title,240);
  const message = clean(input.message,4000);
  const recipientKey = (clean(input.recipientKey,120) || 'CEO').toUpperCase();
  if (!module || !title || !message) throw new Error('module, title and message are required');
  const result = await db.query(`
    INSERT INTO public.system_notifications(
      source_system,notification_type,priority,module,title,message,recipient_key,
      entity_type,entity_id,deep_link,metadata,dedupe_key
    ) VALUES('WORLD_CATALOGUE',$1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11)
    ON CONFLICT (dedupe_key) WHERE dedupe_key IS NOT NULL
    DO UPDATE SET updated_at=public.system_notifications.updated_at
    RETURNING *`,[
      notificationType,priority,module,title,message,recipientKey,
      clean(input.entityType,120),clean(input.entityId,240),clean(input.deepLink,1000),
      JSON.stringify(input.metadata || {}),clean(input.dedupeKey,500)
    ]);
  return result.rows[0];
}

async function safeNotify(input = {}) {
  try { return await createNotification(input); }
  catch (error) { console.error('[world-notifications]', error.code || error.name || 'NOTIFICATION_ERROR'); return null; }
}

async function listNotifications(query = {}) {
  const db = getPool();
  const where = [];
  const values = [];
  for (const [key,column,max] of [
    ['recipientKey','recipient_key',120],['status','status',30],['priority','priority',30],['notificationType','notification_type',120]
  ]) {
    if (query[key]) { values.push(clean(query[key],max).toUpperCase()); where.push(`${column}=$${values.length}`); }
  }
  values.push(Math.min(Math.max(Number(query.limit)||50,1),200));
  const result = await db.query(`SELECT * FROM public.system_notifications ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC LIMIT $${values.length}`,values);
  return result.rows;
}

async function updateNotificationStatus(id,status) {
  const db = getPool();
  const next = String(status || '').toUpperCase();
  if (!STATUSES.has(next)) throw new Error('invalid notification status');
  const col = next === 'READ' ? 'read_at' : next === 'ACKNOWLEDGED' ? 'acknowledged_at' : next === 'RESOLVED' ? 'resolved_at' : null;
  const stamp = col ? `,${col}=COALESCE(${col},now())` : '';
  const result = await db.query(`UPDATE public.system_notifications SET status=$2,updated_at=now()${stamp} WHERE id=$1 RETURNING *`,[id,next]);
  if (!result.rowCount) throw new Error('notification not found');
  return result.rows[0];
}

async function summary(recipientKey = null) {
  const db = getPool();
  const values = [];
  const where = recipientKey ? (values.push(String(recipientKey).toUpperCase()), 'WHERE recipient_key=$1') : '';
  const result = await db.query(`SELECT count(*)::int total,count(*) FILTER(WHERE status='UNREAD')::int unread,count(*) FILTER(WHERE priority='HIGH' AND status<>'RESOLVED')::int high_open,count(*) FILTER(WHERE priority='CRITICAL' AND status<>'RESOLVED')::int critical_open FROM public.system_notifications ${where}`,values);
  return result.rows[0];
}

module.exports = { createNotification, safeNotify, listNotifications, updateNotificationStatus, summary };
