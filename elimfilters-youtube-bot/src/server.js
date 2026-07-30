import express from "express";
import { getConfig } from "./config.js";
import { createDb } from "./db.js";
import { createLogger } from "./logger.js";
import { createWorker } from "./worker.js";

const logger = createLogger("YouTube-Server");
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

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    service: "elimfilters-youtube-bot",
    status: "running",
    webhook: "POST to /webhook to send messages"
  });
});

// Health check
app.get("/health", async (_req, res) => {
  res.json({
    ok: true,
    service: "elimfilters-youtube-bot",
    dryRun: config.dryRun,
    queue: await db.status(),
    webhook: webhookStats
  });
});

// YouTube Webhook verification (GET challenge)
app.get("/webhook", (req, res) => {
  const challenge = req.query["hub.challenge"];
  const verifyToken = req.query["hub.verify_token"];

  if (verifyToken !== config.youtubeVerifyToken) {
    logger.warn("Invalid verify token", { received: verifyToken });
    return res.sendStatus(403);
  }

  logger.info("Webhook verified");
  res.status(200).send(challenge);
});

// YouTube Webhook event receiver (POST comments)
app.post("/webhook", async (req, res) => {
  webhookStats.received++;
  webhookStats.lastReceivedAt = new Date().toISOString();

  const body = req.body;

  try {
    // YouTube sends updates via PubSubHubbub (RSS feed notifications)
    // In production, you would parse the RSS feed and extract comments
    // For now, we'll accept the webhook but note that YouTube requires
    // polling the API for new comments on subscribed videos

    const events = [];
    // TODO: Implement YouTube comment polling
    // YouTube does not push comments directly; it only notifies that a video was updated
    // You must then poll the YouTube Data API to fetch new comments

    webhookStats.lastEventCount = events.length;

    if (events.length > 0) {
      await Promise.all(events.map(e => db.enqueue(e)));
      logger.info(`Queued ${events.length} comments`, { events: webhookStats });
      setImmediate(() => worker.run().catch(console.error));
    }

    res.sendStatus(200);
  } catch (err) {
    logger.logError({ action: "webhook_processing" }, err);
    res.sendStatus(500);
  }
});

const port = config.port || 3000;
app.listen(port, () => {
  logger.info(`YouTube bot listening on port ${port}; dryRun=${config.dryRun}`);
});

// Periodic worker execution
setInterval(() => worker.run().catch(console.error), 5000).unref();
