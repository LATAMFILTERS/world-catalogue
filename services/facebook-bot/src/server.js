import express from "express";
import {getConfig} from "./config.js";
import {verifyMetaSignature, normalizeFacebookEvents} from "./meta.js";
import {generateReply} from "./knowledge.js";
import {publishReply} from "./facebook.js";
import {createStore} from "./store.js";

const config = getConfig();
const store = createStore(config.databaseUrl);
await store.init();

const app = express();
const stats = {received: 0, rejected: 0, processed: 0, failed: 0, lastReceivedAt: null};

app.get("/", (_req, res) => res.json({service: "elimfilters-facebook-bot", ok: true}));
app.get("/health", async (_req, res) => res.json({ok: true, dryRun: config.dryRun, pageId: config.facebookPageId, database: await store.status(), webhook: stats}));
app.get("/ready", async (_req, res) => {
  try {
    const database = await store.status();
    res.json({ready: true, dryRun: config.dryRun, checks: {pageId: true, accessToken: true, appSecret: true, verifyToken: true, database}});
  } catch (error) {
    res.status(503).json({ready: false, error: error.message});
  }
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === config.facebookVerifyToken) return res.status(200).send(challenge);
  return res.sendStatus(403);
});

app.post("/webhook", express.raw({type: "application/json", limit: "1mb"}), async (req, res) => {
  stats.received += 1;
  stats.lastReceivedAt = new Date().toISOString();

  if (!verifyMetaSignature(req.body, req.get("x-hub-signature-256"), config.metaAppSecret)) {
    stats.rejected += 1;
    return res.sendStatus(401);
  }

  let payload;
  try {
    payload = JSON.parse(req.body.toString("utf8"));
  } catch {
    return res.sendStatus(400);
  }

  const events = normalizeFacebookEvents(payload, config.facebookPageId);
  res.sendStatus(200);

  setImmediate(async () => {
    for (const event of events) {
      try {
        if (!(await store.claim(event))) continue;
        const reply = await generateReply(config, event.text);
        if (!reply || reply.trim().toUpperCase() === "NO_REPLY") {
          await store.complete(event.eventId, reply || "", "ignored");
          continue;
        }
        await publishReply(config, event, reply);
        await store.complete(event.eventId, reply, config.dryRun ? "draft" : "sent");
        stats.processed += 1;
      } catch (error) {
        stats.failed += 1;
        console.error(`Facebook event ${event.eventId} failed:`, error);
        await store.fail(event.eventId, error.message).catch(console.error);
      }
    }
  });
});

app.listen(config.port, () => console.log(`ELIMFILTERS Facebook bot listening on port ${config.port}; dryRun=${config.dryRun}`));
