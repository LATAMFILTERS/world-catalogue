'use strict';
const { loadKnowledgeConnection } = require('../../lib/bot-knowledge-connection');
async function main() {
  const config = loadKnowledgeConnection();
  const results = { configured: config.configured, engine: false, review: false };
  if (config.configured) for (const [name, url, header, key] of [
    ['engine', process.env.KNOWLEDGE_ENGINE_RUNTIME_URL, 'x-engine-api-key', process.env.ENGINE_API_KEY],
    ['review', process.env.KNOWLEDGE_CENTER_API_URL, 'x-api-key', process.env.KNOWLEDGE_CENTER_API_KEY]
  ]) { try { const response = await fetch(`${url}/health`, { signal: AbortSignal.timeout(4000) }); results[name] = response.ok; } catch {} }
  console.log(JSON.stringify(results));
  if (!results.engine || !results.review) process.exitCode = 1;
}
main();
