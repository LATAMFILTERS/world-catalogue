'use strict';

const express = require('express');
const { normalizeMetaEnvironment } = require('./meta-channel-env');
const { registerBotProtocol } = require('./bot-protocol');
const { registerBotProtocolImage } = require('./bot-protocol-image');
const { createProtocolSecurityMiddleware } = require('./bot-protocol-security');
const { runBotProtocol } = require('./bot-conversation-orchestrator');
const { registerWebChatProtocolAdapter } = require('./bot-protocol-web-adapter');
const { installFastAutocomplete } = require('./autocomplete-fast');

normalizeMetaEnvironment(process.env);

function legacyInstagramWebhookEnabled() {
  return String(process.env.ENABLE_LEGACY_INSTAGRAM_WEBHOOK || '').trim().toLowerCase() === 'true';
}

function installLegacyInstagramWebhookBlock(app) {
  app.use('/api/instagram/webhook', (req, res, next) => {
    if (legacyInstagramWebhookEnabled()) return next();

    console.warn('[instagram/webhook] legacy Part Search endpoint disabled; use standalone Instagram adapter');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(410).json({
      error: 'legacy_instagram_webhook_disabled',
      owner: 'elimfilters-instagram-bot'
    });
  });
}

// Explicit, single mount point for the bot protocol surface — no express
// module patching, no chained res.json wrappers. Call this once, right after
// the Express app is created, from whichever file boots the HTTP server.
function installBotProtocol(app) {
  installLegacyInstagramWebhookBlock(app);
  installFastAutocomplete(app);
  // Mount the web adapter before server-original.js registers its legacy
  // /api/chat handler. Express stops at this response, so web, WhatsApp and
  // social channels all use the same canonical protocol and PostgreSQL path.
  registerWebChatProtocolAdapter(app);
  // Scoped JSON body parsing for the bot protocol surface only — self
  // contained, independent of where the host app sets up its own parser.
  app.use('/api/bot/protocol', express.json({ limit: '5mb', strict: true }));
  registerBotProtocol(app);
  registerBotProtocolImage(app, runBotProtocol, createProtocolSecurityMiddleware({ image: true }));
}

module.exports = { installBotProtocol };
