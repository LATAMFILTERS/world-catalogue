import { createNvidiaClient } from "./nvidia.js";
import { createLinkedinClient } from "./linkedin.js";

export function createWorker({ config, db, knowledgeSystem }) {
  const nvidia = createNvidiaClient({ apiKey: config.nvidiaApiKey, model: config.nvidiaModel, pool: db.pool });
  const linkedin = createLinkedinClient({
    clientId: config.linkedinClientId,
    clientSecret: config.linkedinClientSecret,
    organizationId: config.linkedinOrganizationId
  });

  return {
    async run() {
      const jobs = await db.claim(5);
      if (!jobs.length) return;

      for (const job of jobs) {
        try {
          console.log(`[LinkedIn Worker] Processing job ${job.event_id}: "${job.message_text.slice(0, 50)}..."`);

          let replyText;
          if (knowledgeSystem && job.message_text && job.event_id) {
            const knowledgeResponse = await knowledgeSystem.getKnowledgeResponse(job.message_text, job.event_id);
            if (knowledgeResponse.success && knowledgeResponse.answer) {
              replyText = knowledgeResponse.answer;
            } else {
              replyText = await nvidia.generateReply(job.message_text);
            }
          } else {
            replyText = await nvidia.generateReply(job.message_text);
          }

          if (config.dryRun) {
            console.log(`[LinkedIn Worker] DRY_RUN=true: Draft reply for ${job.event_id} -> "${replyText}"`);
            await db.complete(job.event_id, `[DRY_RUN DRAFT] ${replyText}`);
            continue;
          }

          if (job.event_type === 'message' || job.event_type === 'dm') {
            await linkedin.replyToDirectMessage({ senderUrn: job.author_urn, replyText });
          } else {
            await linkedin.replyToComment({ targetUrn: job.target_urn, commentId: job.event_id, replyText });
          }

          await db.complete(job.event_id, replyText);
        } catch (err) {
          console.error(`[LinkedIn Worker] Error processing ${job.event_id}:`, err.message);
          await db.fail(job.event_id, err.message);
        }
      }
    }
  };
}
