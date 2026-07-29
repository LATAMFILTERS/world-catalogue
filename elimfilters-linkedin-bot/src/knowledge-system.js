export function createKnowledgeSystemClient(config) {
  return {
    async createCandidateCase(contactId, linkedinUrn, message, context = {}) {
      if (!config.KNOWLEDGE_CENTER_API_URL || !config.KNOWLEDGE_CENTER_API_KEY) {
        console.warn('[Knowledge System] Missing KNOWLEDGE_CENTER_API configuration');
        return null;
      }

      try {
        const url = new URL('/api/knowledge-center/v1/candidate-cases', config.KNOWLEDGE_CENTER_API_URL);
        const response = await fetch(url, {
          method: 'POST',
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.KNOWLEDGE_CENTER_API_KEY,
            'x-actor-id': contactId,
            'x-actor-role': 'LINKEDIN_BOT'
          },
          body: JSON.stringify({
            contactId,
            linkedinUrn,
            message,
            context: {
              source: 'linkedin',
              channel: 'LINKEDIN_BOT',
              ...context
            }
          })
        });

        if (!response.ok) {
          console.warn(`[Knowledge System] Candidate case creation failed: ${response.status} ${response.statusText}`);
          return null;
        }

        const data = await response.json();
        return data.candidateCaseId || null;
      } catch (err) {
        console.error('[Knowledge System] Error creating candidate case:', err.message);
        return null;
      }
    },

    async queryKnowledgeEngine(message, contactId, linkedinUrn, candidateCaseId) {
      if (!config.KNOWLEDGE_ENGINE_RUNTIME_URL || !config.ENGINE_API_KEY) {
        console.warn('[Knowledge System] Missing KNOWLEDGE_ENGINE_RUNTIME configuration');
        return null;
      }

      try {
        const url = new URL('/api/knowledge-engine/v1/reason', config.KNOWLEDGE_ENGINE_RUNTIME_URL);
        const response = await fetch(url, {
          method: 'POST',
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'x-engine-api-key': config.ENGINE_API_KEY
          },
          body: JSON.stringify({
            query: message,
            requestBody: {
              query: message,
              audience: 'technical',
              channel: 'LINKEDIN_BOT',
              correlationId: contactId,
              candidateCaseId,
              context: {
                source: 'linkedin',
                linkedinUrn
              }
            }
          })
        });

        if (!response.ok) {
          console.warn(`[Knowledge System] Engine query failed: ${response.status} ${response.statusText}`);
          return null;
        }

        const data = await response.json();
        return {
          success: true,
          answer: data.answer || data.response || data.result,
          confidence: data.confidence || 0.8,
          source: data.source || 'knowledge-engine'
        };
      } catch (err) {
        console.error('[Knowledge System] Error querying knowledge engine:', err.message);
        return null;
      }
    },

    async getKnowledgeResponse(message, contactId, linkedinUrn) {
      // Step 1: Create candidate case
      const candidateCaseId = await this.createCandidateCase(contactId, linkedinUrn, message);

      // Step 2: Query knowledge engine
      const engineResponse = await this.queryKnowledgeEngine(message, contactId, linkedinUrn, candidateCaseId);

      if (engineResponse?.success) {
        return {
          success: true,
          answer: engineResponse.answer,
          confidence: engineResponse.confidence,
          candidateCaseId,
          source: engineResponse.source
        };
      }

      return {
        success: false,
        answer: null,
        candidateCaseId,
        source: null
      };
    }
  };
}
