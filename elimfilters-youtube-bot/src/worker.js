import { createLogger } from "./logger.js";
import { createYoutubeClient } from "./youtube-client.js";
import { createNvidiaClient } from "./nvidia.js";
import { createCandidateCase, queryKnowledgeEngine } from "./knowledge-engine.js";
import { queryCentralProtocol } from "./protocol-client.js";

const logger = createLogger("YouTube-Bot");
const SAFE_SUPPORT_MESSAGE = "ELIMFILTERS technical intelligence is temporarily unavailable. Please contact support@elimfilters.com for assistance.";

export function createWorker({ config, db, knowledgeSystem }) {
  const youtubeClient = createYoutubeClient({ channelId: config.youtubeChannelId, apiKey: config.youtubeApiKey });
  const nvidia = createNvidiaClient({ apiKey: config.nvidiaApiKey, model: config.nvidiaModel, pool: db.pool });

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

          const session = await db.getOrCreateSession(job.author_channel_id || job.author_id, 'youtube');
          logContext.sessionId = session.session_id;

          let responseText;
          let source = 'fallback';

          if (config.botProtocolApiKey) {
            // Once the central protocol is provisioned, YouTube must not
            // answer through a separate reasoning stack if the protocol fails.
            try {
              const protocol = await queryCentralProtocol(config, {
                message: job.message_text,
                conversationId: session.session_id
              });
              if (protocol?.answer) {
                responseText = protocol.answer;
                source = 'central_protocol';
              } else {
                responseText = SAFE_SUPPORT_MESSAGE;
                source = 'central_protocol_empty_safe_message';
              }
            } catch (protocolError) {
              logger.warn('Central protocol unavailable', { error: protocolError.message });
              responseText = SAFE_SUPPORT_MESSAGE;
              source = 'central_protocol_failure_safe_message';
            }
          } else {
            // Transitional rollback path only while BOT_PROTOCOL_API_KEY has
            // not yet been provisioned on the deployed YouTube service.
            let candidateCaseId = null;
            if (config.knowledgeCenterApiUrl && config.knowledgeCenterApiKey) {
              candidateCaseId = await createCandidateCase(config, session.session_id, job.message_text, 'YOUTUBE');
              if (candidateCaseId) {
                logger.info('Created candidate case', { caseId: candidateCaseId });
              }
            }

            let engineResponse = null;
            const shouldQueryEngine = config.knowledgeEngineRuntimeUrl && config.engineApiKey && candidateCaseId;

            if (shouldQueryEngine) {
              engineResponse = await queryKnowledgeEngine(config, job.message_text, session.session_id, candidateCaseId);
              if (engineResponse && engineResponse.action === 'ANSWER' && engineResponse.answer) {
                responseText = engineResponse.answer;
                source = 'knowledge_engine_legacy';
                logger.info('Using Knowledge Engine legacy response', { confidence: engineResponse.confidence, answerLength: engineResponse.answer.length });
              }
            }

            if (!responseText) {
              logger.warn('Using NVIDIA legacy path because central protocol is not provisioned');
              responseText = await nvidia.generateReply(job.message_text);
              source = 'nvidia_legacy';
            }
          }

          logContext.responseLength = responseText.length;
          logContext.source = source;

          await db.logConversationTurn(session.session_id, {
            messageText: job.message_text,
            action: 'ai_response',
            responseText,
            source
          });

          if (config.dryRun) {
            logger.info(`DRY_RUN: Draft response`, logContext);
            await db.complete(job.event_id, `[DRY_RUN] ${responseText}`);
            continue;
          }

          try {
            await youtubeClient.sendMessage(job.video_id, responseText);
            await db.complete(job.event_id, responseText);
            logger.info('Message sent successfully', logContext);
          } catch (sendErr) {
            logger.error('Failed to send YouTube comment', logContext, { error: sendErr.message });
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
