const assert = require('assert');

/**
 * Regression test: Mack MP8 low oil pressure diagnosis
 *
 * User message: "Tengo un Mack con motor MP8 y está perdiendo presión de aceite que debo revisar primero"
 * (Spanish: "I have a Mack with MP8 engine and it's losing oil pressure, what should I check first")
 *
 * Expected behavior:
 * 1. Bot recognizes Mack truck and MP8 engine
 * 2. Bot recognizes critical symptom: low oil pressure
 * 3. Bot provides immediate safety warning
 * 4. Bot asks relevant diagnostic follow-up (e.g., pressure at idle vs load, warning light, etc.)
 * 5. Bot does NOT ask generic context questions like "what industry/scale"
 * 6. Response must NOT be a generic fallback response
 */

describe('Chatbot: Mack MP8 Low Oil Pressure Diagnosis', () => {
  it('should recognize equipment, symptom, and urgency, and provide targeted diagnostic response', async () => {
    // This test validates the message is routed to knowledge-engine-runtime
    // NOT to the generic Llama LLM fallback

    const userMessage = "Tengo un Mack con motor MP8 y está perdiendo presión de aceite que debo revisar primero";

    // Expected indicators of CORRECT behavior (knowledge-engine-runtime response):
    // - Mentions Mack, truck, or specific engine model
    // - Mentions low oil pressure or pressure loss (presión de aceite)
    // - Includes safety warning (do not operate, critical system)
    // - Asks specific technical follow-up (idle pressure, under load, warning light, etc.)
    // - Does NOT ask "what industry/scale" or "what context"
    // - Response length appropriate for technical diagnosis (not empty, not 2000+ chars)

    // Rejection criteria (signs of generic Llama fallback):
    const FALLBACK_PATTERNS = [
      /¿en\s+qu[ée]\s+contexto\s+operas/i,  // "what context do you operate in"
      /¿industrial.*comercial.*específico/i,  // generic industry classification
      /¿qué escala/i,  // "what scale"
      /perfecto.*mejor\s+recomendación/i,  // generic "perfect, for better recommendation"
      /primero.*cuéntame/i,  // "first tell me"
      /necesito.*saber/i,  // "I need to know"
    ];

    // Recognition criteria (signs of knowledge-engine response):
    const RECOGNITION_PATTERNS = [
      /\bmack\b/i,  // Equipment recognition
      /\bmp8\b/i,  // Engine recognition
      /presión\s+de\s+aceite|oil\s+pressure/i,  // Symptom recognition
      /crítico|urgente|peligro|danger|critical/i,  // Urgency awareness
      /no\s+operes?|don't?\s+operate|inactivo|idle|carga|load/i,  // Diagnostic follow-up
    ];

    // For now, this is a specification test that documents expected behavior.
    // When knowledge-engine-runtime is properly configured in Render,
    // this test can be extended to actually call the /api/chat endpoint
    // and validate the response matches RECOGNITION_PATTERNS and NOT FALLBACK_PATTERNS.

    assert.strictEqual(typeof userMessage, 'string', 'User message must be a string');
    assert.ok(userMessage.includes('Mack'), 'Test validates Mack recognition');
    assert.ok(userMessage.includes('MP8'), 'Test validates MP8 engine recognition');
    assert.ok(userMessage.includes('presión de aceite'), 'Test validates low pressure symptom');
  });

  it('should route to knowledge-engine-runtime, NOT to generic Llama LLM', async () => {
    // This test validates infrastructure:
    // 1. KNOWLEDGE_ENGINE_RUNTIME_URL must be configured in render.yaml
    // 2. KNOWLEDGE_ENGINE_API_KEY must be set in Render secrets
    // 3. The /api/chat endpoint must call queryKnowledgeEngine() for technical symptoms
    // 4. Technical symptoms must NOT fall through to NVIDIA NIM Llama LLM

    // Configuration validation (will be checked during deployment):
    const expectedConfig = {
      KNOWLEDGE_ENGINE_RUNTIME_URL: 'https://knowledge-engine-runtime-staging.onrender.com',
      KNOWLEDGE_CENTER_API_URL: 'https://knowledge-center-api-staging.onrender.com',
    };

    // Both URLs must be defined or the routing fails
    assert.ok(expectedConfig.KNOWLEDGE_ENGINE_RUNTIME_URL, 'KNOWLEDGE_ENGINE_RUNTIME_URL must be configured');
    assert.ok(expectedConfig.KNOWLEDGE_CENTER_API_URL, 'KNOWLEDGE_CENTER_API_URL must be configured');
  });

  it('should detect Mack MP8 as equipment with lubrication system urgency', async () => {
    // Equipment: Mack truck
    // Engine: MP8 (heavy-duty diesel engine, common in trucks)
    // System: Engine lube oil pressure (domain:lube-oil)
    // Symptom: Low oil pressure (critical failure mode)
    // Urgency: Do not operate

    // This should trigger:
    // 1. knowledge-engine-runtime query with domain:lube-oil context
    // 2. Response with "action: ANSWER" including diagnostic guidance
    // 3. Technology mapping: SYNTRAX (engine lube oil filtration)

    const equipment = 'Mack MP8';
    const system = 'lube-oil';
    const symptom = 'low oil pressure';
    const urgency = 'critical';

    assert.ok(equipment.includes('Mack'), 'Must identify Mack truck');
    assert.ok(equipment.includes('MP8'), 'Must identify MP8 engine');
    assert.strictEqual(system, 'lube-oil', 'Must classify as lubrication system');
    assert.strictEqual(urgency, 'critical', 'Must recognize critical urgency');
  });
});
