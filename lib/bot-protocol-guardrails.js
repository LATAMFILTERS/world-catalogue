const SUPPORT_EMAIL = 'support@elimfilters.com';
const MAX_UNRESOLVED_ATTEMPTS = 5;

function cleanText(value) {
  return String(value || '')
    .replace(/\bundefined\b/gi, 'equipo')
    .replace(/\bnull\b/gi, '')
    .replace(/\s{3,}/g, '  ')
    .trim();
}

function uniqueProducts(products = []) {
  const seen = new Set();
  return products.filter(product => {
    const key = product?.id || `${product?.sku || ''}:${product?.codigo_base || ''}`;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function inferResolutionStatus(payload = {}) {
  if (payload?.evidence?.validated) return 'resolved_with_catalog_evidence';
  if (payload?.diagnostic?.complete) return 'conditional_diagnostic';
  if (payload?.pending_field || payload?.diagnostic?.missing_field) return 'awaiting_customer_data';
  return 'unresolved';
}

function applyProtocolGuardrails(payload = {}, requestBody = {}) {
  const context = requestBody?.context && typeof requestBody.context === 'object'
    ? requestBody.context
    : {};
  // Prefer the server-tracked attempt counter on canonical state (requirement
  // 4's `state`) over a client-supplied value — the client should never be
  // able to reset its own unresolved-attempt count.
  const attempts = Math.max(0, Number(payload?.state?.unresolvedAttempts ?? context.unresolved_attempts ?? context.attempts ?? 0));
  const products = uniqueProducts(payload?.evidence?.products || []);
  const evidenceValidated = products.length > 0 && payload?.evidence?.validated === true;
  const resolutionStatus = inferResolutionStatus({
    ...payload,
    evidence: { ...payload.evidence, products, validated: evidenceValidated }
  });
  const requiresHandoff = !evidenceValidated && attempts >= MAX_UNRESOLVED_ATTEMPTS;

  let answer = cleanText(payload.answer);
  if (requiresHandoff) {
    answer = `No tengo evidencia suficiente para cerrar esta consulta sin riesgo de asignar una referencia incorrecta. Envía la marca, modelo, motor, año y cualquier código disponible a ${SUPPORT_EMAIL}.`;
  }

  return {
    ...payload,
    protocol_version: payload.protocol_version || '1.2.0',
    answer,
    evidence: {
      ...(payload.evidence || {}),
      source: 'elimfilters_catalog',
      count: products.length,
      validated: evidenceValidated,
      products
    },
    governance: {
      native_elimfilters_only: true,
      invented_sku_blocked: true,
      competitor_discussion_blocked: true,
      unresolved_attempts: attempts,
      max_unresolved_attempts: MAX_UNRESOLVED_ATTEMPTS,
      resolution_status: requiresHandoff ? 'handoff_required' : resolutionStatus,
      requires_handoff: requiresHandoff,
      handoff_email: requiresHandoff ? SUPPORT_EMAIL : null
    }
  };
}

module.exports = {
  applyProtocolGuardrails,
  MAX_UNRESOLVED_ATTEMPTS,
  SUPPORT_EMAIL
};
