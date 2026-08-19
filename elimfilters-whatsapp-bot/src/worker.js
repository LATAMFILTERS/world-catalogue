import { createLogger } from "./logger.js";
import { createNvidiaClient } from "./nvidia.js";
import { createWhatsAppClient } from "./whatsapp-client.js";
import { createCandidateCase, queryKnowledgeEngine } from "./knowledge-engine.js";
import { queryCentralProtocol, conversationIdFor } from "./protocol-client.js";

const logger = createLogger("WhatsApp-Bot");

// Never invented, never routed through nvidia.js -- per spec, a central
// protocol failure (after its own one retry) gets exactly this, logged, and
// nothing else.
const SAFE_SUPPORT_MESSAGE = "Estamos teniendo dificultades técnicas en este momento. Un miembro de nuestro equipo revisará tu consulta y te contactará a la brevedad. Gracias por tu paciencia.";

// In-memory, per-process only: avoids re-reading the last 20 messages from
// the operational DB on every single message from a contact we've already
// talked to the central engine about. This is a performance optimization
// ONLY -- correctness (never double-seeding) is guaranteed by the central
// engine's own idempotency (memory.context_seed_applied), not by this Set,
// which is empty again after every redeploy/restart.
const seededConversations = new Set();

export function createWorker({ config, db, knowledgeSystem }) {
  const nvidia = createNvidiaClient({ apiKey: config.nvidiaApiKey, model: config.nvidiaModel, pool: db.pool });
  const whatsappClient = createWhatsAppClient({
    phoneNumberId: config.whatsappPhoneNumberId,
    accessToken: config.whatsappAccessToken,
    businessAccountId: config.whatsappBusinessAccountId
  });

  return {
    async run() {
      const jobs = await db.claim(5);
      if (!jobs.length) return;

      const expiredCount = await db.cleanupExpiredSessions();
      if (expiredCount > 0) {
        logger.info(`Cleaned up ${expiredCount} expired sessions`, { action: 'cleanup' });
      }

      for (const job of jobs) {
        const logContext = { jobId: job.event_id, messageLength: job.message_text?.length || 0 };

        try {
          logger.info(`Processing message`, logContext, { messagePreview: job.message_text?.slice(0, 80) });

          // Get or create session
          const session = await db.getOrCreateSession(job.from_number, 'whatsapp');
          logContext.sessionId = session.session_id;

          let responseText;
          let source = 'fallback';

          if (config.useCentralProtocol) {
            // ── Central Conversation Engine adapter path ──────────────────
            // No independent reasoning, diagnosis, or catalog search here --
            // this block only forwards the message and reports back what
            // the engine said, exactly like Instagram and Facebook.
            const conversationId = conversationIdFor(job.from_number);
            let contextSeed;
            if (!seededConversations.has(conversationId)) {
              contextSeed = await db.getRecentMessagesForSeed(session.session_id, 20);
              // Marked optimistically before the call resolves: even if this
              // specific attempt fails/retries, we don't want every message
              // in a broken conversation re-reading history on each retry.
              // The engine's own idempotency is what actually prevents a
              // duplicate seed from ever being applied twice, not this line.
              seededConversations.add(conversationId);
            }

            try {
              const result = await queryCentralProtocol(config, {
                message: job.message_text,
                conversationId,
                contextSeed,
                logger
              });
              responseText = result.answer;
              source = 'central_protocol';
              if (result.contextSeedApplied) {
                logger.info('✓ context_seed applied by central engine', { conversationId, seedSize: contextSeed?.length || 0 });
              }
            } catch (protocolError) {
              // Never invent, never fall back to nvidia.js/knowledge-engine.js
              // here -- log the failure and use the fixed safe support
              // message. queryCentralProtocol has already retried once.
              logger.error('✗ Central protocol failed after retry -- applying safe support message', logContext, { error: protocolError.message, conversationId });
              responseText = SAFE_SUPPORT_MESSAGE;
              source = 'central_protocol_failure_safe_message';
            }
          } else {
            // ── Legacy independent path (controlled rollback only) ────────
            // Kept byte-for-byte as the pre-migration behavior. Active only
            // while USE_CENTRAL_PROTOCOL=false. Files intentionally not
            // deleted: nvidia.js, knowledge.js, knowledge-engine.js,
            // product-search.js.

            // Step 1: Try to create candidate case in Knowledge Center
            let candidateCaseId = null;
            if (config.knowledgeCenterApiUrl && config.knowledgeCenterApiKey) {
              candidateCaseId = await createCandidateCase(config, session.session_id, job.message_text, 'WHATSAPP');
              if (candidateCaseId) {
                logger.info('✓ Created candidate case', { caseId: candidateCaseId });
              }
            } else {
              logger.warn('✗ Candidate case creation skipped', {
                hasUrl: !!config.knowledgeCenterApiUrl,
                hasKey: !!config.knowledgeCenterApiKey
              });
            }

            // Step 2: Try Knowledge Engine Runtime (like web chat)
            let engineResponse = null;
            const shouldQueryEngine = config.knowledgeEngineRuntimeUrl && config.engineApiKey && candidateCaseId;
            logger.info('Knowledge Engine Runtime check', {
              hasUrl: !!config.knowledgeEngineRuntimeUrl,
              hasKey: !!config.engineApiKey,
              hasCaseId: !!candidateCaseId,
              shouldQuery: shouldQueryEngine
            });

            if (shouldQueryEngine) {
              logger.info('→ Querying Knowledge Engine Runtime at', { url: config.knowledgeEngineRuntimeUrl });
              engineResponse = await queryKnowledgeEngine(config, job.message_text, session.session_id, candidateCaseId);

              // If Knowledge Engine has high-confidence answer, use it
              if (engineResponse && engineResponse.action === 'ANSWER' && engineResponse.answer) {
                responseText = engineResponse.answer;
                source = 'knowledge_engine';
                logger.info('✓ Using Knowledge Engine response', { confidence: engineResponse.confidence, answerLength: engineResponse.answer.length });
              } else {
                logger.warn('✗ Knowledge Engine response invalid', { hasResponse: !!engineResponse, action: engineResponse?.action, hasAnswer: !!engineResponse?.answer });
              }
            } else {
              logger.warn('✗ Skipping Knowledge Engine (missing config)', { shouldQueryEngine });
            }

            // Step 3: Fallback to NVIDIA LLM with catalog lookup
            if (!responseText) {
              logger.debug('Falling back to NVIDIA LLM');
              responseText = await nvidia.generateReply(job.message_text);
              source = 'nvidia_llm';
            }
          }

          logContext.responseLength = responseText.length;
          logContext.source = source;

          // Log conversation turn
          await db.logConversationTurn(session.session_id, {
            messageText: job.message_text,
            action: 'ai_response',
            responseText,
            source
          });

          // Send response via WhatsApp API
          if (config.dryRun) {
            logger.info(`DRY_RUN: Draft response`, logContext);
            await db.complete(job.event_id, `[DRY_RUN] ${responseText}`);
            continue;
          }

          try {
            await whatsappClient.sendMessage(job.from_number, responseText);
            await db.complete(job.event_id, responseText);
            logger.info('Message sent successfully', logContext);
          } catch (sendErr) {
            logger.error('Failed to send WhatsApp message', logContext, { error: sendErr.message });
            await db.fail(job.event_id, `Send failed: ${sendErr.message}`);
            throw sendErr;
          }
        } catch (err) {
          logger.logError(logContext, err, { stage: 'processing' });
          await db.fail(job.event_id, err.message);
        }
      }
    }
  };
}
