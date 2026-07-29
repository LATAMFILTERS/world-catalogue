import { setTimeout } from 'timers/promises';

// === CONFIGURATION ===
const baseUrl = process.env.KNOWLEDGE_CENTER_BASE_URL;
const rawKeys = process.env.KNOWLEDGE_API_KEYS ?? '';
const apiKey = rawKeys.split(',').map((value) => value.trim()).find(Boolean);
const REQUEST_TIMEOUT = 30_000;

// === DIAGNOSTICS ===
console.log('[\x1b[34mSMOKE\x1b[0m] Knowledge Center API Smoke Test');
console.log('[\x1b[34mSMOKE\x1b[0m] Diagnostics:');
console.log(`  Base URL: ${baseUrl || '\x1b[31m[MISSING]\x1b[0m'}`);
console.log(`  API Key: ${apiKey ? '\x1b[32m[present]\x1b[0m' : '\x1b[31m[MISSING]\x1b[0m'}`);
console.log(`  Environment: ${process.env.NODE_ENV || 'unset'}`);
console.log(`  Commit: ${process.env.RENDER_GIT_COMMIT || 'local'}`);
console.log('');

// === VALIDATION ===
if (!baseUrl) {
  console.error('[\x1b[31mFAIL\x1b[0m] KNOWLEDGE_CENTER_BASE_URL environment variable is required');
  console.error('[\x1b[31mFAIL\x1b[0m] For staging: https://knowledge-center-api-staging.onrender.com');
  console.error('[\x1b[31mFAIL\x1b[0m] For local dev: http://127.0.0.1:3002');
  process.exit(1);
}

if (!apiKey) {
  console.error('[\x1b[31mFAIL\x1b[0m] KNOWLEDGE_API_KEYS environment variable is empty or missing');
  console.error('[\x1b[31mFAIL\x1b[0m] Must contain at least one comma-separated API key');
  process.exit(1);
}

// === HEALTH CHECK ===
console.log('[\x1b[34mSMOKE\x1b[0m] Testing /health endpoint...');
try {
  const controller = new AbortController();
  const timeout = setTimeout(REQUEST_TIMEOUT);
  timeout.then(() => controller.abort()).catch(() => {});

  const healthRes = await fetch(`${baseUrl}/health`, {
    signal: controller.signal,
    timeout: REQUEST_TIMEOUT
  });

  const healthBody = await healthRes.text();
  console.log(`[\x1b[32m✓\x1b[0m] /health HTTP ${healthRes.status}`);

  if (healthRes.status === 200) {
    try {
      const parsed = JSON.parse(healthBody);
      console.log(`    Status: ${parsed.status || 'N/A'}`);
      console.log(`    Service: ${parsed.service || 'N/A'}`);
      if (parsed.commit) {
        console.log(`    Commit: ${parsed.commit.substring(0, 12)}`);
      }
    } catch {
      console.log(`    Body: ${healthBody.substring(0, 100)}`);
    }
  }
} catch (error) {
  if (error.name === 'AbortError' || error.code === 'ETIMEDOUT') {
    console.error(`[\x1b[31m✗\x1b[0m] /health request timeout (${REQUEST_TIMEOUT}ms)`);
  } else if (error.code === 'ENOTFOUND') {
    console.error(`[\x1b[31m✗\x1b[0m] /health DNS resolution failed for ${baseUrl}`);
  } else if (error.code === 'ECONNREFUSED') {
    console.error(`[\x1b[31m✗\x1b[0m] /health connection refused (server not listening)`);
  } else if (error.code === 'ERR_TLS_CERT_ALTNAME_INVALID' || error.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
    console.error(`[\x1b[31m✗\x1b[0m] /health TLS certificate error: ${error.message}`);
  } else {
    console.error(`[\x1b[31m✗\x1b[0m] /health request failed: ${error.code || error.message}`);
  }
  console.error('[\x1b[31mFAIL\x1b[0m] Cannot proceed without healthy /health endpoint');
  process.exit(1);
}

console.log('');

// === FUNCTIONAL TEST ===
console.log('[\x1b[34mSMOKE\x1b[0m] Testing POST /api/knowledge-center/v1/candidate-cases...');

const externalId = `SMOKE-${Date.now()}`;
const payload = {
  externalId,
  sourceChannel: 'SYSTEM',
  priority: 'NORMAL',
  symptomSummary: 'Automated staging smoke test',
  assetSummary: {},
  structuredIntake: { smokeTest: true }
};

try {
  const controller = new AbortController();
  const timeout = setTimeout(REQUEST_TIMEOUT);
  timeout.then(() => controller.abort()).catch(() => {});

  const response = await fetch(`${baseUrl}/api/knowledge-center/v1/candidate-cases`, {
    method: 'POST',
    signal: controller.signal,
    timeout: REQUEST_TIMEOUT,
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'x-actor-id': 'system.smoke-test',
      'x-actor-role': 'SYSTEM'
    },
    body: JSON.stringify(payload)
  });

  const body = await response.text();

  console.log(`[\x1b[35m→\x1b[0m] HTTP ${response.status}`);

  if (response.status === 201) {
    console.log('[\x1b[32m✓\x1b[0m] SMOKE_OK: HTTP 201 Created');
    try {
      const parsed = JSON.parse(body);
      console.log(`    Case ID: ${parsed.id || 'N/A'}`);
      console.log(`    External ID: ${parsed.external_id || externalId}`);
    } catch {
      console.log(`    Response: ${body.substring(0, 150)}`);
    }
    process.exit(0);
  } else if (response.status === 400) {
    console.error('[\x1b[31m✗\x1b[0m] HTTP 400 Bad Request');
    console.error('[\x1b[31mFAIL\x1b[0m] Malformed request body or missing required fields');
    console.error(`    Response: ${body.substring(0, 200)}`);
    process.exit(1);
  } else if (response.status === 401) {
    console.error('[\x1b[31m✗\x1b[0m] HTTP 401 Unauthorized');
    console.error('[\x1b[31mFAIL\x1b[0m] Invalid or missing authentication credentials');
    console.error('    Check: x-api-key, x-actor-id, x-actor-role');
    process.exit(1);
  } else if (response.status === 403) {
    console.error('[\x1b[31m✗\x1b[0m] HTTP 403 Forbidden');
    console.error('[\x1b[31mFAIL\x1b[0m] Actor does not have permission for this operation');
    console.error('    Check: x-actor-role permissions');
    process.exit(1);
  } else if (response.status === 500) {
    console.error('[\x1b[31m✗\x1b[0m] HTTP 500 Internal Server Error');
    console.error('[\x1b[31mFAIL\x1b[0m] Server-side error (check Render logs)');
    console.error(`    Response: ${body.substring(0, 200)}`);
    process.exit(1);
  } else if (response.status === 503) {
    console.error('[\x1b[31m✗\x1b[0m] HTTP 503 Service Unavailable');
    console.error('[\x1b[31mFAIL\x1b[0m] Database or dependency unavailable');
    process.exit(1);
  } else {
    console.error(`[\x1b[31m✗\x1b[0m] HTTP ${response.status} Unexpected Status`);
    console.error(`    Response: ${body.substring(0, 200)}`);
    process.exit(1);
  }
} catch (error) {
  console.error(`[\x1b[31m✗\x1b[0m] Request failed`);

  if (error.name === 'AbortError' || error.code === 'ETIMEDOUT') {
    console.error(`[\x1b[31mFAIL\x1b[0m] Request timeout after ${REQUEST_TIMEOUT}ms`);
  } else if (error.code === 'ENOTFOUND') {
    console.error(`[\x1b[31mFAIL\x1b[0m] DNS resolution failed for ${baseUrl}`);
  } else if (error.code === 'ECONNREFUSED') {
    console.error(`[\x1b[31mFAIL\x1b[0m] Connection refused (server not listening or port incorrect)`);
  } else if (error.code === 'ECONNRESET' || error.code === 'ERR_SOCKET') {
    console.error(`[\x1b[31mFAIL\x1b[0m] Connection reset by server`);
  } else if (error.code === 'ERR_TLS_CERT_ALTNAME_INVALID' || error.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
    console.error(`[\x1b[31mFAIL\x1b[0m] TLS certificate error: ${error.message}`);
  } else {
    console.error(`[\x1b[31mFAIL\x1b[0m] ${error.code || error.name || 'Unknown error'}: ${error.message}`);
  }

  process.exit(1);
}
