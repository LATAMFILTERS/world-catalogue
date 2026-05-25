/**
 * ELIMFILTERS® Analytics & Observability Library
 * Unified event tracking: GA4 + PostHog + Microsoft Clarity
 *
 * Usage: import { trackEvent, trackRetrievalBlock, ... } from '@/lib/analytics'
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    posthog?: any;
    clarity?: (type: string, key: string, value?: string) => void;
    dataLayer?: unknown[];
  }
}

type EventProperties = Record<string, string | number | boolean | undefined>;

// ─── Core event dispatcher ────────────────────────────────────────────────

export function trackEvent(name: string, properties?: EventProperties) {
  if (typeof window === 'undefined') return;

  // GA4
  if (window.gtag) {
    window.gtag('event', name, properties);
  }

  // PostHog
  if (window.posthog?.capture) {
    window.posthog.capture(name, properties);
  }
}

// ─── Phase A: Semantic Page Flows ─────────────────────────────────────────

export function trackKnowledgePageView(path: string, domain: string, conceptId: string) {
  trackEvent('knowledge_page_view', {
    page_path: path,
    semantic_domain: domain,
    concept_id: conceptId,
    page_type: resolvePageType(path),
  });

  // Clarity custom tag for session segmentation
  window.clarity?.('set', 'semantic_domain', domain);
  window.clarity?.('set', 'concept_id', conceptId);
}

// ─── Phase B: Retrieval Block Interactions ────────────────────────────────

export function trackRetrievalBlock(action: 'expand' | 'collapse', pagePath: string) {
  trackEvent('retrieval_block_interaction', {
    action,
    page_path: pagePath,
    semantic_layer: 'retrieval_summary',
    page_type: resolvePageType(pagePath),
  });
}

// ─── Phase B: Knowledge Graph Traversal ──────────────────────────────────

export function trackKnowledgeTraversal(
  fromPath: string,
  toPath: string,
  linkType: 'definition' | 'standards' | 'failure' | 'technology' | 'operational'
) {
  trackEvent('knowledge_graph_traversal', {
    from_page: fromPath,
    to_page: toPath,
    link_type: linkType,
    from_type: resolvePageType(fromPath),
    to_type: resolvePageType(toPath),
  });
}

// ─── Phase B: Bridge Page Entry Points ───────────────────────────────────

export function trackBridgeEntry(bridgePage: string, referrer?: string) {
  trackEvent('bridge_page_entry', {
    bridge: bridgePage,
    referrer: referrer ?? document.referrer,
    entry_type: document.referrer ? 'internal' : 'direct',
  });
}

// ─── Phase B: Fleet Optimization Conversion Paths ────────────────────────

export function trackFleetConversion(step: string, fromPage: string) {
  trackEvent('fleet_conversion_path', {
    funnel_step: step,
    from_page: fromPage,
    page_type: resolvePageType(fromPage),
  });
}

// ─── Phase C: AI Visibility — Search Query Intent ─────────────────────────

export function trackSearchIntent(query: string, intentType: 'product' | 'problem' | 'system') {
  trackEvent('search_intent_captured', {
    query_text: query,
    intent_type: intentType,
  });
}

// ─── Utilities ────────────────────────────────────────────────────────────

function resolvePageType(path: string): string {
  if (path.includes('/bridges/')) return 'bridge';
  if (path.includes('/standards/iso-')) return 'standard_definition';
  if (path.includes('/standards/')) return 'standard_domain';
  if (path.includes('/contamination/')) return 'contamination';
  if (path.includes('/fleet/')) return 'fleet';
  if (path.includes('/compare/')) return 'compare';
  if (path.includes('/knowledge-system')) return 'hub';
  if (path.includes('/technologies/')) return 'technology';
  return 'other';
}
