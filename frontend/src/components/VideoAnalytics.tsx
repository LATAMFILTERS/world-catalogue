'use client';

import { useEffect, useCallback } from 'react';

/**
 * Video Analytics Component
 * Tracks video engagement metrics (plays, clicks, impressions) for GSC optimization
 * Sends data to GA4, PostHog, and Clarity
 */
export default function VideoAnalytics() {
  useEffect(() => {
    // Attach video event listeners to all video elements on page
    const videoElements = document.querySelectorAll('video, [data-video-id]');

    const trackVideoEvent = (eventType: 'play' | 'pause' | 'click' | 'impression', videoId?: string) => {
      const id = videoId || `video-${Date.now()}`;

      // GA4
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', `video_${eventType}`, {
          video_id: id,
          video_title: document.querySelector('video')?.getAttribute('data-title') || 'Unknown',
          page_path: window.location.pathname,
          timestamp: new Date().toISOString(),
        });
      }

      // PostHog
      if (typeof window !== 'undefined' && window.posthog?.capture) {
        window.posthog.capture(`video_${eventType}`, {
          video_id: id,
          video_title: document.querySelector('video')?.getAttribute('data-title') || 'Unknown',
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
        });
      }

      // Clarity
      if (typeof window !== 'undefined' && window.clarity) {
        window.clarity('set', `video_${eventType}`, id);
      }

      // Console log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Video Analytics] ${eventType.toUpperCase()}:`, {
          videoId: id,
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
        });
      }
    };

    // Track video impressions (video element is visible in viewport)
    const videoIntersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const videoId = (entry.target as HTMLElement).getAttribute('data-video-id');
            trackVideoEvent('impression', videoId || undefined);
            videoIntersectionObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    // Attach listeners to all video elements
    videoElements.forEach((video) => {
      if (video.tagName === 'VIDEO') {
        const videoElement = video as HTMLVideoElement;
        const videoId = video.getAttribute('data-video-id');

        // Track play events
        videoElement.addEventListener('play', () => trackVideoEvent('play', videoId || undefined));

        // Track pause events
        videoElement.addEventListener('pause', () => trackVideoEvent('pause', videoId || undefined));

        // Track clicks on video
        videoElement.addEventListener('click', () => trackVideoEvent('click', videoId || undefined));

        // Track video impression
        videoIntersectionObserver.observe(video);
      }
    });

    return () => {
      videoIntersectionObserver.disconnect();
    };
  }, []);

  return null;
}
