import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3002),
  DATABASE_URL: z.string().min(1),
  DATABASE_SSL: z.enum(['true', 'false']).default('true'),
  KNOWLEDGE_API_KEYS: z.string().min(1),
  KNOWLEDGE_REVIEW_MAILBOX: z.string().email().default('support@elimfilters.com'),
  REQUEST_BODY_LIMIT: z.string().default('1mb')
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid Knowledge Center API configuration: ${parsed.error.message}`);
}

export const config = {
  ...parsed.data,
  apiKeys: new Set(parsed.data.KNOWLEDGE_API_KEYS.split(',').map((v) => v.trim()).filter(Boolean)),
  databaseSsl: parsed.data.DATABASE_SSL === 'true'
};
