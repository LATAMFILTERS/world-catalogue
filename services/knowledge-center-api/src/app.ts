import { createRequire } from 'module';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { routes } from './routes.js';
import { errorHandler } from './http.js';
import { pool } from './db.js';

const require = createRequire(import.meta.url);
const pinoHttp = require('pino-http');

export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: false }));
app.use(express.json({ limit: config.REQUEST_BODY_LIMIT }));
app.use(pinoHttp({ redact: ['req.headers.x-api-key', 'req.body.credentials', 'req.body.accessToken'] }));
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'knowledge-center-api' });
  } catch (error) {
    res.status(503).json({ status: 'not_ready', service: 'knowledge-center-api' });
  }
});
app.use('/api/knowledge-center/v1', routes);
app.use((_req, res) => res.status(404).json({ error: 'NOT_FOUND' }));
app.use(errorHandler);
