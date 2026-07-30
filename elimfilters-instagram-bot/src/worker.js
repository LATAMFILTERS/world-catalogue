import { createLogger } from "./logger.js";
import { createNvidiaClient } from "./nvidia.js";
import { createInstagramClient } from "./instagram-client.js";
import { createCandidateCase, queryKnowledgeEngine } from "./knowledge-engine.js";

const logger = createLogger("Instagram-Bot");

export function createWorker({ config, db, knowledgeSystem }) {
  const nvidia = createNvidiaClient({ apiKey: config.nvidiaApiKey, model: config.nvidiaModel, pool: db.pool });
  const instagramClient = createInstagramClient({
    businessAccountId: config.instagramBusinessAccountId,
    accessToken: config.instagramAccessToken
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
          const session = await db.getOrCreateSession(job.sender_id || job.from, 'instagram');
          logContext.sessionId = session.session_id;

          let responseText;
          let source = 'fallback';

          // Step 1: Try to create candidate case in Knowledge Center
          let candidateCaseId = null;
          if (config.knowledgeCenterApiUrl && config.knowledgeCenterApiKey) {
            candidateCaseId = await createCandidateCase(config, session.session_id, job.message_text, 'INSTAGRAM');
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

          logContext.responseLength = responseText.length;
          logContext.source = source;

          // Log conversation turn
          await db.logConversationTurn(session.session_id, {
            messageText: job.message_text,
            action: 'ai_response',
            responseText,
            source
          });

          // Send response via Instagram API
          if (config.dryRun) {
            logger.info(`DRY_RUN: Draft response`, logContext);
            await db.complete(job.event_id, `[DRY_RUN] ${responseText}`);
            continue;
          }

          try {
            await instagramClient.sendMessage(job.sender_id, responseText);
            await db.complete(job.event_id, responseText);
            logger.info('Message sent successfully', logContext);
          } catch (sendErr) {
            logger.error('Failed to send Instagram message', logContext, { error: sendErr.message });
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
