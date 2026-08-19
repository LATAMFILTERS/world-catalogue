import express from "express";
import crypto from "crypto";
import { getConfig } from "./config.js";
import { createDb } from "./db.js";
import { createLogger } from "./logger.js";
import { createWorker } from "./worker.js";

const logger = createLogger("Instagram-Server");
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

app.get("/", (_req, res) => {
  res.json({
    service: "elimfilters-instagram-bot",
    status: "running",
    webhook: "POST to /webhook to send messages"
  });
});

app.get("/health", async (_req, res) => {
  res.json({
    ok: true,
    service: "elimfilters-instagram-bot",
    dryRun: config.dryRun,
    protocol: Boolean(config.botProtocolUrl && config.botProtocolApiKey),
    queue: await db.status(),
    webhook: webhookStats
  });
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const verifyToken = req.query["hub.verify_token"];

  if (mode !== "subscribe" || verifyToken !== config.instagramVerifyToken || !challenge) {
    logger.warn("Invalid webhook verification request");
    return res.sendStatus(403);
  }

  logger.info("Webhook verified");
  return res.status(200).send(challenge);
});

app.post("/webhook", express.raw({ type: "application/json", limit: "1mb" }), async (req, res) => {
  webhookStats.received++;
  webhookStats.lastReceivedAt = new Date().toISOString();

  const signature = req.get("x-hub-signature-256");
  if (!verifyInstagramSignature(req.body, signature, config.instagramAppSecret)) {
    webhookStats.rejected++;
    logger.warn("Invalid signature");
    return res.sendStatus(401);
  }

  let body;
  try {
    body = JSON.parse(req.body.toString("utf8"));
  } catch (err) {
    logger.error("Invalid JSON in webhook body", { error: err.message });
    return res.sendStatus(400);
  }

  try {
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
    res.sendStatus(200);

    if (events.length > 0) {
      await Promise.all(events.map(event => db.enqueue(event)));
      logger.info(`Queued ${events.length} messages`, { events: webhookStats });
      setImmediate(() => worker.run().catch(console.error));
    }
  } catch (err) {
    logger.logError({ action: "webhook_processing" }, err);
  }
});

function verifyInstagramSignature(rawBody, signature, appSecret) {
  if (!Buffer.isBuffer(rawBody) || !signature || !appSecret) return false;
  const expected = `sha256=${crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
  const receivedBuffer = Buffer.from(String(signature));
  const expectedBuffer = Buffer.from(expected);
  if (receivedBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

const port = config.port || 3000;
app.listen(port, () => {
  logger.info(`Instagram bot listening on port ${port}; dryRun=${config.dryRun}; central_protocol=true`);
});

setInterval(() => worker.run().catch(console.error), 5000).unref();
