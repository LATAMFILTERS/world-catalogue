import express from 'express';
import { loadConfig } from './config.js';
import { createDatabase } from './database.js';
import { extractFacebookEvents, publishFacebookReply, verifyMetaSignature } from './meta.js';
import { getKnowledgeReply } from './knowledge.js';

const config = loadConfig();
const db = createDatabase(config);
await db.init();

const app = express();
app.use(express.json({
  limit: '1mb',
  verify: (req, _res, buffer) => {
    req.rawBody = buffer;
  },
}));

app.get('/', (_req, res) => {
  res.json({ service: 'elimfilters-facebook-bot', status: 'ok', dryRun: config.dryRun });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/ready', async (_req, res) => {
  const checks = {
    metaAppSecret: Boolean(config.metaAppSecret),
    metaVerifyToken: Boolean(config.metaVerifyToken),
    metaPageId: Boolean(config.metaPageId),
    publisher: config.dryRun || Boolean(config.metaPageAccessToken),
    knowledge: Boolean(config.knowledgeBaseUrl),
    database: db.enabled ? await db.ping().catch(() => false) : null,
  };
  const ready = Object.entries(checks).every(([key, value]) => key === 'database' || value !== false);
  res.status(ready ? 200 : 503).json({ ready, dryRun: config.dryRun, checks });
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === config.metaVerifyToken) {
    console.log('Facebook webhook verification completed');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

app.post('/webhook', (req, res) => {
  const signature = req.get('x-hub-signature-256');
  if (!verifyMetaSignature(req.rawBody || Buffer.alloc(0), signature, config.metaAppSecret)) {
    return res.status(401).json({ error: 'invalid_signature' });
  }

  const events = extractFacebookEvents(req.body, config.metaPageId);
  res.sendStatus(200);

  for (const event of events) {
    void processEvent(event);
  }
});

async function processEvent(event) {
  try {
    const claimed = await db.claim(event);
    if (!claimed) return;

    const reply = await getKnowledgeReply(config, event);
    if (!reply) {
      await db.complete(event.eventId, null);
      console.log(`NO_REPLY for Facebook ${event.type} ${event.eventId}`);
      return;
    }

    const result = await publishFacebookReply(config, event, reply);
    await db.complete(event.eventId, reply);
    console.log(JSON.stringify({ eventId: event.eventId, type: event.type, dryRun: config.dryRun, result }));
  } catch (error) {
    await db.fail(event.eventId, error).catch(() => {});
    console.error(`Facebook event ${event.eventId} failed:`, error);
  }
}

app.listen(config.port, '0.0.0.0', () => {
  console.log(`elimfilters-facebook-bot listening on port ${config.port}; dryRun=${config.dryRun}`);
});
