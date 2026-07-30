import express from "express";
import { getConfig } from "./config.js";
import { createDb } from "./db.js";
import { createKnowledgeSystemClient } from "./knowledge-system.js";
import { createWorker } from "./worker.js";

const config = getConfig();
const db = createDb(config.databaseUrl);
await db.init();
const knowledgeSystem = createKnowledgeSystemClient(config);

const worker = createWorker({ config, db, knowledgeSystem });
const app = express();

const webhookStats = {
  received: 0,
  rejected: 0,
  lastEventCount: 0,
  lastReceivedAt: null
};

const legalPage = (title, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | ELIMFILTERS</title><style>body{font:16px/1.6 Arial,sans-serif;max-width:820px;margin:48px auto;padding:0 22px;color:#171717}h1,h2{color:#111}a{color:#195faa}.muted{color:#666}</style></head><body><h1>${title}</h1>${body}<p class="muted">Last updated: July 24, 2026</p></body></html>`;

app.get("/privacy", (_req, res) =>
  res.type("html").send(legalPage("Privacy Policy", `
<p>LATAM FILTERS PRO INC, operating the ELIMFILTERS brand, uses the official YouTube Data API to assist with channel communications on the @elimfilters YouTube channel.</p>
<h2>Information processed</h2><p>We process incoming comment content, commenter IDs, timestamps, and metadata required to generate AI assistance.</p>
<h2>Purpose and providers</h2><p>The information is used only to understand and respond to YouTube comments, prevent duplicate processing and protect the service. Processing may involve YouTube, Render hosting, PostgreSQL storage and NVIDIA NIM. We do not sell personal information.</p>
<h2>Contact</h2><p>ELIMFILTERS — <a href="mailto:elimfilters@gmail.com">elimfilters@gmail.com</a></p>`))
);

app.get("/terms", (_req, res) =>
  res.type("html").send(legalPage("Terms of Service", `
<p>This service assists ELIMFILTERS with managing communications on its YouTube Channel. Use of YouTube remains subject to Google's Terms of Service and API Terms.</p>
<p>Questions: <a href="mailto:elimfilters@gmail.com">elimfilters@gmail.com</a>.</p>`))
);

app.get("/health", async (_req, res) =>
  res.json({
    ok: true,
    service: "elimfilters-youtube-bot",
    youtubeChannelId: config.youtubeChannelId,
    dryRun: config.dryRun,
    queue: await db.status(),
    webhook: webhookStats
  })
);

app.get("/review-drafts", async (_req, res) => {
  if (!config.dryRun) return res.sendStatus(404);
  res.json({ ok: true, dryRun: true, drafts: await db.recentDrafts(10) });
});

// YouTube Webhook verification / challenge endpoint
app.get("/webhook", (req, res) => {
  const challenge = req.query["hub.challenge"];
  const token = req.query["hub.verify_token"];

  if (token !== config.youtubeVerifyToken) {
    return res.sendStatus(403);
  }
  return res.status(200).send(challenge || "OK");
});

// YouTube Webhook event receiver (Pub/Sub from YouTube)
app.post("/webhook", express.json({ limit: "1mb" }), async (req, res) => {
  webhookStats.received++;
  webhookStats.lastReceivedAt = new Date().toISOString();

  const body = req.body;

  // YouTube Pub/Sub message format
  if (body.subscription && body.message) {
    // This is a test notification
    if (body.message.data === "test") {
      return res.sendStatus(200);
    }

    // Process actual updates (video comments, channel activity)
    try {
      const messageData = JSON.parse(Buffer.from(body.message.data, "base64").toString("utf-8"));

      if (messageData.topicTitle && messageData.topicTitle.includes(config.youtubeChannelId)) {
        // Video comment or activity update related to this channel
        const event = {
          id: body.message.messageId,
          type: "youtube_activity",
          timestamp: new Date().toISOString(),
          channelId: config.youtubeChannelId,
          data: messageData,
          platform: "youtube"
        };

        await db.enqueue(event);
        webhookStats.lastEventCount++;
      }
    } catch (err) {
      console.error("Error parsing YouTube webhook data:", err);
      webhookStats.rejected++;
    }
  }

  res.sendStatus(200);
  setImmediate(() => worker.run().catch(console.error));
});

app.listen(config.port, () =>
  console.log(`ELIMFILTERS YouTube bot listening on port ${config.port}; dryRun=${config.dryRun}`)
);

setInterval(() => worker.run().catch(console.error), 5 * 60 * 1000).unref();
