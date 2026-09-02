import crypto from 'node:crypto';
import { Pool } from 'pg';
import type { ControlAction, ReasoningRequest, ReasoningResponse, RetrievedRecord } from './contracts.js';

if (!process.env.DATABASE_URL) {
  throw new Error('FATAL: DATABASE_URL environment variable is not set. Service cannot start without database connection.');
}

const poolConfig: any = { connectionString: process.env.DATABASE_URL };
if (process.env.DATABASE_SSL === 'true') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);
const maxRecords = Number(process.env.MAX_RETRIEVAL_RECORDS ?? 12);
const minAnswer = Number(process.env.MIN_ANSWER_CONFIDENCE ?? 0.72);
const minProduction = Number(process.env.MIN_PRODUCTION_CONFIDENCE ?? 0.85);

/**
 * Phase 6 is required by this service because every reasoning request writes an
 * append-only trace. Older deployments only checked the Phase 2 schema in
 * /health, which allowed Render to mark the service healthy even when the
 * reasoning_traces table had never been installed. In that state every call to
 * reason() ended as a generic HTTP 400 after retrieval.
 *
 * Keep the runtime migration idempotent so a fresh or partially migrated
 * database can recover during deployment without requiring a manual SQL step.
 */
export async function ensureRuntimeSchema(): Promise<void> {
  await pool.query('BEGIN');
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS knowledge_center.reasoning_traces (
        id uuid PRIMARY KEY,
        correlation_id uuid,
        candidate_case_id uuid REFERENCES knowledge_center.candidate_cases(id),
        audience text NOT NULL CHECK (audience IN ('TECHNICAL_SUPPORT','DISTRIBUTOR','CUSTOMER','INTERNAL_ENGINEERING')),
        channel text NOT NULL,
        query_text text NOT NULL,
        action text NOT NULL CHECK (action IN ('ANSWER','VERIFY','ESCALATE','STOP')),
        confidence numeric(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
        retrieved_version_ids uuid[] NOT NULL DEFAULT '{}',
        response_payload jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS reasoning_traces_candidate_case_idx ON knowledge_center.reasoning_traces(candidate_case_id, created_at DESC)');
    await pool.query('CREATE INDEX IF NOT EXISTS reasoning_traces_action_idx ON knowledge_center.reasoning_traces(action, created_at DESC)');
    await pool.query('CREATE INDEX IF NOT EXISTS reasoning_traces_correlation_idx ON knowledge_center.reasoning_traces(correlation_id) WHERE correlation_id IS NOT NULL');
    await pool.query(`
      CREATE OR REPLACE FUNCTION knowledge_center.block_reasoning_trace_mutation()
      RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        RAISE EXCEPTION 'reasoning traces are append-only';
      END;
      $$
    `);
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger
          WHERE tgname = 'reasoning_traces_immutable'
            AND tgrelid = 'knowledge_center.reasoning_traces'::regclass
        ) THEN
          CREATE TRIGGER reasoning_traces_immutable
          BEFORE UPDATE OR DELETE ON knowledge_center.reasoning_traces
          FOR EACH ROW EXECUTE FUNCTION knowledge_center.block_reasoning_trace_mutation();
        END IF;
      END;
      $$
    `);
    await pool.query(`
      INSERT INTO knowledge_center.schema_migrations(version, description)
      VALUES ('6.0.0', 'Knowledge Engine Runtime reasoning traces')
      ON CONFLICT (version) DO NOTHING
    `);
    await pool.query('COMMIT');
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
}

// Generic question words ("what is X used for", "tell me about X") almost
// never appear verbatim in formal technical record text, so counting them
// toward the confidence denominator in decide() silently sank real matches
// below the 0.72 answer threshold -- confirmed live: a query naming an
// actual seeded technology by name scored ~0.4 (2 of 5 terms) because
// "what"/"used"/"for" never matched anything, even though "syntrax" and
// "technology" both did. Stripped before scoring so confidence reflects
// how much of the *substantive* query matched, not filler words.
const STOPWORDS = new Set(['the','and','for','are','but','not','you','all','can','has','have','had','was','were','been','being','this','that','these','those','what','which','who','whom','whose','when','where','why','how','tell','about','used','use','uses','using','does','doing','done','with','from','into','onto','than','then','them','they','their','there','here','some','any','more','most','much','many','also','just','only','very','difference','different','differences','between','versus','compare','comparison','ser','uso','usar','usado','para','sobre','que','cual','como','donde','cuando','esta','este','esto','sirve','diferencia','entre']);

function tokens(text: string): string[] {
  return [...new Set(text.toLowerCase().replace(/[^a-z0-9áéíóúñü\s-]/gi, ' ').split(/\s+/).filter(x => x.length > 2 && !STOPWORDS.has(x)))].slice(0, 24);
}

async function retrieve(query: string): Promise<RetrievedRecord[]> {
  const terms = tokens(query);
  if (!terms.length) return [];
  const pattern = terms.map(t => `%${t}%`);
  const result = await pool.query(`
    SELECT kr.id AS record_id, krv.id AS version_id, kr.external_id, kr.record_type,
           krv.title, krv.summary, krv.content,
           LEAST(1.0, COUNT(*)::numeric / GREATEST($2::numeric,1)) AS confidence
      FROM knowledge_center.knowledge_records kr
      JOIN knowledge_center.knowledge_record_versions krv ON krv.id=kr.current_version_id
      CROSS JOIN unnest($1::text[]) AS q(term)
     WHERE kr.production_eligible=true
       AND kr.lifecycle_status IN ('APPROVED','CURRENT','LIMITED_USE')
       AND (krv.title ILIKE q.term OR COALESCE(krv.summary,'') ILIKE q.term OR krv.content::text ILIKE q.term)
     GROUP BY kr.id,krv.id
     ORDER BY confidence DESC, krv.created_at DESC
     LIMIT $3`, [pattern, terms.length, maxRecords]);

  const records: RetrievedRecord[] = [];
  for (const row of result.rows) {
    const sources = await pool.query(`SELECT s.id AS source_id,s.title,s.authority_level,rs.support_type,s.locator
      FROM knowledge_center.record_sources rs JOIN knowledge_center.sources s ON s.id=rs.source_id
      WHERE rs.record_version_id=$1 ORDER BY CASE s.authority_level WHEN 'PRIMARY' THEN 1 WHEN 'AUTHORITATIVE' THEN 2 WHEN 'SECONDARY' THEN 3 ELSE 4 END`, [row.version_id]);
    records.push({ recordId: row.record_id, versionId: row.version_id, externalId: row.external_id, recordType: row.record_type, title: row.title, summary: row.summary, content: row.content, confidence: Number(row.confidence), sources: sources.rows.map(s => ({ sourceId:s.source_id,title:s.title,authorityLevel:s.authority_level,supportType:s.support_type,locator:s.locator })) });
  }
  return records;
}

function decide(records: RetrievedRecord[], request: ReasoningRequest): { action: ControlAction; confidence: number; reason?: string } {
  if (/\b(bypass|ignore approval|publish automatically|override safety)\b/i.test(request.query)) return { action:'STOP', confidence:1, reason:'Request conflicts with governance boundaries.' };
  if (!records.length) return { action:'ESCALATE', confidence:0, reason:'No approved knowledge matched the request.' };
  const contradictions = records.some(r => r.sources.some(s => s.supportType === 'CONTRADICTS'));
  // records is already ORDER BY confidence DESC, so records[0] is the best
  // single match. Averaging in weaker co-matches (the old records.slice(0,3)
  // average) actively punishes a strong single match: confirmed live, a
  // query naming one seeded technology by name scored a clean 1.0 against
  // that record, but every other technology record also contains generic
  // shared vocabulary ("technology") and matched at ~0.5, pulling the
  // averaged confidence down to ~0.67 -- below the 0.72 answer threshold --
  // purely because unrelated records existed at all, not because the real
  // match was weak.
  //
  // A single best match isn't the whole picture either: a two-entity query
  // ("difference between SYNTRAX and HYDROCORE") splits across two records
  // that each cover their own name but not the other's, so records[0] alone
  // sits at ~0.5 even though the top few records TOGETHER answer the full
  // query -- confirmed live. unionConfidence measures how much of the
  // query's substantive terms are covered by compose()'s top-4 candidate
  // set as a whole (the same set the answer text is actually built from),
  // so a query correctly answered by combining several on-topic records
  // isn't penalized just because no single one of them was self-sufficient.
  const queryTerms = tokens(request.query);
  const topCandidates = records.slice(0, 4);
  const combinedText = topCandidates.map(r => `${r.title} ${r.summary ?? ''} ${JSON.stringify(r.content ?? '')}`).join(' ').toLowerCase();
  const unionConfidence = queryTerms.length ? queryTerms.filter(t => combinedText.includes(t)).length / queryTerms.length : 0;
  const confidence = Math.max(records[0].confidence, unionConfidence);
  if (contradictions) return { action:'VERIFY', confidence, reason:'Approved evidence contains a contradiction.' };
  if (request.audience === 'CUSTOMER' && confidence < minProduction) return { action:'ESCALATE', confidence, reason:'Confidence is below the production response threshold.' };
  if (confidence < minAnswer) return { action:'VERIFY', confidence, reason:'More asset or measurement evidence is required.' };
  return { action:'ANSWER', confidence };
}

function compose(records: RetrievedRecord[], action: ControlAction): string | null {
  if (action !== 'ANSWER') return null;
  return records.slice(0,4).map((r,i)=>`${i+1}. ${r.title}: ${r.summary ?? 'Approved technical record retrieved.'}`).join('\n');
}

export async function reason(request: ReasoningRequest): Promise<ReasoningResponse> {
  const traceId = crypto.randomUUID();
  const records = await retrieve(request.query);
  const decision = decide(records, request);
  const response: ReasoningResponse = {
    traceId,
    action: decision.action,
    confidence: decision.confidence,
    answer: compose(records, decision.action),
    verificationRequests: decision.action==='VERIFY' ? ['Confirm asset identification, operating conditions, measurements, and available images or logs.'] : [],
    escalationReason: decision.action==='ESCALATE' ? decision.reason ?? null : null,
    stopReason: decision.action==='STOP' ? decision.reason ?? null : null,
    citations: records.flatMap(r => r.sources.length ? r.sources.map(s => ({ recordId:r.recordId,versionId:r.versionId,sourceId:s.sourceId,label:s.title })) : [{ recordId:r.recordId,versionId:r.versionId,label:r.title }]),
    limitations: records.length ? ['Response is limited to approved Knowledge Center records and explicit user evidence.'] : ['No approved record supported an answer.']
  };
  await pool.query(`INSERT INTO knowledge_center.reasoning_traces(id,correlation_id,candidate_case_id,audience,channel,query_text,action,confidence,retrieved_version_ids,response_payload,created_at)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now())`, [traceId, request.correlationId ?? null, request.candidateCaseId ?? null, request.audience, request.channel, request.query, response.action, response.confidence, records.map(r=>r.versionId), response]);
  return response;
}

export async function readiness(): Promise<void> {
  const result = await pool.query(`
    SELECT
      EXISTS (SELECT 1 FROM knowledge_center.schema_migrations WHERE version='2.0.0') AS phase2,
      EXISTS (SELECT 1 FROM knowledge_center.schema_migrations WHERE version='6.0.0') AS phase6,
      to_regclass('knowledge_center.knowledge_records') IS NOT NULL AS records_table,
      to_regclass('knowledge_center.knowledge_record_versions') IS NOT NULL AS versions_table,
      to_regclass('knowledge_center.record_sources') IS NOT NULL AS sources_table,
      to_regclass('knowledge_center.reasoning_traces') IS NOT NULL AS traces_table
  `);
  const state = result.rows[0];
  if (!state?.phase2 || !state?.phase6 || !state?.records_table || !state?.versions_table || !state?.sources_table || !state?.traces_table) {
    throw new Error(`Knowledge Engine schema is incomplete: ${JSON.stringify(state || {})}`);
  }
  await pool.query('SELECT 1');
}
