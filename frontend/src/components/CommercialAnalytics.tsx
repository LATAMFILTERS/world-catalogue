'use client';

import { useEffect } from 'react';
import { useConsent } from '@/lib/useConsent';
import { trackEvent } from '@/lib/analytics';
import { sendCommercialIntelligenceEvent } from '@/lib/commercial-intelligence';

type EventParams = Record<string, string | number | boolean | undefined>;

const CAMPAIGN_KEY = 'elimfilters_campaign_attribution';
const SOCIAL_HOSTS = ['instagram.com', 'facebook.com', 'linkedin.com', 'youtube.com', 'youtu.be', 'tiktok.com', 'x.com', 'twitter.com'];
const DOWNLOAD_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.zip'];
const CONVERSION_EVENTS: Record<string, string> = {
  'product-intelligence': 'conversion_product_intelligence',
  'application-support': 'conversion_application_support',
  'distributor-locator': 'conversion_distributor_locator',
  'partner-application': 'conversion_partner_application',
};

function readCampaign(): EventParams {
  if (typeof window === 'undefined') return {};

  const query = new URLSearchParams(window.location.search);
  const current = {
    campaign_source: query.get('utm_source') || undefined,
    campaign_medium: query.get('utm_medium') || undefined,
    campaign_name: query.get('utm_campaign') || undefined,
    campaign_content: query.get('utm_content') || undefined,
    campaign_term: query.get('utm_term') || undefined,
  };

  if (Object.values(current).some(Boolean)) {
    try {
      sessionStorage.setItem(CAMPAIGN_KEY, JSON.stringify(current));
    } catch {
      // Storage may be unavailable.
    }
    return current;
  }

  try {
    const stored = sessionStorage.getItem(CAMPAIGN_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function sendEvent(name: string, params: EventParams = {}) {
  if (typeof window === 'undefined') return;

  const enriched = {
    page_path: window.location.pathname,
    page_location: window.location.href,
    page_title: document.title,
    ...readCampaign(),
    ...params,
  };

  trackEvent(name, enriched);
  sendCommercialIntelligenceEvent(name, enriched);
}

function cleanLabel(element: HTMLElement): string {
  return (
    element.getAttribute('data-analytics-label') ||
    element.getAttribute('aria-label') ||
    element.textContent ||
    ''
  ).replace(/\s+/g, ' ').trim().slice(0, 120);
}

function classifyContactLink(url: URL) {
  const path = url.pathname.toLowerCase();
  if (path.includes('distribution')) return 'distributor_network';
  if (path.includes('support')) return 'technical_support';
  if (path.includes('commercial')) return 'commercial';
  return 'general_contact';
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function parseBody(init?: RequestInit): Record<string, unknown> {
  if (!init?.body || typeof init.body !== 'string') return {};
  try {
    return JSON.parse(init.body) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function trackSuccessfulRequest(urlValue: string, init?: RequestInit) {
  let url: URL;
  try {
    url = new URL(urlValue, window.location.origin);
  } catch {
    return;
  }

  const path = url.pathname.toLowerCase();
  const payload = parseBody(init);

  if (path === '/api/distributor') {
    sendEvent('distributor_application_submit', {
      lead_type: 'distributor',
      form_name: 'authorized_distributor_application',
    });
    sendEvent('generate_lead', {
      lead_type: 'distributor',
      form_name: 'authorized_distributor_application',
    });
    return;
  }

  if (path === '/api/lead-capture') {
    const leadType = typeof payload.leadType === 'string' ? payload.leadType : 'unknown';
    sendEvent('lead_capture_submit', {
      lead_type: leadType,
      form_name: 'conversion_lead_capture',
    });
    sendEvent('generate_lead', {
      lead_type: leadType,
      form_name: 'conversion_lead_capture',
    });
    return;
  }

  if (path.includes('/api/contact') || path.includes('/api/commercial')) {
    sendEvent('commercial_form_submit', {
      lead_type: 'commercial',
      form_name: path.split('/').filter(Boolean).pop() || 'contact',
    });
    sendEvent('generate_lead', { lead_type: 'commercial' });
    return;
  }

  if (path.includes('/api/support')) {
    sendEvent('technical_support_submit', {
      lead_type: 'technical_support',
      form_name: path.split('/').filter(Boolean).pop() || 'support',
    });
  }
}

export default function CommercialAnalytics() {
  const { consent } = useConsent();

  useEffect(() => {
    if (consent !== 'accepted') return;

    readCampaign();

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const interactive = target?.closest<HTMLElement>('a, button, [role="button"]');
      if (!interactive) return;

      const label = cleanLabel(interactive);
      const href = interactive instanceof HTMLAnchorElement ? interactive.href : '';
      const rawHref = interactive instanceof HTMLAnchorElement ? interactive.getAttribute('href') || '' : '';
      const analyticsAction = interactive.getAttribute('data-analytics-event');
      const conversionAction = interactive.getAttribute('data-conversion-action');

      if (conversionAction) {
        const conversionEvent = CONVERSION_EVENTS[conversionAction] || 'conversion_action_click';
        sendEvent(conversionEvent, {
          conversion_action: conversionAction,
          link_text: label,
          destination: href || undefined,
          button_location: window.location.pathname,
        });
      }

      if (analyticsAction) {
        sendEvent(analyticsAction, { link_text: label, button_location: window.location.pathname });
        return;
      }

      if (!href) {
        const marker = `${interactive.id} ${interactive.className} ${label}`.toLowerCase();
        if (marker.includes('chat') || marker.includes('assistant') || marker.includes('support bot')) {
          sendEvent('chat_started', { button_text: label, button_location: window.location.pathname });
        }
        return;
      }

      if (rawHref.startsWith('mailto:')) {
        sendEvent('email_contact_clicked', { link_text: label, contact_method: 'email' });
        return;
      }

      if (rawHref.startsWith('tel:')) {
        sendEvent('phone_contact_clicked', { link_text: label, contact_method: 'phone' });
        return;
      }

      let url: URL;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }

      const hostname = url.hostname.toLowerCase();
      const lowerPath = url.pathname.toLowerCase();

      if (hostname === 'part-search.elimfilters.com') {
        sendEvent('part_search_opened', {
          link_text: label,
          destination: url.href,
          button_location: window.location.pathname,
        });
        return;
      }

      if (hostname.includes('wa.me') || hostname.includes('whatsapp.com')) {
        sendEvent('whatsapp_contact_clicked', { link_text: label, destination: url.href });
        return;
      }

      if (SOCIAL_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`))) {
        sendEvent('social_link_clicked', {
          social_network: hostname.replace(/^www\./, ''),
          link_text: label,
          destination: url.href,
        });
        return;
      }

      if (DOWNLOAD_EXTENSIONS.some((extension) => lowerPath.endsWith(extension))) {
        sendEvent('document_downloaded', {
          file_name: lowerPath.split('/').pop() || 'document',
          file_extension: lowerPath.split('.').pop() || '',
          destination: url.href,
        });
        return;
      }

      if (url.origin === window.location.origin && lowerPath.startsWith('/contact')) {
        sendEvent('contact_opened', {
          contact_type: classifyContactLink(url),
          link_text: label,
          destination_path: url.pathname,
        });
      }
    };

    const onSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement | null;
      if (!form) return;

      sendEvent('form_submit_attempt', {
        form_id: form.id || form.getAttribute('name') || 'unnamed_form',
        form_action: form.getAttribute('action') || window.location.pathname,
        form_location: window.location.pathname,
      });
    };

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const response = await originalFetch(input, init);
      if (response.ok) trackSuccessfulRequest(requestUrl(input), init);
      return response;
    };

    document.addEventListener('click', onClick, true);
    document.addEventListener('submit', onSubmit, true);

    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('submit', onSubmit, true);
      window.fetch = originalFetch;
    };
  }, [consent]);

  return null;
}
