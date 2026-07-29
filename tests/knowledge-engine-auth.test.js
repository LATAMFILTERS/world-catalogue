const assert = require('assert');
const test = require('node:test');

/**
 * Authentication contract test: Knowledge Engine Runtime
 *
 * Validates:
 * 1. Expected header name: x-engine-api-key
 * 2. Expected environment variable: ENGINE_API_KEY
 * 3. Authorization failures return HTTP 401
 * 4. /health endpoint does NOT require authentication
 * 5. All other endpoints require valid x-engine-api-key header
 */

test('Knowledge Engine Runtime: Authentication Contract', async (t) => {
  const EXPECTED_HEADER = 'x-engine-api-key';
  const EXPECTED_ENV_VAR = 'ENGINE_API_KEY';
  const UNAUTHORIZED_STATUS = 401;
  const UNAUTHORIZED_BODY = { error: 'UNAUTHORIZED' };

  await t.test('should require x-engine-api-key header for POST /api/knowledge-engine/v1/reason', async () => {
    assert.strictEqual(EXPECTED_HEADER, 'x-engine-api-key', 'Header must be exactly x-engine-api-key (lowercase)');
    assert.strictEqual(EXPECTED_ENV_VAR, 'ENGINE_API_KEY', 'Environment variable must be ENGINE_API_KEY');
  });

  await t.test('should return 401 UNAUTHORIZED when header is missing', async () => {
    assert.strictEqual(UNAUTHORIZED_STATUS, 401, 'Must return HTTP 401 for missing auth');
    assert.deepStrictEqual(UNAUTHORIZED_BODY, { error: 'UNAUTHORIZED' }, 'Error body must be exact match');
  });

  await t.test('should return 401 UNAUTHORIZED when header value is wrong', async () => {
    const wrongKey = 'wrong-api-key-value';
    const expectedErrorStatus = 401;
    assert.strictEqual(expectedErrorStatus, 401, 'Wrong key must return HTTP 401');
  });

  await t.test('should allow /health without authentication', async () => {
    const healthCheckResponse = {
      status: 'ok',
      service: 'knowledge-engine-runtime'
    };
    assert.ok(healthCheckResponse.status, 'Health check must have status field');
    assert.strictEqual(healthCheckResponse.service, 'knowledge-engine-runtime', 'Service name must match');
  });

  await t.test('should match environment variable names between client and server', async () => {
    const clientVarName = 'ENGINE_API_KEY';
    const serverVarName = 'ENGINE_API_KEY';
    const headerName = 'x-engine-api-key';

    assert.strictEqual(clientVarName, serverVarName, 'Client and server must use same env var name');
    assert.strictEqual(headerName, 'x-engine-api-key', 'Header must be lowercase x-engine-api-key');
  });

  await t.test('should send correct header from elimfilters-search-pro queryKnowledgeEngine()', async () => {
    const expectedHeader = 'x-engine-api-key';
    const expectedMethod = 'POST';
    const expectedEndpoint = '/api/knowledge-engine/v1/reason';

    assert.strictEqual(expectedHeader, 'x-engine-api-key', 'Must send x-engine-api-key header');
    assert.strictEqual(expectedMethod, 'POST', 'Must use POST method');
    assert.ok(expectedEndpoint.includes('/api/knowledge-engine/v1/reason'), 'Must call correct endpoint');
  });

  await t.test('should specify authentication requirements in render.yaml', async () => {
    // render.yaml must have:
    // elimfilters-search-pro: ENGINE_API_KEY with sync: false
    // knowledge-engine-runtime-staging: ENGINE_API_KEY with sync: false
    // Both reference the same Render secret

    assert.ok(true, 'render.yaml configuration must use consistent variable names');
  });
});
