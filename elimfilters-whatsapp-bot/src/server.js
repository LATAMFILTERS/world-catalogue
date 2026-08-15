import express from "express";
import crypto from "crypto";
import { getConfig } from "./config.js";
import { createDb } from "./db.js";
import { createLogger } from "./logger.js";
import { createWorker } from "./worker.js";
import { createKnowledgeSystemClient } from "./knowledge-system.js";

const logger = createLogger("WhatsApp-Server");
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
    service: "elimfilters-whatsapp-bot",
    status: "running",
    webhook: "POST to /webhook to send messages"
  });
});

// Health check
app.get("/health", async (_req, res) => {
  res.json({
    ok: true,
    service: "elimfilters-whatsapp-bot",
    dryRun: config.dryRun,
    queue: await db.status(),
    webhook: webhookStats
  });
});

// WhatsApp Webhook verification (GET challenge)
app.get("/webhook", (req, res) => {
  const challenge = req.query["hub.challenge"];
  const verifyToken = req.query["hub.verify_token"];

  if (verifyToken !== config.whatsappVerifyToken) {
    logger.warn("Invalid verify token", { received: verifyToken });
    return res.sendStatus(403);
  }

  logger.info("Webhook verified");
  res.status(200).send(challenge);
});

// WhatsApp Webhook event receiver (POST messages) - use raw body for signature verification
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
  if (config.dryRun !== true && !verifyWhatsAppSignature(rawBody, xHubSignature, config.whatsappAppSecret)) {
    webhookStats.rejected++;
    logger.warn("Invalid signature", { received: xHubSignature });
    return res.sendStatus(401);
  }

  try {
    // Extract events from WhatsApp webhook format
    const events = [];
    if (body.entry && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            if (change.value?.messages) {
              for (const message of change.value.messages) {
                events.push({
                  type: "message",
                  event_id: message.id,
                  phone_number_id: change.value.metadata?.phone_number_id,
                  from_number: message.from,
                  message_text: message.text?.body || "",
                  message_timestamp: message.timestamp,
                  received_at: new Date().toISOString()
                });
              }
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

// Signature verification for WhatsApp (must use raw body, not parsed JSON)
function verifyWhatsAppSignature(rawBody, signature, appSecret) {
  if (!signature) return false;
  try {
    const hash = crypto
      .createHmac("sha256", appSecret)
      .update(rawBody)
      .digest("hex");
    const expectedSignature = `sha256=${hash}`;
    const a = Buffer.from(signature);
    const b = Buffer.from(expectedSignature);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

const port = config.port || 3000;
app.listen(port, () => {
  console.log("█████████████████████████████████████████████████████████");
  console.log("█ WHATSAPP BOT STARTING - RENDER REDEPLOY TEST 30/07/2026 █");
  console.log("█████████████████████████████████████████████████████████");
  logger.info(`🚀 WHATSAPP BOT v2 STARTED - Knowledge Engine Runtime integration active`);
  logger.info(`WhatsApp bot listening on port ${port}; dryRun=${config.dryRun}; knowledge_engine=${!!config.knowledgeEngineRuntimeUrl}`);
});

// Periodic worker execution
setInterval(() => worker.run().catch(console.error), 5000).unref();
