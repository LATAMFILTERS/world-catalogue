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
// TEMPLATE: knowledge-system.js
// Copy this to: [bot-directory]/src/knowledge-system.js
// ============================================================================

export function createKnowledgeSystemClient(config) {
  return {
    async createCandidateCase(contactId, channelIdentifier, message, context = {}) {
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
            'x-actor-role': '[BOT_CHANNEL]_BOT'  // Replace with WHATSAPP_BOT, INSTAGRAM_BOT, YOUTUBE_BOT, etc
          },
          body: JSON.stringify({
            contactId,
            channelIdentifier,  // Phone number, Instagram ID, YouTube channel, LinkedIn URN, etc
            message,
            context: {
              source: '[channel-name]',
              channel: '[BOT_CHANNEL]_BOT',
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

    async queryKnowledgeEngine(message, contactId, channelIdentifier, candidateCaseId) {
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
              channel: '[BOT_CHANNEL]_BOT',
              correlationId: contactId,
              candidateCaseId,
              context: {
                source: '[channel-name]',
                channelIdentifier
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

    async getKnowledgeResponse(message, contactId, channelIdentifier) {
      // Step 1: Create candidate case to register the inquiry
      const candidateCaseId = await this.createCandidateCase(contactId, channelIdentifier, message);

      // Step 2: Query knowledge engine for technical diagnosis
      const engineResponse = await this.queryKnowledgeEngine(message, contactId, channelIdentifier, candidateCaseId);

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

// ============================================================================
// INTEGRATION CHECKLIST FOR EACH BOT
// ============================================================================
/*
1. CREATE knowledge-system.js
   - Copy the template above (knowledge-system.js function)
   - Replace [BOT_CHANNEL] with bot name (WHATSAPP, INSTAGRAM, YOUTUBE, etc)
   - Replace [channel-name] with lowercase name (whatsapp, instagram, youtube, etc)
   - Replace channelIdentifier parameter names with bot-specific identifiers:
     * WhatsApp: phoneNumber
     * Instagram: instagramId or instagramAccountId
     * YouTube: channelId or videoId (context-dependent)
     * LinkedIn: linkedinUrn or linkedinOrganizationId

2. UPDATE config.js
   Add these 4 environment variables:

   // Knowledge System Integration
   KNOWLEDGE_CENTER_API_URL: process.env.KNOWLEDGE_CENTER_API_URL?.trim() || "https://knowledge-center-api-staging.onrender.com",
   KNOWLEDGE_CENTER_API_KEY: process.env.KNOWLEDGE_CENTER_API_KEY?.trim() || null,
   KNOWLEDGE_ENGINE_RUNTIME_URL: process.env.KNOWLEDGE_ENGINE_RUNTIME_URL?.trim() || "https://knowledge-engine-runtime-staging.onrender.com",
   ENGINE_API_KEY: process.env.ENGINE_API_KEY?.trim() || null

3. UPDATE server.js
   - Add import: import { createKnowledgeSystemClient } from "./knowledge-system.js";
   - After db.init(), add: const knowledgeSystem = createKnowledgeSystemClient(config);
   - Pass knowledgeSystem to worker/conversation-flow constructor

4. UPDATE worker.js or conversation-flow.js
   - Accept knowledgeSystem in constructor: createWorker({ config, db, knowledgeSystem })
   - In message processing logic, query knowledge system first:

     let replyText;
     if (knowledgeSystem && messageText && [channelIdentifier]) {
       const knowledgeResponse = await knowledgeSystem.getKnowledgeResponse(
         messageText,
         contactId,
         [channelIdentifier]
       );
       if (knowledgeResponse.success && knowledgeResponse.answer) {
         replyText = knowledgeResponse.answer;
       } else {
         replyText = await fallbackMethod(messageText);  // nvidia, hardcoded knowledge, etc
       }
     } else {
       replyText = await fallbackMethod(messageText);
     }

5. UPDATE render.yaml (CRITICAL)
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

6. COMMIT AND PUSH
   git add [bot-directory]/src/knowledge-system.js [bot-directory]/src/config.js [bot-directory]/src/server.js [bot-directory]/src/worker.js render.yaml
   git commit -m "feat: integrate knowledge system into [Bot Name] bot for unified technical responses

   - Add knowledge-system.js module for API integration
   - Update config.js with knowledge center and engine environment variables
   - Modify server.js to instantiate knowledge system client
   - Update worker.js to query knowledge engine before fallback to [fallback method]
   - Add 4 knowledge system environment variables to render.yaml
   - [Bot Name] bot now provides technical knowledge responses like web chat"

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
