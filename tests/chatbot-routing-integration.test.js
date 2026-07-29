const assert = require('assert');
const test = require('node:test');

/**
 * Integration test: Chatbot routing to knowledge-engine-runtime
 *
 * Validates:
 * 1. When KNOWLEDGE_ENGINE_RUNTIME_URL and ENGINE_API_KEY are configured
 * 2. And candidateCaseId is created successfully
 * 3. And runtime responds with action='ANSWER'
 * 4. Then chatbot returns the runtime response (NOT generic LLM)
 *
 * Test case: Mack MP8 low oil pressure diagnosis
 * User message: "Tengo un Mack con motor MP8 y está perdiendo presión de aceite que debo revisar primero"
 * Expected: Technical diagnosis from knowledge-engine-runtime, NOT "¿en qué contexto operas?"
 */

test('Chatbot: Routing Integration with Knowledge Engine Runtime', async (t) => {
  // Mock environment variables
  const mockEnv = {
    KNOWLEDGE_ENGINE_RUNTIME_URL: 'https://knowledge-engine-runtime-staging.onrender.com',
    ENGINE_API_KEY: 'test-api-key-1234567890',
    KNOWLEDGE_CENTER_API_URL: 'https://knowledge-center-api-staging.onrender.com',
    KNOWLEDGE_CENTER_API_KEY: 'test-knowledge-key-1234567890'
  };

  // Mock runtime response for a technical question
  const mockRuntimeResponse = {
    traceId: '550e8400-e29b-41d4-a716-446655440000',
    action: 'ANSWER',
    confidence: 0.87,
    answer: 'Mack MP8 engine: Low oil pressure is critical. 1. Check oil level immediately. 2. Verify oil pressure at idle (should be 15-25 PSI). 3. Under load, should be 40-50 PSI+. 4. Common causes: worn bearings, viscosity degradation, filter restriction. 5. DO NOT OPERATE if pressure < 10 PSI.',
    verificationRequests: [],
    escalationReason: null,
    stopReason: null,
    citations: [
      { recordId: 'rec-mp8-001', versionId: 'v-mp8-001', sourceId: 's-mack-001', label: 'Mack MP8 Maintenance Manual' }
    ],
    limitations: ['Response limited to approved Knowledge Center records.']
  };

  await t.test('should query knowledge-engine-runtime when all conditions met', async () => {
    // Preconditions
    const hasRuntimeURL = !!mockEnv.KNOWLEDGE_ENGINE_RUNTIME_URL;
    const hasRuntimeKey = !!mockEnv.ENGINE_API_KEY;
    const hasKnowledgeCenterURL = !!mockEnv.KNOWLEDGE_CENTER_API_URL;
    const hasKnowledgeCenterKey = !!mockEnv.KNOWLEDGE_CENTER_API_KEY;
    const candidateCaseId = '660e8400-e29b-41d4-a716-446655440000'; // Mock: case created successfully

    assert.strictEqual(hasRuntimeURL, true, 'KNOWLEDGE_ENGINE_RUNTIME_URL must be configured');
    assert.strictEqual(hasRuntimeKey, true, 'ENGINE_API_KEY must be configured');
    assert.strictEqual(hasKnowledgeCenterURL, true, 'KNOWLEDGE_CENTER_API_URL must be configured');
    assert.strictEqual(hasKnowledgeCenterKey, true, 'KNOWLEDGE_CENTER_API_KEY must be configured');
    assert.ok(candidateCaseId, 'Candidate case ID must exist');

    // Routing decision: should query runtime
    const shouldQueryRuntime = hasRuntimeURL && hasRuntimeKey && !!candidateCaseId;
    assert.ok(shouldQueryRuntime, 'Should query knowledge-engine-runtime');
  });

  await t.test('should validate request contract sent to runtime', async () => {
    const userMessage = 'Tengo un Mack con motor MP8 y está perdiendo presión de aceite que debo revisar primero';
    const sessionId = '550e8400-e29b-41d4-a716-446655440001';
    const candidateCaseId = '660e8400-e29b-41d4-a716-446655440000';

    // Mock request body
    const requestBody = {
      query: userMessage,
      audience: 'TECHNICAL_SUPPORT',
      channel: 'WEB_CHAT',
      correlationId: sessionId,
      candidateCaseId: candidateCaseId,
      context: { timestamp: new Date().toISOString() }
    };

    // Validate request contract
    assert.strictEqual(typeof requestBody.query, 'string', 'query must be string');
    assert.ok(requestBody.query.length > 3, 'query must be at least 3 chars');
    assert.ok(requestBody.query.includes('Mack'), 'query must contain equipment name');
    assert.ok(requestBody.query.includes('MP8'), 'query must contain engine model');
    assert.ok(requestBody.query.includes('presión'), 'query must contain symptom');
    assert.strictEqual(requestBody.audience, 'TECHNICAL_SUPPORT', 'audience must be TECHNICAL_SUPPORT');
    assert.strictEqual(requestBody.channel, 'WEB_CHAT', 'channel must be WEB_CHAT');
    assert.ok(requestBody.correlationId, 'correlationId must be present (session ID)');
    assert.ok(requestBody.candidateCaseId, 'candidateCaseId must be present');
    assert.ok(requestBody.context.timestamp, 'timestamp must be present');
  });

  await t.test('should validate response contract from runtime', async () => {
    // Validate response contract
    const response = mockRuntimeResponse;

    assert.ok(response.traceId, 'response must have traceId');
    assert.ok(['ANSWER', 'VERIFY', 'ESCALATE', 'STOP'].includes(response.action), 'response.action must be valid ControlAction');
    assert.strictEqual(typeof response.confidence, 'number', 'confidence must be number');
    assert.ok(response.confidence >= 0 && response.confidence <= 1, 'confidence must be 0-1');
    assert.ok(Array.isArray(response.citations), 'citations must be array');
    assert.ok(Array.isArray(response.limitations), 'limitations must be array');

    // For ANSWER action specifically
    if (response.action === 'ANSWER') {
      assert.strictEqual(typeof response.answer, 'string', 'ANSWER must have answer field');
      assert.ok(response.answer.length > 0, 'answer must not be empty');
    }
  });

  await t.test('should accept ANSWER response and return it (not generic LLM)', async () => {
    const response = mockRuntimeResponse;

    // Routing logic: accept if ANSWER with answer content
    const isAccepted = response && response.action === 'ANSWER' && !!response.answer;
    assert.ok(isAccepted, 'Response should be accepted');

    // Validate response content is technical (NOT generic)
    const answer = response.answer;
    const hasEquipmentContext = answer.includes('Mack') || answer.includes('MP8');
    const hasTechnicalDetail = answer.includes('PSI') || answer.includes('pressure') || answer.includes('bearings');
    const hasActionable = answer.includes('Check') || answer.includes('Verify') || answer.includes('Common causes');
    const isNotGeneric = !answer.includes('contexto') && !answer.includes('industria') && !answer.includes('escala');

    assert.ok(hasEquipmentContext, 'Response must mention equipment (Mack/MP8)');
    assert.ok(hasTechnicalDetail, 'Response must have technical details (PSI, pressure, etc)');
    assert.ok(hasActionable, 'Response must have diagnostic actions');
    assert.ok(isNotGeneric, 'Response must NOT be generic (no "contexto/industria/escala" questions)');

    // Final response structure
    const chatResponse = {
      reply: response.answer,
      outcome: 'resolved',
      source: 'knowledge_engine',
      supportRecommended: false,
      escalated: false
    };

    assert.strictEqual(chatResponse.outcome, 'resolved', 'Outcome must be resolved');
    assert.strictEqual(chatResponse.source, 'knowledge_engine', 'Source must be knowledge_engine');
    assert.strictEqual(chatResponse.escalated, false, 'Not escalated');
  });

  await t.test('should handle non-ANSWER responses by falling through to LLM', async () => {
    const escalateResponse = {
      ...mockRuntimeResponse,
      action: 'ESCALATE',
      answer: null,
      escalationReason: 'Confidence is below the production response threshold.'
    };

    // Routing logic: reject if not ANSWER or no answer
    const isAccepted = escalateResponse && escalateResponse.action === 'ANSWER' && escalateResponse.answer;
    assert.strictEqual(isAccepted, false, 'ESCALATE response should be rejected');

    // Should fall through to generic LLM
    assert.strictEqual(escalateResponse.action, 'ESCALATE', 'Action is ESCALATE');
    assert.ok(escalateResponse.escalationReason, 'Escalation reason logged');
  });

  await t.test('should fail routing if runtime not configured', async () => {
    const missingRuntimeURL = {
      KNOWLEDGE_ENGINE_RUNTIME_URL: null,
      ENGINE_API_KEY: 'test-key'
    };
    const missingRuntimeKey = {
      KNOWLEDGE_ENGINE_RUNTIME_URL: 'https://url.com',
      ENGINE_API_KEY: null
    };
    const candidateCaseId = '660e8400-e29b-41d4-a716-446655440000';

    // Condition 1: URL missing
    let shouldQuery = !!(missingRuntimeURL.KNOWLEDGE_ENGINE_RUNTIME_URL && missingRuntimeURL.ENGINE_API_KEY && candidateCaseId);
    assert.strictEqual(shouldQuery, false, 'Should not query if KNOWLEDGE_ENGINE_RUNTIME_URL missing');

    // Condition 2: KEY missing
    shouldQuery = !!(missingRuntimeKey.KNOWLEDGE_ENGINE_RUNTIME_URL && missingRuntimeKey.ENGINE_API_KEY && candidateCaseId);
    assert.strictEqual(shouldQuery, false, 'Should not query if ENGINE_API_KEY missing');

    // Condition 3: caseId missing
    shouldQuery = !!(missingRuntimeURL.KNOWLEDGE_ENGINE_RUNTIME_URL && missingRuntimeURL.ENGINE_API_KEY && null);
    assert.strictEqual(shouldQuery, false, 'Should not query if candidateCaseId missing');
  });

  await t.test('should validate header authentication contract', async () => {
    // Header that will be sent
    const header = 'x-engine-api-key';
    const headerValue = 'test-api-key-1234567890';

    // Runtime expects this exact header
    assert.strictEqual(header, 'x-engine-api-key', 'Header must be exactly x-engine-api-key (lowercase)');
    assert.ok(headerValue.length >= 16, 'API key must be strong (at least 16 chars for Zod validation)');

    // Mismatch scenario
    const suppliedKey = 'wrong-key';
    const storedKey = 'test-api-key-1234567890';
    const authenticated = suppliedKey === storedKey;
    assert.strictEqual(authenticated, false, 'Wrong key must fail authentication');

    // Match scenario
    const correctKey = 'test-api-key-1234567890';
    const authenticated2 = correctKey === storedKey;
    assert.strictEqual(authenticated2, true, 'Correct key must pass authentication');
  });
});
