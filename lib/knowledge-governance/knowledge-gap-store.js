'use strict';

// Durable persistence for lib/knowledge-governance/knowledge-gap-contract.js
// records, in the bot orchestrator's own database (same DATABASE_URL/pool as
// elimfilters_catalog, via bot-protocol-db.js — see migrations/bot-knowledge-
// gap-store/001_schema.sql for why this is a separate table from
// knowledge_center.candidate_cases rather than a duplicate of it).
//
// Every function degrades safely: a PostgreSQL failure never throws past
// this module — callers get { persisted: false, error } and the
// conversation continues without inventing a result.

const { withProtocolClient } = require('../bot-protocol-db');
const {
  createKnowledgeGap,
  mergeDuplicateKnowledgeGap,
  transitionKnowledgeGapStatus
} = require('./knowledge-gap-contract');

const TABLE = 'bot_governance.knowledge_gaps';

function rowToGap(row) {
  if (!row) return null;
  return {
    request_id: row.request_id,
    request_type: row.request_type,
    origin: row.origin,
    status: row.status,
    priority: row.priority,
    equipment: row.equipment || {},
    system: row.system,
    component: row.component,
    question: row.question,
    reason: row.reason,
    source_required: row.source_required,
    requested_by: row.requested_by,
    conversation_id: row.conversation_id,
    channel: row.channel,
    deduplication_key: row.deduplication_key,
    occurrences: row.occurrences,
    first_detected_at: row.first_detected_at,
    last_detected_at: row.last_detected_at,
    assigned_to: row.assigned_to,
    hermes_research_id: row.hermes_research_id,
    obsidian_document_id: row.obsidian_document_id,
    resolution_summary: row.resolution_summary,
    audit_history: row.audit_history || []
  };
}

async function getKnowledgeGapByDeduplicationKey(key) {
  if (!key) return { persisted: true, gap: null };
  try {
    const gap = await withProtocolClient(async client => {
      const result = await client.query(`SELECT * FROM ${TABLE} WHERE deduplication_key = $1`, [key]);
      return rowToGap(result.rows[0]);
    });
    return { persisted: true, gap };
  } catch (error) {
    console.error('[knowledge-gap-store] lookup by dedup key failed', error.message);
    return { persisted: false, gap: null, error: error.message };
  }
}

async function getKnowledgeGapByRequestId(requestId) {
  if (!requestId) return { persisted: true, gap: null };
  try {
    const gap = await withProtocolClient(async client => {
      const result = await client.query(`SELECT * FROM ${TABLE} WHERE request_id = $1`, [requestId]);
      return rowToGap(result.rows[0]);
    });
    return { persisted: true, gap };
  } catch (error) {
    console.error('[knowledge-gap-store] lookup by request id failed', error.message);
    return { persisted: false, gap: null, error: error.message };
  }
}

// Creates a new gap, or — if one with the same deduplication_key already
// exists — merges into it (bumps occurrences, extends last_detected_at,
// never regresses status). Runs inside a single transaction with a row lock
// on the existing match, so two concurrent conversations reporting the same
// gap can never race into two active rows for it.
async function upsertKnowledgeGap(input) {
  const candidate = createKnowledgeGap(input);
  try {
    const { gap, created } = await withProtocolClient(async client => {
      const existing = await client.query(`SELECT * FROM ${TABLE} WHERE deduplication_key = $1 FOR UPDATE`, [candidate.deduplication_key]);
      if (existing.rows.length) {
        const merged = mergeDuplicateKnowledgeGap(rowToGap(existing.rows[0]), { ...input, now: candidate.first_detected_at });
        const result = await client.query(
          `UPDATE ${TABLE}
              SET occurrences = $2, last_detected_at = $3, priority = $4, audit_history = $5, updated_at = now()
            WHERE deduplication_key = $1
            RETURNING *`,
          [candidate.deduplication_key, merged.occurrences, merged.last_detected_at, merged.priority, JSON.stringify(merged.audit_history)]
        );
        return { gap: rowToGap(result.rows[0]), created: false };
      }
      const result = await client.query(
        `INSERT INTO ${TABLE}
           (request_id, request_type, origin, status, priority, equipment, system, component,
            question, reason, source_required, requested_by, conversation_id, channel,
            deduplication_key, occurrences, first_detected_at, last_detected_at, audit_history)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         RETURNING *`,
        [
          candidate.request_id, candidate.request_type, candidate.origin, candidate.status, candidate.priority,
          JSON.stringify(candidate.equipment), candidate.system, candidate.component,
          candidate.question, candidate.reason, candidate.source_required, candidate.requested_by,
          candidate.conversation_id, candidate.channel, candidate.deduplication_key, candidate.occurrences,
          candidate.first_detected_at, candidate.last_detected_at, JSON.stringify(candidate.audit_history)
        ]
      );
      return { gap: rowToGap(result.rows[0]), created: true };
    });
    return { persisted: true, gap, created };
  } catch (error) {
    console.error('[knowledge-gap-store] upsert failed', error.message);
    return { persisted: false, gap: null, created: false, error: error.message };
  }
}

async function transitionStoredKnowledgeGap(requestId, nextStatus, opts = {}) {
  try {
    const gap = await withProtocolClient(async client => {
      const existing = await client.query(`SELECT * FROM ${TABLE} WHERE request_id = $1 FOR UPDATE`, [requestId]);
      if (!existing.rows.length) throw new Error(`knowledge gap not found: ${requestId}`);
      const next = transitionKnowledgeGapStatus(rowToGap(existing.rows[0]), nextStatus, opts);
      const result = await client.query(
        `UPDATE ${TABLE}
            SET status = $2, assigned_to = $3, hermes_research_id = $4, obsidian_document_id = $5,
                resolution_summary = $6, audit_history = $7, last_detected_at = $8, updated_at = now()
          WHERE request_id = $1
          RETURNING *`,
        [requestId, next.status, next.assigned_to, next.hermes_research_id, next.obsidian_document_id,
          next.resolution_summary, JSON.stringify(next.audit_history), next.last_detected_at]
      );
      return rowToGap(result.rows[0]);
    });
    return { persisted: true, gap };
  } catch (error) {
    console.error('[knowledge-gap-store] transition failed', error.message);
    return { persisted: false, gap: null, error: error.message };
  }
}

async function attachHermesResearchId(requestId, hermesResearchId) {
  return transitionStoredKnowledgeGap(requestId, 'queued_for_hermes', {
    hermes_research_id: hermesResearchId,
    reason: 'HERMES research request created'
  });
}

async function attachObsidianDocumentId(requestId, obsidianDocumentId) {
  try {
    const gap = await withProtocolClient(async client => {
      const result = await client.query(
        `UPDATE ${TABLE} SET obsidian_document_id = $2, updated_at = now() WHERE request_id = $1 RETURNING *`,
        [requestId, obsidianDocumentId]
      );
      return rowToGap(result.rows[0]);
    });
    return { persisted: true, gap };
  } catch (error) {
    console.error('[knowledge-gap-store] attach obsidian document id failed', error.message);
    return { persisted: false, gap: null, error: error.message };
  }
}

async function closeKnowledgeGap(requestId, resolutionSummary) {
  return transitionStoredKnowledgeGap(requestId, 'closed', {
    resolution_summary: resolutionSummary || null,
    reason: 'closed by bot orchestrator'
  });
}

async function listPendingKnowledgeGaps({ limit = 25 } = {}) {
  try {
    const gaps = await withProtocolClient(async client => {
      const result = await client.query(
        `SELECT * FROM ${TABLE}
          WHERE status NOT IN ('closed', 'published_in_obsidian')
          ORDER BY last_detected_at DESC
          LIMIT $1`,
        [Math.max(1, Math.min(100, Number(limit) || 25))]
      );
      return result.rows.map(rowToGap);
    });
    return { persisted: true, gaps };
  } catch (error) {
    console.error('[knowledge-gap-store] list pending failed', error.message);
    return { persisted: false, gaps: [], error: error.message };
  }
}

module.exports = {
  upsertKnowledgeGap,
  getKnowledgeGapByRequestId,
  getKnowledgeGapByDeduplicationKey,
  transitionStoredKnowledgeGap,
  attachHermesResearchId,
  attachObsidianDocumentId,
  closeKnowledgeGap,
  listPendingKnowledgeGaps
};
