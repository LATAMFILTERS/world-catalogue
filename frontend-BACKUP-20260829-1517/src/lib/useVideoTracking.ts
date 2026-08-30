'use client';

import { useCallback } from 'react';

/**
 * useVideoTracking Hook
 * Manually track video engagement events in components
 * Usage: const { trackVideoEvent } = useVideoTracking();
 */
export function useVideoTracking() {
  const trackVideoEvent = useCallback(
    (
      eventType: 'play' | 'pause' | 'click' | 'impression' | 'complete' | 'time_milestone',
      videoId: string,
      videoTitle?: string,
      metadata?: Record<string, any>
    ) => {
      // GA4
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', `video_${eventType}`, {
          video_id: videoId,
          video_title: videoTitle || 'Unknown',
          page_path: window.location.pathname,
          ...metadata,
          timestamp: new Date().toISOString(),
        });
      }

      // PostHog
      if (typeof window !== 'undefined' && window.posthog?.capture) {
        window.posthog.capture(`video_${eventType}`, {
          video_id: videoId,
          video_title: videoTitle || 'Unknown',
          page: window.location.pathname,
          ...metadata,
          timestamp: new Date().toISOString(),
        });
      }

      // Clarity
      if (typeof window !== 'undefined' && window.clarity) {
        window.clarity('set', `video_${eventType}_${videoId}`, 'true');
      }

      // Console log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Video Tracking] ${eventType.toUpperCase()}:`, {
          videoId,
          videoTitle,
          page: window.location.pathname,
          metadata,
          timestamp: new Date().toISOString(),
        });
      }
    },
    []
  );

  return { trackVideoEvent };
}
