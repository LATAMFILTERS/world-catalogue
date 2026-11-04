'use strict';
const fs = require('node:fs');
function loadKnowledgeConnection(env = process.env) {
  const filename = env.KNOWLEDGE_STACK_SECRETS_PATH;
  if (!filename) return { configured: Boolean(env.KNOWLEDGE_ENGINE_RUNTIME_URL && env.ENGINE_API_KEY), source: 'environment' };
  try {
    const cfg = JSON.parse(fs.readFileSync(filename, 'utf8').replace(/^\uFEFF/, ''));
    if (!cfg.engineApiKey || !cfg.knowledgeApiKey || !Number.isInteger(Number(cfg.enginePort)) || !Number.isInteger(Number(cfg.apiPort)) || Number(cfg.enginePort) < 1 || Number(cfg.apiPort) < 1 || Number(cfg.enginePort) > 65535 || Number(cfg.apiPort) > 65535) throw new Error('Invalid local knowledge configuration');
    env.KNOWLEDGE_ENGINE_RUNTIME_URL ||= `http://127.0.0.1:${Number(cfg.enginePort)}`;
    env.KNOWLEDGE_CENTER_API_URL ||= `http://127.0.0.1:${Number(cfg.apiPort)}`;
    env.ENGINE_API_KEY ||= cfg.engineApiKey;
    env.KNOWLEDGE_CENTER_API_KEY ||= cfg.knowledgeApiKey;
    // Request submission remains controlled explicitly by the deployment.
    return { configured: true, source: 'local_secret_file' };
  } catch {
    return { configured: false, source: 'local_secret_file', reason: 'KNOWLEDGE_CONNECTION_UNAVAILABLE' };
  }
}
module.exports = { loadKnowledgeConnection };
