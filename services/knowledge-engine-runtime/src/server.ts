import express from 'express';
import helmet from 'helmet';
import pino from 'pino';
import { ZodError } from 'zod';
import { createBridgeApp } from './bridge.js';

const log = pino({ level: process.env.LOG_LEVEL ?? 'info' });
const bridgeUpstream = process.env.BRIDGE_UPSTREAM_URL?.trim();
const port = Number(process.env.PORT ?? 8086);

if (bridgeUpstream) {
  const bridgeApp = createBridgeApp(bridgeUpstream, 'knowledge-engine-runtime');
  const server = bridgeApp.listen(port, () => log.info({ port, bridgeUpstream }, 'knowledge engine bridge started'));
  for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close(() => process.exit(0)));
} else {
  const [{ reasoningRequestSchema }, { ensureRuntimeSchema, readiness, reason }] = await Promise.all([
    import('./contracts.js'),
    import('./runtime.js')
  ]);

  log.info('DATABASE_URL is configured: %s', process.env.DATABASE_URL ? 'yes' : 'no');
  log.info('ENGINE_API_KEY is configured: %s (length: %d)', process.env.ENGINE_API_KEY ? 'yes' : 'no', process.env.ENGINE_API_KEY?.length ?? 0);
  const app = express();
  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));
  app.use((req, res, next) => {
    if (req.path === '/health') return next();
    const supplied = req.header('x-engine-api-key');
    if (!supplied || supplied !== process.env.ENGINE_API_KEY) return res.status(401).json({ error: 'UNAUTHORIZED' });
    next();
  });
  app.get('/health', async (_req, res) => {
    try {
      await readiness();
      res.json({ status: 'ok', service: 'knowledge-engine-runtime', schema: 'ready' });
    } catch (error) {
      log.error({ err: error }, 'knowledge engine readiness failed');
      res.status(503).json({ status: 'not_ready', service: 'knowledge-engine-runtime' });
    }
  });

  app.post('/api/knowledge-engine/v1/reason', async (req, res) => {
    try {
      const input = reasoningRequestSchema.parse(req.body);
      res.json(await reason(input));
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: 'INVALID_REQUEST', issues: error.issues.map(issue => ({ path: issue.path.join('.'), code: issue.code, message: issue.message })) });
      }
      log.error({ err: error }, 'knowledge engine reasoning failed');
      res.status(503).json({ error: 'KNOWLEDGE_ENGINE_UNAVAILABLE' });
    }
  });

  try {
    await ensureRuntimeSchema();
    await readiness();
    const server = app.listen(port, () => log.info({ port }, 'knowledge engine runtime started'));
    for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close(() => process.exit(0)));
  } catch (error) {
    log.fatal({ err: error }, 'knowledge engine runtime startup failed');
    process.exit(1);
  }
}
