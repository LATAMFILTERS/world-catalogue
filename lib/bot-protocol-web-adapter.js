'use strict';

const express = require('express');
const { registerTechnicalReview, technicalReviewText } = require('./bot-technical-review');
const { runUnifiedBotProtocol } = require('./bot-protocol-unified-orchestrator');
const { applyCatalogNotFoundGuard } = require('./bot-protocol-guardrails');
const { applyTechnicalProductPresentation } = require('./bot-protocol-technical-product-presentation');
const { preflightReferenceLookup } = require('./bot-protocol-reference-preflight');
const { looksLikeVehicleApplicationQuery } = require('./bot-protocol-deterministic-router');

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

      const preflightPayload = looksLikeVehicleApplicationQuery(message)
        ? null
        : await preflightReferenceLookup(requestBody);
      const rawPayload = preflightPayload || await runUnifiedBotProtocol(requestBody);
      const notFoundGuarded = rawPayload.support_contact_handled ? rawPayload : applyCatalogNotFoundGuard(rawPayload, requestBody);
      const payload = rawPayload.support_contact_handled ? rawPayload : applyTechnicalProductPresentation(notFoundGuarded, requestBody);
      const technicalValidated = ['general', 'support_request'].includes(payload.intent) && payload.intelligence?.knowledge_status === 'validated'
        && payload.knowledge_governance?.technical_source_validated === true && payload.knowledge_governance?.safe_to_publish === true
        && Number(payload.knowledge_governance?.authority_violation_count || 0) === 0;
      const unresolved = !payload.support_contact_handled && !payload.evidence?.validated && !payload.pending_field &&
        (['application_lookup', 'exact_reference_lookup', 'cross_reference_lookup', 'specification_lookup', 'diagnostic'].includes(payload.intent) || payload.knowledge_governance?.applicability_status === 'not_verified');
      if (unresolved) {
        const reviewReason = payload.knowledge_governance?.applicability_status === 'not_verified' ? 'TECHNICAL_APPLICATION_UNVERIFIED' : (payload.evidence?.lookup_status || 'EVIDENCE_MISSING');
        const reviewState = { ...(payload.state || {}), intent: payload.intent || payload.state?.intent };
        try { payload.technical_review = await registerTechnicalReview(requestBody, reviewState, reviewReason); }
        catch { payload.technical_review = { status: 'unavailable', registered: false }; }
        payload.answer = `${payload.answer}\n\n${technicalReviewText(payload.technical_review, language || 'es')}`;
      }

      return res.json({
        reply: payload.answer,
        technical_review: payload.technical_review || null,
        claim: payload.evidence?.validated ? (payload.intent === 'application_lookup' ? 'APPLICATION_CONFIRMED' : (payload.governance?.reference_authority === 'elimfilters_catalog.sku' || payload.evidence?.claim === 'SKU_EXISTS') ? 'SKU_EXISTS' : 'EQUIVALENCE_CONFIRMED') : 'NONE',
        outcome: payload.pending_field ? 'follow_up' : (payload.evidence?.validated || technicalValidated ? 'resolved' : 'no_evidence'),
        technical_evidence_validated: technicalValidated,
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
