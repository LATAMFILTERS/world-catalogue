#!/usr/bin/env node

const required = [
  'KNOWLEDGE_CENTER_API_URL',
  'KNOWLEDGE_CHANNEL_GATEWAY_URL',
  'KNOWLEDGE_ENGINE_RUNTIME_URL',
  'KNOWLEDGE_REVIEW_URL'
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(2);
  }
}

const checks = [
  ['knowledge-center-api', `${process.env.KNOWLEDGE_CENTER_API_URL}/health`],
  ['knowledge-channel-gateway', `${process.env.KNOWLEDGE_CHANNEL_GATEWAY_URL}/health`],
  ['knowledge-engine-runtime', `${process.env.KNOWLEDGE_ENGINE_RUNTIME_URL}/health`],
  ['knowledge-review', `${process.env.KNOWLEDGE_REVIEW_URL}/`]
];

let failed = false;

for (const [name, url] of checks) {
  try {
    const response = await fetch(url, {
      redirect: 'manual',
      headers: { 'user-agent': 'elimfilters-knowledge-center-smoke-test/1.0' }
    });

    const acceptable = name === 'knowledge-review'
      ? [200, 302, 307, 401, 403].includes(response.status)
      : response.ok;

    if (!acceptable) {
      failed = true;
      console.error(`${name}: FAIL (${response.status})`);
      continue;
    }

    console.log(`${name}: PASS (${response.status})`);
  } catch (error) {
    failed = true;
    console.error(`${name}: FAIL (${error instanceof Error ? error.message : String(error)})`);
  }
}

process.exit(failed ? 1 : 0);
