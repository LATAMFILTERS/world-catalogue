'use strict';

// Builds and registers a support lead when a verified catalog search finds
// nothing. Reuses bot-protocol-escalation.js's ticket infrastructure
// (Redis SET NX persistence + internal department email) rather than
// duplicating a separate store -- the internal support address it emails is
// for NOTIFICATION ONLY and never substitutes for the customer's own email,
// which is captured and stored separately in the ticket's `email` field.

const { dispatchTicket, createTicketId, DEPARTMENTS } = require('./bot-protocol-escalation');

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

function extractValidEmail(message) {
  const match = String(message || '').match(EMAIL_PATTERN);
  if (!match) return null;
  return match[0].trim().toLowerCase();
}

function buildSupportLeadTicket({ state, body, email }) {
  const conversationId = String(
    body.conversation_id || body.user_id || body.contact_id || body.context?.conversation_id || ''
  ).trim() || null;
  const channel = body.channel || body.context?.channel || 'api';
  const language = body.context?.language || body.language || null;
  const department = DEPARTMENTS.support;

  const mentionedCodes = [
    state.installedFilter?.reference,
    ...(Array.isArray(state.validatedProducts) ? state.validatedProducts.map(p => p.sku) : [])
  ].filter(Boolean);

  // Deterministic PER CONVERSATION (a fixed reason string, never the raw
  // message text) so that a repeated/duplicate email delivery for the SAME
  // conversation always produces the SAME ticket_id -- persistTicket's
  // Redis SET NX then rejects it as a duplicate even if the state-based
  // `supportLead.created` check in the orchestrator were ever bypassed.
  const ticketId = createTicketId({ conversationId, intent: 'support_lead', message: 'support_lead_email_captured' });

  return {
    ticket_id: ticketId,
    status: 'OPEN',
    priority: state.impact === 'equipment_down' ? 'HIGH' : 'NORMAL',
    department: 'support',
    department_label: department.label,
    department_email: department.email,
    mail_type: department.mailType,
    reason: 'catalog_search_no_match',
    channel,
    conversation_id: conversationId,
    intent: state.intent,
    language,
    email,
    message: String(body.message || '').trim(),
    equipment: state.equipment || null,
    references: mentionedCodes,
    history: Array.isArray(state.conversationHistory) ? state.conversationHistory.slice(-20) : [],
    created_at: new Date().toISOString()
  };
}

module.exports = { extractValidEmail, buildSupportLeadTicket, dispatchTicket };
