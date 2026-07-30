import express from "express";
import { getConfig } from "./config.js";
import { createDb } from "./db.js";
import { createKnowledgeSystemClient } from "./knowledge-system.js";
import { verifyLinkedinSignature, normalizeLinkedinEvents } from "./security.js";
import { createWorker } from "./worker.js";
import { createInactivityCleaner } from "./inactivity-cleaner.js";
import { createWhatsAppClient } from "./whatsapp.js";

const config = getConfig();
const db = createDb(config.databaseUrl);
await db.init();
const knowledgeSystem = createKnowledgeSystemClient(config);

const whatsapp = createWhatsAppClient({
  accessToken: config.metaAccessToken,
  phoneNumberId: config.whatsappPhoneNumberId,
  graphApiVersion: config.metaGraphApiVersion
});

const worker = createWorker({ config, db, knowledgeSystem });
const inactivityCleaner = createInactivityCleaner({ db, whatsapp, instagram: null, youtube: null });
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
<p>LATAM FILTERS PRO INC, operating the ELIMFILTERS brand, uses the official LinkedIn Developer API to assist with company page communications on the @elimfilters professional account.</p>
<h2>Information processed</h2><p>We process incoming post comments, direct message content, sender URNs, timestamps, and metadata required to generate AI assistance.</p>
<h2>Purpose and providers</h2><p>The information is used only to understand and respond to LinkedIn interactions, prevent duplicate processing and protect the service. Processing may involve LinkedIn, Render hosting, PostgreSQL storage and NVIDIA NIM. We do not sell personal information.</p>
<h2>Contact</h2><p>ELIMFILTERS — <a href="mailto:elimfilters@gmail.com">elimfilters@gmail.com</a></p>`))
);

app.get("/terms", (_req, res) =>
  res.type("html").send(legalPage("Terms of Service", `
<p>This service assists ELIMFILTERS with managing communications on its LinkedIn Organization Page. Use of LinkedIn remains subject to LinkedIn's User Agreement and API Terms.</p>
<p>Questions: <a href="mailto:elimfilters@gmail.com">elimfilters@gmail.com</a>.</p>`))
);

app.get("/health", async (_req, res) =>
  res.json({
    ok: true,
    service: "elimfilters-whatsapp-bot",
    businessAccountId: config.whatsappBusinessAccountId,
    dryRun: config.dryRun,
    queue: await db.status(),
    webhook: webhookStats
  })
);

app.get("/review-drafts", async (_req, res) => {
  if (!config.dryRun) return res.sendStatus(404);
  res.json({ ok: true, dryRun: true, drafts: await db.recentDrafts(10) });
});

// WhatsApp Webhook verification / challenge endpoint (Meta)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === config.whatsappVerifyToken) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// WhatsApp Webhook event receiver (Meta)
app.post("/webhook", express.json({ limit: "1mb" }), async (req, res) => {
  webhookStats.received++;
  webhookStats.lastReceivedAt = new Date().toISOString();

  const body = req.body;

  // Verify Meta signature
  const signature = req.get("x-hub-signature-256");
  if (signature && config.metaAppSecret) {
    const crypto = (await import("crypto")).default;
    const hash = crypto
      .createHmac("sha256", config.metaAppSecret)
      .update(JSON.stringify(body))
      .digest("hex");

    if (`sha256=${hash}` !== signature) {
      webhookStats.rejected++;
      return res.sendStatus(401);
    }
  }

  // Process only message events from target business account
  if (!body.entry) return res.sendStatus(200);

  for (const entry of body.entry) {
    if (entry.id !== config.whatsappBusinessAccountId) continue;

    const changes = entry.changes || [];
    for (const change of changes) {
      if (change.field !== "messages") continue;
      if (!change.value || !change.value.messages) continue;

      const messages = change.value.messages || [];
      const contacts = change.value.contacts || [];

      for (const msg of messages) {
        if (msg.type !== "text") continue;
        if (!msg.text || !msg.text.body) continue;

        const sender = contacts.find(c => c.wa_id === msg.from);
        const event = {
          id: msg.id,
          type: "message",
          timestamp: msg.timestamp,
          from: msg.from,
          fromName: sender?.profile?.name || msg.from,
          text: msg.text.body,
          phoneNumberId: change.value.metadata?.phone_number_id
        };

        await db.enqueue(event);
        webhookStats.lastEventCount++;
      }
    }
  }

  res.sendStatus(200);
  setImmediate(() => worker.run().catch(console.error));
});

app.listen(config.port, () => {
  console.log(`ELIMFILTERS WhatsApp bot listening on port ${config.port}; dryRun=${config.dryRun}`);
  inactivityCleaner.start();
});

setInterval(() => worker.run().catch(console.error), 5 * 60 * 1000).unref();
