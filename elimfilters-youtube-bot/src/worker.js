import { createLogger } from "./logger.js";
import { createYoutubeClient } from "./youtube-client.js";
import { createNvidiaClient } from "./nvidia.js";

const logger = createLogger("YouTube-Bot");

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

          // Get or create session
          const session = await db.getOrCreateSession(job.author_channel_id || job.author_id, 'youtube');
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

          // Send response via YouTube API
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
