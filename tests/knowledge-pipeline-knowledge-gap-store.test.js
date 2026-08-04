'use strict';

// Direct unit tests for lib/knowledge-governance/knowledge-gap-store.js
// against an in-memory fake bot_governance.knowledge_gaps table, injected
// through the same __setProtocolPoolForTests seam bot-protocol-e2e.test.js
// uses for elimfilters_catalog.

const test = require('node:test');
const assert = require('node:assert/strict');

const { __setProtocolPoolForTests } = require('../lib/bot-protocol-db');
const {
  upsertKnowledgeGap,
  getKnowledgeGapByDeduplicationKey,
  transitionStoredKnowledgeGap,
  attachHermesResearchId,
  closeKnowledgeGap,
  listPendingKnowledgeGaps
} = require('../lib/knowledge-governance/knowledge-gap-store');

// A tiny in-memory SQL stand-in: only understands the exact statement
// shapes knowledge-gap-store.js issues against bot_governance.knowledge_gaps.
function createFakeKnowledgeGapTable() {
  const rows = new Map(); // deduplication_key -> row
  const byRequestId = new Map(); // request_id -> deduplication_key

  function client() {
    return {
      async query(sql, params = []) {
        const text = String(sql);
        if (/^\s*(BEGIN|COMMIT|ROLLBACK|SET LOCAL)/i.test(text)) return { rows: [] };

        if (/SELECT \* FROM bot_governance\.knowledge_gaps WHERE deduplication_key = \$1/i.test(text)) {
          const row = rows.get(params[0]);
          return { rows: row ? [row] : [] };
        }
        if (/SELECT \* FROM bot_governance\.knowledge_gaps WHERE request_id = \$1/i.test(text)) {
          const key = byRequestId.get(params[0]);
          const row = key ? rows.get(key) : null;
          return { rows: row ? [row] : [] };
        }
        if (/^INSERT INTO bot_governance\.knowledge_gaps/i.test(text)) {
          const [request_id, request_type, origin, status, priority, equipment, system, component,
            question, reason, source_required, requested_by, conversation_id, channel,
            deduplication_key, occurrences, first_detected_at, last_detected_at, audit_history] = params;
          const row = {
            request_id, request_type, origin, status, priority,
            equipment: JSON.parse(equipment), system, component, question, reason, source_required,
            requested_by, conversation_id, channel, deduplication_key, occurrences,
            first_detected_at, last_detected_at, assigned_to: null, hermes_research_id: null,
            obsidian_document_id: null, resolution_summary: null, audit_history: JSON.parse(audit_history)
          };
          rows.set(deduplication_key, row);
          byRequestId.set(request_id, deduplication_key);
          return { rows: [row] };
        }
        if (/^UPDATE bot_governance\.knowledge_gaps\s+SET occurrences/i.test(text)) {
          const [deduplication_key, occurrences, last_detected_at, priority, audit_history] = params;
          const row = rows.get(deduplication_key);
          if (!row) return { rows: [] };
          Object.assign(row, { occurrences, last_detected_at, priority, audit_history: JSON.parse(audit_history) });
          return { rows: [row] };
        }
        if (/^UPDATE bot_governance\.knowledge_gaps\s+SET status/i.test(text)) {
          const [request_id, status, assigned_to, hermes_research_id, obsidian_document_id, resolution_summary, audit_history, last_detected_at] = params;
          const key = byRequestId.get(request_id);
          const row = key ? rows.get(key) : null;
          if (!row) return { rows: [] };
          Object.assign(row, { status, assigned_to, hermes_research_id, obsidian_document_id, resolution_summary, audit_history: JSON.parse(audit_history), last_detected_at });
          return { rows: [row] };
        }
        if (/^UPDATE bot_governance\.knowledge_gaps SET obsidian_document_id/i.test(text)) {
          const [request_id, obsidian_document_id] = params;
          const key = byRequestId.get(request_id);
          const row = key ? rows.get(key) : null;
          if (!row) return { rows: [] };
          row.obsidian_document_id = obsidian_document_id;
          return { rows: [row] };
        }
        if (/^SELECT \* FROM bot_governance\.knowledge_gaps\s+WHERE status NOT IN/i.test(text)) {
          const pending = [...rows.values()].filter(r => !['closed', 'published_in_obsidian'].includes(r.status));
          return { rows: pending.slice(0, params[0]) };
        }
        throw new Error(`fake knowledge_gaps table: unhandled query: ${text}`);
      },
      release() {}
    };
  }

  return { connect: async () => client(), rows, byRequestId };
}

let fakeDb;
test.beforeEach(() => {
  fakeDb = createFakeKnowledgeGapTable();
  __setProtocolPoolForTests(fakeDb);
});
test.afterEach(() => __setProtocolPoolForTests(null));

const BASE_GAP_INPUT = {
  request_type: 'oem_maintenance_interval',
  origin: 'bot_orchestrator',
  equipment: { brand: 'MACK', model: null, engine: 'MP8', year: 2019 },
  system: 'fuel',
  question: '¿Cada cuánto se cambia el filtro de combustible?',
  reason: 'technical knowledge query returned not_found',
  requested_by: 'bot_orchestrator',
  conversation_id: 'conv-gap-1',
  channel: 'whatsapp'
};

// Case 3: Obsidian no encuentra información -> vacío persistido.
test('upsertKnowledgeGap persists a new gap on first occurrence', async () => {
  const result = await upsertKnowledgeGap(BASE_GAP_INPUT);
  assert.equal(result.persisted, true);
  assert.equal(result.created, true);
  assert.equal(result.gap.occurrences, 1);
  assert.equal(result.gap.status, 'detected');
  assert.equal(fakeDb.rows.size, 1);
});

// Case 4: Vacío repetido -> occurrences aumenta, no duplica.
test('upsertKnowledgeGap merges a repeated gap instead of creating a duplicate row', async () => {
  await upsertKnowledgeGap(BASE_GAP_INPUT);
  const second = await upsertKnowledgeGap(BASE_GAP_INPUT);
  assert.equal(second.created, false);
  assert.equal(second.gap.occurrences, 2);
  assert.equal(fakeDb.rows.size, 1, 'must still be exactly one row');
});

// Case 28: 20 solicitudes iguales generan un solo vacío durable.
test('20 identical gap reports produce exactly one durable row with occurrences = 20', async () => {
  let last;
  for (let i = 0; i < 20; i += 1) last = await upsertKnowledgeGap(BASE_GAP_INPUT);
  assert.equal(fakeDb.rows.size, 1);
  assert.equal(last.gap.occurrences, 20);
});

test('getKnowledgeGapByDeduplicationKey finds the persisted row', async () => {
  const created = await upsertKnowledgeGap(BASE_GAP_INPUT);
  const found = await getKnowledgeGapByDeduplicationKey(created.gap.deduplication_key);
  assert.equal(found.persisted, true);
  assert.equal(found.gap.request_id, created.gap.request_id);
});

test('a different equipment/system/question produces a distinct gap row', async () => {
  await upsertKnowledgeGap(BASE_GAP_INPUT);
  await upsertKnowledgeGap({ ...BASE_GAP_INPUT, system: 'hydraulic', question: 'otra pregunta distinta' });
  assert.equal(fakeDb.rows.size, 2);
});

test('attachHermesResearchId transitions detected -> queued_for_hermes and stores the id', async () => {
  const created = await upsertKnowledgeGap(BASE_GAP_INPUT);
  const attached = await attachHermesResearchId(created.gap.request_id, 'hermes-case-123');
  assert.equal(attached.persisted, true);
  assert.equal(attached.gap.status, 'queued_for_hermes');
  assert.equal(attached.gap.hermes_research_id, 'hermes-case-123');
});

test('transitionStoredKnowledgeGap rejects an invalid jump (detected -> closed)', async () => {
  const created = await upsertKnowledgeGap(BASE_GAP_INPUT);
  const result = await transitionStoredKnowledgeGap(created.gap.request_id, 'closed', { reason: 'skip ahead' });
  assert.equal(result.persisted, false);
  assert.match(result.error, /invalid knowledge gap transition/);
});

test('closeKnowledgeGap moves a gap through the full valid lifecycle to closed', async () => {
  const created = await upsertKnowledgeGap(BASE_GAP_INPUT);
  await attachHermesResearchId(created.gap.request_id, 'hermes-case-456');
  await transitionStoredKnowledgeGap(created.gap.request_id, 'researching', { reason: 'HERMES started research' });
  await transitionStoredKnowledgeGap(created.gap.request_id, 'researched', { reason: 'HERMES finished research' });
  await transitionStoredKnowledgeGap(created.gap.request_id, 'awaiting_review', { reason: 'ready for Obsidian review' });
  await transitionStoredKnowledgeGap(created.gap.request_id, 'approved_for_obsidian', { reason: 'reviewer approved' });
  await transitionStoredKnowledgeGap(created.gap.request_id, 'published_in_obsidian', { reason: 'published' });
  const closed = await closeKnowledgeGap(created.gap.request_id, 'resolved');
  assert.equal(closed.gap.status, 'closed');
});

test('listPendingKnowledgeGaps excludes closed and published rows', async () => {
  const a = await upsertKnowledgeGap(BASE_GAP_INPUT);
  await upsertKnowledgeGap({ ...BASE_GAP_INPUT, system: 'hydraulic', question: 'otra' });
  // A gap can only reach 'closed' by walking the full valid lifecycle
  // (the FSM in knowledge-gap-contract.js rejects a direct detected -> closed jump).
  await attachHermesResearchId(a.gap.request_id, 'hermes-case-789');
  await transitionStoredKnowledgeGap(a.gap.request_id, 'researching', { reason: 'r' });
  await transitionStoredKnowledgeGap(a.gap.request_id, 'researched', { reason: 'r' });
  await transitionStoredKnowledgeGap(a.gap.request_id, 'awaiting_review', { reason: 'r' });
  await transitionStoredKnowledgeGap(a.gap.request_id, 'approved_for_obsidian', { reason: 'r' });
  await transitionStoredKnowledgeGap(a.gap.request_id, 'published_in_obsidian', { reason: 'r' });
  await closeKnowledgeGap(a.gap.request_id, 'resolved manually');
  const pending = await listPendingKnowledgeGaps({ limit: 10 });
  assert.equal(pending.persisted, true);
  assert.equal(pending.gaps.length, 1);
});

test('a PostgreSQL failure degrades safely instead of throwing', async () => {
  __setProtocolPoolForTests({ connect: async () => { throw new Error('ECONNREFUSED'); } });
  const result = await upsertKnowledgeGap(BASE_GAP_INPUT);
  assert.equal(result.persisted, false);
  assert.ok(result.error);
});
