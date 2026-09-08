#!/usr/bin/env node
import process from 'node:process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Pool } from 'pg';
import { isoWeekKey, hasSentThisWeek } from './weekly-send-guard-core.mjs';

const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 2 });

async function ensureSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.hermes_runtime_nodes (
      node_id text PRIMARY KEY,
      role text NOT NULL,
      status text NOT NULL,
      heartbeat_at timestamptz NOT NULL DEFAULT now(),
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.hermes_weekly_runs (
      iso_week text PRIMARY KEY,
      owner_node text,
      owner_role text,
      state text NOT NULL DEFAULT 'PENDING',
      claimed_at timestamptz,
      lease_expires_at timestamptz,
      completed_at timestamptz,
      last_error text,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

export async function publishHeartbeat({ nodeId, role, status = 'OK', metadata = {} }) {
  const client = await pool.connect();
  try {
    await ensureSchema(client);
    const { rows } = await client.query(`
      INSERT INTO public.hermes_runtime_nodes(node_id, role, status, heartbeat_at, metadata, updated_at)
      VALUES($1,$2,$3,now(),$4::jsonb,now())
      ON CONFLICT(node_id) DO UPDATE SET
        role=excluded.role,
        status=excluded.status,
        heartbeat_at=now(),
        metadata=excluded.metadata,
        updated_at=now()
      RETURNING node_id, role, status, heartbeat_at, metadata
    `, [nodeId, role, status, JSON.stringify(metadata)]);
    return rows[0];
  } finally { client.release(); }
}

export async function getNodeHeartbeat(nodeId) {
  const client = await pool.connect();
  try {
    await ensureSchema(client);
    const { rows } = await client.query(`
      SELECT node_id, role, status, heartbeat_at, metadata,
             extract(epoch from (now() - heartbeat_at))/60.0 AS age_minutes
      FROM public.hermes_runtime_nodes
      WHERE node_id=$1
    `, [nodeId]);
    return rows[0] || null;
  } finally { client.release(); }
}

export async function claimWeeklyRun({ nodeId, role, leaseHours = 6 }) {
  const client = await pool.connect();
  const week = isoWeekKey(new Date());
  try {
    await ensureSchema(client);
    await client.query('BEGIN');
    await client.query(`SELECT pg_advisory_xact_lock(hashtext('ELIMFILTERS_HERMES_WEEKLY_HA'))`);

    const legacy = hasSentThisWeek();
    if (legacy.sent) {
      await client.query(`
        INSERT INTO public.hermes_weekly_runs(iso_week, owner_node, owner_role, state, completed_at, updated_at)
        VALUES($1,'LEGACY_GIT_STATE','PRIMARY','COMPLETED',now(),now())
        ON CONFLICT(iso_week) DO UPDATE SET
          state='COMPLETED', completed_at=coalesce(hermes_weekly_runs.completed_at, now()), updated_at=now()
      `, [week]);
      await client.query('COMMIT');
      return { claimed: false, week, reason: 'already completed according to durable hermes-state marker' };
    }

    const current = await client.query(`SELECT * FROM public.hermes_weekly_runs WHERE iso_week=$1 FOR UPDATE`, [week]);
    if (current.rows[0]?.state === 'COMPLETED') {
      await client.query('COMMIT');
      return { claimed: false, week, reason: 'already completed in HA ledger', current: current.rows[0] };
    }
    if (current.rows[0]?.state === 'RUNNING' && current.rows[0]?.lease_expires_at && new Date(current.rows[0].lease_expires_at) > new Date()) {
      await client.query('COMMIT');
      return { claimed: false, week, reason: `active lease held by ${current.rows[0].owner_node}`, current: current.rows[0] };
    }

    const { rows } = await client.query(`
      INSERT INTO public.hermes_weekly_runs(iso_week, owner_node, owner_role, state, claimed_at, lease_expires_at, last_error, updated_at)
      VALUES($1,$2,$3,'RUNNING',now(),now()+($4::text || ' hours')::interval,NULL,now())
      ON CONFLICT(iso_week) DO UPDATE SET
        owner_node=excluded.owner_node,
        owner_role=excluded.owner_role,
        state='RUNNING',
        claimed_at=now(),
        lease_expires_at=now()+($4::text || ' hours')::interval,
        last_error=NULL,
        updated_at=now()
      RETURNING *
    `, [week, nodeId, role, String(leaseHours)]);
    await client.query('COMMIT');
    return { claimed: true, week, lease: rows[0] };
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    throw error;
  } finally { client.release(); }
}

export async function completeWeeklyRun({ nodeId }) {
  const client = await pool.connect();
  const week = isoWeekKey(new Date());
  try {
    await ensureSchema(client);
    const { rows } = await client.query(`
      UPDATE public.hermes_weekly_runs
      SET state='COMPLETED', completed_at=now(), lease_expires_at=NULL, last_error=NULL, updated_at=now()
      WHERE iso_week=$1 AND owner_node=$2
      RETURNING *
    `, [week, nodeId]);
    return rows[0] || null;
  } finally { client.release(); }
}

export async function failWeeklyRun({ nodeId, error }) {
  const client = await pool.connect();
  const week = isoWeekKey(new Date());
  try {
    await ensureSchema(client);
    const { rows } = await client.query(`
      UPDATE public.hermes_weekly_runs
      SET state='FAILED', lease_expires_at=now(), last_error=$3, updated_at=now()
      WHERE iso_week=$1 AND owner_node=$2
      RETURNING *
    `, [week, nodeId, String(error || 'unknown failure').slice(0, 4000)]);
    return rows[0] || null;
  } finally { client.release(); }
}

async function main() {
  const action = process.argv[2];
  const arg = (name, fallback) => {
    const i = process.argv.indexOf(`--${name}`);
    return i >= 0 ? process.argv[i + 1] : fallback;
  };
  let result;
  if (action === 'heartbeat') {
    result = await publishHeartbeat({
      nodeId: arg('node', process.env.ELIM_RUNTIME_NODE || 'UNKNOWN'),
      role: arg('role', process.env.ELIM_RUNTIME_ROLE || 'UNKNOWN'),
      status: arg('status', 'OK'),
      metadata: { source: arg('source', 'cli') }
    });
  } else if (action === 'status') {
    result = await getNodeHeartbeat(arg('node', 'LENOVO'));
  } else if (action === 'claim') {
    result = await claimWeeklyRun({ nodeId: arg('node', 'UNKNOWN'), role: arg('role', 'UNKNOWN'), leaseHours: Number(arg('lease-hours', 6)) });
  } else if (action === 'complete') {
    result = await completeWeeklyRun({ nodeId: arg('node', 'UNKNOWN') });
  } else if (action === 'fail') {
    result = await failWeeklyRun({ nodeId: arg('node', 'UNKNOWN'), error: arg('error', 'unspecified') });
  } else {
    throw new Error('usage: hermes-ha-control.mjs <heartbeat|status|claim|complete|fail> [--node ID] [--role ROLE]');
  }
  console.log(JSON.stringify(result, null, 2));
}

const isDirectCli = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isDirectCli) {
  main().catch((error) => { console.error('[hermes-ha-control] failed', error); process.exitCode = 1; }).finally(() => pool.end());
}
