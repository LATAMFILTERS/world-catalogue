function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function optional(name, fallback = '') {
  return process.env[name]?.trim() || fallback;
}

function bool(name, fallback = false) {
  const raw = process.env[name];
  if (raw == null) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(raw.trim().toLowerCase());
}

export function loadConfig() {
  const dryRun = bool('DRY_RUN', true);
  return {
    port: Number(process.env.PORT || 10000),
    nodeEnv: optional('NODE_ENV', 'production'),
    dryRun,
    metaAppSecret: required('META_APP_SECRET'),
    metaVerifyToken: required('META_VERIFY_TOKEN'),
    metaPageAccessToken: dryRun ? optional('META_PAGE_ACCESS_TOKEN') : required('META_PAGE_ACCESS_TOKEN'),
    metaPageId: required('META_PAGE_ID'),
    metaGraphVersion: optional('META_GRAPH_VERSION', 'v23.0'),
    knowledgeBaseUrl: required('KNOWLEDGE_BASE_URL').replace(/\/$/, ''),
    knowledgeApiKey: optional('KNOWLEDGE_API_KEY'),
    databaseUrl: optional('DATABASE_URL'),
    requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || 15000),
    maxReplyLength: Number(process.env.MAX_REPLY_LENGTH || 800),
  };
}
