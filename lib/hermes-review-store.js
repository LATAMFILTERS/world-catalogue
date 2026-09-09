'use strict';

const { Pool } = require('pg');

function dbUrl(env = process.env) {
  return String(env.CATALOG_DATABASE_URL || '').trim();
}

function poolFor(env = process.env) {
  const connectionString = dbUrl(env);
  if (!connectionString) throw new Error('CATALOG_DATABASE_URL is required for HERMES review store');
  return new Pool({ connectionString, max: 2, ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false } });
}

async function ensureSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.hermes_review_queue (
      candidate_code text PRIMARY KEY,
      cycle_id text NOT NULL,
      candidate jsonb NOT NULL,
      review_status text NOT NULL DEFAULT 'READY',
      decision text,
      decision_reason text,
      decided_by text,
      decided_at timestamptz,
      applied_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS hermes_review_queue_status_idx ON public.hermes_review_queue(review_status)`);
}

async function stageCandidates(candidates, { cycleId, env = process.env } = {}) {
  const pool = poolFor(env);
  try {
    await ensureSchema(pool);
    for (const candidate of candidates) {
      const code = String(candidate?.entity_code || '').trim();
      if (!code) continue;
      await pool.query(`
        INSERT INTO public.hermes_review_queue(candidate_code, cycle_id, candidate, review_status, updated_at)
        VALUES ($1,$2,$3::jsonb,'READY',now())
        ON CONFLICT (candidate_code) DO UPDATE SET
          cycle_id = EXCLUDED.cycle_id,
          candidate = EXCLUDED.candidate,
          review_status = CASE WHEN public.hermes_review_queue.review_status IN ('DECIDED','APPLIED') THEN public.hermes_review_queue.review_status ELSE 'READY' END,
          updated_at = now()
      `, [code, String(cycleId || 'current'), JSON.stringify(candidate)]);
    }
  } finally {
    await pool.end();
  }
}

async function recordDecision({ candidateCode, decision, reason = null, actor = 'Victor Abreu', env = process.env }) {
  const normalized = String(decision || '').toLowerCase();
  if (!['approve','reject','research'].includes(normalized)) throw new Error('invalid HERMES review decision');
  const pool = poolFor(env);
  try {
    await ensureSchema(pool);
    const result = await pool.query(`
      UPDATE public.hermes_review_queue
      SET review_status='DECIDED', decision=$2, decision_reason=$3, decided_by=$4, decided_at=now(), updated_at=now()
      WHERE candidate_code=$1 AND review_status IN ('READY','DECIDED')
      RETURNING candidate_code, cycle_id, decision, review_status
    `, [candidateCode, normalized, reason, actor]);
    if (!result.rowCount) throw new Error(`candidate not available for review: ${candidateCode}`);
    return result.rows[0];
  } finally {
    await pool.end();
  }
}

async function fetchDecisions({ env = process.env } = {}) {
  const pool = poolFor(env);
  try {
    await ensureSchema(pool);
    const result = await pool.query(`
      SELECT candidate_code, cycle_id, candidate, decision, decision_reason, decided_by, decided_at
      FROM public.hermes_review_queue
      WHERE review_status='DECIDED'
      ORDER BY decided_at ASC
    `);
    return result.rows;
  } finally {
    await pool.end();
  }
}

async function markApplied(candidateCode, { env = process.env } = {}) {
  const pool = poolFor(env);
  try {
    await ensureSchema(pool);
    await pool.query(`UPDATE public.hermes_review_queue SET review_status='APPLIED', applied_at=now(), updated_at=now() WHERE candidate_code=$1`, [candidateCode]);
  } finally {
    await pool.end();
  }
}

module.exports = { ensureSchema, stageCandidates, recordDecision, fetchDecisions, markApplied };
