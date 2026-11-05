'use strict';
const { upsertKnowledgeGap, attachHermesResearchId } = require('./knowledge-governance/knowledge-gap-store');
const { createHermesResearchRequest } = require('./knowledge-governance/hermes-client');

function reviewRequestType(question, state, reason) {
  if (state.intent === 'application_lookup') return 'filter_application';
  if (/conflict/i.test(reason)) return 'technical_conflict';
  if (/\b(?:intervalo|interval|cada cu[aá]nto|how often|service interval)\b/i.test(question)) return 'oem_maintenance_interval';
  if (/\b(?:presi[oó]n|pressure|par de apriete|torque|medidas?|dimensi[oó]n|specification)\b/i.test(question)) return 'technical_specification';
  if (/\b(?:norma|standard|iso|sae|astm)\b/i.test(question)) return 'industry_standard';
  if (/\b(?:procedimiento|procedure|instalaci[oó]n|installation)\b/i.test(question)) return 'oem_service_procedure';
  if (['exact_reference_lookup', 'cross_reference_lookup', 'specification_lookup'].includes(state.intent)) return 'technical_specification';
  return 'other';
}

function receiptId(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

async function registerTechnicalReview(body, state = {}, reason = 'APPLICATION_EVIDENCE_MISSING') {
  const question = String(body.message || '').trim();
  const request_type = reviewRequestType(question, state, reason);
  const stored = await upsertKnowledgeGap({
    request_type, origin: 'bot_orchestrator', equipment: state.equipment || {},
    system: state.equipment?.system || state.system || null,
    question, reason, priority: 'medium', requested_by: 'bot_orchestrator',
    conversation_id: body.conversation_id || null, channel: body.channel || 'web'
  });
  if (!stored.persisted || !stored.gap) return { status: 'unavailable', registered: false, request_type, reason: 'REVIEW_STORE_UNAVAILABLE' };
  const gap = stored.gap;
  // Gap workflow state is local evidence, not a live read of the API case.
  // Do not reopen or announce a fresh review for a completed local record.
  if (['closed', 'rejected', 'approved_for_obsidian', 'published_in_obsidian'].includes(gap.status)) {
    return { status: 'previous_review', registered: false, id: receiptId(gap.hermes_research_id), request_type,
      knowledge_gap_status: gap.status, reason: 'PREVIOUS_REVIEW_REQUIRES_REASSESSMENT' };
  }
  if (gap.hermes_research_id) {
    const id = receiptId(gap.hermes_research_id);
    return id ? { status: 'registered', registered: true, existing: true, id, request_type, tracking_persisted: true }
      : { status: 'unavailable', registered: false, request_type, reason: 'REVIEW_RECEIPT_INVALID' };
  }
  const submission = await createHermesResearchRequest({ knowledgeGap: gap, researchRequest: { research_question: question, required_source_types: ['oem_manual', 'approved_internal_document'] }, conversationId: body.conversation_id });
  const id = receiptId(submission.hermes_research_id);
  if (!['accepted', 'duplicate'].includes(submission.status) || !id) return { status: 'pending_delivery', registered: false, request_type, reason: submission.error_code || 'TECHNICAL_REVIEW_UNAVAILABLE' };
  // An idempotent retry can return a case whose review is already completed.
  // Attaching here would incorrectly transition the gap to queued_for_hermes.
  if (['APPROVED', 'REJECTED', 'PUBLISHED', 'DUPLICATE'].includes(submission.queue_status)) {
    return { status: 'previous_review', registered: false, id, request_type,
      case_status: submission.queue_status, tracking_persisted: false,
      reason: 'PREVIOUS_REVIEW_REQUIRES_REASSESSMENT' };
  }
  // The case acknowledgement remains valid even if saving its local link fails.
  let tracking_persisted = false;
  try { tracking_persisted = (await attachHermesResearchId(gap.request_id, id))?.persisted === true; }
  catch { /* Preserve the accepted receipt; the stable external ID protects retries. */ }
  return { status: 'registered', registered: true, id, request_type, tracking_persisted };
}

function technicalReviewText(review, language = 'es') {
  const application = !review?.request_type || review.request_type === 'filter_application';
  const unresolved = language === 'en'
    ? (application ? 'Compatibility has not been confirmed.' : 'The requested technical information has not been confirmed.')
    : (application ? 'La compatibilidad todavía no está confirmada.' : 'La información técnica solicitada todavía no está confirmada.');
  if (review?.status === 'previous_review') {
    const reference = receiptId(review.id) ? (language === 'en' ? ` Previous reference: ${review.id}.` : ` Referencia anterior: ${review.id}.`) : '';
    return language === 'en'
      ? `There is a previous research record for this question. I have not created or reopened a review. Contact support@elimfilters.com so technical support can check its status and scope.${reference} ${unresolved}`
      : `Existe un registro anterior de investigación para esta consulta. No he creado ni reabierto una revisión. Contacta a support@elimfilters.com para que el departamento técnico compruebe su estado y alcance.${reference} ${unresolved}`;
  }
  if (review?.registered && review.existing && receiptId(review.id)) return language === 'en'
    ? `A request is already registered. I have not created another one. Tracking ID: ${review.id}. ${unresolved}`
    : `Ya existe una solicitud registrada. No he creado otra. Seguimiento: ${review.id}. ${unresolved}`;
  if (review?.registered && receiptId(review.id)) return language === 'en'
    ? `Your request was registered for technical review. Tracking ID: ${review.id}. ${unresolved}`
    : `Tu solicitud quedó registrada para revisión del departamento técnico. Seguimiento: ${review.id}. ${unresolved}`;
  return language === 'en'
    ? `${unresolved} Technical review is needed, but its delivery could not be confirmed. Please contact support@elimfilters.com.`
    : `${unresolved} Se necesita revisión del departamento técnico, pero no pude confirmar la entrega de la solicitud. Contacta a support@elimfilters.com.`;
}
module.exports = { registerTechnicalReview, technicalReviewText };
