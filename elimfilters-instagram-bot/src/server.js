import express from "express";
import crypto from "crypto";
import { getConfig } from "./config.js";
import { createDb } from "./db.js";
import { createLogger } from "./logger.js";
import { createWorker } from "./worker.js";
import { createKnowledgeSystemClient } from "./knowledge-system.js";

const logger = createLogger("Instagram-Server");
const config = getConfig();
const db = createDb(config.databaseUrl);
await db.init();
const knowledgeSystem = createKnowledgeSystemClient(config);

const worker = createWorker({ config, db, knowledgeSystem });
const app = express();

// Force Knowledge Engine Runtime to be configured
if (!config.knowledgeEngineRuntimeUrl || !config.engineApiKey) {
  logger.warn('WARNING: Knowledge Engine Runtime not fully configured', {
    hasUrl: !!config.knowledgeEngineRuntimeUrl,
    hasKey: !!config.engineApiKey
  });
}

const webhookStats = {
  received: 0,
  rejected: 0,
  lastEventCount: 0,
  lastReceivedAt: null
};

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    service: "elimfilters-instagram-bot",
    status: "running",
    webhook: "POST to /webhook to send messages"
  });
});

// Health check
app.get("/health", async (_req, res) => {
  res.json({
    ok: true,
    service: "elimfilters-instagram-bot",
    dryRun: config.dryRun,
    queue: await db.status(),
    webhook: webhookStats
  });
});

// Instagram Webhook verification (GET challenge)
app.get("/webhook", (req, res) => {
  const challenge = req.query["hub.challenge"];
  const verifyToken = req.query["hub.verify_token"];

  if (verifyToken !== config.instagramVerifyToken) {
    logger.warn("Invalid verify token", { received: verifyToken });
    return res.sendStatus(403);
  }

  logger.info("Webhook verified");
  res.status(200).send(challenge);
});

// Instagram Webhook event receiver (POST messages) - use raw body for signature verification
app.post("/webhook", express.raw({ type: "application/json", limit: "1mb" }), async (req, res) => {
  webhookStats.received++;
  webhookStats.lastReceivedAt = new Date().toISOString();

  let body;
  try {
    body = JSON.parse(req.body.toString("utf8"));
  } catch (err) {
    logger.error("Invalid JSON in webhook body", { error: err.message });
    return res.sendStatus(400);
  }

  const rawBody = req.body.toString("utf8");

  // Verify signature using raw body
  const xHubSignature = req.get("x-hub-signature-256");
  if (config.dryRun !== true && !verifyInstagramSignature(rawBody, xHubSignature, config.instagramAppSecret)) {
    webhookStats.rejected++;
    logger.warn("Invalid signature", { received: xHubSignature });
    return res.sendStatus(401);
  }

  try {
    // Extract events from Instagram webhook format
    const events = [];
    if (body.entry && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        if (entry.messaging && Array.isArray(entry.messaging)) {
          for (const message of entry.messaging) {
            if (message.message?.text) {
              events.push({
                type: "message",
                event_id: message.message.mid,
                sender_id: message.sender.id,
                message_text: message.message.text || "",
                timestamp: message.timestamp,
                received_at: new Date().toISOString()
              });
            }
          }
        }
      }
    }

    webhookStats.lastEventCount = events.length;

    if (events.length > 0) {
      await Promise.all(events.map(e => db.enqueue(e)));
      logger.info(`Queued ${events.length} messages`, { events: webhookStats });
      setImmediate(() => worker.run().catch(console.error));
    }

    res.sendStatus(200);
  } catch (err) {
    logger.logError({ action: "webhook_processing" }, err);
    res.sendStatus(500);
  }
});

// Signature verification for Instagram (must use raw body, not parsed JSON)
function verifyInstagramSignature(rawBody, signature, appSecret) {
  if (!signature) return false;
  const hash = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");
  const expectedSignature = `sha256=${hash}`;
  return crypto.timingSafeEqual(signature, expectedSignature);
}

const port = config.port || 3000;
app.listen(port, () => {
  console.log("█████████████████████████████████████████████████████████");
  console.log("█ INSTAGRAM BOT STARTING - RENDER REDEPLOY TEST 30/07/2026 █");
  console.log("█████████████████████████████████████████████████████████");
  logger.info(`🚀 INSTAGRAM BOT v2 STARTED - Knowledge Engine Runtime integration active`);
  logger.info(`Instagram bot listening on port ${port}; dryRun=${config.dryRun}; knowledge_engine=${!!config.knowledgeEngineRuntimeUrl}`);
});

// Periodic worker execution
setInterval(() => worker.run().catch(console.error), 5000).unref();
