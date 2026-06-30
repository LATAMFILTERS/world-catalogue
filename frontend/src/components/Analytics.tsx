'use client';

import Script from 'next/script';
import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { trackKnowledgePageView } from '@/lib/analytics';
import { useConsent } from '@/lib/useConsent';

const GA_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com';

// Semantic domain map — identifies which domain a path belongs to
const DOMAIN_MAP: Record<string, string> = {
  'lube-oil-systems': 'Contamination Control Systems',
  'air-intake-systems': 'Air Intake Filtration Systems',
  'fuel-systems': 'Diesel Fuel Integrity Systems',
  'hydraulic-systems': 'Hydraulic Efficiency Systems',
  'cabin-safety-systems': 'Contamination Control Systems',
  'compressed-air-systems': 'Contamination Control Systems',
  'iso-4406': 'Contamination Control Systems',
  'iso-16889': 'Contamination Control Systems',
  'iso-5011': 'Air Intake Filtration Systems',
  'particle-wear': 'Contamination Control Systems',
  'diesel-water': 'Diesel Fuel Integrity Systems',
  'hydraulic-system': 'Hydraulic Efficiency Systems',
  'reducing-downtime': 'Asset Protection Systems',
  'fuel-efficiency': 'Diesel Fuel Integrity Systems',
  'total-cost-ownership': 'Asset Protection Systems',
  'system-vs-commodity': 'Asset Protection Systems',
  'evaluation-framework': 'Asset Protection Systems',
  'oem-comparison': 'Asset Protection Systems',
  'industrial-filtration': 'Asset Protection Systems',
  'oem-replacement': 'Asset Protection Systems',
  'aftermarket-selection': 'Asset Protection Systems',
  'fleet-solutions': 'Asset Protection Systems',
  'roi-calculator': 'Asset Protection Systems',
  'coolant-contamination': 'Contamination Control Systems',
  'compressed-air-contamination': 'Contamination Control Systems',
  'fuel-injector-wear': 'Diesel Fuel Integrity Systems',
  'varnish-formation': 'Contamination Control Systems',
};

function resolveDomain(path: string): string {
  const segment = path.split('/').filter(Boolean).pop() ?? '';
  return DOMAIN_MAP[segment] ?? 'General';
}

function resolveConceptId(path: string): string {
  return path.split('/').filter(Boolean).join('_') || 'home';
}

export default function Analytics() {
  const pathname = usePathname();
  const { consent } = useConsent();

  const firePageView = useCallback(
    (path: string) => {
      // GA4 SPA page view
      if (typeof window !== 'undefined' && window.gtag && GA_ID) {
        window.gtag('config', GA_ID, { page_path: path });
      }
      // PostHog SPA page view
      if (typeof window !== 'undefined' && window.posthog?.capture) {
        window.posthog.capture('$pageview');
      }
      // Knowledge System semantic tracking
      if (path.includes('/knowledge-system')) {
        trackKnowledgePageView(path, resolveDomain(path), resolveConceptId(path));
      }
    },
    []
  );

  useEffect(() => {
    if (consent === 'accepted') firePageView(pathname);
  }, [pathname, firePageView, consent]);

  // Only render tracking scripts after explicit consent
  if (consent !== 'accepted') return null;

  return (
    <>
      {/* ── Google Analytics 4 ── */}
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', {
                page_path: window.location.pathname,
                send_page_view: true,
                custom_map: {
                  dimension1: 'semantic_domain',
                  dimension2: 'concept_id',
                  dimension3: 'page_type'
                }
              });
            `}
          </Script>
        </>
      )}

      {/* ── PostHog (CDN — no npm required) ── */}
      {POSTHOG_KEY && (
        <Script id="posthog-init" strategy="afterInteractive">
          {`
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString()+" (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId setPersonPropertiesForFlags".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('${POSTHOG_KEY}', {
              api_host: '${POSTHOG_HOST}',
              person_profiles: 'identified_only',
              capture_pageview: false,
              capture_pageleave: true,
              autocapture: true,
              session_recording: {
                maskAllInputs: true,
                maskTextSelector: 'input, textarea, select',
              }
            });
          `}
        </Script>
      )}

      {/* ── Microsoft Clarity ── */}
      {CLARITY_ID && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=elimfilters";
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window,document,"clarity","script","${CLARITY_ID}");
          `}
        </Script>
      )}
    </>
  );
}
