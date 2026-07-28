import crypto from 'node:crypto';
import { Pool } from 'pg';
import type { ControlAction, ReasoningRequest, ReasoningResponse, RetrievedRecord } from './contracts.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const maxRecords = Number(process.env.MAX_RETRIEVAL_RECORDS ?? 12);
const minAnswer = Number(process.env.MIN_ANSWER_CONFIDENCE ?? 0.72);
const minProduction = Number(process.env.MIN_PRODUCTION_CONFIDENCE ?? 0.85);

function tokens(text: string): string[] {
  return [...new Set(text.toLowerCase().replace(/[^a-z0-9áéíóúñü\s-]/gi, ' ').split(/\s+/).filter(x => x.length > 2))].slice(0, 24);
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
  const confidence = Math.min(1, records.slice(0,3).reduce((sum,r)=>sum+r.confidence,0) / Math.min(3,records.length));
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
  await pool.query(`SELECT 1 FROM knowledge_center.schema_migrations WHERE version='2.0.0'`);
}