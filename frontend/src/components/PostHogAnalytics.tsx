'use client';

import { useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    posthog?: any;
  }
}

export default function PostHogAnalytics() {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  useEffect(() => {
    if (typeof window === 'undefined' || !posthogKey) return;

    // Load PostHog script
    const script = document.createElement('script');
    script.src = `${posthogHost}/static/js/web.js`;
    script.async = true;
    script.onload = () => {
      if (window.posthog) {
        window.posthog.init(posthogKey, {
          api_host: posthogHost,
          autocapture: true,
          sessionRecording: false,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [posthogKey, posthogHost]);

  if (!posthogKey) {
    console.warn('PostHog API key not configured. Set NEXT_PUBLIC_POSTHOG_KEY environment variable.');
    return null;
  }

  return null;
}
