'use strict';

const crypto = require('crypto');
const Redis = require('ioredis');
const OutlookMailService = require('./outlook-mail');

const TICKET_TTL_SECONDS = 60 * 60 * 24 * 30;
let redis = null;
let mailer = null;

const DEPARTMENTS = Object.freeze({
  support: { label: 'Technical Support', email: 'support@elimfilters.com', mailType: 'support' },
  distribution: { label: 'Distribution Network', email: 'distribution_network@elimfilters.com', mailType: 'distributor' },
  commercial: { label: 'Commercial', email: 'solutions@elimfilters.com', mailType: 'solutions' },
  finance: { label: 'Finance', email: 'finance@elimfilters.com', mailType: 'finance' },
  logistics: { label: 'Logistics', email: 'logistics@elimfilters.com', mailType: 'logistics' },
  information: { label: 'Information', email: 'info@elimfilters.com', mailType: 'contact' }
});

function getRedis() {
  if (!process.env.REDIS_URL) return null;
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 1, enableReadyCheck: false, lazyConnect: true });
    redis.on('error', error => console.error('[bot-ticket-redis]', error.message));
  }
  return redis;
}

function getMailer() {
  if (!mailer) mailer = new OutlookMailService();
  return mailer;
}

function assignDepartment(intent, message = '') {
  const text = String(message || '').toLowerCase();
  if (intent === 'distribution_inquiry' || /distribu|dealer|territor|representar/.test(text)) return 'distribution';
  if (/factura|invoice|pago|payment|cr[eé]dito|credit|financ/.test(text)) return 'finance';
  if (/embarque|shipment|tracking|seguimiento|log[ií]stic|planta|orden de compra/.test(text)) return 'logistics';
  if (intent === 'commercial_inquiry' || /precio|cotiza|comprar|purchase|availability|disponibilidad/.test(text)) return 'commercial';
  if (['diagnostic', 'application_lookup', 'exact_reference_lookup', 'cross_reference_lookup', 'specification_lookup', 'support_request'].includes(intent)) return 'support';
  return 'information';
}

function createTicketId({ conversationId, intent, message, now = new Date() }) {
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const hash = crypto.createHash('sha256')
    .update(`${conversationId || 'anonymous'}|${intent || 'general'}|${String(message || '').trim().toLowerCase()}`)
    .digest('hex').slice(0, 8).toUpperCase();
  return `EF-${date}-${hash}`;
}

function buildTicket({ payload = {}, requestBody = {}, reason = 'unresolved_after_max_attempts' } = {}) {
  const message = String(requestBody.message || '').trim();
  const conversationId = String(requestBody.conversation_id || requestBody.user_id || requestBody.contact_id || requestBody.context?.conversation_id || '').trim() || null;
  const intent = payload.intent || payload.state?.intent || 'general';
  const departmentKey = assignDepartment(intent, message);
  const department = DEPARTMENTS[departmentKey];
  const ticketId = createTicketId({ conversationId, intent, message });

  return {
    ticket_id: ticketId,
    status: 'OPEN',
    priority: payload.state?.impact === 'equipment_down' ? 'HIGH' : 'NORMAL',
    department: departmentKey,
    department_label: department.label,
    department_email: department.email,
    mail_type: department.mailType,
    reason,
    channel: requestBody.channel || requestBody.context?.channel || 'api',
    conversation_id: conversationId,
    intent,
    message,
    history: Array.isArray(payload.state?.conversationHistory) ? payload.state.conversationHistory.slice(-12) : [],
    equipment: payload.state?.equipment || null,
    references: Array.isArray(payload.evidence?.products) ? payload.evidence.products.map(p => p.sku).filter(Boolean) : [],
    created_at: new Date().toISOString()
  };
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function ticketEmail(ticket) {
  const subject = `[${ticket.ticket_id}] ${ticket.department_label} - ${ticket.intent}`;
  const rows = [
    ['Ticket', ticket.ticket_id], ['Status', ticket.status], ['Priority', ticket.priority],
    ['Department', ticket.department_label], ['Channel', ticket.channel],
    ['Conversation', ticket.conversation_id || 'N/A'], ['Intent', ticket.intent],
    ['Reason', ticket.reason], ['Message', ticket.message]
  ];
  const html = `<h2>ELIMFILTERS Bot Escalation</h2><table>${rows.map(([k,v]) => `<tr><td><strong>${escapeHtml(k)}</strong></td><td>${escapeHtml(v)}</td></tr>`).join('')}</table><h3>Recent history</h3><pre>${escapeHtml(ticket.history.join('\n'))}</pre><h3>Equipment</h3><pre>${escapeHtml(JSON.stringify(ticket.equipment || {}, null, 2))}</pre>`;
  const text = rows.map(([k,v]) => `${k}: ${v}`).join('\n') + `\n\nRecent history:\n${ticket.history.join('\n')}`;
  return { subject, html, text };
}

async function persistTicket(ticket) {
  const client = getRedis();
  if (!client) return { persisted: false, duplicate: false, source: 'unavailable' };
  try {
    if (client.status === 'wait' && typeof client.connect === 'function') await client.connect();
    const key = `bot-ticket:${ticket.ticket_id}`;
    const created = await client.set(key, JSON.stringify(ticket), 'EX', TICKET_TTL_SECONDS, 'NX');
    return { persisted: true, duplicate: created !== 'OK', source: 'redis' };
  } catch (error) {
    console.error('[bot-ticket-store]', error.message);
    return { persisted: false, duplicate: false, source: 'error' };
  }
}

async function dispatchTicket(ticket) {
  const stored = await persistTicket(ticket);
  if (stored.duplicate) return { ...stored, emailed: false };

  try {
    const { subject, html, text } = ticketEmail(ticket);
    await getMailer().send(ticket.department_email, subject, html, text, ticket.mail_type);
    console.info('[bot-ticket]', { ticket_id: ticket.ticket_id, department: ticket.department, status: 'sent' });
    return { ...stored, emailed: true };
  } catch (error) {
    console.error('[bot-ticket]', { ticket_id: ticket.ticket_id, department: ticket.department, status: 'email_failed', error: error.message });
    return { ...stored, emailed: false, error: error.message };
  }
}

module.exports = { DEPARTMENTS, assignDepartment, createTicketId, buildTicket, dispatchTicket };
