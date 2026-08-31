const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.elimfilters.com').replace(/\/$/, '');

const BACKEND_EVENTS = new Set([
  'conversion_product_intelligence',
  'conversion_application_support',
  'conversion_distributor_locator',
  'conversion_partner_application',
  'conversion_action_click',
  'part_search_opened',
  'lead_capture_submit',
  'distributor_application_submit',
  'commercial_form_submit',
  'technical_support_submit',
  'generate_lead',
]);

export function sendCommercialIntelligenceEvent(name: string, properties: Record<string, unknown> = {}) {
  if (typeof window === 'undefined' || !BACKEND_EVENTS.has(name)) return;

  const payload = {
    eventName: name,
    eventId: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    pagePath: window.location.pathname,
    pageLocation: window.location.href,
    pageTitle: document.title,
    referrer: document.referrer || undefined,
    sourceDomain: window.location.hostname,
    ...properties,
  };

  try {
    fetch(`${API_URL}/api/conversion-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Analytics must never block user navigation.
  }
}
