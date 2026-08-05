'use strict';

const express = require('express');
const { runUnifiedBotProtocol } = require('./bot-protocol-unified-orchestrator');

function normalizeLanguage(value) {
  const lang = String(value || '').trim().toLowerCase();
  return ['es', 'en', 'pt', 'fr', 'it', 'nl', 'ru', 'zh', 'ja', 'ar', 'fa'].includes(lang) ? lang : null;
}

function registerWebChatProtocolAdapter(app) {
  app.post('/api/chat', express.json({ limit: '1mb', strict: true }), async (req, res) => {
    try {
      const { message, sessionId, lang } = req.body || {};
      if (!message || typeof message !== 'string' || !sessionId || typeof sessionId !== 'string') {
        return res.status(400).json({ error: 'Missing message or sessionId' });
      }
      if (message.length > 1000) return res.status(400).json({ error: 'Message too long' });

      const language = normalizeLanguage(lang);
      const payload = await runUnifiedBotProtocol({
        channel: 'web',
        conversation_id: sessionId,
        message: message.trim(),
        language,
        context: {
          channel: 'web',
          conversation_id: sessionId,
          language
        }
      });

      return res.json({
        reply: payload.answer,
        outcome: payload.evidence?.validated ? 'resolved' : (payload.pending_field ? 'follow_up' : 'no_evidence'),
        buyerType: 'unknown',
        unresolvedAttempts: Number(payload.state?.unresolvedAttempts || 0),
        supportRecommended: Boolean(payload.escalation),
        escalated: Boolean(payload.escalation),
        source: 'central_protocol',
        protocol_version: payload.protocol_version,
        request_id: payload.request_id,
        intent: payload.intent,
        phase: payload.phase,
        pending_field: payload.pending_field,
        evidence_count: Number(payload.evidence?.count || 0)
      });
    } catch (error) {
      console.error('[bot-protocol-web-adapter]', { error: error.message, stack: error.stack });
      return res.status(503).json({ error: 'protocol_temporarily_unavailable' });
    }
  });
}

module.exports = { registerWebChatProtocolAdapter, normalizeLanguage };
