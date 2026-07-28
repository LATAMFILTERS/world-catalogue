import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { config } from './config.js';
import { routes } from './routes.js';
import { errorHandler } from './http.js';

export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: false }));
app.use(express.json({ limit: config.REQUEST_BODY_LIMIT }));
app.use(pinoHttp({ redact: ['req.headers.x-api-key', 'req.body.credentials', 'req.body.accessToken'] }));
app.use('/api/knowledge-center/v1', routes);
app.use((_req, res) => res.status(404).json({ error: 'NOT_FOUND' }));
app.use(errorHandler);
