import crypto from 'node:crypto';
import express, { type Request } from 'express';
import { Pool } from 'pg';
import { z } from 'zod';

const required = z.object({
  PORT: z.coerce.number().int().positive().default(3012),
  DATABASE_URL: z.string().min(1),
  KNOWLEDGE_API_URL: z.string().url(),
  KNOWLEDGE_API_KEY: z.string().min(16),
  SYSTEM_ACTOR_ID: z.string().uuid(),
  META_APP_SECRET: z.string().min(8),
  META_VERIFY_TOKEN: z.string().min(8),
  WEB_CHAT_SHARED_SECRET: z.string().min(8)
}).parse(process.env);

const pool = new Pool({ connectionString: required.DATABASE_URL, max: 10 });
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '2mb', verify: (req, _res, buf) => { (req as Request & { rawBody?: Buffer }).rawBody = Buffer.from(buf); } }));

const normalizedSchema = z.object({
  channel: z.enum(['WHATSAPP','INSTAGRAM','WEB_CHAT','EMAIL','IMPORT']),
  provider: z.string().min(1),
  externalEventId: z.string().min(1),
  externalConversationId: z.string().min(1),
  externalContactId: z.string().optional(),
  contactDisplayName: z.string().optional(),
  contactAddress: z.string().optional(),
  direction: z.enum(['INBOUND','OUTBOUND','SYSTEM']).default('INBOUND'),
  eventType: z.string().min(1),
  occurredAt: z.string().datetime(),
  text: z.string().optional(),
  raw: z.record(z.string(), z.unknown()),
  metadata: z.record(z.string(), z.unknown()).default({})
});

type Normalized = z.infer<typeof normalizedSchema>;

function verifyHmac(raw: Buffer, signature: string | undefined, secret: string): boolean {
  if (!signature) return false;
  const expected = `sha256=${crypto.createHmac('sha256', secret).update(raw).digest('hex')}`;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function shouldCreateCase(event: Normalized): boolean {
  if (event.direction !== 'INBOUND' || !event.text) return false;
  const text = event.text.toLowerCase();
  const technicalSignals = ['filter','filtro','pressure','presión','oil','aceite','fuel','combustible','hydraulic','hidrául','coolant','refrigerante','air','aire','failure','falla','cross reference','equivalent','equivalente'];
  return technicalSignals.some(signal => text.includes(signal));
}

async function createCandidateCase(event: Normalized): Promise<string> {
  const response = await fetch(`${required.KNOWLEDGE_API_URL}/candidate-cases`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': required.KNOWLEDGE_API_KEY,
      'x-actor-id': required.SYSTEM_ACTOR_ID,
      'x-actor-role': 'SYSTEM'
    },
    body: JSON.stringify({
      externalId: `CH-${event.channel}-${event.externalEventId}`,
      sourceChannel: event.channel,
      priority: 'NORMAL',
      symptomSummary: event.text ?? `[${event.eventType}]`,
      structuredIntake: {
        provider: event.provider,
        externalConversationId: event.externalConversationId,
        externalContactId: event.externalContactId,
        contactDisplayName: event.contactDisplayName,
        contactAddress: event.contactAddress,
        eventType: event.eventType,
        metadata: event.metadata
      }
    })
  });
  if (!response.ok) throw new Error(`Knowledge API ${response.status}: ${await response.text()}`);
  const body = z.object({ id: z.string().uuid() }).parse(await response.json());
  return body.id;
}

async function ingest(eventInput: unknown, signatureVerified: boolean): Promise<{ duplicate: boolean; candidateCaseId?: string }> {
  const event = normalizedSchema.parse(eventInput);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const conversation = await client.query(
      `INSERT INTO knowledge_center.channel_conversations(channel,external_conversation_id,external_contact_id,contact_display_name,contact_address,metadata,last_seen_at)
       VALUES($1,$2,$3,$4,$5,$6,now())
       ON CONFLICT(channel,external_conversation_id) DO UPDATE SET external_contact_id=COALESCE(EXCLUDED.external_contact_id,knowledge_center.channel_conversations.external_contact_id),contact_display_name=COALESCE(EXCLUDED.contact_display_name,knowledge_center.channel_conversations.contact_display_name),contact_address=COALESCE(EXCLUDED.contact_address,knowledge_center.channel_conversations.contact_address),metadata=knowledge_center.channel_conversations.metadata||EXCLUDED.metadata,last_seen_at=now()
       RETURNING id`,
      [event.channel,event.externalConversationId,event.externalContactId??null,event.contactDisplayName??null,event.contactAddress??null,event.metadata]
    );
    const inserted = await client.query(
      `INSERT INTO knowledge_center.channel_events(channel,provider,external_event_id,conversation_id,direction,event_type,occurred_at,text_content,normalized_payload,raw_payload,signature_verified,processing_status)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'NORMALIZED')
       ON CONFLICT(channel,provider,external_event_id) DO NOTHING RETURNING id`,
      [event.channel,event.provider,event.externalEventId,conversation.rows[0].id,event.direction,event.eventType,event.occurredAt,event.text??null,event,event.raw,signatureVerified]
    );
    if (!inserted.rowCount) { await client.query('ROLLBACK'); return { duplicate: true }; }
    await client.query('COMMIT');

    if (!shouldCreateCase(event)) {
      await pool.query(`UPDATE knowledge_center.channel_events SET processing_status='IGNORED',processed_at=now() WHERE id=$1`,[inserted.rows[0].id]);
      return { duplicate: false };
    }

    try {
      const candidateCaseId = await createCandidateCase(event);
      await pool.query(`UPDATE knowledge_center.channel_events SET processing_status='CASE_CREATED',candidate_case_id=$2,processed_at=now() WHERE id=$1`,[inserted.rows[0].id,candidateCaseId]);
      return { duplicate: false, candidateCaseId };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown processing failure';
      await pool.query(`UPDATE knowledge_center.channel_events SET processing_status='FAILED',failure_reason=$2,processed_at=now() WHERE id=$1`,[inserted.rows[0].id,message]);
      await pool.query(`INSERT INTO knowledge_center.channel_dead_letters(channel_event_id,channel,provider,error_code,error_message,payload,next_retry_at) VALUES($1,$2,$3,'CASE_CREATION_FAILED',$4,$5,now()+interval '5 minutes')`,[inserted.rows[0].id,event.channel,event.provider,message,event]);
      throw error;
    }
  } finally { client.release(); }
}

app.get('/health', async (_req,res) => { await pool.query('SELECT 1'); res.json({status:'ok',service:'knowledge-channel-gateway'}); });

app.get('/webhooks/meta', (req,res) => {
  if (req.query['hub.verify_token'] !== required.META_VERIFY_TOKEN) return res.sendStatus(403);
  res.status(200).send(String(req.query['hub.challenge'] ?? ''));
});

app.post('/webhooks/meta', async (req: Request & { rawBody?: Buffer },res,next) => {
  try {
    if (!verifyHmac(req.rawBody ?? Buffer.alloc(0), req.header('x-hub-signature-256'), required.META_APP_SECRET)) return res.sendStatus(401);
    const body = req.body as any;
    const events: Normalized[] = [];
    for (const entry of body.entry ?? []) for (const change of entry.changes ?? []) {
      const value = change.value ?? {};
      for (const message of value.messages ?? []) events.push({channel:'WHATSAPP',provider:'META',externalEventId:String(message.id),externalConversationId:String(message.from),externalContactId:String(message.from),contactAddress:String(message.from),direction:'INBOUND',eventType:String(message.type ?? 'message'),occurredAt:new Date(Number(message.timestamp)*1000).toISOString(),text:message.text?.body,raw:message,metadata:{phoneNumberId:value.metadata?.phone_number_id}});
      for (const messaging of entry.messaging ?? []) events.push({channel:'INSTAGRAM',provider:'META',externalEventId:String(messaging.message?.mid ?? `${entry.id}-${messaging.timestamp}`),externalConversationId:String(messaging.sender?.id),externalContactId:String(messaging.sender?.id),direction:'INBOUND',eventType:'message',occurredAt:new Date(Number(messaging.timestamp)).toISOString(),text:messaging.message?.text,raw:messaging,metadata:{recipientId:messaging.recipient?.id}});
    }
    const results=[]; for (const event of events) results.push(await ingest(event,true));
    res.status(200).json({accepted:results.length,results});
  } catch (error) { next(error); }
});

app.post('/webhooks/web-chat', async (req,res,next) => {
  try {
    if (req.header('x-web-chat-secret') !== required.WEB_CHAT_SHARED_SECRET) return res.sendStatus(401);
    const input=z.object({eventId:z.string(),conversationId:z.string(),contactId:z.string().optional(),name:z.string().optional(),email:z.string().email().optional(),text:z.string(),occurredAt:z.string().datetime().default(()=>new Date().toISOString()),metadata:z.record(z.string(),z.unknown()).default({})}).parse(req.body);
    res.status(202).json(await ingest({channel:'WEB_CHAT',provider:'ELIMFILTERS_WEB',externalEventId:input.eventId,externalConversationId:input.conversationId,externalContactId:input.contactId,contactDisplayName:input.name,contactAddress:input.email,direction:'INBOUND',eventType:'message',occurredAt:input.occurredAt,text:input.text,raw:input,metadata:input.metadata},true));
  } catch(error){next(error);}
});

app.post('/internal/email-events', async (req,res,next) => {
  try {
    if (req.header('x-api-key') !== required.KNOWLEDGE_API_KEY) return res.sendStatus(401);
    const input=z.object({messageId:z.string(),conversationId:z.string(),from:z.string(),fromName:z.string().optional(),subject:z.string(),bodyText:z.string(),receivedAt:z.string().datetime(),metadata:z.record(z.string(),z.unknown()).default({})}).parse(req.body);
    res.status(202).json(await ingest({channel:'EMAIL',provider:'MICROSOFT_GRAPH',externalEventId:input.messageId,externalConversationId:input.conversationId,externalContactId:input.from,contactDisplayName:input.fromName,contactAddress:input.from,direction:'INBOUND',eventType:'email',occurredAt:input.receivedAt,text:`${input.subject}\n${input.bodyText}`,raw:input,metadata:input.metadata},true));
  } catch(error){next(error);}
});

app.use((error: unknown,_req:Request,res:express.Response,_next:express.NextFunction)=>{const message=error instanceof Error?error.message:'Unexpected error';res.status(error instanceof z.ZodError?400:500).json({error:'CHANNEL_GATEWAY_ERROR',message});});

const server=app.listen(required.PORT,()=>console.log(JSON.stringify({event:'listening',port:required.PORT})));
for(const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.close(async()=>{await pool.end();process.exit(0);}));
