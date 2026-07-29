/**
 * KNOWLEDGE SYSTEM BOT INTEGRATION TEMPLATE
 *
 * This file documents the standard pattern for integrating the Knowledge System
 * into any ELIMFILTERS bot (WhatsApp, Instagram, YouTube, LinkedIn, etc).
 *
 * When reactivating bots, copy the knowledge-system.js pattern below and
 * follow the integration checklist in this file.
 */

// ============================================================================
// TEMPLATE: knowledge-system.js (WEB CHAT PATTERN - UNIFIED ACROSS ALL BOTS)
// Copy this to: [bot-directory]/src/knowledge-system.js
// This implements the EXACT SAME pattern as server-original.js for consistency
// ============================================================================

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
              'x-actor-role': '[BOT_CHANNEL]_BOT'  // Replace with WHATSAPP_BOT, INSTAGRAM_BOT, YOUTUBE_BOT, etc
            },
            body: JSON.stringify({
              externalId: `[BOT_CHANNEL]-${sessionId}-${Date.now()}`,  // Replace [BOT_CHANNEL]
              sourceChannel: '[BOT_CHANNEL]_BOT',  // Replace [BOT_CHANNEL]
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
          return data.id;  // Returns data.id (not candidateCaseId)
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
        channel: '[BOT_CHANNEL]_BOT',  // Replace [BOT_CHANNEL]
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
              'x-engine-api-key': config.ENGINE_API_KEY ? '[REDACTED]' : 'MISSING'  // Redact in logs
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
          return data;  // Returns full response with action, confidence, answer, citations
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

        // CRITICAL: Only return if action === 'ANSWER' and answer is present
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

// ============================================================================
// INTEGRATION CHECKLIST FOR EACH BOT (UNIFIED WEB CHAT PATTERN)
// ============================================================================
/*
CRITICAL: All bots must follow the EXACT SAME PATTERN as server-original.js
This ensures uniform behavior across all channels.

1. CREATE knowledge-system.js
   - Copy the template above (knowledge-system.js function)
   - Replace ALL [BOT_CHANNEL] with bot name (WHATSAPP_BOT, INSTAGRAM_BOT, YOUTUBE_BOT, etc)
   - Ensure getKnowledgeResponse(message, sessionId) signature - ONLY 2 parameters
   - DO NOT add bot-specific parameters or context objects

2. UPDATE config.js
   Add these 4 environment variables (IDENTICAL across all bots):

   // Knowledge System Integration
   KNOWLEDGE_CENTER_API_URL: process.env.KNOWLEDGE_CENTER_API_URL?.trim() || "https://knowledge-center-api-staging.onrender.com",
   KNOWLEDGE_CENTER_API_KEY: process.env.KNOWLEDGE_CENTER_API_KEY?.trim() || null,
   KNOWLEDGE_ENGINE_RUNTIME_URL: process.env.KNOWLEDGE_ENGINE_RUNTIME_URL?.trim() || "https://knowledge-engine-runtime-staging.onrender.com",
   ENGINE_API_KEY: process.env.ENGINE_API_KEY?.trim() || null

3. UPDATE server.js
   - Add import: import { createKnowledgeSystemClient } from "./knowledge-system.js";
   - After db.init(), add: const knowledgeSystem = createKnowledgeSystemClient(config);
   - Pass knowledgeSystem to worker constructor

4. UPDATE worker.js
   - Accept knowledgeSystem in constructor: createWorker({ config, db, knowledgeSystem })
   - In message processing, query knowledge system FIRST, ALWAYS:

     let replyText;
     if (knowledgeSystem && messageText && sessionId) {
       const knowledgeResponse = await knowledgeSystem.getKnowledgeResponse(messageText, sessionId);
       if (knowledgeResponse.success && knowledgeResponse.answer) {
         replyText = knowledgeResponse.answer;
       } else {
         replyText = await fallbackMethod(messageText);  // nvidia, hardcoded, etc
       }
     } else {
       replyText = await fallbackMethod(messageText);
     }

   - sessionId can be: event_id, jobId, correlationId, etc (context-dependent)
   - fallbackMethod must be: nvidia.generateReply(), hardcoded answers, etc

5. UPDATE render.yaml (CRITICAL - IDENTICAL for all bots)
   Add these 4 environment variables to the bot's envVars section:

   # Knowledge System Integration
   - key: KNOWLEDGE_CENTER_API_URL
     value: https://knowledge-center-api-staging.onrender.com
   - key: KNOWLEDGE_CENTER_API_KEY
     sync: false
   - key: KNOWLEDGE_ENGINE_RUNTIME_URL
     value: https://knowledge-engine-runtime-staging.onrender.com
   - key: ENGINE_API_KEY
     sync: false

6. VERIFY AND COMMIT
   - All syntax checked: node --check [bot]/src/knowledge-system.js
   - All changes follow web chat pattern exactly
   - Logging uses [knowledge-system], [knowledge-center-api], [query-engine], [knowledge-engine-runtime] prefixes

   git add [bot-directory]/src/knowledge-system.js [bot-directory]/src/config.js [bot-directory]/src/server.js [bot-directory]/src/worker.js render.yaml
   git commit -m "feat: integrate knowledge system into [Bot Name] bot (unified web chat pattern)

   - Add knowledge-system.js module for API integration (identical to web chat pattern)
   - Update config.js with knowledge center and engine environment variables
   - Modify server.js to instantiate knowledge system client
   - Update worker.js to query knowledge engine with ONLY (message, sessionId) parameters
   - Add 4 knowledge system environment variables to render.yaml
   - [Bot Name] bot now provides technical knowledge responses identical to web chat"

   git push -u origin claude/world-catalogue-build-thyf4l
*/

// ============================================================================
// REFERENCE IMPLEMENTATIONS (Completed)
// ============================================================================
/*
✅ LinkedIn Bot (elimfilters-linkedin-bot)
   - knowledge-system.js: src/knowledge-system.js
   - config.js: Updated with 4 knowledge system variables
   - server.js: Instantiates knowledgeSystem client
   - worker.js: Queries knowledge system, falls back to nvidia
   - render.yaml: Includes 4 knowledge system environment variables
   - Commit: 07486ab4a4

Pending Reactivation:

⏳ WhatsApp Bot (elimfilters-whatsapp-bot)
   - Status: Removed from render.yaml (blocking deployment)
   - When reactivating: Follow integration checklist above
   - Channel identifier: phoneNumber
   - Fallback: hardcoded TECHNICAL_KNOWLEDGE

⏳ Instagram Bot (elimfilters-instagram-bot)
   - Status: Removed from render.yaml (blocking deployment)
   - When reactivating: Follow integration checklist above
   - Channel identifier: instagramId or instagramAccountId
   - Fallback: hardcoded knowledge

⏳ YouTube Bot (elimfilters-youtube-bot)
   - Status: Removed from render.yaml (blocking deployment)
   - When reactivating: Follow integration checklist above
   - Channel identifier: videoId or channelId (context-dependent)
   - Fallback: hardcoded responses
*/
