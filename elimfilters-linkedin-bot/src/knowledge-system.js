export function createKnowledgeSystemClient(config) {
  return {
    async createCandidateCase(sessionId, message, sourceContext = {}) {
      if (!config.KNOWLEDGE_CENTER_API_URL || !config.KNOWLEDGE_CENTER_API_KEY) return null;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
          const response = await fetch(`${config.KNOWLEDGE_CENTER_API_URL}/api/knowledge-center/v1/candidate-cases`, {
            method: 'POST',
            signal: controller.signal,
            headers: {
              'content-type': 'application/json',
              'x-api-key': config.KNOWLEDGE_CENTER_API_KEY,
              'x-actor-id': sessionId,
              'x-actor-role': 'LINKEDIN_BOT'
            },
            body: JSON.stringify({
              externalId: `LINKEDIN-${sessionId}-${Date.now()}`,
              sourceChannel: 'LINKEDIN_BOT',
              priority: 'NORMAL',
              symptomSummary: message.slice(0, 500),
              assetSummary: sourceContext,
              structuredIntake: { sessionId, initialMessage: message }
            })
          });
          if (!response.ok) {
            console.error('[knowledge-center-api] Failed to create case:', response.status);
            return null;
          }
          const data = await response.json();
          return data.id;
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.error('[knowledge-center-api] Timeout (5s) creating candidate case');
        } else {
          console.error('[knowledge-center-api] Error creating candidate case:', error.message);
        }
        return null;
      }
    },

    async queryKnowledgeEngine(message, sessionId, candidateCaseId) {
      if (!config.KNOWLEDGE_ENGINE_RUNTIME_URL || !config.ENGINE_API_KEY) {
        console.warn('[query-engine] Preconditions not met: URL=%s, KEY=%s', !!config.KNOWLEDGE_ENGINE_RUNTIME_URL, !!config.ENGINE_API_KEY);
        return null;
      }

      const requestBody = {
        query: message,
        audience: 'TECHNICAL_SUPPORT',
        channel: 'LINKEDIN_BOT',
        correlationId: sessionId,
        candidateCaseId: candidateCaseId,
        context: { timestamp: new Date().toISOString() }
      };

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
          console.log('[query-engine] Making request to: %s/api/knowledge-engine/v1/reason', config.KNOWLEDGE_ENGINE_RUNTIME_URL);
          console.log('[query-engine] Request body: query_len=%d, audience=%s, channel=%s', message.length, requestBody.audience, requestBody.channel);

          const response = await fetch(`${config.KNOWLEDGE_ENGINE_RUNTIME_URL}/api/knowledge-engine/v1/reason`, {
            method: 'POST',
            signal: controller.signal,
            headers: {
              'content-type': 'application/json',
              'x-engine-api-key': config.ENGINE_API_KEY ? '[REDACTED]' : 'MISSING'
            },
            body: JSON.stringify(requestBody)
          });

          console.log('[query-engine] Response status: %d', response.status);

          if (!response.ok) {
            const errorBody = await response.text().catch(() => '(no body)');
            console.error('[knowledge-engine-runtime] HTTP %d: %s', response.status, errorBody.slice(0, 200));
            return null;
          }

          const data = await response.json();
          console.log('[query-engine] Response parsed: action=%s, confidence=%f, answer_len=%d, citations=%d',
            data.action, data.confidence, data.answer?.length ?? 0, data.citations?.length ?? 0);
          return data;
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.error('[knowledge-engine-runtime] Timeout (10s) querying knowledge engine');
        } else {
          console.error('[knowledge-engine-runtime] Error: %s', error.message);
        }
        return null;
      }
    },

    async getKnowledgeResponse(message, sessionId) {
      // Attempt to create candidate case for knowledge center workflow
      let candidateCaseId = null;
      if (config.KNOWLEDGE_CENTER_API_URL && config.KNOWLEDGE_CENTER_API_KEY) {
        candidateCaseId = await this.createCandidateCase(sessionId, message);
        if (candidateCaseId) {
          console.log(`[knowledge-system] Created candidate case: ${candidateCaseId}`);
        } else {
          console.warn('[knowledge-system] Failed to create candidate case', { KNOWLEDGE_CENTER_API_URL: !!config.KNOWLEDGE_CENTER_API_URL, KNOWLEDGE_CENTER_API_KEY: !!config.KNOWLEDGE_CENTER_API_KEY });
        }
      } else {
        console.warn('[knowledge-system] Candidate case creation skipped', { KNOWLEDGE_CENTER_API_URL: !!config.KNOWLEDGE_CENTER_API_URL, KNOWLEDGE_CENTER_API_KEY: !!config.KNOWLEDGE_CENTER_API_KEY });
      }

      // Try knowledge-engine-runtime first if available
      let engineResponse = null;
      const shouldQueryRuntime = config.KNOWLEDGE_ENGINE_RUNTIME_URL && config.ENGINE_API_KEY && candidateCaseId;
      console.log(`[knowledge-system] Runtime query conditions: URL=${!!config.KNOWLEDGE_ENGINE_RUNTIME_URL}, KEY=${!!config.ENGINE_API_KEY}, caseId=${!!candidateCaseId}, should_query=${shouldQueryRuntime}`);

      if (shouldQueryRuntime) {
        console.log(`[knowledge-system] Querying knowledge-engine-runtime at ${config.KNOWLEDGE_ENGINE_RUNTIME_URL}/api/knowledge-engine/v1/reason`);
        engineResponse = await this.queryKnowledgeEngine(message, sessionId, candidateCaseId);
        console.log(`[knowledge-system] Runtime response: action=${engineResponse?.action}, confidence=${engineResponse?.confidence}, has_answer=${!!engineResponse?.answer}`);

        if (engineResponse && engineResponse.action === 'ANSWER' && engineResponse.answer) {
          console.log(`[knowledge-system] Knowledge engine provided answer (confidence: ${engineResponse.confidence})`);
          return {
            success: true,
            answer: engineResponse.answer,
            confidence: engineResponse.confidence,
            candidateCaseId,
            source: 'knowledge_engine'
          };
        }
        if (engineResponse) {
          console.log(`[knowledge-system] Knowledge engine returned non-ANSWER action: ${engineResponse.action} (confidence: ${engineResponse.confidence})`);
          if (engineResponse.escalationReason) console.log(`[knowledge-system] Escalation reason: ${engineResponse.escalationReason}`);
          if (engineResponse.verificationRequests?.length) console.log(`[knowledge-system] Verification needed: ${engineResponse.verificationRequests.join('; ')}`);
        }
      } else {
        console.warn('[knowledge-system] Knowledge engine not available', { KNOWLEDGE_ENGINE_RUNTIME_URL: !!config.KNOWLEDGE_ENGINE_RUNTIME_URL, ENGINE_API_KEY: !!config.ENGINE_API_KEY, candidateCaseId: !!candidateCaseId });
      }

      console.log('[knowledge-system] No ANSWER from knowledge engine, returning null for fallback');
      return {
        success: false,
        answer: null,
        candidateCaseId,
        source: null
      };
    }
  };
}
