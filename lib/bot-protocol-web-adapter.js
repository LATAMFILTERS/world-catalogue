'use strict';

const express = require('express');
const { runUnifiedBotProtocol } = require('./bot-protocol-unified-orchestrator');
const { applyCatalogNotFoundGuard } = require('./bot-protocol-guardrails');
const { applyTechnicalProductPresentation } = require('./bot-protocol-technical-product-presentation');
const { preflightReferenceLookup } = require('./bot-protocol-reference-preflight');

const WEB_CHAT_ORIGINS = new Set([
  'https://elimfilters.com',
  'https://www.elimfilters.com',
  'https://part-search.elimfilters.com'
]);

function normalizeLanguage(value) {
  const lang = String(value || '').trim().toLowerCase();
  return ['es', 'en', 'pt', 'fr', 'it', 'nl', 'ru', 'zh', 'ja', 'ar', 'fa'].includes(lang) ? lang : null;
}

function webChatCors(req, res, next) {
  const origin = String(req.get('origin') || '').trim();
  if (WEB_CHAT_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  next();
}

function registerWebChatProtocolAdapter(app) {
  app.post('/api/chat', webChatCors, express.json({ limit: '1mb', strict: true }), async (req, res) => {
    try {
      const { message, sessionId, lang } = req.body || {};
      if (!message || typeof message !== 'string' || !sessionId || typeof sessionId !== 'string') {
        return res.status(400).json({ error: 'Missing message or sessionId' });
      }
      if (message.length > 1000) return res.status(400).json({ error: 'Message too long' });

      const language = normalizeLanguage(lang);
      const requestBody = {
        channel: 'web',
        conversation_id: sessionId,
        message: message.trim(),
        language,
        context: {
          channel: 'web',
          conversation_id: sessionId,
          language
        }
      };

      const preflightPayload = await preflightReferenceLookup(requestBody);
      const rawPayload = preflightPayload || await runUnifiedBotProtocol(requestBody);
      const notFoundGuarded = applyCatalogNotFoundGuard(rawPayload, requestBody);
      const payload = applyTechnicalProductPresentation(notFoundGuarded, requestBody);

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
        evidence_count: Number(payload.evidence?.count || 0),
        lookup_status: payload.evidence?.lookup_status || null,
        catalog_not_found_blocked: Boolean(payload.governance?.catalog_not_found_blocked),
        reference_response_policy: payload.governance?.reference_response_policy || null,
        reference_preflight: Boolean(payload.governance?.reference_preflight),
        llm_bypassed: Boolean(payload.governance?.llm_bypassed),
        source_brand: payload.governance?.source_brand || null,
        applications_published: Number(payload.governance?.applications_published || 0),
        equivalent_references_published: Number(payload.governance?.equivalent_references_published || 0),
        technical_description_source: payload.governance?.technical_description_source || null
      });
    } catch (error) {
      console.error('[bot-protocol-web-adapter]', { error: error.message, stack: error.stack });
      return res.status(503).json({ error: 'protocol_temporarily_unavailable' });
    }
  });
}

module.exports = { registerWebChatProtocolAdapter, normalizeLanguage, webChatCors };
