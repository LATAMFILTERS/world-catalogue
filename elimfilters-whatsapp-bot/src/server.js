import express from "express";
import crypto from "crypto";
import { getConfig } from "./config.js";
import { createDb } from "./db.js";
import { createLogger } from "./logger.js";
import { createWorker } from "./worker.js";

const logger = createLogger("WhatsApp-Server");
const config = getConfig();
const db = createDb(config.databaseUrl);
await db.init();

const worker = createWorker({ config, db });
const app = express();

const webhookStats = {
  received: 0,
  rejected: 0,
  lastEventCount: 0,
  lastReceivedAt: null
};

// Middleware
app.use(express.json({ limit: "1mb" }));

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

// WhatsApp Webhook event receiver (POST messages)
app.post("/webhook", async (req, res) => {
  webhookStats.received++;
  webhookStats.lastReceivedAt = new Date().toISOString();

  const body = req.body;

  // Verify signature
  const xHubSignature = req.get("x-hub-signature-256");
  if (config.dryRun !== true && !verifyWhatsAppSignature(body, xHubSignature, config.whatsappAppSecret)) {
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

// Signature verification for WhatsApp
function verifyWhatsAppSignature(body, signature, appSecret) {
  if (!signature) return false;
  const hash = crypto
    .createHmac("sha256", appSecret)
    .update(JSON.stringify(body))
    .digest("hex");
  const expectedSignature = `sha256=${hash}`;
  return crypto.timingSafeEqual(signature, expectedSignature);
}

const port = config.port || 3000;
app.listen(port, () => {
  logger.info(`WhatsApp bot listening on port ${port}; dryRun=${config.dryRun}`);
});

// Periodic worker execution
setInterval(() => worker.run().catch(console.error), 5000).unref();
