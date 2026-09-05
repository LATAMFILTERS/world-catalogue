const SUPPORT_EMAIL = 'support@elimfilters.com';
const MAX_UNRESOLVED_ATTEMPTS = 5;

const NOT_FOUND_COPY = Object.freeze({
  es: ref => `No encontré una coincidencia verificada para ${ref} en el catálogo ELIMFILTERS. No asignaré un SKU, equivalencia ni especificación sin evidencia validada.`,
  en: ref => `I could not find a verified match for ${ref} in the ELIMFILTERS catalog. I will not assign a SKU, cross-reference, or specification without validated evidence.`,
  pt: ref => `Não encontrei uma correspondência verificada para ${ref} no catálogo ELIMFILTERS. Não vou atribuir SKU, equivalência ou especificação sem evidência validada.`,
  fr: ref => `Je n'ai trouvé aucune correspondance vérifiée pour ${ref} dans le catalogue ELIMFILTERS. Je n'attribuerai aucun SKU, équivalent ou spécification sans preuve validée.`,
  it: ref => `Non ho trovato una corrispondenza verificata per ${ref} nel catalogo ELIMFILTERS. Non assegnerò SKU, equivalenze o specifiche senza evidenza validata.`,
  nl: ref => `Ik heb geen geverifieerde overeenkomst voor ${ref} gevonden in de ELIMFILTERS-catalogus. Ik wijs geen SKU, kruisreferentie of specificatie toe zonder gevalideerd bewijs.`,
  ru: ref => `Я не нашёл подтверждённого соответствия для ${ref} в каталоге ELIMFILTERS. Я не буду назначать SKU, аналог или спецификацию без подтверждённых данных.`,
  zh: ref => `在 ELIMFILTERS 目录中未找到 ${ref} 的已验证匹配项。没有经过验证的证据，我不会分配 SKU、交叉参考或技术规格。`,
  ja: ref => `ELIMFILTERS カタログで ${ref} の検証済み一致を確認できませんでした。検証済みの根拠なしに SKU、互換品番、仕様を割り当てません。`,
  ar: ref => `لم أجد تطابقًا موثقًا للمرجع ${ref} في كتالوج ELIMFILTERS. لن أعيّن رمز SKU أو مرجعًا بديلًا أو مواصفة من دون دليل موثق.`,
  fa: ref => `برای مرجع ${ref} تطابق تأییدشده‌ای در کاتالوگ ELIMFILTERS پیدا نشد. بدون شواهد معتبر، SKU، معادل یا مشخصات فنی تعیین نمی‌کنم.`
});

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

function normalizedLanguage(requestBody = {}) {
  const value = String(requestBody.language || requestBody.lang || requestBody?.context?.language || '').trim().toLowerCase();
  return NOT_FOUND_COPY[value] ? value : 'en';
}

function referenceLabel(payload = {}, requestBody = {}) {
  const evidenceReference = Array.isArray(payload?.evidence?.references)
    ? payload.evidence.references.find(Boolean)
    : null;
  if (evidenceReference) return String(evidenceReference).trim().toUpperCase();

  const message = String(requestBody.message || '');
  const candidates = message.match(/\b[A-Z0-9][A-Z0-9._/-]{4,}\b/gi) || [];
  const preferred = candidates.find(value => /\d/.test(value));
  return String(preferred || candidates[0] || 'esa referencia').trim().toUpperCase();
}

function applyCatalogNotFoundGuard(payload = {}, requestBody = {}) {
  const lookupStatus = String(payload?.evidence?.lookup_status || '').trim().toLowerCase();
  if (lookupStatus !== 'not_found') return payload;

  const language = normalizedLanguage(requestBody);
  const reference = referenceLabel(payload, requestBody);
  const answer = NOT_FOUND_COPY[language](reference);

  return {
    ...payload,
    answer,
    pending_field: null,
    evidence: {
      ...(payload.evidence || {}),
      source: 'elimfilters_catalog',
      lookup_status: 'not_found',
      count: 0,
      validated: false,
      products: []
    },
    knowledge_governance: {
      ...(payload.knowledge_governance || {}),
      safe_to_publish: true,
      sku_validated_in_postgresql: false
    },
    deterministic_router: {
      ...(payload.deterministic_router || {}),
      matched: true,
      source: 'catalog_not_found_guard'
    },
    governance: {
      ...(payload.governance || {}),
      invented_sku_blocked: true,
      catalog_not_found_blocked: true,
      resolution_status: 'unresolved'
    }
  };
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
  applyCatalogNotFoundGuard,
  MAX_UNRESOLVED_ATTEMPTS,
  SUPPORT_EMAIL
};
