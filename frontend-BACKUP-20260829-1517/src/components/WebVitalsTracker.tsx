'use client';

import { useEffect } from 'react';
import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';

/**
 * Web Vitals Tracker Component
 * Measures Core Web Vitals (CLS, FID, FCP, LCP, TTFB)
 * Sends data to GA4 and PostHog for monitoring
 */
export default function WebVitalsTracker() {
  useEffect(() => {
    // Function to send metric to analytics
    const sendMetric = (metric: Metric) => {
      // Skip if not in production or consent not given
      if (typeof window === 'undefined') return;

      // GA4
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_path: window.location.pathname,
          page_title: document.title,
          // Web Vitals as custom metrics
          [metric.name]: metric.value,
          metric_id: metric.id,
          metric_rating: metric.rating,
        });
      }

      // PostHog
      if (window.posthog?.capture) {
        window.posthog.capture('web_vital', {
          vital_name: metric.name,
          vital_value: metric.value,
          vital_rating: metric.rating,
          delta: metric.delta,
          page: window.location.pathname,
        });
      }

      // Clarity
      if (window.clarity) {
        window.clarity('set', `vital_${metric.name}`, String(metric.value));
      }

      // Console log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Web Vitals] ${metric.name}:`, {
          value: metric.value.toFixed(2),
          rating: metric.rating,
          delta: metric.delta?.toFixed(2),
        });
      }
    };

    // Register all Core Web Vitals
    getCLS(sendMetric);
    getFID(sendMetric);
    getFCP(sendMetric);
    getLCP(sendMetric);
    getTTFB(sendMetric);
  }, []);

  return null;
}
