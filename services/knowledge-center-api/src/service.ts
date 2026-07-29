import type pg from 'pg';
import { withTransaction } from './db.js';

export class KnowledgeCenterService {
  async createCandidateCase(input: any, actorId: string) {
    return withTransaction(async (client) => {
      const result = await client.query(
        `INSERT INTO candidate_cases
          (external_id,status,priority,source_channel,protection_system,technical_family,asset_summary,symptom_summary,structured_intake,novelty_classification,novelty_score,created_by,due_at)
         VALUES ($1,'CAPTURED',$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING *`,
        [input.externalId,input.priority,input.sourceChannel,input.protectionSystem ?? null,input.technicalFamily ?? null,input.assetSummary,input.symptomSummary,input.structuredIntake,input.noveltyClassification ?? null,input.noveltyScore ?? null,actorId,input.dueAt ?? null]
      );
      const candidate = result.rows[0];
      await client.query(
        `INSERT INTO candidate_case_events(candidate_case_id,event_type,new_status,reason,actor_id)
         VALUES ($1,'CANDIDATE_CASE_CREATED','CAPTURED','Structured intake accepted',$2)`,
        [candidate.id, actorId]
      );
      await client.query(
        `INSERT INTO review_assignments(candidate_case_id,queue_name,due_at)
         VALUES ($1,'support@elimfilters.com',$2)`,
        [candidate.id, input.dueAt ?? null]
      );
      await this.queueNotification(client, candidate.id, 'CANDIDATE_CASE_CREATED', candidate.external_id);
      return candidate;
    });
  }

  async listReviewQueue(limit: number, offset: number) {
    const { pool } = await import('./db.js');
    const result = await pool.query('SELECT * FROM knowledge_center.review_queue ORDER BY priority DESC, due_at NULLS LAST, created_at ASC LIMIT $1 OFFSET $2', [limit, offset]);
    return result.rows;
  }

  async getCase(id: string) {
    const { pool } = await import('./db.js');
    const result = await pool.query(
      `SELECT c.*,
        COALESCE((SELECT jsonb_agg(e ORDER BY e.occurred_at) FROM knowledge_center.candidate_case_events e WHERE e.candidate_case_id=c.id),'[]'::jsonb) events,
        COALESCE((SELECT jsonb_agg(a ORDER BY a.assigned_at DESC) FROM knowledge_center.review_assignments a WHERE a.candidate_case_id=c.id),'[]'::jsonb) assignments,
        COALESCE((SELECT jsonb_agg(d ORDER BY d.decided_at DESC) FROM knowledge_center.review_decisions d WHERE d.candidate_case_id=c.id),'[]'::jsonb) decisions
       FROM knowledge_center.candidate_cases c WHERE c.id=$1`, [id]
    );
    return result.rows[0] ?? null;
  }

  async transitionCase(id: string, input: any, actorId: string) {
    return withTransaction(async (client) => {
      const locked = await client.query('SELECT status FROM candidate_cases WHERE id=$1 FOR UPDATE', [id]);
      if (!locked.rowCount) throw new Error('Candidate case not found');
      const previous = locked.rows[0].status;
      const updated = await client.query(
        `UPDATE candidate_cases SET status=$2,updated_at=now(),closed_at=CASE WHEN $2 IN ('APPROVED','REJECTED','PUBLISHED') THEN now() ELSE closed_at END WHERE id=$1 RETURNING *`,
        [id, input.newStatus]
      );
      await client.query(
        `INSERT INTO candidate_case_events(candidate_case_id,event_type,previous_status,new_status,reason,payload,actor_id)
         VALUES ($1,'STATUS_CHANGED',$2,$3,$4,$5,$6)`,
        [id, previous, input.newStatus, input.reason, input.payload, actorId]
      );
      if (input.newStatus === 'TECHNICAL_REVIEW') await this.queueNotification(client,id,'TECHNICAL_REVIEW_REQUESTED',id);
      return updated.rows[0];
    });
  }

  async decideCase(id: string, input: any, actorId: string) {
    return withTransaction(async (client) => {
      const decision = await client.query(
        `INSERT INTO review_decisions(candidate_case_id,decision,rationale,target_record_id,decided_by,metadata)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [id,input.decision,input.rationale,input.targetRecordId ?? null,actorId,input.metadata]
      );
      const status = input.decision === 'APPROVE' ? 'APPROVED' : input.decision === 'REJECT' ? 'REJECTED' : input.decision === 'RETURN_TO_DRAFT' ? 'DRAFTED' : null;
      if (status) {
        await client.query('UPDATE candidate_cases SET status=$2,updated_at=now(),closed_at=CASE WHEN $2 IN (\'APPROVED\',\'REJECTED\') THEN now() ELSE closed_at END WHERE id=$1',[id,status]);
        await client.query(`INSERT INTO candidate_case_events(candidate_case_id,event_type,new_status,reason,actor_id,payload) VALUES ($1,'REVIEW_DECISION',$2,$3,$4,$5)`,[id,status,input.rationale,actorId,{decision:input.decision}]);
      }
      return decision.rows[0];
    });
  }

  async createKnowledge(input: any, actorId: string) {
    return withTransaction(async (client) => {
      const record = await client.query(`INSERT INTO knowledge_records(external_id,record_type,owner_actor_id) VALUES ($1,$2,$3) RETURNING *`,[input.externalId,input.recordType,actorId]);
      const version = await client.query(
        `INSERT INTO knowledge_record_versions(record_id,version_number,schema_version,title,summary,content,content_hash,change_reason,created_by)
         VALUES ($1,1,$2,$3,$4,$5,encode(digest($5::text,'sha256'),'hex'),$6,$7) RETURNING *`,
        [record.rows[0].id,input.schemaVersion,input.title,input.summary ?? null,input.content,input.changeReason,actorId]
      );
      await client.query('UPDATE knowledge_records SET current_version_id=$2 WHERE id=$1',[record.rows[0].id,version.rows[0].id]);
      return { ...record.rows[0], currentVersion: version.rows[0] };
    });
  }

  async publish(versionId: string, input: any, actorId: string) {
    return withTransaction(async (client) => {
      const result = await client.query(
        `INSERT INTO publication_records(record_version_id,approval_record_id,publication_status,target_environment,published_by)
         VALUES ($1,$2,'QUEUED',$3,$4) RETURNING *`,
        [versionId,input.approvalRecordId,input.targetEnvironment,actorId]
      );
      return result.rows[0];
    });
  }

  async convertCaseToKnowledge(caseId: string, input: any, actorId: string) {
    return withTransaction(async (client) => {
      // Verify case exists and is approved
      const caseResult = await client.query('SELECT * FROM candidate_cases WHERE id=$1', [caseId]);
      if (!caseResult.rowCount) throw new Error('Candidate case not found');
      const candidateCase = caseResult.rows[0];
      if (candidateCase.status !== 'APPROVED') throw new Error('Case must be in APPROVED status');
      if (candidateCase.related_record_id) throw new Error('Case already converted to knowledge');

      // Create knowledge record
      const knowledgeExternalId = `KC-${candidateCase.external_id}-${Date.now()}`;
      const recordResult = await client.query(
        `INSERT INTO knowledge_records(external_id,record_type,owner_actor_id,lifecycle_status)
         VALUES ($1,$2,$3,'DRAFT') RETURNING *`,
        [knowledgeExternalId,input.recordType || 'DIAGNOSTIC',actorId]
      );
      const record = recordResult.rows[0];

      // Create initial version
      const versionResult = await client.query(
        `INSERT INTO knowledge_record_versions(record_id,version_number,schema_version,title,summary,content,content_hash,change_reason,created_by)
         VALUES ($1,1,$2,$3,$4,$5,encode(digest($5::text,'sha256'),'hex'),$6,$7) RETURNING *`,
        [
          record.id,
          input.schemaVersion || '1.0',
          input.title || candidateCase.symptom_summary?.slice(0, 100) || 'Auto-generated from candidate case',
          input.summary || candidateCase.symptom_summary?.slice(0, 500),
          input.content || { originalCaseId: caseId, source: 'AUTO_CONVERTED_FROM_CANDIDATE_CASE' },
          `Converted from candidate case ${candidateCase.external_id}`,
          actorId
        ]
      );

      // Link case to knowledge record
      await client.query('UPDATE candidate_cases SET related_record_id=$2,updated_at=now() WHERE id=$1', [caseId, record.id]);
      await client.query('UPDATE knowledge_records SET current_version_id=$2 WHERE id=$1', [record.id, versionResult.rows[0].id]);

      // Log the conversion
      await client.query(
        `INSERT INTO candidate_case_events(candidate_case_id,event_type,new_status,reason,actor_id,payload)
         VALUES ($1,'CONVERTED_TO_KNOWLEDGE','APPROVED','Converted to knowledge record',$2,$3)`,
        [caseId, actorId, { knowledgeRecordId: record.id }]
      );

      return { ...record, currentVersion: versionResult.rows[0] };
    });
  }

  private async queueNotification(client: pg.PoolClient, candidateCaseId: string, eventType: string, keyPart: string) {
    await client.query(
      `INSERT INTO notification_deliveries(candidate_case_id,event_type,idempotency_key,recipient,sender,delivery_status)
       VALUES ($1,$2,$3,'support@elimfilters.com','support@elimfilters.com','QUEUED') ON CONFLICT (idempotency_key) DO NOTHING`,
      [candidateCaseId,eventType,`${eventType}:${keyPart}`]
    );
  }
}
