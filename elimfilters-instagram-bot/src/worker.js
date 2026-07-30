import { createLogger } from "./logger.js";
import { createNvidiaClient } from "./nvidia.js";
import { createInstagramClient } from "./instagram-client.js";

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

          // Generate AI response using NVIDIA LLM + catalog lookup
          const responseText = await nvidia.generateReply(job.message_text);
          logContext.responseLength = responseText.length;

          // Log conversation turn
          await db.logConversationTurn(session.session_id, {
            messageText: job.message_text,
            action: 'ai_response',
            responseText
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
