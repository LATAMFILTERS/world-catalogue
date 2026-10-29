// Pure lead-conversion decision rules; no network or browser access.
export function commercialLeadKind(urlValue, origin) {
  let url;
  try { url = new URL(urlValue, origin); } catch { return null; }
  const path = url.pathname.toLowerCase().replace(/\/+$/, '');
  const sameOrigin = url.origin === origin;
  if (sameOrigin && path === '/api/distributor') return 'distributor';
  if (path === '/api/lead-capture' && (sameOrigin || url.hostname === 'api.elimfilters.com')) return 'lead_capture';
  if (sameOrigin && (path === '/api/contact' || path.startsWith('/api/contact/') || path === '/api/commercial' || path.startsWith('/api/commercial/'))) return 'commercial';
  if (url.origin === 'https://crm-api.elimfilters.com' && path === '/v1/public/partner-applications') return 'partner';
  return null;
}

export function acceptedLeadResponse(response, payload) {
  if (!response?.ok || ![200, 201, 202].includes(response.status)) return false;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  if (payload.success === false || payload.ok === false || payload.accepted === false || payload.error || payload.errors) return false;
  return payload.success === true || payload.ok === true || payload.accepted === true
    || typeof payload.leadId === 'string' && payload.leadId.length > 0
    || typeof payload.applicationId === 'string' && payload.applicationId.length > 0
    || typeof payload.id === 'string' && payload.id.length > 0 && (payload.status === 'accepted' || payload.status === 'created');
}

export function leadDedupKey(kind, requestPayload, resultPayload) {
  const explicit = resultPayload?.leadId || resultPayload?.applicationId ||
    (resultPayload?.status === 'accepted' || resultPayload?.status === 'created' ? resultPayload?.id : null) ||
    requestPayload?.idempotencyKey;
  return explicit ? `${kind}:${String(explicit)}` : null;
}
