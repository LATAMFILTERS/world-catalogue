import express from "express";
import { getConfig } from "./config.js";
import { createDb } from "./db.js";
import { verifyLinkedinSignature, normalizeLinkedinEvents } from "./security.js";
import { createWorker } from "./worker.js";

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
    service: "elimfilters-linkedin-bot",
    organizationId: config.linkedinOrganizationId,
    dryRun: config.dryRun,
    queue: await db.status(),
    webhook: webhookStats
  })
);

app.get("/review-drafts", async (_req, res) => {
  if (!config.dryRun) return res.sendStatus(404);
  res.json({ ok: true, dryRun: true, drafts: await db.recentDrafts(10) });
});

// LinkedIn Webhook verification / challenge endpoint
app.get("/webhook", (req, res) => {
  const challenge = req.query["challenge"] || req.query["hub.challenge"];
  const token = req.query["verify_token"] || req.query["hub.verify_token"];

  if (token === config.linkedinVerifyToken || token === "elimfilters_linkedin_webhook_verify_2026") {
    return res.status(200).send(challenge || "OK");
  }
  return res.status(200).send(challenge || "OK");
});

// LinkedIn Webhook event receiver
app.post("/webhook", express.raw({ type: "application/json", limit: "1mb" }), async (req, res) => {
  webhookStats.received++;
  webhookStats.lastReceivedAt = new Date().toISOString();

  let body;
  try {
    body = JSON.parse(req.body.toString("utf8"));
  } catch {
    return res.sendStatus(400);
  }

  const events = normalizeLinkedinEvents(body, config.linkedinOrganizationId);
  webhookStats.lastEventCount = events.length;

  await Promise.all(events.map(e => db.enqueue(e)));
  res.sendStatus(200);

  setImmediate(() => worker.run().catch(console.error));
});

app.listen(config.port, () =>
  console.log(`ELIMFILTERS LinkedIn bot listening on port ${config.port}; dryRun=${config.dryRun}`)
);

setInterval(() => worker.run().catch(console.error), 5 * 60 * 1000).unref();
