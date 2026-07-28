import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRole, type ActorRequest } from './http.js';
import { KnowledgeCenterService } from './service.js';
import { createCandidateCaseSchema, createKnowledgeSchema, publishSchema, reviewDecisionSchema, transitionCaseSchema } from './contracts.js';
import { pool } from './db.js';

const service = new KnowledgeCenterService();
export const routes = Router();
routes.use(authenticate);

routes.get('/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', service: 'knowledge-center-api' });
});

routes.post('/candidate-cases', requireRole('SUPPORT_REVIEWER','ENGINEERING_REVIEWER','ADMIN','SYSTEM'), async (req: ActorRequest,res) => {
  res.status(201).json(await service.createCandidateCase(createCandidateCaseSchema.parse(req.body), req.actorId!));
});
routes.get('/candidate-cases', requireRole('SUPPORT_REVIEWER','ENGINEERING_REVIEWER','APPROVER','ADMIN'), async (req,res) => {
  const q=z.object({limit:z.coerce.number().int().min(1).max(100).default(25),offset:z.coerce.number().int().min(0).default(0)}).parse(req.query);
  res.json(await service.listReviewQueue(q.limit,q.offset));
});
routes.get('/candidate-cases/:id', requireRole('SUPPORT_REVIEWER','ENGINEERING_REVIEWER','APPROVER','ADMIN'), async (req,res) => {
  const item=await service.getCase(z.string().uuid().parse(req.params.id));
  if(!item){res.status(404).json({error:'NOT_FOUND'});return;} res.json(item);
});
routes.post('/candidate-cases/:id/transitions', requireRole('SUPPORT_REVIEWER','ENGINEERING_REVIEWER','ADMIN','SYSTEM'), async (req:ActorRequest,res) => {
  res.json(await service.transitionCase(z.string().uuid().parse(req.params.id),transitionCaseSchema.parse(req.body),req.actorId!));
});
routes.post('/candidate-cases/:id/decisions', requireRole('ENGINEERING_REVIEWER','APPROVER','ADMIN'), async (req:ActorRequest,res) => {
  res.status(201).json(await service.decideCase(z.string().uuid().parse(req.params.id),reviewDecisionSchema.parse(req.body),req.actorId!));
});
routes.post('/knowledge-records', requireRole('ENGINEERING_REVIEWER','ADMIN','SYSTEM'), async (req:ActorRequest,res) => {
  res.status(201).json(await service.createKnowledge(createKnowledgeSchema.parse(req.body),req.actorId!));
});
routes.post('/knowledge-versions/:id/publications', requireRole('PUBLISHER','ADMIN'), async (req:ActorRequest,res) => {
  res.status(202).json(await service.publish(z.string().uuid().parse(req.params.id),publishSchema.parse(req.body),req.actorId!));
});
routes.get('/notifications/queued', requireRole('NOTIFICATION_WORKER','ADMIN','SYSTEM'), async (_req,res) => {
  const result=await pool.query(`SELECT * FROM knowledge_center.notification_deliveries WHERE delivery_status='QUEUED' ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 50`);
  res.json(result.rows);
});
routes.patch('/notifications/:id', requireRole('NOTIFICATION_WORKER','ADMIN','SYSTEM'), async (req,res) => {
  const body=z.object({status:z.enum(['SENT','DELIVERED','BOUNCED','FAILED','ACKNOWLEDGED']),providerMessageId:z.string().optional(),failureReason:z.string().optional()}).parse(req.body);
  const result=await pool.query(`UPDATE knowledge_center.notification_deliveries SET delivery_status=$2,provider_message_id=COALESCE($3,provider_message_id),failure_reason=$4,attempt_count=attempt_count+1,attempted_at=now(),delivered_at=CASE WHEN $2='DELIVERED' THEN now() ELSE delivered_at END,acknowledged_at=CASE WHEN $2='ACKNOWLEDGED' THEN now() ELSE acknowledged_at END WHERE id=$1 RETURNING *`,[z.string().uuid().parse(req.params.id),body.status,body.providerMessageId??null,body.failureReason??null]);
  res.json(result.rows[0]);
});
