import { createLogger } from "./logger.js";
import { createInstagramClient } from "./instagram-client.js";
import { queryCentralProtocol } from "./protocol-client.js";

const logger = createLogger("Instagram-Bot");

export function createWorker({ config, db }) {
  const instagramClient = createInstagramClient({
    businessAccountId: config.instagramBusinessAccountId,
    accessToken: config.instagramAccessToken
  });

  return {
    async run() {
      const jobs = await db.claim(5);
      if (!jobs.length) return;

      const expiredCount = await db.cleanupExpiredSessions();
      if (expiredCount > 0) logger.info(`Cleaned up ${expiredCount} expired sessions`, { action: 'cleanup' });

      for (const job of jobs) {
        const logContext = { jobId: job.event_id, messageLength: job.message_text?.length || 0 };

        try {
          logger.info('Processing message', logContext, { messagePreview: job.message_text?.slice(0, 80) });
          const session = await db.getOrCreateSession(job.sender_id || job.from, 'instagram');
          logContext.sessionId = session.session_id;

          const protocol = await queryCentralProtocol(config, {
            message: job.message_text,
            conversationId: job.sender_id || session.session_id
          });
          const responseText = protocol.answer;

          logContext.responseLength = responseText.length;
          logContext.source = 'central_protocol';
          logContext.intent = protocol.intent;
          logContext.phase = protocol.phase;

          await db.logConversationTurn(session.session_id, {
            messageText: job.message_text,
            action: 'protocol_response',
            responseText,
            source: 'central_protocol'
          });

          if (config.dryRun) {
            logger.info('DRY_RUN: Draft response', logContext);
            await db.complete(job.event_id, `[DRY_RUN] ${responseText}`);
            continue;
          }

          await instagramClient.sendMessage(job.sender_id, responseText);
          await db.complete(job.event_id, responseText);
          logger.info('Message sent successfully', logContext);
        } catch (err) {
          logger.logError(logContext, err, { stage: 'processing' });
          await db.fail(job.event_id, err.message);
        }
      }
    }
  };
}
