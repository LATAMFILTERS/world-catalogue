import { createLogger } from "./logger.js";

const logger = createLogger("Knowledge-Engine");

export async function createCandidateCase(config, sessionId, message, channel) {
  if (!config.knowledgeCenterApiUrl || !config.knowledgeCenterApiKey) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${config.knowledgeCenterApiUrl}/api/knowledge-center/v1/candidate-cases`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'content-type': 'application/json',
          'x-api-key': config.knowledgeCenterApiKey,
          'x-actor-id': sessionId,
          'x-actor-role': 'SYSTEM'
        },
        body: JSON.stringify({
          externalId: `${channel}-${sessionId}-${Date.now()}`,
          sourceChannel: channel,
          priority: 'NORMAL',
          symptomSummary: message.slice(0, 500),
          assetSummary: {},
          structuredIntake: { sessionId, initialMessage: message }
        })
      });

      if (!response.ok) {
        logger.warn('Failed to create candidate case', { status: response.status });
        return null;
      }

      const data = await response.json();
      logger.debug('Candidate case created', { caseId: data.id });
      return data.id;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      logger.warn('Timeout creating candidate case');
    } else {
      logger.warn('Error creating candidate case', { error: error.message });
    }
    return null;
  }
}

export async function queryKnowledgeEngine(config, message, sessionId, candidateCaseId) {
  if (!config.knowledgeEngineRuntimeUrl || !config.engineApiKey) {
    logger.debug('Knowledge Engine not configured');
    return null;
  }

  const requestBody = {
    query: message,
    audience: 'TECHNICAL_SUPPORT',
    channel: 'INSTAGRAM',
    correlationId: sessionId,
    candidateCaseId: candidateCaseId,
    context: { timestamp: new Date().toISOString() }
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      logger.debug('Querying Knowledge Engine', { messageLength: message.length });

      const response = await fetch(`${config.knowledgeEngineRuntimeUrl}/api/knowledge-engine/v1/reason`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'content-type': 'application/json',
          'x-engine-api-key': config.engineApiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '(no body)');
        logger.warn('Knowledge Engine error', { status: response.status, error: errorBody.slice(0, 200) });
        return null;
      }

      const data = await response.json();
      logger.debug('Knowledge Engine response', {
        action: data.action,
        confidence: data.confidence,
        answerLength: data.answer?.length ?? 0
      });
      return data;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      logger.warn('Knowledge Engine timeout');
    } else {
      logger.warn('Knowledge Engine error', { error: error.message });
    }
    return null;
  }
}
